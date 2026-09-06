import { Link } from "react-router-dom";
import {
  Stethoscope,
  Calendar,
  FileText,
  ShieldCheck,
  Heart,
  Baby,
  Activity,
  ArrowRight,
  CheckCircle2,
  Microscope,
  Flower2,
  Users,
  Scissors,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  const primaryAction =
    user?.role === "patient"
      ? { to: "/appointments", label: "Book Appointment" }
      : user?.role === "doctor"
        ? { to: "/admin", label: "Go to Dashboard" }
        : { to: "/register", label: "Get Started" };

  const services = [
    {
      icon: Stethoscope,
      title: "Comprehensive Gynecology Consultation",
      desc: "Complete gynecological assessment, consultation, diagnosis and personalized care.",
      tone: "sage",
    },
    {
      icon: Baby,
      title: "Pregnancy & Antenatal Care",
      desc: "Professional antenatal care and regular monitoring throughout pregnancy.",
      tone: "pink",
    },
    {
      icon: Heart,
      title: "High-Risk Pregnancy Management",
      desc: "Specialized monitoring and care for pregnancies requiring additional attention.",
      tone: "sage",
    },
    {
      icon: Microscope,
      title: "Infertility Evaluation & Treatment",
      desc: "Comprehensive fertility evaluation and personalized reproductive healthcare.",
      tone: "pink",
    },
    {
      icon: Activity,
      title: "PCOS & Menstrual Disorder Management",
      desc: "Personalized management of PCOS, irregular periods and menstrual concerns.",
      tone: "sage",
    },
    {
      icon: Flower2,
      title: "Menopause & Hormonal Health Care",
      desc: "Support and personalized care for menopause and hormonal health.",
      tone: "pink",
    },
    {
      icon: ShieldCheck,
      title: "Cervical Cancer Screening (Pap Smear & HPV)",
      desc: "Preventive cervical screening and testing for early detection.",
      tone: "sage",
    },
    {
      icon: Users,
      title: "Family Planning & Contraceptive Services",
      desc: "Confidential counseling and personalized family planning options.",
      tone: "pink",
    },
    {
      icon: Scissors,
      title: "All Type Of Gynecological Surgeries",
      desc: "Professional surgical care for a range of gynecological conditions.",
      tone: "sage",
    },
  ];

  const features = [
    {
      icon: Stethoscope,
      title: "Expert Care",
      desc: "Professional gynaecological consultations focused on your individual needs.",
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      desc: "Book appointments online quickly and conveniently.",
    },
    {
      icon: FileText,
      title: "Digital Records",
      desc: "Organized and secure patient information for better care management.",
    },
    {
      icon: ShieldCheck,
      title: "Privacy First",
      desc: "Your healthcare information is handled with care and confidentiality.",
    },
  ];

  return (
    <div className="bg-[#FAFAF7] text-[#172B49]">
      {/* =====================================================
          HERO / HOME
      ====================================================== */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-[#FAFAF7] via-white to-[#F7E8EA] pt-16 pb-20 lg:pt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div>
              <span className="inline-flex rounded-full bg-[#F7E8EA] px-4 py-2 text-sm font-semibold text-[#6F8F7A]">
                Women's Healthcare • Lahore
              </span>

              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#172B49]">
                Compassionate care
                <span className="block text-[#6F8F7A]">for every woman.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#667085]">
                Expert gynaecological care with a patient-first approach,
                convenient appointments and a secure digital healthcare
                experience.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to={primaryAction.to}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#172B49] px-6 py-3.5 font-semibold text-white hover:bg-[#6F8F7A] transition"
                >
                  {primaryAction.label}
                  <ArrowRight className="h-5 w-5" />
                </Link>

                {!user && (
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-xl border-2 border-[#172B49] px-6 py-3.5 font-semibold text-[#172B49] hover:bg-[#172B49] hover:text-white transition"
                  >
                    Login
                  </Link>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Trusted consultations",
                  "Easy online booking",
                  "Secure records",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-[#667085]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#6F8F7A]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute -inset-8 rounded-[3rem] bg-[#F7E8EA] blur-3xl opacity-70" />

              <div className="relative w-full max-w-xl rounded-[2rem] border border-white bg-white/80 p-5 shadow-xl backdrop-blur">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-[#E7EFE9] via-white to-[#F7E8EA] p-8 min-h-[390px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <img
                      src="/logo-mark.png"
                      alt="Elite Gynaecology"
                      className="h-16 w-16 object-contain"
                    />

                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#6F8F7A] shadow-sm">
                      Patient First
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#D98C9A]">
                      ELITE GYNAECOLOGY LAHORE
                    </p>

                    <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#172B49]">
                      Care that listens.
                      <br />
                      Care that understands.
                    </h2>

                    <p className="mt-4 max-w-md text-sm leading-6 text-[#667085]">
                      A calm, modern space for consultations, appointments and
                      women's health management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ====================================================== */}
      <section id="about" className="scroll-mt-24 bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-[#6F8F7A]">
                About Elite Gynaecology
              </span>

              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#172B49]">
                Dedicated to women's health and well-being.
              </h2>

              <p className="mt-5 text-[#667085] leading-8">
                Elite Gynaecology Lahore is designed to provide women with
                professional, compassionate and personalized healthcare. Our
                approach focuses on creating a comfortable environment where
                every patient can discuss her concerns with confidence.
              </p>

              <p className="mt-4 text-[#667085] leading-8">
                From routine gynecological consultations and pregnancy care to
                reproductive health and hormonal management, we aim to make
                every step of your healthcare journey simple and organized.
              </p>

              <div className="mt-7 space-y-3">
                {[
                  "Patient-centered healthcare",
                  "Professional gynecological care",
                  "Comfortable and confidential consultations",
                  "Modern digital appointment management",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#6F8F7A]" />
                    <span className="text-[#667085]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#F7E8EA] p-8 lg:p-10">
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#E7EFE9] flex items-center justify-center">
                  <Heart className="h-7 w-7 text-[#6F8F7A]" />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-[#172B49]">
                  Your comfort matters.
                </h3>

                <p className="mt-4 text-[#667085] leading-7">
                  We believe quality healthcare begins with listening,
                  understanding and building trust with every patient.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[#E7EFE9] p-5">
                    <p className="text-2xl font-bold text-[#172B49]">9+</p>
                    <p className="mt-1 text-sm text-[#667085]">
                      Specialized Services
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F7E8EA] p-5">
                    <p className="text-2xl font-bold text-[#172B49]">24/7</p>
                    <p className="mt-1 text-sm text-[#667085]">Online Access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}
      <section id="services" className="scroll-mt-24 bg-[#FAFAF7] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#6F8F7A]">
              Our Services
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#172B49]">
              Comprehensive care for every stage of women's health.
            </h2>

            <p className="mt-4 text-[#667085] leading-7">
              Professional gynecological services designed to support your
              health, comfort and well-being.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, tone }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    tone === "sage" ? "bg-[#E7EFE9]" : "bg-[#F7E8EA]"
                  }`}
                >
                  <Icon
                    className={`h-7 w-7 ${
                      tone === "sage" ? "text-[#6F8F7A]" : "text-[#D98C9A]"
                    }`}
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#172B49]">
                  {title}
                </h3>

                <p className="mt-3 text-sm text-[#667085] leading-6">{desc}</p>

                <div className="mt-5 h-1 w-10 rounded-full bg-[#D98C9A] group-hover:w-16 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY CHOOSE US
      ====================================================== */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#6F8F7A]">
              Why Elite Gynaecology
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#172B49]">
              A better way to manage your care.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-100 bg-[#FAFAF7] p-6 text-center hover:border-[#6F8F7A]/40 hover:shadow-md transition"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-[#E7EFE9] flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[#6F8F7A]" />
                </div>

                <h3 className="mt-5 font-bold text-[#172B49]">{title}</h3>

                <p className="mt-2 text-sm text-[#667085] leading-6">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          OUR DOCTOR
      ====================================================== */}
      <section id="doctor" className="scroll-mt-24 bg-[#F7E8EA] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F8F7A]">
              Meet Our Specialist
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#172B49]">
              Expert Care. Trusted Experience.
            </h2>

            <p className="mt-4 text-[#667085] leading-7">
              Dedicated to providing compassionate, professional and
              personalized healthcare for women at every stage of life.
            </p>
          </div>

          {/* Doctor Card */}
          <div className="max-w-6xl mx-auto overflow-hidden rounded-[2rem] bg-white shadow-xl border border-white">
            <div className="grid lg:grid-cols-[1.08fr_1fr]">
              {/* Doctor Image */}
              <div className="relative bg-[#E7EFE9] min-h-[500px] lg:min-h-[580px] flex items-center justify-center overflow-hidden">
                <div className="absolute top-8 left-8 w-28 h-28 rounded-full bg-[#F7E8EA] opacity-80" />

                <div className="absolute bottom-8 right-8 w-32 h-32 rounded-full bg-[#6F8F7A]/10" />

                <img
                  src="/dr image.jpeg"
                  alt="Prof. Dr. Ambreen Akhtar - Gynaecologist"
                  className="relative z-10 w-full h-full object-cover object-center"
                />
              </div>

              {/* Doctor Information */}
              <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                <span className="inline-flex self-start rounded-full bg-[#F7E8EA] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#D98C9A]">
                  Consultant Gynaecologist
                </span>

                <h3 className="mt-5 text-3xl md:text-4xl font-bold leading-tight text-[#172B49]">
                  Prof. Dr. Ambreen Akhtar
                </h3>

                <p className="mt-3 text-[#6F8F7A] font-semibold">
                  Specialist in Gynaecology & Gynae Oncology
                </p>

                {/* Qualifications */}
                <div className="mt-7">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[#172B49]">
                    Qualifications
                  </h4>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-[#E7EFE9] px-4 py-2 text-sm font-medium text-[#172B49]">
                      MBBS
                    </span>

                    <span className="rounded-lg bg-[#F7E8EA] px-4 py-2 text-sm font-medium text-[#172B49]">
                      FCPS
                    </span>

                    <span className="rounded-lg bg-[#E7EFE9] px-4 py-2 text-sm font-medium text-[#172B49]">
                      MCPS
                    </span>

                    <span className="rounded-lg bg-[#F7E8EA] px-4 py-2 text-sm font-medium text-[#172B49]">
                      CHPE
                    </span>

                    <span className="rounded-lg bg-[#E7EFE9] px-4 py-2 text-sm font-medium text-[#172B49]">
                      FIMSA (India)
                    </span>

                    <span className="rounded-lg bg-[#F7E8EA] px-4 py-2 text-sm font-medium text-[#172B49]">
                      Masters in Gynae Oncology (Spain)
                    </span>
                  </div>
                </div>

                <div className="my-7 h-px bg-slate-100" />

                {/* Areas of Expertise */}
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#172B49]">
                  Areas of Expertise
                </h4>

                <div className="mt-4 grid sm:grid-cols-2 gap-x-5 gap-y-3">
                  {[
                    "Comprehensive Gynecological Care",
                    "Pregnancy & Antenatal Care",
                    "High-Risk Pregnancy Management",
                    "Gynae Oncology",
                    "PCOS & Hormonal Health",
                    "Women's Reproductive Health",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6F8F7A]" />

                      <span className="text-sm leading-5 text-[#667085]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    to={primaryAction.to}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#172B49] px-6 py-3.5 font-semibold text-white hover:bg-[#6F8F7A] transition duration-300"
                  >
                    Book a Consultation
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT
      ====================================================== */}
      <section id="contact" className="scroll-mt-24 bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-[#6F8F7A]">
                Contact Us
              </span>

              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#172B49]">
                We're here to help.
              </h2>

              <p className="mt-4 text-[#667085] leading-7 max-w-lg">
                Have a question or want to schedule a consultation? Get in touch
                with Elite Gynaecology Lahore.
              </p>

              <div className="mt-8 space-y-5">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E7EFE9] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#6F8F7A]" />
                  </div>

                  <div>
                    <h4 className="font-bold text-[#172B49]">Clinic Address</h4>

                    <p className="mt-1 text-[#667085]">Lahore, Pakistan</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F7E8EA] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#D98C9A]" />
                  </div>

                  <div>
                    <h4 className="font-bold text-[#172B49]">Phone</h4>

                    <p className="mt-1 text-[#667085]">+92 318 0082848</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E7EFE9] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#6F8F7A]" />
                  </div>

                  <div>
                    <h4 className="font-bold text-[#172B49]">Email</h4>

                    <p className="mt-1 text-[#667085]">
                      doctorambreenakhtar@gmail.com
                    </p>
                  </div>
                </div>

                {/* Clinic Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F7E8EA] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#D98C9A]" />
                  </div>

                  <div>
                    <h4 className="font-bold text-[#172B49]">Clinic Hours</h4>

                    <p className="mt-1 text-[#667085]">
                      Monday - Saturday • 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="rounded-3xl bg-[#FAFAF7] border border-slate-100 p-7 md:p-9 shadow-sm">
              <h3 className="text-2xl font-bold text-[#172B49]">
                Book a Consultation
              </h3>

              <p className="mt-2 text-[#667085]">
                Take the first step toward better women's healthcare.
              </p>

              <div className="mt-7 space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#6F8F7A] transition"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#6F8F7A] transition"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#6F8F7A] transition"
                />

                <textarea
                  rows="4"
                  placeholder="How can we help you?"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#6F8F7A] transition resize-none"
                />

                <Link
                  to={primaryAction.to}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-[#172B49] px-6 py-3.5 font-semibold text-white hover:bg-[#6F8F7A] transition"
                >
                  Book an Appointment
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="bg-[#172B49] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Your health deserves expert care.
          </h2>

          <p className="mt-4 text-slate-300">
            Schedule your consultation with Elite Gynaecology Lahore today.
          </p>

          <Link
            to={primaryAction.to}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#6F8F7A] px-7 py-3.5 font-semibold text-white hover:bg-[#D98C9A] transition"
          >
            {primaryAction.label}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
