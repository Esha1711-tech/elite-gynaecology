require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Blog = require("./models/Blog");

const DEFAULT_DOCTOR = {
  name: "Dr. Ambreen Akhtar",
  email: "doctor@elitegynaecology.com",
  password: "REMOVED_OLD_PASSWORD",
  phone: "03001234567",
  specialization: "Gynaecologist & Women's Health Specialist",
  qualification: "MBBS, FCPS",
  licenseNumber: "ELITE-GYN-001",
  role: "doctor",
  country: "Pakistan",
  isActive: true,
};

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

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/elite_gynaecology",
    );
    console.log("MongoDB connected.");

    // Keep one configured doctor for this single-doctor clinic.
    await User.deleteMany({
      role: "doctor",
      email: { $ne: DEFAULT_DOCTOR.email },
    });

    let doctor = await User.findOne({ email: DEFAULT_DOCTOR.email });
    if (!doctor) {
      doctor = await User.create(DEFAULT_DOCTOR);
      console.log("Default doctor created.");
    } else {
      Object.assign(doctor, DEFAULT_DOCTOR);
      // Re-save only if the password is not already the desired one.
      const passwordMatches = await doctor.comparePassword(
        DEFAULT_DOCTOR.password,
      );
      if (!passwordMatches) doctor.password = DEFAULT_DOCTOR.password;
      await doctor.save();
      console.log("Default doctor updated.");
    }

    for (const blogData of BLOGS) {
      await Blog.findOneAndUpdate(
        { slug: blogData.slug },
        {
          ...blogData,
          authorId: doctor._id,
          authorName: doctor.name,
          isPublished: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    console.log("3 published blogs seeded with featured images.");
    console.log("Doctor login: doctor@elitegynaecology.com / REMOVED_OLD_PASSWORD");
  } catch (error) {
    console.error("Seed error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
