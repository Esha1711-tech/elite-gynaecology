const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    slug: { type: String, required: true, trim: true },
    image: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const heroSlideSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "", trim: true },
    title: { type: String, required: true, trim: true },
    text: { type: String, default: "", trim: true },
    image: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const websiteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "main",
      unique: true,
      immutable: true,
    },

    heroSlides: {
      type: [heroSlideSchema],
      default: [],
    },

    about: {
      eyebrow: {
        type: String,
        default: "About Elite Gynaecology",
      },
      title: {
        type: String,
        default: "Complete Women's Healthcare",
      },
      highlight: {
        type: String,
        default: "Under Expert Supervision",
      },
      description1: {
        type: String,
        default: "",
      },
      description2: {
        type: String,
        default: "",
      },
      image: {
        type: String,
        default: "/hero-image.png",
      },
    },

    doctor: {
      name: {
        type: String,
        default: "Prof. Dr. Ambreen Akhtar",
      },
      specialty: {
        type: String,
        default: "Gynaecology & Gynae Oncology",
      },
      qualifications: {
        type: String,
        default:
          "MBBS, FCPS, MCPS, CHPE, FIMSA (India), Masters in Gynae Oncology (Spain)",
      },
    },

    services: {
      type: [serviceSchema],
      default: [],
    },

    contact: {
      phone: {
        type: String,
        default: "+92 318 0082848",
      },
      email: {
        type: String,
        default: "doctorambreenakhtar@gmail.com",
      },
      address: {
        type: String,
        default:
          "8-2, Gulberg Complex, Jail Rd, Gulberg V, Lahore, Pakistan",
      },
      clinicHours: {
        type: String,
        default: "Mon - Sat",
      },
    },

    theme: {
      primaryColor: {
        type: String,
        default: "#CF3650",
      },
      secondaryColor: {
        type: String,
        default: "#33151B",
      },
      accentColor: {
        type: String,
        default: "#F5A900",
      },
      textColor: {
        type: String,
        default: "#6E1F32",
      },
      fontFamily: {
        type: String,
        default: "Inter",
      },
      headingSize: {
        type: Number,
        default: 48,
        min: 24,
        max: 80,
      },
      bodySize: {
        type: Number,
        default: 16,
        min: 12,
        max: 24,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "WebsiteSettings",
  websiteSettingsSchema
);