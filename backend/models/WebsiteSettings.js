const mongoose = require("mongoose");

// =====================================================
// REUSABLE CONTENT STYLE SCHEMA
// =====================================================

const textStyleSchema = new mongoose.Schema(
  {
    fontSize: {
      type: Number,
      default: 16,
      min: 12,
      max: 96,
    },

    color: {
      type: String,
      default: "#4B5563",
      trim: true,
    },

    alignment: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left",
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// SERVICE SCHEMA
// =====================================================

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // SERVICE SEO
    // =================================================

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

    metaKeywords: {
      type: [String],
      default: [],
    },

    primaryKeyword: {
      type: String,
      default: "",
      trim: true,
    },

    secondaryKeywords: {
      type: [String],
      default: [],
    },

    imageAlt: {
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

    // =================================================
    // SOCIAL / OPEN GRAPH
    // =================================================

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

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// MAIN WEBSITE SETTINGS SCHEMA
// =====================================================

const websiteSettingsSchema = new mongoose.Schema(
  {
    // =================================================
    // HERO
    // =================================================

    hero: {
      title: {
        type: String,
        default: "Expert Women's Healthcare You Can Trust",
      },

      subtitle: {
        type: String,
        default:
          "Compassionate and professional gynaecology care for every stage of life.",
      },

      buttonText: {
        type: String,
        default: "Book Appointment",
      },

      buttonLink: {
        type: String,
        default: "/book-appointment",
      },

      image: {
        type: String,
        default: "/hero-image.png",
      },

      imageAlt: {
        type: String,
        default: "Elite Gynaecology Clinic",
      },
    },

    // =================================================
    // ABOUT
    // =================================================

    about: {
      heading: {
        type: String,
        default: "About Elite Gynaecology",
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

      imageAlt: {
        type: String,
        default: "Elite Gynaecology doctor",
      },
    },

    // =================================================
    // DOCTOR
    // =================================================

    doctor: {
      name: {
        type: String,
        default: "Dr. Elite Gynaecologist",
      },

      specialty: {
        type: String,
        default: "Consultant Gynaecologist",
      },

      qualifications: {
        type: String,
        default:
          "MBBS, FCPS, MCPS, CHPE, FIMSA, Masters in Gynae Oncology",
      },
    },

    // =================================================
    // SERVICES
    // =================================================

    services: {
      type: [serviceSchema],
      default: [],
    },

    // =================================================
    // CONTACT
    // =================================================

    contact: {
      phone: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        default: "Lahore, Pakistan",
      },

      clinicHours: {
        type: String,
        default: "",
      },
    },

    // =================================================
    // GLOBAL THEME
    // =================================================

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

      backgroundColor: {
        type: String,
        default: "#FFF7F8",
      },

      textColor: {
        type: String,
        default: "#4B5563",
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

    // =================================================
    // INDIVIDUAL SECTION TYPOGRAPHY / ALIGNMENT
    // =================================================

    contentStyles: {
      // ---------------------------------------------
      // HERO
      // ---------------------------------------------

      hero: {
        heading: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 56,
            color: "#FFFFFF",
            alignment: "left",
          }),
        },

        text: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 18,
            color: "#FFFFFF",
            alignment: "left",
          }),
        },
      },

      // ---------------------------------------------
      // ABOUT
      // ---------------------------------------------

      about: {
        heading: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 36,
            color: "#33151B",
            alignment: "left",
          }),
        },

        text: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 16,
            color: "#4B5563",
            alignment: "left",
          }),
        },
      },

      // ---------------------------------------------
      // DOCTOR
      // ---------------------------------------------

      doctor: {
        heading: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 36,
            color: "#33151B",
            alignment: "left",
          }),
        },

        text: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 16,
            color: "#4B5563",
            alignment: "left",
          }),
        },
      },

      // ---------------------------------------------
      // SERVICES
      // ---------------------------------------------

      services: {
        heading: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 36,
            color: "#33151B",
            alignment: "center",
          }),
        },

        text: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 16,
            color: "#4B5563",
            alignment: "center",
          }),
        },
      },

      // ---------------------------------------------
      // CONTACT
      // ---------------------------------------------

      contact: {
        heading: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 36,
            color: "#33151B",
            alignment: "left",
          }),
        },

        text: {
          type: textStyleSchema,
          default: () => ({
            fontSize: 16,
            color: "#4B5563",
            alignment: "left",
          }),
        },
      },
    },

    // =================================================
    // SEO
    // =================================================

    seo: {
      // GLOBAL SEO

      siteName: {
        type: String,
        default: "Elite Gynaecology",
      },

      defaultTitle: {
        type: String,
        default: "Elite Gynaecology | Women's Healthcare",
      },

      defaultMetaDescription: {
        type: String,
        default: "",
      },

      metaKeywords: {
        type: [String],
        default: [],
      },

      primaryKeyword: {
        type: String,
        default: "",
      },

      secondaryKeywords: {
        type: [String],
        default: [],
      },

      targetLocation: {
        type: String,
        default: "Lahore, Pakistan",
      },

      // HOME SEO

      home: {
        title: {
          type: String,
          default: "Elite Gynaecology | Women's Healthcare in Lahore",
        },

        metaDescription: {
          type: String,
          default: "",
        },

        metaKeywords: {
          type: [String],
          default: [],
        },

        primaryKeyword: {
          type: String,
          default: "",
        },

        secondaryKeywords: {
          type: [String],
          default: [],
        },

        canonicalUrl: {
          type: String,
          default: "",
        },

        indexPage: {
          type: Boolean,
          default: true,
        },
      },

      // OPEN GRAPH

      openGraph: {
        title: {
          type: String,
          default: "",
        },

        description: {
          type: String,
          default: "",
        },

        image: {
          type: String,
          default: "",
        },
      },

      // LOCAL SEO

      localSeo: {
        businessName: {
          type: String,
          default: "Elite Gynaecology",
        },

        doctorName: {
          type: String,
          default: "",
        },

        city: {
          type: String,
          default: "Lahore",
        },

        country: {
          type: String,
          default: "Pakistan",
        },

        phone: {
          type: String,
          default: "",
        },

        address: {
          type: String,
          default: "",
        },
      },
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// =====================================================
// WEBSITE SETTINGS ARE A SINGLETON DOCUMENT
// =====================================================

websiteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();

  if (!settings) {
    settings = await this.create({});
  }

  return settings;
};

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model(
  "WebsiteSettings",
  websiteSettingsSchema
);