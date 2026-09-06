const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const { auth, authorize } = require("../middleware/auth");

// Public: all published blogs
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (search?.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { content: { $regex: search.trim(), $options: "i" } },
        { excerpt: { $regex: search.trim(), $options: "i" } },
      ];
    }
    const blogs = await Blog.find(query)
      .populate("authorId", "name email")
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    console.error("Get blogs error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Doctor: own blogs. MUST be before /:slug.
router.get("/my/blogs", auth, authorize("doctor"), async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.user.id })
      .populate("authorId", "name email")
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    console.error("Get my blogs error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Public: single published blog
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true })
      .populate("authorId", "name email");
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    return res.json({ success: true, blog });
  } catch (error) {
    console.error("Get blog detail error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Doctor: create
router.post("/", auth, authorize("doctor"), async (req, res) => {
  try {
    const { title, content, excerpt, featuredImage, category, tags, isPublished } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: "Title and content are required." });
    }
    const slug = `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
    const blog = await Blog.create({
      title: title.trim(), slug, content: content.trim(), excerpt: excerpt || "",
      featuredImage: featuredImage || "", category: category || "Women's Health",
      tags: Array.isArray(tags) ? tags : [], isPublished: isPublished !== false,
      authorId: req.user.id, authorName: req.user.name || "Dr. Elite Gynaecologist",
    });
    return res.status(201).json({ success: true, message: "Blog created successfully.", blog });
  } catch (error) {
    console.error("Create blog error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Doctor: update
router.patch("/:id", auth, authorize("doctor"), async (req, res) => {
  try {
    const allowed = ["title", "content", "excerpt", "featuredImage", "category", "tags", "isPublished"];
    const update = {};
    allowed.forEach((field) => { if (req.body[field] !== undefined) update[field] = req.body[field]; });
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, authorId: req.user.id }, update,
      { new: true, runValidators: true }
    ).populate("authorId", "name email");
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found or unauthorized." });
    return res.json({ success: true, message: "Blog updated successfully.", blog });
  } catch (error) {
    console.error("Update blog error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Doctor: delete
router.delete("/:id", auth, authorize("doctor"), async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, authorId: req.user.id });
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found or unauthorized." });
    return res.json({ success: true, message: "Blog deleted successfully." });
  } catch (error) {
    console.error("Delete blog error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
