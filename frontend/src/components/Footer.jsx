import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-600 border-t border-[#F3D8DE]">
      <div className="border-b border-[#F3D8DE] bg-[#FFF7F8]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B92F48]">
              Elite Gynaecology Lahore
            </p>
            <h3 className="mt-1 text-2xl font-bold text-[#7A2033]">Professional care for every stage of womanhood.</h3>
          </div>
          <Link
            to="/register"
            className="appointment-btn"
          >
            Book Appointment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <img src="/logo.png" alt="Elite Gynaecology" className="h-16 w-auto rounded-lg bg-white p-2" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600">
            Compassionate and professional gynaecological care with a focus on privacy, comfort and personalized attention.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              [Facebook, "https://facebook.com", "Facebook"],
              [Instagram, "https://instagram.com", "Instagram"],
              [Youtube, "https://youtube.com", "YouTube"],
              [Linkedin, "https://linkedin.com", "LinkedIn"],
            ].map(([Icon, href, label]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className=" flex h-10 w-10 items-center justify-center
  rounded-full
  border border-[#F0D8DD]
  bg-[#FFF7F8]
  text-[#6E1F32]
  transition-all duration-300
  hover:bg-[#CF3650]
  hover:text-[#FFD1D9]
  hover:border-[#CF3650]
  hover:-translate-y-1
  hover:shadow-md"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-[#B92F48]">Quick Links</h4>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <Link className="block hover:text-[#CF3650]" to="/#home">Home</Link>
            <Link className="block hover:text-[#CF3650]" to="/#about">About</Link>
            <Link className="block hover:text-[#CF3650]" to="/#services">Services</Link>
            <Link className="block hover:text-[#CF3650]" to="/#doctor">Doctor</Link>
            <Link className="block hover:text-[#CF3650]" to="/#contact">Contact</Link>
            <Link className="block text-gray-600 transition hover:text-[#CF3650]"to="/blog">Health Blog </Link>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-[#B92F48]">Popular Services</h4>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <Link className="block hover:text-[#CF3650]" to="/services/pregnancy-antenatal-care">Pregnancy & Antenatal Care</Link>
            <Link className="block hover:text-[#CF3650]" to="/services/high-risk-pregnancy">High-Risk Pregnancy</Link>
            <Link className="block hover:text-[#CF3650]" to="/services/pcos-menstrual-disorders">PCOS Management</Link>
            <Link className="block hover:text-[#CF3650]" to="/services/gynecological-surgeries">Gynaecological Surgeries</Link>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-[#B92F48]">Contact</h4>
          <div className="mt-4 space-y-4 text-sm text-gray-600">
            <div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#CF3650]" /><span>8-2, Gulberg Complex, Jail Rd, Gulberg V, Lahore, Pakistan</span></div>
            <a href="https://wa.me/923180082848" target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-[#CF3650]"><Phone className="h-5 w-5 shrink-0 text-[#CF3650]" /><span>+92 318 0082848</span></a>
            <a href="mailto:doctorambreenakhtar@gmail.com" className="flex gap-3 break-all hover:text-[#CF3650]"><Mail className="h-5 w-5 shrink-0 text-[#CF3650]" /><span>doctorambreenakhtar@gmail.com</span></a>
            <div className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-[#CF3650]" /><span>Monday - Saturday</span></div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#F3D8DE] bg-[#FFF7F8]">
         <div className="mx-auto max-w-4xl px-4 py-6 text-center sm:px-6">
    
    {/* <p className="mx-auto max-w-3xl text-sm leading-6 text-gray-500">
      The information and tools on this website are for general educational
     purposes only and are not a substitute for professional medical advice, 
     diagnosis, or treatment. Always consult your physician or a qualified provider
      with any questions about your health, and never disregard or delay seeking 
      medical advice because of something you read here. In an emergency, call your 
      respective medical helpline. Read our full medical disclaimer.
 
    </p> */}

    <div className="mx-auto my-4 h-px w-20 bg-[#F3D8DE]" />

    <p className="text-xs font-medium text-gray-500">
      © {new Date().getFullYear()} Elite Gynaecology. All rights reserved.
    </p>

  </div>
      </div>
    </footer>
  );
};

export default Footer;
