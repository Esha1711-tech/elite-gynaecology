const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { blogImageUpload } = require("../middleware/upload");

const Blog = require("../models/Blog");
const {
  auth,
  authorize,
} = require("../middleware/auth");

// =====================================================
// HELPERS
// =====================================================

const sanitizeText = (value = "") => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const sanitizeBlogContent = (value = "") => {
  if (typeof value !== "string") {
    return "";
  }

  // Remove dangerous script/style/iframe/object/embed tags.
  // Rich-text formatting such as headings, paragraphs,
  // lists, bold and italic content remains available.

  return value
    .replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    )
    .replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      ""
    )
    .replace(
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      ""
    )
    .replace(
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      ""
    )
    .replace(
      /<embed\b[^>]*>/gi,
      ""
    )
    .replace(
      /\son\w+\s*=\s*["'][^"']*["']/gi,
      ""
    )
    .replace(
      /\son\w+\s*=\s*[^\s>]+/gi,
      ""
    )
    .replace(
      /javascript:/gi,
      ""
    )
    .trim();
};

const createSlug = (title = "") => {
  const baseSlug = sanitizeText(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${baseSlug || "blog"}-${Date.now()}`;
};

const sanitizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) =>
      sanitizeText(String(tag))
    )
    .filter(Boolean)
    .slice(0, 30);
};

const sanitizeSeo = (seo = {}) => {
  const allowedSchemas = [
    "Article",
    "BlogPosting",
    "MedicalWebPage",
  ];

  return {
    focusKeyword: sanitizeText(
      seo?.focusKeyword || ""
    ),

    seoTitle: sanitizeText(
      seo?.seoTitle || ""
    ),

    metaDescription: sanitizeText(
      seo?.metaDescription || ""
    ),

    canonicalUrl: sanitizeText(
      seo?.canonicalUrl || ""
    ),

    indexPage:
      seo?.indexPage !== false,

    ogTitle: sanitizeText(
      seo?.ogTitle || ""
    ),

    ogDescription: sanitizeText(
      seo?.ogDescription || ""
    ),

    ogImage: sanitizeText(
      seo?.ogImage || ""
    ),

    schemaType:
      allowedSchemas.includes(
        seo?.schemaType
      )
        ? seo.schemaType
        : "Article",
  };
};


// =====================================================
// PUBLIC — GET PUBLISHED BLOGS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const page = Math.max(
      Number.parseInt(
        req.query.page,
        10
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          req.query.limit,
          10
        ) || 12,
        1
      ),
      50
    );

    const skip =
      (page - 1) * limit;

    const filter = {
      isPublished: true,
    };

    if (req.query.category) {
      filter.category =
        sanitizeText(
          req.query.category
        );
    }

    const [
      blogs,
      total,
    ] = await Promise.all([
      Blog.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .select(
          "-__v"
        ),

      Blog.countDocuments(
        filter
      ),
    ]);

    return res.json({
      success: true,

      blogs,

      pagination: {
        page,
        limit,
        total,
        pages:
          Math.ceil(
            total / limit
          ) || 1,
      },
    });
  } catch (error) {
    console.error(
      "Get blogs error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to load blogs.",
      });
  }
});


// =====================================================
// DOCTOR — GET OWN BLOGS
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

      const filter = {
        authorId: req.user.id,
      };

      const [blogs, totalBlogs] = await Promise.all([
        Blog.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("-__v"),

        Blog.countDocuments(filter),
      ]);

      const totalPages =
        Math.ceil(totalBlogs / limit) || 1;

      return res.json({
        success: true,

        blogs,

        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      console.error(
        "Get doctor blogs error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load your blogs.",
      });
    }
  }
);

// =====================================================
// BLOG IMAGE UPLOAD
// Doctor only
// =====================================================

router.post(
  "/upload-image",
  auth,
  authorize("doctor"),
  (req, res) => {
    blogImageUpload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Unable to upload blog image.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image.",
        });
      }

      const imageUrl = `/api/blog/images/${req.file.filename}`;

      return res.status(201).json({
        success: true,
        message: "Blog image uploaded successfully.",
        imageUrl,
      });
    });
  }
);


// =====================================================
// PUBLIC BLOG IMAGE
// =====================================================

router.get("/images/:filename", (req, res) => {
  try {
    // Prevent directory traversal
    const filename = path.basename(req.params.filename);

    const imagePath = path.join(
      __dirname,
      "..",
      "uploads",
      "blogs",
      filename
    );

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: "Blog image not found.",
      });
    }

    return res.sendFile(imagePath);
  } catch (error) {
    console.error("Blog image error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load blog image.",
    });
  }
});

// =====================================================
// PUBLIC — GET SINGLE PUBLISHED BLOG
// =====================================================

router.get(
  "/:slug",
  async (req, res) => {
    try {
      const slug =
        String(
          req.params.slug || ""
        ).trim();

      if (!slug) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Blog slug is required.",
          });
      }

      const blog =
        await Blog.findOne({
          slug,
          isPublished: true,
        }).select("-__v");

      if (!blog) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Blog not found.",
          });
      }

      // Increase view count without
      // blocking the response.

      Blog.updateOne(
        {
          _id: blog._id,
        },
        {
          $inc: {
            views: 1,
          },
        }
      ).catch((error) => {
        console.error(
          "Blog view update error:",
          error
        );
      });

      blog.views =
        Number(
          blog.views || 0
        ) + 1;

      return res.json({
        success: true,
        blog,
      });
    } catch (error) {
      console.error(
        "Get blog error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load blog.",
        });
    }
  }
);

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
        seo,
      } = req.body;

      if (
        !title?.trim() ||
        !content?.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Title and content are required.",
          });
      }

      const cleanTitle =
        sanitizeText(title);

      const cleanContent =
        sanitizeBlogContent(
          content
        );

      const cleanExcerpt =
        sanitizeText(
          excerpt || ""
        );

      const cleanCategory =
        sanitizeText(
          category ||
            "Women's Health"
        );

      const cleanTags =
        sanitizeTags(tags);

      const cleanSeo =
        sanitizeSeo(seo);

      if (!cleanTitle) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Valid blog title is required.",
          });
      }

      if (
        !cleanContent.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Blog content is empty after validation.",
          });
      }

      const slug =
        createSlug(
          cleanTitle
        );

      const blog =
        await Blog.create({
          title:
            cleanTitle,

          slug,

          content:
            cleanContent,

          excerpt:
            cleanExcerpt,

          featuredImage:
            typeof featuredImage ===
            "string"
              ? featuredImage.trim()
              : "",

          category:
            cleanCategory ||
            "Women's Health",

          tags:
            cleanTags,

          isPublished:
            isPublished !==
            false,

          seo:
            cleanSeo,

          authorId:
            req.user.id,

          authorName:
            req.user.name ||
            "Dr. Elite Gynaecologist",
        });

      return res
        .status(201)
        .json({
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

      if (
        error?.code ===
        11000
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "A blog with this slug already exists.",
          });
      }

      return res
        .status(500)
        .json({
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
        const cleanTitle =
          sanitizeText(
            req.body.title
          );

        if (!cleanTitle) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "Valid blog title is required.",
            });
        }

        update.title =
          cleanTitle;
      }

      if (
        req.body.content !==
        undefined
      ) {
        const cleanContent =
          sanitizeBlogContent(
            req.body.content
          );

        if (
          !cleanContent.trim()
        ) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "Blog content cannot be empty.",
            });
        }

        update.content =
          cleanContent;
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
          typeof req.body
            .featuredImage ===
          "string"
            ? req.body.featuredImage.trim()
            : "";
      }

      if (
        req.body.tags !==
        undefined
      ) {
        update.tags =
          sanitizeTags(
            req.body.tags
          );
      }

      if (
        req.body.isPublished !==
        undefined
      ) {
        update.isPublished =
          Boolean(
            req.body
              .isPublished
          );
      }

      if (
        req.body.seo !==
        undefined
      ) {
        update.seo =
          sanitizeSeo(
            req.body.seo
          );
      }

      const blog =
        await Blog.findOneAndUpdate(
          {
            _id:
              req.params.id,

            authorId:
              req.user.id,
          },

          update,

          {
            new: true,
            runValidators:
              true,
          }
        ).populate(
          "authorId",
          "name email"
        );

      if (!blog) {
        return res
          .status(404)
          .json({
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

      return res
        .status(500)
        .json({
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
        await Blog.findOneAndDelete(
          {
            _id:
              req.params.id,

            authorId:
              req.user.id,
          }
        );

      if (!blog) {
        return res
          .status(404)
          .json({
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

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to delete blog.",
        });
    }
  }
);

module.exports = router;