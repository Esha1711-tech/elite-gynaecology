const express = require("express");
const sanitizeHtml = require("sanitize-html");

const router = express.Router();

const Blog = require("../models/Blog");
const { auth, authorize } = require("../middleware/auth");

// =====================================================
// HTML SANITIZER
// =====================================================

const sanitizeBlogContent = (content = "") => {
  return sanitizeHtml(content, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "code",
      "pre",
    ],

    allowedAttributes: {
      a: ["href", "target", "rel"],
    },

    allowedSchemes: [
      "http",
      "https",
      "mailto",
    ],

    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
};

// =====================================================
// PLAIN TEXT SANITIZER
// =====================================================

const sanitizeText = (value = "") => {
  return sanitizeHtml(String(value), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

// =====================================================
// PUBLIC — ALL PUBLISHED BLOGS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;

    const query = {
      isPublished: true,
    };

    if (category) {
      query.category = category;
    }

    if (search?.trim()) {
      const safeSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        {
          title: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          content: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          excerpt: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    const blogs = await Blog.find(query)
      .populate(
        "authorId",
        "name email"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error(
      "Get blogs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load blogs.",
    });
  }
});

// =====================================================
// DOCTOR — OWN BLOGS
// PAGINATION
// MUST REMAIN BEFORE /:slug
// =====================================================

router.get(
  "/my/blogs",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const page = Math.max(
        parseInt(req.query.page, 10) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          parseInt(req.query.limit, 10) || 6,
          1
        ),
        50
      );

      const skip = (page - 1) * limit;

      const query = {
        authorId: req.user.id,
      };

      const [blogs, totalBlogs] =
        await Promise.all([
          Blog.find(query)
            .populate(
              "authorId",
              "name email"
            )
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

          Blog.countDocuments(query),
        ]);

      const totalPages = Math.max(
        Math.ceil(totalBlogs / limit),
        1
      );

      return res.json({
        success: true,
        count: blogs.length,
        blogs,

        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs,
          limit,

          hasNextPage:
            page < totalPages,

          hasPreviousPage:
            page > 1,
        },
      });
    } catch (error) {
      console.error(
        "Get my blogs error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load your blogs.",
      });
    }
  }
);

// =====================================================
// PUBLIC — SINGLE PUBLISHED BLOG
// =====================================================

router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).populate(
      "authorId",
      "name email"
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message:
          "Blog not found.",
      });
    }

    blog.views =
      (blog.views || 0) + 1;

    await blog.save();

    return res.json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error(
      "Get blog detail error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load blog.",
    });
  }
});

// =====================================================
// DOCTOR — CREATE BLOG
// =====================================================

router.post(
  "/",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const {
        title,
        content,
        excerpt,
        featuredImage,
        category,
        tags,
        isPublished,
      } = req.body;

      if (
        !title?.trim() ||
        !content?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title and content are required.",
        });
      }

      // ---------------------------------------------
      // SANITIZE USER CONTENT
      // ---------------------------------------------

      const cleanTitle =
        sanitizeText(title);

      const cleanContent =
        sanitizeBlogContent(content);

      const cleanExcerpt =
        sanitizeText(excerpt || "");

      const cleanCategory =
        sanitizeText(
          category ||
            "Women's Health"
        );

      const cleanTags =
        Array.isArray(tags)
          ? tags
              .map((tag) =>
                sanitizeText(tag)
              )
              .filter(Boolean)
          : [];

      if (!cleanContent.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Blog content is empty after validation.",
        });
      }

      // ---------------------------------------------
      // SLUG
      // ---------------------------------------------

      const slug =
        `${cleanTitle
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /(^-|-$)/g,
            ""
          )}-${Date.now()}`;

      // ---------------------------------------------
      // CREATE
      // ---------------------------------------------

      const blog =
        await Blog.create({
          title: cleanTitle,

          slug,

          content: cleanContent,

          excerpt: cleanExcerpt,

          featuredImage:
            featuredImage?.trim() || "",

          category:
            cleanCategory ||
            "Women's Health",

          tags: cleanTags,

          isPublished:
            isPublished !== false,

          authorId:
            req.user.id,

          authorName:
            req.user.name ||
            "Dr. Elite Gynaecologist",
        });

      return res.status(201).json({
        success: true,
        message:
          "Blog created successfully.",
        blog,
      });
    } catch (error) {
      console.error(
        "Create blog error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create blog.",
      });
    }
  }
);

// =====================================================
// DOCTOR — UPDATE BLOG
// =====================================================

router.patch(
  "/:id",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const update = {};

      if (
        req.body.title !==
        undefined
      ) {
        update.title =
          sanitizeText(
            req.body.title
          );
      }

      if (
        req.body.content !==
        undefined
      ) {
        update.content =
          sanitizeBlogContent(
            req.body.content
          );
      }

      if (
        req.body.excerpt !==
        undefined
      ) {
        update.excerpt =
          sanitizeText(
            req.body.excerpt
          );
      }

      if (
        req.body.category !==
        undefined
      ) {
        update.category =
          sanitizeText(
            req.body.category
          );
      }

      if (
        req.body.featuredImage !==
        undefined
      ) {
        update.featuredImage =
          String(
            req.body.featuredImage
          ).trim();
      }

      if (
        req.body.tags !==
        undefined
      ) {
        update.tags =
          Array.isArray(
            req.body.tags
          )
            ? req.body.tags
                .map((tag) =>
                  sanitizeText(tag)
                )
                .filter(Boolean)
            : [];
      }

      if (
        req.body.isPublished !==
        undefined
      ) {
        update.isPublished =
          Boolean(
            req.body.isPublished
          );
      }

      const blog =
        await Blog.findOneAndUpdate(
          {
            _id: req.params.id,
            authorId: req.user.id,
          },
          update,
          {
            new: true,
            runValidators: true,
          }
        ).populate(
          "authorId",
          "name email"
        );

      if (!blog) {
        return res.status(404).json({
          success: false,
          message:
            "Blog not found or unauthorized.",
        });
      }

      return res.json({
        success: true,
        message:
          "Blog updated successfully.",
        blog,
      });
    } catch (error) {
      console.error(
        "Update blog error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update blog.",
      });
    }
  }
);

// =====================================================
// DOCTOR — DELETE BLOG
// =====================================================

router.delete(
  "/:id",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const blog =
        await Blog.findOneAndDelete({
          _id: req.params.id,
          authorId: req.user.id,
        });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message:
            "Blog not found or unauthorized.",
        });
      }

      return res.json({
        success: true,
        message:
          "Blog deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete blog error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete blog.",
      });
    }
  }
);

module.exports = router;