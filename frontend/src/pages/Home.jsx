import { useEffect, useState } from "react";
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
  Award,
  UserRoundCheck,
  ClipboardCheck,
  MonitorSmartphone,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: "/checkup.jpg",
      eyebrow: "Prenatal Excellence",
      title: "Exceptional Maternity Care",
      text: "A warm, supportive approach to pregnancy, motherhood and every stage of womanhood.",
    },
    {
      image: "/services/pregnancy-antenatal-care.jpg",
      eyebrow: "Pregnancy & Antenatal Care",
      title: "Care Through Every Trimester",
      text: "Personalized antenatal support with professional guidance and regular monitoring throughout pregnancy.",
    },
    {
      image: "/services/high-risk-pregnancy.jpg",
      eyebrow: "Specialist Women's Care",
      title: "Support When You Need It Most",
      text: "Experienced gynaecological care focused on comfort, privacy and individual healthcare needs.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const previousSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

  // =========================================================
  // PRIMARY ACTION
  // =========================================================

  const primaryAction =
    user?.role === "patient"
      ? {
          to: "/appointments",
          label: "Book Appointment",
        }
      : user?.role === "doctor"
        ? {
            to: "/admin",
            label: "Go to Dashboard",
          }
        : {
            to: "/register",
            label: "Book Appointment",
          };

  // =========================================================
  // SERVICES
  // =========================================================

  const services = [
    {
      title: "Comprehensive Gynecology Consultation",
      desc: "Complete gynecological assessment, consultation, diagnosis and personalized care.",
      slug: "gynecology-consultation",
      image: "/services/gyneacology-consultation.jpg",
    },
    {
      // icon: Baby,
      title: "Pregnancy & Antenatal Care",
      desc: "Professional antenatal care and regular monitoring throughout pregnancy.",
      slug: "pregnancy-antenatal-care",
      image: "/services/pregnancy-antenatal-care.jpg",
    },
    {
      // icon: Heart,
      title: "High-Risk Pregnancy Management",
      desc: "Specialized monitoring and care for pregnancies requiring additional attention.",
      slug: "high-risk-pregnancy",
      image: "/services/high-risk-pregnancy.jpg",
    },
    {
      // icon: Microscope,
      title: "Infertility Evaluation & Treatment",
      desc: "Comprehensive fertility evaluation and personalized reproductive healthcare.",
      slug: "infertility-treatment",
      image: "/services/infertility-treatment.jpg",
    },
    {
      // icon: Activity,
      title: "PCOS & Menstrual Disorder Management",
      desc: "Personalized management of PCOS, irregular periods and menstrual concerns.",
      slug: "pcos-menstrual-disorders",
      image: "/services/pcos-menstrual-disorders.jpg",
    },
    {
      // icon: Flower2,
      title: "Menopause & Hormonal Health Care",
      desc: "Support and personalized care for menopause and hormonal health.",
      slug: "menopause-hormonal-health",
      image: "/services/menopause-hormonal-health.jpg",
    },
    {
      // icon: ShieldCheck,
      title: "Cervical Cancer Screening",
      desc: "Pap smear and HPV screening services focused on prevention and early detection.",
      slug: "cervical-cancer-screening",
      image: "/services/cervical-cancer-screening.jpg",
    },
    {
      // icon: Users,
      title: "Family Planning & Contraceptive Services",
      desc: "Confidential counseling and personalized family planning options.",
      slug: "family-planning",
      image: "/services/family-planning.jpg",
    },
    {
      // icon: Scissors,
      title: "All Types of Gynecological Surgeries",
      desc: "Professional surgical care for a wide range of gynecological conditions.",
      slug: "gynecological-surgeries",
      image: "/services/gynecological-surgeries.jpg",
    },
  ];

  // =========================================================
  // WHY CHOOSE US
  // =========================================================

  const features = [
    {
      icon: Award,
      title: "Specialist Care",
      desc: "Professional women's healthcare under an experienced consultant gynaecologist.",
    },
    {
      icon: Heart,
      title: "Patient-Centered",
      desc: "Every consultation is focused on comfort, privacy and individual healthcare needs.",
    },
    {
      icon: Calendar,
      title: "Easy Appointments",
      desc: "Convenient online appointment booking and organized consultation management.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Healthcare",
      desc: "Patient information and medical records are handled securely and confidentially.",
    },
  ];

  // =========================================================
  // FAQ
  // =========================================================

  const faqs = [
    {
      question: "When should I visit a gynaecologist?",
      answer:
        "You can consult a gynaecologist for routine women's health checkups, menstrual concerns, pregnancy care, fertility concerns, hormonal issues, pelvic symptoms or other reproductive health concerns.",
    },
    {
      question: "Can I book an appointment online?",
      answer:
        "Yes. Registered patients can conveniently request and manage appointments through the Elite Gynaecology online portal.",
    },
    {
      question: "Do you provide pregnancy and antenatal care?",
      answer:
        "Yes. Pregnancy and antenatal care is one of our core services, including routine monitoring and care throughout pregnancy.",
    },
    {
      question: "Are consultations confidential?",
      answer:
        "Yes. Patient privacy and confidentiality are an important part of our healthcare and digital record management process.",
    },
    {
      question: "What should I bring to my first appointment?",
      answer:
      "Please bring any previous medical records, test results, ultrasound reports, current medication details, and relevant health information. This helps the doctor better understand your medical history and provide appropriate guidance."
    },
  ];

  return (
    <div className="bg-white text-[#6E1F32]">

      {/* =====================================================
          HERO / AUTO SLIDER
      ====================================================== */}
      <section id="home" className="relative overflow-hidden bg-[#33151B]">
        <div className="relative min-h-[560px] md:min-h-[620px] lg:min-h-[660px]">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.title}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/15" />
            </div>
          ))}

          <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl items-center px-5 sm:px-6 md:min-h-[620px] lg:min-h-[660px] lg:px-8">
            <div className="max-w-3xl pt-8 text-white">
              <p className="text-lg font-bold text-[#F5B1BC] md:text-xl">
                {heroSlides[currentSlide].eyebrow}
              </p>

              <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.03] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                {heroSlides[currentSlide].title}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90 md:text-2xl">
                {heroSlides[currentSlide].text}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/923180082848"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-[#CF3650] shadow-lg transition hover:-translate-y-0.5"
                >
                  <Phone className="h-5 w-5" />
                  Call Us
                </a>

                <Link
                  to={primaryAction.to}
                  className="appointment-btn"
                >
                  <Calendar className="h-5 w-5" />
                  {user?.role === "doctor" ? "Go to Dashboard" : "Book Your Appointment"}
                </Link>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous banner"
            className="absolute left-4 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30 md:flex"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next banner"
            className="absolute right-4 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30 md:flex"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-3 rounded-full transition-all ${
                  currentSlide === index ? "w-9 bg-[#CF3650]" : "w-3 bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK INFORMATION STRIP
      ====================================================== */}

      <section className="relative z-20 -mt-1">

        <div className="max-w-7xl mx-auto">

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 bg-[#CF3650]">

            {[
              {
                icon: Calendar,
                title: "Appointments",
                text: "Book Online",
              },
              {
                icon: Stethoscope,
                title: "Specialist Care",
                text: "Women's Healthcare",
              },
              {
                icon: Phone,
                title: "Call Us",
                text: "+92 318 0082848",
              },
              {
                icon: Clock,
                title: "Clinic Hours",
                text: "Mon - Sat",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className={`flex items-center gap-4 px-7 py-7 ${
                  index !== 3
                    ? "lg:border-r border-white/15"
                    : ""
                }`}
              >
                <Icon className="w-7 h-7 text-[#F5A900] shrink-0" />

                <div>
                  <p className="text-white font-semibold">
                    {title}
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {text}
                  </p>
                </div>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          ABOUT
      ====================================================== */}

      <section
        id="about"
        className="scroll-mt-24 py-6 lg:py-7 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-5 lg:gap-5 items-center">

            {/* IMAGE */}

            <div className="relative">

              <div className="bg-[#FCEBED] p-4 sm:p-7">

                <img
                  src="/hero-image.png"
                  alt="Elite Gynaecology"
                  className="w-full h-[470px] object-cover object-top"
                />

              </div>

              <div className="absolute -bottom-7 right-0 sm:-right-7 bg-[#E85B73] text-white p-7 shadow-lg">

                <Heart className="w-8 h-8" />

                <p className="mt-3 text-xl font-bold">
                  Compassionate
                </p>

                <p className="text-sm text-white/80">
                  Women's Healthcare
                </p>

              </div>

            </div>

            {/* CONTENT */}

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#CF3650]">
                About Elite Gynaecology
              </p>

              <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#6E1F32]">
                Complete Women's Healthcare
                <span className="block text-[#E85B73]">
                  Under Expert Supervision
                </span>
              </h2>

              <p className="mt-4 text-[#6F5B60] leading-8">
                Elite Gynaecology Lahore provides professional,
                compassionate and personalized healthcare for women at
                different stages of life.
              </p>

              <p className="mt-4 text-[#6F5B60] leading-8">
                From routine gynaecological consultations and pregnancy
                care to reproductive health, hormonal management and
                specialized treatment, our focus is on making every
                patient's healthcare journey comfortable and organized.
              </p>

              <div className="mt-5 grid sm:grid-cols-2 gap-4 text-center">

                {[
                  "Personalized Consultation",
                  "Pregnancy Care",
                  "Reproductive Healthcare",
                  "Gynae Oncology",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#CF3650] shrink-0" />

                    <span className="text-sm font-medium text-[#5E4750]">
                      {item}
                    </span>
                  </div>
                ))}

              </div>
              <div className="flex justify-center">
  <Link
    to={primaryAction.to}
    className="mt-6 inline-flex items-center justify-center gap-3 font-semibold text-[#6E1F32] group"
  >
    Schedule a Consultation

    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
  </Link>
</div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}

      <section
  id="services"
  className="scroll-mt-24 bg-[#FFF7F8] py-10 lg:py-14"
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* HEADING */}
    <div className="text-center max-w-3xl mx-auto">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#CF3650]">
        Our Services
      </p>

      <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-[#6E1F32]">
        Complete Women's Healthcare Services
      </h2>

      <p className="mt-4 text-[#6F5B60] leading-7">
        Comprehensive care designed to support women's health from
        routine consultations to specialized treatment.
      </p>
    </div>

    {/* SERVICE CARDS */}
    <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
     {services.map(({ title, desc, slug, image }) => (
  <Link
    key={slug}
    to={`/services/${slug}`}
    className="group overflow-hidden rounded-2xl border border-[#F0D8DD] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#CF3650]/40 hover:shadow-xl"
  >
    {/* IMAGE */}
    <div className="h-48 overflow-hidden">
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>

    {/* CONTENT */}
    <div className="p-5 text-center">
      <h3 className="text-lg font-bold text-[#6E1F32] transition group-hover:text-[#CF3650]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#6F5B60]">
        {desc}
      </p>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-[#CF3650]">
        Learn More
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  {/* </Link>
))} */}

          {/* BOTTOM HOVER LINE */}
          <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#E85B73] transition-all duration-500 group-hover:w-full" />
        </Link>
      ))}
    </div>
  </div>
</section>

      {/* =====================================================
          DOCTOR
      ====================================================== */}

      <section
        id="doctor"
        className="scroll-mt-24 py-6 lg:py-7 bg-white"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-5">

            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#CF3650]">
              Meet Our Specialist
            </p>

            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-[#6E1F32]">
              Experienced Care You Can Trust
            </h2>

          </div>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-3xl bg-[#FFF7F8] shadow-sm">

            {/* IMAGE */}

            <div className="relative min-h-[520px]">

              <img
                src="/dr image.jpeg"
                alt="Prof. Dr. Ambreen Akhtar"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />

            </div>

            {/* DETAILS */}

            <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center">

              <p className="text-sm uppercase tracking-[0.16em] font-bold text-[#E85B73]">
                Consultant Gynaecologist
              </p>

              <h3 className="mt-3 text-3xl md:text-4xl font-bold text-[#6E1F32]">
                Prof. Dr. Ambreen Akhtar
              </h3>

              <p className="mt-3 font-semibold text-[#CF3650]">
                Specialist in Gynaecology & Gynae Oncology
              </p>

              <div className="mt-5">

                <p className="text-sm font-bold uppercase tracking-wider text-[#6E1F32]">
                  Qualifications
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  {[
                    "MBBS",
                    "FCPS",
                    "MCPS",
                    "CHPE",
                    "FIMSA (India)",
                    "Masters in Gynae Oncology (Spain)",
                  ].map((qualification) => (
                    <span
                      key={qualification}
                      className="bg-white border border-[#F0D8DD] px-4 py-2 text-sm text-[#5E4750]"
                    >
                      {qualification}
                    </span>
                  ))}

                </div>

              </div>

              <div className="mt-6">

                <p className="text-sm font-bold uppercase tracking-wider text-[#6E1F32]">
                  Areas of Expertise
                </p>

                <div className="mt-4 grid sm:grid-cols-2 gap-3">

                  {[
                    "Comprehensive Gynaecology",
                    "Pregnancy & Antenatal Care",
                    "High-Risk Pregnancy",
                    "Gynae Oncology",
                    "PCOS & Hormonal Health",
                    "Reproductive Healthcare",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 mt-1 text-[#CF3650] shrink-0" />

                      <span className="text-sm text-[#6F5B60]">
                        {item}
                      </span>
                    </div>
                  ))}

                </div>

              </div>

              <div className="mt-5 flex flex-wrap gap-3">

                <Link
                  to={primaryAction.to}
                  className="appointment-btn"
                >
                  Book Appointment

                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="https://wa.me/923180082848"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border 
                  border-[#6E1F32] text-[#6E1F32] px-6 py-3.5 rounded-full font-semibold hover:bg-[#CF3650] hover:text-white transition"
                >
                  <Phone className="w-5 h-5" />

                  Call Now
                </a>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          WHY CHOOSE US
      ====================================================== */}

      <section className="bg-[#8F2338] py-6 lg:py-7">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-5 lg:gap-5">

            <div>

              <p className="text-sm uppercase tracking-[0.18em] font-bold text-[#E85B73]">
                Why Choose Us
              </p>

              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white leading-tight">
                Women's Healthcare Focused on You
              </h2>

              <p className="mt-5 leading-7 text-slate-300">
                Professional expertise combined with compassionate,
                personalized and organized healthcare.
              </p>

              <Link
                to={primaryAction.to}
                className="appointment-btn"
              >
                Book Your Consultation

                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>

            </div>

            <div className="grid sm:grid-cols-2 gap-px bg-white/15">

              {features.map(
                ({ icon: Icon, title, desc }) => (

                  <div
                    key={title}
                    className="bg-[#8F2338] p-7 hover:bg-[#A92B43] transition"
                  >

                    <Icon className="w-8 h-8 text-[#E85B73]" />

                    <h3 className="mt-5 text-xl font-bold text-white">
                      {title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {desc}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
    PATIENT CARE / DIGITAL FACILITIES
====================================================== */}

<section className="relative overflow-hidden bg-[#FFF7F8] py-6 lg:py-7">
  {/* Decorative background */}
  <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#FCEBED]/70 blur-3xl" />
  <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#FDE6EA]/60 blur-3xl" />

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Heading */}
    <div className="text-center max-w-3xl mx-auto">
      <span className="inline-flex items-center gap-2 rounded-full bg-[#FCEBED] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#CF3650]">
        <span className="h-2 w-2 rounded-full bg-[#E85B73]" />
        Patient Facilities
      </span>

      <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold text-[#6E1F32]">
        Modern Care.
        <span className="text-[#CF3650]"> Simple Experience.</span>
      </h2>

      <p className="mt-5 max-w-2xl mx-auto text-[#6F5B60] leading-7">
        Digital healthcare facilities designed to make appointments,
        medical information and patient care easier to manage.
      </p>
    </div>

    {/* Facility Cards */}
   <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {[
    {
      title: "Online Booking",
      desc: "Schedule and manage your appointments conveniently online.",
    },
    {
      title: "Medical Records",
      desc: "Keep your healthcare information organized and accessible.",
    },
    {
      title: "Reports",
      desc: "View and manage your medical reports from one secure place.",
    },
    {
      title: "Patient Portal",
      desc: "Access your healthcare services through a simple digital portal.",
    },
  ].map(({ title, desc }) => (
    <div
      key={title}
      className="group rounded-xl border border-[#F0D8DD] bg-white px-5 py-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#CF3650]/40 hover:shadow-md"
    >
      <h3 className="text-lg font-bold text-[#6E1F32] transition-colors duration-300 group-hover:text-[#CF3650]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#6F5B60]">
        {desc}
      </p>
 
  

          {/* Bottom decoration */}
          {/* <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#CF3650]">
            <span>Patient Service</span>

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
          </div> */}

          {/* Hover bottom line */}
          <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#CF3650] to-[#E85B73] transition-all duration-500 group-hover:w-full" />
        </div>
      ))}
    </div>

    {/* Bottom message */}
    <div className="mt-6 flex flex-col items-center justify-between gap-5 rounded-2xl border border-[#F0D8DD] bg-white/80 px-6 py-6 shadow-sm backdrop-blur sm:flex-row lg:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FDE6EA]">
          <ShieldCheck className="h-6 w-6 text-[#E85B73]" />
        </div>

        <div>
          <h4 className="font-bold text-[#6E1F32]">
            Your healthcare, organized in one place
          </h4>

          <p className="mt-1 text-sm text-[#6F5B60]">
            Convenient access with privacy and patient-focused care.
          </p>
        </div>
      </div>

      <Link
        to={primaryAction.to}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#6E1F32] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#CF3650]"
      >
        Get Started
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </div>
</section>
      {/* =====================================================
          FAQ
      ====================================================== */}

      <section className="py-6 lg:py-7 bg-white">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto">

            <p className="text-sm uppercase tracking-[0.18em] font-bold text-[#CF3650]">
              Frequently Asked Questions
            </p>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#6E1F32]">
              How Can We Help?
            </h2>

          </div>

          <div className="mt-6 border-t border-[#F0D8DD]">

            {faqs.map((faq, index) => (

              <details
                key={faq.question}
                className="group border-b border-[#F0D8DD]"
              >

                <summary className="cursor-pointer list-none flex items-center justify-between gap-5 py-6">

                  <div className="flex items-start gap-4">

                    <span className="text-sm font-bold text-[#E85B73]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="font-bold text-[#6E1F32]">
                      {faq.question}
                    </h3>

                  </div>

                  <ChevronRight className="w-5 h-5 shrink-0 text-[#CF3650] group-open:rotate-90 transition" />

                </summary>

                <p className="pb-6 pl-12 pr-8 leading-7 text-[#6F5B60]">
                  {faq.answer}
                </p>

              </details>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTACT
      ====================================================== */}

      <section
        id="contact"
        className="scroll-mt-24 bg-[#FFF7F8] py-6 lg:py-7"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2">

            {/* CONTACT DETAILS */}

            <div className="bg-white p-8 md:p-12">

              <p className="text-sm uppercase tracking-[0.18em] font-bold text-[#CF3650]">
                Contact Us
              </p>

              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#6E1F32]">
                Get in Touch
              </h2>

              <p className="mt-4 leading-7 text-[#6F5B60]">
                Contact Elite Gynaecology Lahore for appointments and
                consultation information.
              </p>

              <div className="mt-5 space-y-6">

                <div className="flex gap-4">

                  <MapPin className="w-6 h-6 text-[#F5A900] shrink-0" />

                  <div>
                    <p className="font-bold text-[#6E1F32]">
                      Clinic Address
                    </p>

                    <p className="mt-1 text-sm text-[#6F5B60]">
                      Lahore, Pakistan
                    </p>
                  </div>

                </div>

                <div className="flex gap-4">

                  <Phone className="w-6 h-6 text-[#F5A900] shrink-0" />

                  <div>
                    <p className="font-bold text-[#6E1F32]">
                      Phone
                    </p>

                    <a
                      href="https://wa.me/923180082848"
                  target="_blank"
                  rel="noopener noreferrer"
                      className="mt-1 block text-sm text-[#6F5B60] hover:text-[#CF3650]"
                    >
                      +92 318 0082848
                    </a>
                  </div>

                </div>

                <div className="flex gap-4">

                  <Mail className="w-6 h-6 text-[#F5A900] shrink-0" />

                  <div>
                    <p className="font-bold text-[#6E1F32]">
                      Email
                    </p>

                    <a
                      href="mailto:doctorambreenakhtar@gmail.com"
                      className="mt-1 block text-sm text-[#6F5B60] break-all hover:text-[#CF3650]"
                    >
                      doctorambreenakhtar@gmail.com
                    </a>
                  </div>

                </div>

                <div className="flex gap-4">

                  <Clock className="w-6 h-6 text-[#F5A900] shrink-0" />

                  <div>
                    <p className="font-bold text-[#6E1F32]">
                      Clinic Hours
                    </p>

                    <p className="mt-1 text-sm text-[#6F5B60]">
                      Monday - Saturday
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* APPOINTMENT CTA */}

            <div className="bg-[#FCEBED] p-8 md:p-12 flex flex-col justify-center">

              <UserRoundCheck className="w-12 h-12 text-[#CF3650]" />

              <h3 className="mt-6 text-3xl font-bold text-[#6E1F32]">
                Need a Consultation?
              </h3>

              <p className="mt-4 max-w-md leading-7 text-[#6F5B60]">
                Schedule an appointment and get professional women's
                healthcare with personalized attention.
              </p>

              <Link
                to={primaryAction.to}
                className="mt-6 self-start inline-flex items-center gap-2 bg-[#6E1F32] text-white px-7 py-4 font-semibold hover:bg-[#CF3650] transition"
              >
                {primaryAction.label}

                <ArrowRight className="w-5 h-5" />
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#8F2338] py-6 lg:py-7">

        <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full border border-white/10" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">

          <p className="text-sm uppercase tracking-[0.18em] font-bold text-[#E85B73]">
            Elite Gynaecology Lahore
          </p>

          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
            Your Health Deserves Expert Care
          </h2>

          <p className="mt-4 text-slate-300">
            Schedule your consultation with Prof. Dr. Ambreen Akhtar.
          </p>

          <Link
            to={primaryAction.to}
            className="mt-6 inline-flex items-center gap-2 bg-[#E85B73] text-white px-7 py-4 font-semibold hover:bg-[#CF3650] transition"
          >
            {primaryAction.label}

            <ArrowRight className="w-5 h-5" />
          </Link>

        </div>

      </section>

    </div>
  );
};

export default Home;
