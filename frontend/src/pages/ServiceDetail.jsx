import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

const services = {
  "gynecology-consultation": {
    title: "Comprehensive Gynecology Consultation",
    subtitle: "Personalized care for women's health concerns at every stage of life.",
    image: "/services/gyneacology-consultation.jpg",
    overview:
      "A comprehensive gynaecology consultation helps assess symptoms, review medical history and plan appropriate investigations or treatment based on individual needs.",
    includes: [
      "Detailed medical and menstrual history review",
      "Assessment of gynaecological symptoms",
      "Discussion of appropriate investigations",
      "Personalized treatment and follow-up plan",
    ],
    faqs: [
      {
        question: "When should I book a gynaecology consultation?",
        answer:
          "You can book a consultation for menstrual changes, pelvic discomfort, abnormal bleeding, discharge, reproductive health concerns, routine checkups or any other women's health concern.",
      },
      {
        question: "What should I bring to my appointment?",
        answer:
          "Bring any previous reports, ultrasound results, medication list and relevant medical records if available.",
      },
      {
        question: "Will I need tests during the first visit?",
        answer:
          "Not always. Tests are recommended only when clinically appropriate after your history and assessment.",
      },
    ],
  },

  "pregnancy-antenatal-care": {
    title: "Pregnancy & Antenatal Care",
    subtitle: "Professional support and monitoring throughout pregnancy.",
    image: "/services/pregnancy-antenatal-care.jpg",
    overview:
      "Antenatal care focuses on monitoring maternal wellbeing, fetal growth and pregnancy progress through regular consultations and appropriate investigations.",
    includes: [
      "Routine antenatal consultations",
      "Pregnancy progress monitoring",
      "Review of ultrasound and laboratory reports",
      "Guidance on follow-up and pregnancy care",
    ],
    faqs: [
      {
        question: "When should antenatal care begin?",
        answer:
          "It is generally helpful to arrange your first antenatal appointment early in pregnancy so your health history and pregnancy can be assessed.",
      },
      {
        question: "How often are antenatal visits required?",
        answer:
          "The schedule varies according to the stage of pregnancy and individual clinical needs. Your doctor will recommend an appropriate follow-up plan.",
      },
      {
        question: "Can I bring previous pregnancy reports?",
        answer:
          "Yes. Previous scans, laboratory reports and medical records can help provide useful clinical context.",
      },
    ],
  },

  "high-risk-pregnancy": {
    title: "High-Risk Pregnancy Management",
    subtitle: "Closer monitoring and individualized care for pregnancies needing additional attention.",
    image: "/services/high-risk-pregnancy.jpg",
    overview:
      "Some pregnancies require closer follow-up because of maternal health conditions, pregnancy complications or other clinical risk factors.",
    includes: [
      "Individual risk assessment",
      "Closer maternal and fetal monitoring",
      "Review of relevant investigations",
      "Personalized follow-up planning",
    ],
    faqs: [
      {
        question: "What makes a pregnancy high risk?",
        answer:
          "Risk can be related to maternal medical conditions, pregnancy complications, previous pregnancy history or other factors identified by the treating clinician.",
      },
      {
        question: "Does high risk always mean there will be complications?",
        answer:
          "No. The term indicates that additional monitoring or care may be appropriate; it does not necessarily mean a complication will occur.",
      },
      {
        question: "Will I need more frequent appointments?",
        answer:
          "Some patients do require closer follow-up. The frequency depends on the specific clinical situation.",
      },
    ],
  },

  "infertility-treatment": {
    title: "Infertility Evaluation & Treatment",
    subtitle: "Thoughtful assessment and personalized fertility care.",
    image: "/services/infertility-treatment.jpg",
    overview:
      "Fertility evaluation may include a detailed history, assessment of menstrual and reproductive health, relevant investigations and a treatment plan based on identified factors.",
    includes: [
      "Fertility and reproductive history review",
      "Menstrual and ovulation assessment",
      "Review or recommendation of relevant investigations",
      "Individualized management and follow-up",
    ],
    faqs: [
      {
        question: "When should we seek fertility advice?",
        answer:
          "The appropriate timing depends on age, medical history, menstrual pattern and how long pregnancy has been attempted. A consultation can help determine the next step.",
      },
      {
        question: "Does fertility evaluation involve both partners?",
        answer:
          "Fertility can be influenced by factors involving either partner, so evaluation may include relevant assessment for both when appropriate.",
      },
      {
        question: "Are fertility tests done at the first appointment?",
        answer:
          "The first visit usually focuses on history and planning. Tests may then be recommended according to individual needs.",
      },
    ],
  },

  "pcos-menstrual-disorders": {
    title: "PCOS & Menstrual Disorder Management",
    subtitle: "Personalized assessment for irregular periods, PCOS and hormonal concerns.",
    image: "/services/pcos-menstrual-disorders.jpg",
    overview:
      "PCOS and menstrual disorders can present in different ways. Evaluation focuses on symptoms, menstrual history and relevant clinical or laboratory findings.",
    includes: [
      "Menstrual history and symptom assessment",
      "PCOS-focused clinical evaluation",
      "Review of relevant investigations",
      "Personalized management and follow-up",
    ],
    faqs: [
      {
        question: "Does an irregular period always mean PCOS?",
        answer:
          "No. Irregular periods can have several causes. Proper assessment is needed before attributing them to PCOS.",
      },
      {
        question: "Can PCOS affect fertility?",
        answer:
          "PCOS can affect ovulation in some patients, but the impact differs from person to person and can be discussed during evaluation.",
      },
      {
        question: "Is PCOS management the same for everyone?",
        answer:
          "No. Management depends on symptoms, health goals, reproductive plans and clinical findings.",
      },
    ],
  },

  "menopause-hormonal-health": {
    title: "Menopause & Hormonal Health Care",
    subtitle: "Supportive care for menopause-related and hormonal health concerns.",
    image: "/services/menopause-hormonal-health.jpg",
    overview:
      "Menopause care focuses on understanding symptoms, reviewing overall health and discussing appropriate management options based on individual needs.",
    includes: [
      "Menopause symptom assessment",
      "Menstrual and hormonal history review",
      "Discussion of management options",
      "Ongoing follow-up where required",
    ],
    faqs: [
      {
        question: "What symptoms can occur around menopause?",
        answer:
          "Symptoms vary and may include menstrual changes, hot flushes, sleep disturbance, mood changes or other concerns.",
      },
      {
        question: "Do all women need treatment during menopause?",
        answer:
          "No. Treatment is individualized according to symptoms, medical history and personal preferences.",
      },
      {
        question: "Should I still have routine gynaecology checkups after menopause?",
        answer:
          "Routine women's health care can remain important after menopause. Your doctor can advise on appropriate screening and follow-up.",
      },
    ],
  },

  "cervical-cancer-screening": {
    title: "Cervical Cancer Screening",
    subtitle: "Preventive screening focused on early detection and women's health.",
    image: "/services/cervical-cancer-screening.jpg",
    overview:
      "Cervical screening may involve tests such as Pap smear or HPV testing when clinically appropriate, with follow-up based on results and individual history.",
    includes: [
      "Screening history review",
      "Pap smear and HPV screening where appropriate",
      "Result review and explanation",
      "Follow-up planning if required",
    ],
    faqs: [
      {
        question: "What is the purpose of cervical screening?",
        answer:
          "Screening is used to look for cervical changes or HPV-related risk before symptoms or more serious disease develops.",
      },
      {
        question: "How often should screening be done?",
        answer:
          "The recommended interval depends on age, previous results, the screening method used and relevant clinical guidelines.",
      },
      {
        question: "What happens if a screening result is abnormal?",
        answer:
          "An abnormal result does not automatically mean cancer. Your clinician will explain whether repeat testing or further assessment is appropriate.",
      },
    ],
  },

  "family-planning": {
    title: "Family Planning & Contraceptive Services",
    subtitle: "Confidential counselling to help you choose an appropriate family-planning option.",
    image: "/services/family-planning.jpg",
    overview:
      "Family-planning consultations help patients understand available contraceptive options and select a method based on health history, preferences and reproductive plans.",
    includes: [
      "Confidential contraception counselling",
      "Discussion of available options",
      "Medical suitability assessment",
      "Follow-up for questions or concerns",
    ],
    faqs: [
      {
        question: "Which contraceptive method is best?",
        answer:
          "There is no single best method for everyone. Suitability depends on medical history, preferences, convenience and reproductive plans.",
      },
      {
        question: "Can contraception affect future fertility?",
        answer:
          "Different methods work in different ways. Your clinician can explain expected return to fertility and other considerations for the option you are considering.",
      },
      {
        question: "Is family-planning counselling confidential?",
        answer:
          "Yes. Consultations are handled with patient privacy and confidentiality in mind.",
      },
    ],
  },

  "gynecological-surgeries": {
    title: "All Types of Gynecological Surgeries",
    subtitle: "Specialist surgical assessment and care for gynaecological conditions.",
    image: "/services/gynecological-surgeries.jpg",
    overview:
      "When surgery is being considered, the first step is a specialist assessment to review the diagnosis, available treatment options, expected benefits and potential risks.",
    includes: [
      "Pre-operative specialist assessment",
      "Review of reports and investigations",
      "Discussion of surgical options",
      "Post-operative follow-up planning",
    ],
    faqs: [
      {
        question: "Does every gynaecological condition require surgery?",
        answer:
          "No. Many conditions can be managed without surgery. Surgery is considered only when it is clinically appropriate.",
      },
      {
        question: "What happens before a gynaecological operation?",
        answer:
          "Your doctor reviews your diagnosis, medical history and investigations and explains the planned procedure, preparation and follow-up.",
      },
      {
        question: "How long does recovery take?",
        answer:
          "Recovery varies depending on the procedure and individual health. Specific recovery guidance is provided for the planned surgery.",
      },
    ],
  },
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = services[slug];

  if (!service) {
    return (
      <main className="min-h-[70vh] bg-[#FFF7F8] flex items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <h1 className="text-3xl font-bold text-[#6E1F32]">Service not found</h1>
          <p className="mt-3 text-[#6F5B60]">
            The service you are looking for is not available.
          </p>
          <Link
  to="/#services"
  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#F7B7C2]"
>
  <ArrowLeft className="h-4 w-4" />
  Back to Services
</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-[#6E1F32]">
      {/* SERVICE BANNER — same image as service card */}
      <section className="relative min-h-[420px] overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Stronger left-side overlay so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />

        {/* Content starts from the top with no extra top padding */}
        <div className="relative z-10 mx-auto min-h-[420px] max-w-7xl px-4 pt-0 pb-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">

            {/* BACK TO SERVICES */}
            <Link
              to="/#services"
              className="mt-[20px] inline-flex items-center gap-2 pt-0 mt-0 text-sm font-semibold text-white transition hover:text-[#F7B7C2]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>

            <div className="pt-10 md:pt-12">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FFC1CC] drop-shadow-md">
                Elite Gynaecology Lahore
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
                {service.title}
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white drop-shadow-md md:text-xl md:leading-8">
                {service.subtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/appointments"
                  className="appointment-btn"
                >
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </Link>

                <a
                  href="https://wa.me/923180082848"
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" inline-flex items-center gap-2
    rounded-full
    border border-white/70
    bg-black/20
    px-5 py-2.5
    text-sm font-semibold text-white
    backdrop-blur-sm
    transition-all duration-300
    hover:bg-[#CF3650]
    hover:border-[#CF3650]"
                >
                  <Phone className="h-5 w-5" />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-10 lg:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#CF3650]">
              Service Overview
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#6E1F32]">
              Care Designed Around Your Needs
            </h2>
            <p className="mt-4 leading-8 text-[#6F5B60]">
              {service.overview}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {service.includes.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-[#F0D8DD] bg-[#FFF7F8] p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#CF3650]" />
                  <span className="text-sm leading-6 text-[#5E4750]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-2xl bg-[#FFF1F3] p-6 lg:sticky lg:top-24">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
              <Stethoscope className="h-6 w-6 text-[#CF3650]" />
            </div>
            <h3 className="mt-5 text-2xl font-bold">Need a Consultation?</h3>
            <p className="mt-3 text-sm leading-6 text-[#6F5B60]">
              Book an appointment for specialist assessment and personalized guidance.
            </p>
            <Link
              to="/appointments"
              className="appointment-btn"
            >
              Book Appointment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      {/* SERVICE-SPECIFIC FAQ */}
      <section className="bg-[#FFF7F8] py-10 lg:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#CF3650]">
              Frequently Asked Questions
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#6E1F32]">
              Questions About {service.title}
            </h2>
          </div>

          <div className="mt-7 overflow-hidden rounded-2xl border border-[#F0D8DD] bg-white">
            {service.faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group border-b border-[#F0D8DD] last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-[#E85B73]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-bold text-[#6E1F32]">{faq.question}</h3>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#CF3650] transition group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-5 pl-12 leading-7 text-[#6F5B60]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST + CTA */}
      <section className="py-9">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#CF3650] p-7 text-white md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-[#F3C2CB]" />
              <div>
                <h3 className="text-xl font-bold">Private, Patient-Focused Care</h3>
                <p className="mt-1 text-sm text-white/75">
                  Professional consultation with privacy and personalized attention.
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/923180082848"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#E85B73] px-5 py-3 font-semibold text-white transition hover:bg-[#CF3650]"
            >
              Contact on WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServiceDetail;

