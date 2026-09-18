require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");
const Blog = require("./models/Blog");

// =====================================================
// DEFAULT DOCTOR CONFIGURATION
// IMPORTANT:
// Password is NEVER hard-coded here.
// It must come from backend/.env as:
// DOCTOR_SEED_PASSWORD=your-strong-password
// =====================================================

const DEFAULT_DOCTOR = {
  name: "Dr. Ambreen Akhtar",
  email: "doctor@elitegynaecology.com",
  phone: "03001234567",
  specialization: "Gynaecologist & Women's Health Specialist",
  qualification: "MBBS, FCPS",
  licenseNumber: "ELITE-GYN-001",
  role: "doctor",
  country: "Pakistan",
  isActive: true,
};

// =====================================================
// DEFAULT BLOGS
// =====================================================

const BLOGS = [
  {
    title: "Understanding PCOS: Symptoms and When to Seek Help",
    slug: "understanding-pcos-symptoms-and-when-to-seek-help",
    excerpt:
      "A practical overview of common PCOS symptoms and why individual medical assessment matters.",
    content:
      "Polycystic Ovary Syndrome can affect menstrual cycles, ovulation, skin, hair and metabolism. Symptoms vary between patients. Keeping a menstrual history and discussing persistent changes with a qualified gynaecologist can help with timely assessment and personalized care.",
    featuredImage:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=80",
    category: "Women's Health",
    tags: ["PCOS", "Hormonal Health", "Women's Health"],
  },
  {
    title: "Healthy Pregnancy: Important Antenatal Checkups",
    slug: "healthy-pregnancy-important-antenatal-checkups",
    excerpt:
      "Why regular antenatal appointments help monitor maternal and fetal wellbeing.",
    content:
      "Antenatal care provides opportunities to monitor pregnancy progress, discuss nutrition and lifestyle, review screening needs and identify concerns early. The schedule and investigations should always be individualized by the treating healthcare professional.",
    featuredImage:
      "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=1200&q=80",
    category: "Pregnancy",
    tags: ["Pregnancy", "Antenatal Care", "Maternal Health"],
  },
  {
    title: "Period Health: Tracking Your Menstrual Cycle",
    slug: "period-health-tracking-your-menstrual-cycle",
    excerpt:
      "Simple information about cycle tracking and signs that deserve professional attention.",
    content:
      "Tracking cycle dates, flow changes and associated symptoms can give useful information during a consultation. Significant changes, persistent pain, unusually heavy bleeding or repeated irregular cycles should be discussed with a healthcare professional.",
    featuredImage:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80",
    category: "Women's Health",
    tags: ["Periods", "Cycle Tracking", "Women's Health"],
  },
];

// =====================================================
// SEED DATABASE
// =====================================================

async function seed() {
  try {
    // -------------------------------------------------
    // Validate required environment variables
    // -------------------------------------------------

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing. Add it to your backend/.env file.",
      );
    }

    if (!process.env.DOCTOR_SEED_PASSWORD) {
      throw new Error(
        "DOCTOR_SEED_PASSWORD is missing. Add it to your backend/.env file.",
      );
    }

    const doctorPassword = process.env.DOCTOR_SEED_PASSWORD;

    // -------------------------------------------------
    // Connect MongoDB
    // -------------------------------------------------

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    // -------------------------------------------------
    // Single Doctor Clinic
    // -------------------------------------------------

    await User.deleteMany({
      role: "doctor",
      email: { $ne: DEFAULT_DOCTOR.email },
    });

    let doctor = await User.findOne({
      email: DEFAULT_DOCTOR.email,
      role: "doctor",
    }).select("+password");

    // -------------------------------------------------
    // Create doctor if not found
    // -------------------------------------------------

    if (!doctor) {
      doctor = await User.create({
        ...DEFAULT_DOCTOR,
        password: doctorPassword,
      });

      console.log("Default doctor created.");
    } else {
      // -------------------------------------------------
      // Update doctor profile
      // -------------------------------------------------

      doctor.name = DEFAULT_DOCTOR.name;
      doctor.email = DEFAULT_DOCTOR.email;
      doctor.phone = DEFAULT_DOCTOR.phone;
      doctor.specialization = DEFAULT_DOCTOR.specialization;
      doctor.qualification = DEFAULT_DOCTOR.qualification;
      doctor.licenseNumber = DEFAULT_DOCTOR.licenseNumber;
      doctor.role = DEFAULT_DOCTOR.role;
      doctor.country = DEFAULT_DOCTOR.country;
      doctor.isActive = DEFAULT_DOCTOR.isActive;

      // -------------------------------------------------
      // Update password only when different
      // -------------------------------------------------

      const passwordMatches =
        await doctor.comparePassword(doctorPassword);

      if (!passwordMatches) {
        doctor.password = doctorPassword;
      }

      await doctor.save();

      console.log("Default doctor updated.");
    }

    // -------------------------------------------------
    // Seed Blogs
    // -------------------------------------------------

    for (const blogData of BLOGS) {
      await Blog.findOneAndUpdate(
        {
          slug: blogData.slug,
        },
        {
          ...blogData,
          authorId: doctor._id,
          authorName: doctor.name,
          isPublished: true,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    console.log("3 published blogs seeded successfully.");

    // IMPORTANT:
    // Never print passwords or other credentials here.
    console.log("Doctor account seeded successfully.");
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exitCode = 1;
  } finally {
    // -------------------------------------------------
    // Disconnect MongoDB safely
    // -------------------------------------------------

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
  }
}

// =====================================================
// RUN SEED
// =====================================================

seed();