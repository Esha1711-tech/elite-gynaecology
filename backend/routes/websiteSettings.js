const express = require("express");
const router = express.Router();

const sanitizeHtml = require("sanitize-html");

const WebsiteSettings = require("../models/WebsiteSettings");

const {
  auth,
  authorize,
} = require("../middleware/auth");

// =====================================================
// HELPERS
// =====================================================

/*
 * Decode only the HTML entities that we actually want
 * to display as normal text.
 *
 * IMPORTANT:
 * We intentionally DO NOT decode &lt; and &gt; here.
 * sanitizeHtml removes HTML tags first. Decoding those
 * two entities afterwards could turn encoded markup
 * back into angle brackets.
 */
const decodeHtmlEntities = (value = "") =>
  String(value)
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/gi, " ");

const cleanText = (value = "") => {
  const sanitized = sanitizeHtml(String(value), {
    allowedTags: [],
    allowedAttributes: {},
  });

  return decodeHtmlEntities(sanitized).trim();
};

const cleanImagePath = (value = "") => {
  if (!value) {
    return "";
  }

  const image = String(value).trim();

  // Allow local uploaded/static paths.
  if (image.startsWith("/")) {
    return image;
  }

  // Allow normal HTTP/HTTPS images.
  if (
    image.startsWith("https://") ||
    image.startsWith("http://")
  ) {
    return image;
  }

  return "";
};

const cleanUrl = (value = "") => {
  if (!value) {
    return "";
  }

  const url = String(value).trim();

  // Allow internal frontend routes.
  if (url.startsWith("/")) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:"
    ) {
      return parsed.toString();
    }
  } catch (error) {
    return "";
  }

  return "";
};

const cleanStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => cleanText(item))
    .filter(Boolean)
    .slice(0, 50);
};

const validColor = (
  value,
  fallback = "#4B5563"
) => {
  if (
    typeof value === "string" &&
    /^#[0-9A-Fa-f]{6}$/.test(value.trim())
  ) {
    return value.trim().toUpperCase();
  }

  return fallback;
};

const clampNumber = (
  value,
  min,
  max,
  fallback
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(
    Math.max(number, min),
    max
  );
};

const validAlignment = (
  value,
  fallback = "left"
) => {
  const allowed = [
    "left",
    "center",
    "right",
  ];

  return allowed.includes(value)
    ? value
    : fallback;
};

// =====================================================
// CONTENT STYLE SANITIZER
// =====================================================

const sanitizeContentStyles = (
  incomingStyles,
  currentStyles = {}
) => {
  /*
   * Doctor is intentionally included here.
   *
   * This means CMS Design controls can now save:
   * - Doctor heading font size
   * - Doctor heading color
   * - Doctor heading alignment
   * - Doctor text font size
   * - Doctor text color
   * - Doctor text alignment
   */
  const allowedSections = [
    "hero",
    "about",
    "doctor",
    "services",
    "contact",
  ];

  const result = {};

  allowedSections.forEach((section) => {
    const incoming =
      incomingStyles?.[section] || {};

    const current =
      currentStyles?.[section] || {};

    const currentHeading =
      current.heading || {};

    const currentText =
      current.text || {};

    result[section] = {
      heading: {
        fontSize: clampNumber(
          incoming?.heading?.fontSize,
          20,
          96,
          Number(
            currentHeading.fontSize
          ) ||
            (section === "hero"
              ? 56
              : 36)
        ),

        color: validColor(
          incoming?.heading?.color,
          currentHeading.color ||
            (section === "hero"
              ? "#FFFFFF"
              : "#33151B")
        ),

        alignment: validAlignment(
          incoming?.heading?.alignment,
          currentHeading.alignment ||
            (section === "services"
              ? "center"
              : "left")
        ),
      },

      text: {
        fontSize: clampNumber(
          incoming?.text?.fontSize,
          12,
          36,
          Number(
            currentText.fontSize
          ) ||
            (section === "hero"
              ? 18
              : 16)
        ),

        color: validColor(
          incoming?.text?.color,
          currentText.color ||
            (section === "hero"
              ? "#FFFFFF"
              : "#4B5563")
        ),

        alignment: validAlignment(
          incoming?.text?.alignment,
          currentText.alignment ||
            (section === "services"
              ? "center"
              : "left")
        ),
      },
    };
  });

  return result;
};

// =====================================================
// PUBLIC — GET WEBSITE SETTINGS
// =====================================================

router.get(
  "/",
  async (req, res) => {
    try {
      const settings =
        await WebsiteSettings.getSettings();

      return res.json({
        success: true,
        settings,
      });
    } catch (error) {
      console.error(
        "Get website settings error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load website settings.",
        });
    }
  }
);

// =====================================================
// DOCTOR — UPDATE WEBSITE SETTINGS
// =====================================================

router.patch(
  "/",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const settings =
        await WebsiteSettings.getSettings();

      const {
        hero,
        about,
        doctor,
        services,
        contact,
        theme,
        contentStyles,
        seo,
      } = req.body;

      // =================================================
      // HERO
      // =================================================

      if (
        hero &&
        typeof hero === "object"
      ) {
        settings.hero = {
          title:
            cleanText(
              hero.title ??
                settings.hero?.title
            ) ||
            settings.hero?.title ||
            "Expert Women's Healthcare You Can Trust",

          subtitle:
            cleanText(
              hero.subtitle ??
                settings.hero?.subtitle
            ),

          buttonText:
            cleanText(
              hero.buttonText ??
                settings.hero?.buttonText
            ) ||
            "Book Appointment",

          buttonLink:
            cleanUrl(
              hero.buttonLink ??
                settings.hero?.buttonLink
            ) ||
            settings.hero?.buttonLink ||
            "/book-appointment",

          image:
            cleanImagePath(
              hero.image ??
                settings.hero?.image
            ) ||
            settings.hero?.image ||
            "/hero-image.png",

          imageAlt:
            cleanText(
              hero.imageAlt ??
                settings.hero?.imageAlt
            ) ||
            "Elite Gynaecology Clinic",
        };
      }

      // =================================================
      // ABOUT
      // =================================================

      if (
        about &&
        typeof about === "object"
      ) {
        settings.about = {
          heading:
            cleanText(
              about.heading ??
                settings.about?.heading
            ) ||
            settings.about?.heading ||
            "About Elite Gynaecology",

          description1:
            cleanText(
              about.description1 ??
                settings.about?.description1
            ),

          description2:
            cleanText(
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

          imageAlt:
            cleanText(
              about.imageAlt ??
                settings.about?.imageAlt
            ) ||
            "Elite Gynaecology doctor",
        };
      }

      // =================================================
      // DOCTOR
      // =================================================

      if (
        doctor &&
        typeof doctor === "object"
      ) {
        settings.doctor = {
          name:
            cleanText(
              doctor.name ??
                settings.doctor?.name
            ) ||
            settings.doctor?.name ||
            "Dr. Elite Gynaecologist",

          specialty:
            cleanText(
              doctor.specialty ??
                settings.doctor?.specialty
            ),

          qualifications:
            cleanText(
              doctor.qualifications ??
                settings.doctor
                  ?.qualifications
            ),
        };
      }

      // =================================================
      // SERVICES
      // =================================================

      if (Array.isArray(services)) {
        settings.services = services
          .slice(0, 30)
          .map((service, index) => {
            /*
             * cleanText() also normalizes old values
             * such as:
             *
             * Family Planning &amp; Counselling
             *
             * into:
             *
             * Family Planning & Counselling
             */
            const title =
              cleanText(service.title) ||
              `Service ${index + 1}`;

            const slug =
              cleanText(service.slug)
                .toLowerCase()
                .replace(
                  /[^a-z0-9]+/g,
                  "-"
                )
                .replace(
                  /(^-|-$)/g,
                  ""
                ) ||
              `service-${index + 1}`;

            return {
              title,

              description:
                cleanText(
                  service.description ??
                    service.desc ??
                    ""
                ),

              slug,

              image:
                cleanImagePath(
                  service.image
                ),

              // -------------------------------
              // SERVICE SEO
              // -------------------------------

              seoTitle:
                cleanText(
                  service.seoTitle
                ),

              metaDescription:
                cleanText(
                  service.metaDescription
                ),

              metaKeywords:
                cleanStringArray(
                  service.metaKeywords
                ),

              primaryKeyword:
                cleanText(
                  service.primaryKeyword
                ),

              secondaryKeywords:
                cleanStringArray(
                  service.secondaryKeywords
                ),

              imageAlt:
                cleanText(
                  service.imageAlt
                ),

              canonicalUrl:
                cleanUrl(
                  service.canonicalUrl
                ),

              indexPage:
                service.indexPage !==
                false,

              // -------------------------------
              // OPEN GRAPH
              // -------------------------------

              ogTitle:
                cleanText(
                  service.ogTitle
                ),

              ogDescription:
                cleanText(
                  service.ogDescription
                ),

              ogImage:
                cleanImagePath(
                  service.ogImage
                ),

              isActive:
                service.isActive !==
                false,

              order:
                Number.isFinite(
                  Number(service.order)
                )
                  ? Number(
                      service.order
                    )
                  : index,
            };
          });
      }

      // =================================================
      // CONTACT
      // =================================================

      if (
        contact &&
        typeof contact === "object"
      ) {
        settings.contact = {
          phone:
            cleanText(
              contact.phone ??
                settings.contact?.phone
            ),

          email:
            cleanText(
              contact.email ??
                settings.contact?.email
            ),

          address:
            cleanText(
              contact.address ??
                settings.contact?.address
            ),

          clinicHours:
            cleanText(
              contact.clinicHours ??
                settings.contact
                  ?.clinicHours
            ),
        };
      }

      // =================================================
      // GLOBAL THEME
      // =================================================

      if (
        theme &&
        typeof theme === "object"
      ) {
        settings.theme = {
          primaryColor:
            validColor(
              theme.primaryColor,
              settings.theme
                ?.primaryColor ||
                "#CF3650"
            ),

          secondaryColor:
            validColor(
              theme.secondaryColor,
              settings.theme
                ?.secondaryColor ||
                "#33151B"
            ),

          accentColor:
            validColor(
              theme.accentColor,
              settings.theme
                ?.accentColor ||
                "#F5A900"
            ),

          backgroundColor:
            validColor(
              theme.backgroundColor,
              settings.theme
                ?.backgroundColor ||
                "#FFF7F8"
            ),

          textColor:
            validColor(
              theme.textColor,
              settings.theme
                ?.textColor ||
                "#4B5563"
            ),

          fontFamily:
            cleanText(
              theme.fontFamily ??
                settings.theme
                  ?.fontFamily
            ) ||
            "Inter",

          headingSize:
            clampNumber(
              theme.headingSize,
              24,
              80,
              Number(
                settings.theme
                  ?.headingSize
              ) || 48
            ),

          bodySize:
            clampNumber(
              theme.bodySize,
              12,
              24,
              Number(
                settings.theme
                  ?.bodySize
              ) || 16
            ),
        };
      }

      // =================================================
      // SECTION-SPECIFIC TYPOGRAPHY
      // =================================================

      if (
        contentStyles &&
        typeof contentStyles ===
          "object"
      ) {
        /*
         * sanitizeContentStyles now supports:
         *
         * hero
         * about
         * doctor   <-- NEW
         * services
         * contact
         */
        settings.contentStyles =
          sanitizeContentStyles(
            contentStyles,
            settings.contentStyles
          );

        settings.markModified(
          "contentStyles"
        );
      }

      // =================================================
      // SEO
      // =================================================

      if (
        seo &&
        typeof seo === "object"
      ) {
        const currentSeo =
          settings.seo || {};

        const currentHome =
          currentSeo.home || {};

        const currentOpenGraph =
          currentSeo.openGraph || {};

        const currentLocalSeo =
          currentSeo.localSeo || {};

        settings.seo = {
          // -------------------------------
          // GLOBAL SEO
          // -------------------------------

          siteName:
            cleanText(
              seo.siteName ??
                currentSeo.siteName
            ) ||
            "Elite Gynaecology",

          defaultTitle:
            cleanText(
              seo.defaultTitle ??
                currentSeo.defaultTitle
            ) ||
            "Elite Gynaecology | Women's Healthcare",

          defaultMetaDescription:
            cleanText(
              seo.defaultMetaDescription ??
                currentSeo
                  .defaultMetaDescription
            ),

          metaKeywords:
            seo.metaKeywords !==
            undefined
              ? cleanStringArray(
                  seo.metaKeywords
                )
              : currentSeo
                  .metaKeywords || [],

          primaryKeyword:
            cleanText(
              seo.primaryKeyword ??
                currentSeo
                  .primaryKeyword
            ),

          secondaryKeywords:
            seo.secondaryKeywords !==
            undefined
              ? cleanStringArray(
                  seo.secondaryKeywords
                )
              : currentSeo
                  .secondaryKeywords ||
                [],

          targetLocation:
            cleanText(
              seo.targetLocation ??
                currentSeo
                  .targetLocation
            ) ||
            "Lahore, Pakistan",

          // -------------------------------
          // HOME SEO
          // -------------------------------

          home: {
            title:
              cleanText(
                seo.home?.title ??
                  currentHome.title
              ) ||
              "Elite Gynaecology | Women's Healthcare in Lahore",

            metaDescription:
              cleanText(
                seo.home
                  ?.metaDescription ??
                  currentHome
                    .metaDescription
              ),

            metaKeywords:
              seo.home
                ?.metaKeywords !==
              undefined
                ? cleanStringArray(
                    seo.home
                      .metaKeywords
                  )
                : currentHome
                    .metaKeywords ||
                  [],

            primaryKeyword:
              cleanText(
                seo.home
                  ?.primaryKeyword ??
                  currentHome
                    .primaryKeyword
              ),

            secondaryKeywords:
              seo.home
                ?.secondaryKeywords !==
              undefined
                ? cleanStringArray(
                    seo.home
                      .secondaryKeywords
                  )
                : currentHome
                    .secondaryKeywords ||
                  [],

            canonicalUrl:
              cleanUrl(
                seo.home
                  ?.canonicalUrl ??
                  currentHome
                    .canonicalUrl
              ),

            indexPage:
              seo.home
                ?.indexPage !==
              undefined
                ? seo.home
                    .indexPage !==
                  false
                : currentHome
                    .indexPage !==
                  false,
          },

          // -------------------------------
          // OPEN GRAPH
          // -------------------------------

          openGraph: {
            title:
              cleanText(
                seo.openGraph
                  ?.title ??
                  currentOpenGraph
                    .title
              ),

            description:
              cleanText(
                seo.openGraph
                  ?.description ??
                  currentOpenGraph
                    .description
              ),

            image:
              cleanImagePath(
                seo.openGraph
                  ?.image ??
                  currentOpenGraph
                    .image
              ),
          },

          // -------------------------------
          // LOCAL SEO
          // -------------------------------

          localSeo: {
            businessName:
              cleanText(
                seo.localSeo
                  ?.businessName ??
                  currentLocalSeo
                    .businessName
              ) ||
              "Elite Gynaecology",

            doctorName:
              cleanText(
                seo.localSeo
                  ?.doctorName ??
                  currentLocalSeo
                    .doctorName
              ),

            city:
              cleanText(
                seo.localSeo
                  ?.city ??
                  currentLocalSeo
                    .city
              ) ||
              "Lahore",

            country:
              cleanText(
                seo.localSeo
                  ?.country ??
                  currentLocalSeo
                    .country
              ) ||
              "Pakistan",

            phone:
              cleanText(
                seo.localSeo
                  ?.phone ??
                  currentLocalSeo
                    .phone
              ),

            address:
              cleanText(
                seo.localSeo
                  ?.address ??
                  currentLocalSeo
                    .address
              ),
          },
        };

        settings.markModified("seo");
      }

      // =================================================
      // SAVE
      // =================================================

      await settings.save();

      return res.json({
        success: true,

        message:
          "Website settings updated successfully.",

        settings,
      });
    } catch (error) {
      console.error(
        "Update website settings error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to update website settings.",
        });
    }
  }
);

module.exports = router;