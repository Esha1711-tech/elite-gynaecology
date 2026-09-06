import { Link } from "react-router-dom";
import {
  Clock3,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 bg-accent-navy text-white">
      <div className="h-1 bg-gradient-to-r from-accent-sage via-accent-rose to-accent-sage" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center mb-5">
              <img
                src="/logo.png"
                alt="Elite Gynaecology Lahore"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-300 text-sm leading-6 max-w-sm">
              Compassionate, patient-first women&apos;s healthcare with trusted
              gynaecological consultations and modern appointment management.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="#"
                aria-label="Facebook"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent-rose transition"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent-rose transition"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-5">Quick Links</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <Link className="block hover:text-accent-rose transition" to="/">
                Home
              </Link>
              <Link
                className="block hover:text-accent-rose transition"
                to="/blog"
              >
                Health Blog
              </Link>
              <Link
                className="block hover:text-accent-rose transition"
                to="/appointments"
              >
                Appointments
              </Link>
              <Link
                className="block hover:text-accent-rose transition"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="block hover:text-accent-rose transition"
                to="/register"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-5">Contact Us</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-accent-sage" />
                <span>123-M, Gulberg III, Lahore, Pakistan</span>
              </div>
              <div className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-accent-sage" />
                <span>+92 318 0082848</span>
              </div>
              <div className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-accent-sage" />
                <span>doctorambreenakhtar@gmail.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-5">Clinic Hours</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex gap-3">
                <Clock3 className="h-5 w-5 shrink-0 text-accent-sage" />
                <span>
                  Monday – Saturday
                  <br />
                  9:00 AM – 6:00 PM
                </span>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-accent-sage" />
                <span>Private &amp; secure patient records</span>
              </div>
            </div>
            <Link
              to="/appointments"
              className="inline-flex mt-6 rounded-lg bg-accent-rose px-5 py-2.5 text-sm font-semibold hover:bg-white hover:text-accent-navy transition"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400">
          <span>© 2026 Elite Gynaecology Lahore. All rights reserved.</span>
          <span>Compassionate care. Trusted expertise. Better outcomes.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
