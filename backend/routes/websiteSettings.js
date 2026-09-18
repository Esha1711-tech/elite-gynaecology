const express = require("express");
const sanitizeHtml = require("sanitize-html");

const router = express.Router();

const WebsiteSettings = require("../models/WebsiteSettings");
const { auth, authorize } = require("../middleware/auth");

// =====================================================
// HELPERS
// =====================================================

const cleanText = (value = "") =>
  sanitizeHtml(String(value), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

const validColor = (value, fallback) => {
  const color = String(value || "").trim();

  return /^#[0-9A-Fa-f]{6}$/.test(color)
    ? color
    : fallback;
};

const cleanImagePath = (value = "") => {
  const image = String(value).trim();

  // Local public asset
  if (image.startsWith("/") && !image.startsWith("//")) {
    return image;
  }

  // Remote HTTPS image
  if (image.startsWith("https://")) {
    return image;
  }

  return "";
};

// =====================================================
// DEFAULT SETTINGS
// =====================================================

const getDefaultSettings = () => ({
  key: "main",

  heroSlides: [
    {
      image: "/checkup.jpg",
      eyebrow: "Prenatal Excellence",
      title: "Exceptional Maternity Care",
      text:
        "A warm, supportive approach to pregnancy, motherhood and every stage of womanhood.",
      isActive: true,
      order: 0,
    },
    {
      image: "/services/pregnancy-antenatal-care.jpg",
      eyebrow: "Pregnancy & Antenatal Care",
      title: "Care Through Every Trimester",
      text:
        "Personalized antenatal support with professional guidance and regular monitoring throughout pregnancy.",
      isActive: true,
      order: 1,
    },
    {
      image: "/services/high-risk-pregnancy.jpg",
      eyebrow: "Specialist Women's Care",
      title: "Support When You Need It Most",
      text:
        "Experienced gynaecological care focused on comfort, privacy and individual healthcare needs.",
      isActive: true,
      order: 2,
    },
  ],

  about: {
    eyebrow: "About Elite Gynaecology",
    title: "Complete Women's Healthcare",
    highlight: "Under Expert Supervision",

    description1:
      "Elite Gynaecology Lahore provides professional, compassionate and personalized healthcare for women at different stages of life.",

    description2:
      "From routine gynaecological consultations and pregnancy care to reproductive health, hormonal management and specialized treatment, our focus is on making every patient's healthcare journey comfortable and organized.",

    image: "/hero-image.png",
  },

  doctor: {
    name: "Prof. Dr. Ambreen Akhtar",
    specialty: "Gynaecology & Gynae Oncology",
    qualifications:
      "MBBS, FCPS, MCPS, CHPE, FIMSA (India), Masters in Gynae Oncology (Spain)",
  },

  services: [
    {
      title: "Comprehensive Gynecology Consultation",
      description:
        "Complete gynecological assessment, consultation, diagnosis and personalized care.",
      slug: "gynecology-consultation",
      image: "/services/gyneacology-consultation.jpg",
      isActive: true,
      order: 0,
    },
    {
      title: "Pregnancy & Antenatal Care",
      description:
        "Professional antenatal care and regular monitoring throughout pregnancy.",
      slug: "pregnancy-antenatal-care",
      image: "/services/pregnancy-antenatal-care.jpg",
      isActive: true,
      order: 1,
    },
    {
      title: "High-Risk Pregnancy Management",
      description:
        "Specialized monitoring and care for pregnancies requiring additional attention.",
      slug: "high-risk-pregnancy",
      image: "/services/high-risk-pregnancy.jpg",
      isActive: true,
      order: 2,
    },
    {
      title: "Infertility Evaluation & Treatment",
      description:
        "Comprehensive fertility evaluation and personalized reproductive healthcare.",
      slug: "infertility-treatment",
      image: "/services/infertility-treatment.jpg",
      isActive: true,
      order: 3,
    },
    {
      title: "PCOS & Menstrual Disorder Management",
      description:
        "Personalized management of PCOS, irregular periods and menstrual concerns.",
      slug: "pcos-menstrual-disorders",
      image: "/services/pcos-menstrual-disorders.jpg",
      isActive: true,
      order: 4,
    },
    {
      title: "Menopause & Hormonal Health Care",
      description:
        "Support and personalized care for menopause and hormonal health.",
      slug: "menopause-hormonal-health",
      image: "/services/menopause-hormonal-health.jpg",
      isActive: true,
      order: 5,
    },
    {
      title: "Cervical Cancer Screening",
      description:
        "Pap smear and HPV screening services focused on prevention and early detection.",
      slug: "cervical-cancer-screening",
      image: "/services/cervical-cancer-screening.jpg",
      isActive: true,
      order: 6,
    },
    {
      title: "Family Planning & Contraceptive Services",
      description:
        "Confidential counseling and personalized family planning options.",
      slug: "family-planning",
      image: "/services/family-planning.jpg",
      isActive: true,
      order: 7,
    },
    {
      title: "All Types of Gynecological Surgeries",
      description:
        "Professional surgical care for a wide range of gynecological conditions.",
      slug: "gynecological-surgeries",
      image: "/services/gynecological-surgeries.jpg",
      isActive: true,
      order: 8,
    },
  ],

  contact: {
    phone: "+92 318 0082848",
    email: "doctorambreenakhtar@gmail.com",
    address:
      "8-2, Gulberg Complex, Jail Rd, Gulberg V, Lahore, Pakistan",
    clinicHours: "Mon - Sat",
  },

  theme: {
    primaryColor: "#CF3650",
    secondaryColor: "#33151B",
    accentColor: "#F5A900",
    textColor: "#6E1F32",
    fontFamily: "Inter",
    headingSize: 48,
    bodySize: 16,
  },
});

// =====================================================
// PUBLIC — GET WEBSITE SETTINGS
// =====================================================

router.get("/", async (_req, res) => {
  try {
    let settings = await WebsiteSettings.findOne({
      key: "main",
    });

    if (!settings) {
      settings = await WebsiteSettings.create(
        getDefaultSettings()
      );
    }

    return res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "Get website settings error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load website settings.",
    });
  }
});

// =====================================================
// DOCTOR/ADMIN — UPDATE WEBSITE SETTINGS
// =====================================================

router.patch(
  "/",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      let settings = await WebsiteSettings.findOne({
        key: "main",
      });

      if (!settings) {
        settings = await WebsiteSettings.create(
          getDefaultSettings()
        );
      }

      const {
        heroSlides,
        about,
        doctor,
        services,
        contact,
        theme,
      } = req.body;

      // ---------------- HERO ----------------

      if (Array.isArray(heroSlides)) {
        settings.heroSlides = heroSlides
          .slice(0, 10)
          .map((slide, index) => ({
            eyebrow: cleanText(slide.eyebrow),
            title:
              cleanText(slide.title) ||
              `Hero Slide ${index + 1}`,
            text: cleanText(slide.text),
            image: cleanImagePath(slide.image),
            isActive: slide.isActive !== false,
            order: index,
          }));
      }

      // ---------------- ABOUT ----------------

      if (about && typeof about === "object") {
        settings.about = {
          eyebrow: cleanText(
            about.eyebrow ??
              settings.about?.eyebrow
          ),

          title: cleanText(
            about.title ??
              settings.about?.title
          ),

          highlight: cleanText(
            about.highlight ??
              settings.about?.highlight
          ),

          description1: cleanText(
            about.description1 ??
              settings.about?.description1
          ),

          description2: cleanText(
            about.description2 ??
              settings.about?.description2
          ),

          image:
            cleanImagePath(
              about.image ??
                settings.about?.image
            ) ||
            settings.about?.image ||
            "/hero-image.png",
        };
      }

      // ---------------- DOCTOR ----------------

      if (doctor && typeof doctor === "object") {
        settings.doctor = {
          name: cleanText(
            doctor.name ??
              settings.doctor?.name
          ),

          specialty: cleanText(
            doctor.specialty ??
              settings.doctor?.specialty
          ),

          qualifications: cleanText(
            doctor.qualifications ??
              settings.doctor?.qualifications
          ),
        };
      }

      // ---------------- SERVICES ----------------

      if (Array.isArray(services)) {
        settings.services = services
          .slice(0, 30)
          .map((service, index) => {
            const title =
              cleanText(service.title) ||
              `Service ${index + 1}`;

            const slug =
              cleanText(service.slug)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") ||
              `service-${index + 1}`;

            return {
              title,

              description: cleanText(
                service.description ??
                  service.desc ??
                  ""
              ),

              slug,

              image: cleanImagePath(
                service.image
              ),

              isActive:
                service.isActive !== false,

              order: index,
            };
          });
      }

      // ---------------- CONTACT ----------------

      if (
        contact &&
        typeof contact === "object"
      ) {
        settings.contact = {
          phone: cleanText(
            contact.phone ??
              settings.contact?.phone
          ),

          email: cleanText(
            contact.email ??
              settings.contact?.email
          ),

          address: cleanText(
            contact.address ??
              settings.contact?.address
          ),

          clinicHours: cleanText(
            contact.clinicHours ??
              settings.contact?.clinicHours
          ),
        };
      }

      // ---------------- THEME ----------------

      if (theme && typeof theme === "object") {
        const headingSize = Number(
          theme.headingSize
        );

        const bodySize = Number(
          theme.bodySize
        );

        settings.theme = {
          primaryColor: validColor(
            theme.primaryColor,
            settings.theme?.primaryColor ||
              "#CF3650"
          ),

          secondaryColor: validColor(
            theme.secondaryColor,
            settings.theme?.secondaryColor ||
              "#33151B"
          ),

          accentColor: validColor(
            theme.accentColor,
            settings.theme?.accentColor ||
              "#F5A900"
          ),

          textColor: validColor(
            theme.textColor,
            settings.theme?.textColor ||
              "#6E1F32"
          ),

          fontFamily:
            cleanText(theme.fontFamily) ||
            settings.theme?.fontFamily ||
            "Inter",

          headingSize:
            Number.isFinite(headingSize)
              ? Math.min(
                  80,
                  Math.max(24, headingSize)
                )
              : settings.theme?.headingSize ||
                48,

          bodySize:
            Number.isFinite(bodySize)
              ? Math.min(
                  24,
                  Math.max(12, bodySize)
                )
              : settings.theme?.bodySize ||
                16,
        };
      }

      await settings.save();

      return res.json({
        success: true,
        message:
          "Website updated successfully.",
        settings,
      });
    } catch (error) {
      console.error(
        "Update website settings error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update website settings.",
      });
    }
  }
);

module.exports = router;