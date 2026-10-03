const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    excerpt: {
      type: String,
      default: "",
    },

    featuredImage: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "General",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    authorName: {
      type: String,
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // BLOG SEO — RANK MATH STYLE
    // =================================================

    seo: {
      focusKeyword: {
        type: String,
        default: "",
        trim: true,
      },

      seoTitle: {
        type: String,
        default: "",
        trim: true,
      },

      metaDescription: {
        type: String,
        default: "",
        trim: true,
      },

      canonicalUrl: {
        type: String,
        default: "",
        trim: true,
      },

      indexPage: {
        type: Boolean,
        default: true,
      },

      // ---------------------------------------------
      // SOCIAL / OPEN GRAPH
      // ---------------------------------------------

      ogTitle: {
        type: String,
        default: "",
        trim: true,
      },

      ogDescription: {
        type: String,
        default: "",
        trim: true,
      },

      ogImage: {
        type: String,
        default: "",
        trim: true,
      },

      // ---------------------------------------------
      // STRUCTURED DATA
      // ---------------------------------------------

      schemaType: {
        type: String,
        enum: [
          "Article",
          "BlogPosting",
          "MedicalWebPage",
        ],
        default: "Article",
      },
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

// `slug` already receives a unique index from `unique: true`.
// These indexes help public/admin blog queries.

blogSchema.index({
  isPublished: 1,
  createdAt: -1,
});

blogSchema.index({
  authorId: 1,
  createdAt: -1,
});

blogSchema.index({
  category: 1,
  isPublished: 1,
});

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model(
  "Blog",
  blogSchema
);