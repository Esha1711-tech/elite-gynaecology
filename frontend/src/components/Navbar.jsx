import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  const scrollToSection = (sectionId) => {
    setMobileOpen(false);

    if (location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    navigate("/");
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 180);
  };

  const bookingPath =
    user?.role === "patient"
      ? "/appointments"
      : user?.role === "doctor"
        ? "/admin"
        : "/register";

  return (
    <header className="relative z-50 w-full bg-white font-sans">
      {/* Announcement bar */}
      <div className="bg-[#F5A900] text-white">
        <div className="mx-auto flex min-h-11 max-w-7xl items-center justify-center px-4 py-2 text-center text-sm font-bold sm:text-base">
          ✨ Compassionate women&apos;s healthcare in Lahore. Book your consultation today →
        </div>
      </div>

      {/* Contact / utility bar */}
      <div className="bg-[#CF3650] text-white">
        <div className="mx-auto flex min-h-13 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="tel:+923180082848"
              className="flex items-center gap-2 font-semibold transition hover:text-white/80"
            >
              <Phone className="h-4 w-4" />
              +92 318 0082848
            </a>

            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lahore, Pakistan
            </span>

            <span className="hidden items-center gap-2 md:flex">
              <ShieldCheck className="h-4 w-4" />
              Private &amp; Confidential Care
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {user?.role === "patient" && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 font-semibold transition hover:text-white/80"
              >
                <UserCircle2 className="h-4 w-4" />
                Patient Portal
              </Link>
            )}

            <a
              href="https://wa.me/923180082848"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-semibold transition hover:text-white/80"
            >
              <MessageCircle className="h-4 w-4" />
              Message Us Now
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[108px] items-center justify-between gap-6">
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className="flex shrink-0 items-center gap-3 text-left"
            >
              <img
                src="/logo.png"
                alt="Elite Gynaecology"
                className="h-16 w-auto object-contain sm:h-20"
              />
            </button>

            <div className="hidden items-center gap-8 lg:flex">
              {[
                ["home", "Home"],
                ["about", "About Us"],
                ["services", "Services"],
                ["doctor", "Doctor"],
                ["contact", "Contact"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className="relative py-3 text-[17px] font-semibold text-[#B92842] transition hover:text-[#CF3650] after:absolute after:bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[#CF3650] after:transition-all hover:after:w-full"
                >
                  {label}
                </button>
              ))}

              {user?.role === "patient" && (
                <Link
                  to="/dashboard"
                  className="text-[17px] font-semibold text-[#B92842] hover:text-[#CF3650]"
                >
                  Dashboard
                </Link>
              )}

              {user?.role === "doctor" && (
                <Link
                  to="/admin"
                  className="text-[17px] font-semibold text-[#B92842] hover:text-[#CF3650]"
                >
                  Dashboard
                </Link>
              )}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[#CF3650]/20 px-5 py-3 font-semibold text-[#B92842] transition hover:bg-[#FFF2F4]"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full border border-[#CF3650]/20 px-5 py-3 font-semibold text-[#B92842] transition hover:bg-[#FFF2F4]"
                >
                  Login
                </Link>
              )}

             <Link
  to={user?.role === "doctor" ? "/admin" : "/appointments"}
  className="appointment-btn"
>
  <Calendar className="h-5 w-5" />

  {user?.role === "doctor"
    ? "Dashboard"
    : "Book Your Appointment"}
</Link>
</div>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg bg-[#FFF2F4] text-[#CF3650] lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <span
                className={`block h-0.5 w-6 bg-current transition ${
                  mobileOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-current transition ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-current transition ${
                  mobileOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#CF3650]/10 bg-white lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
              {[
                ["home", "Home"],
                ["about", "About Us"],
                ["services", "Services"],
                ["doctor", "Doctor"],
                ["contact", "Contact"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className="block w-full rounded-lg px-4 py-3 text-left font-semibold text-[#B92842] hover:bg-[#FFF2F4]"
                >
                  {label}
                </button>
              ))}

              {user?.role === "patient" && (
                <>
                  <Link
                    to="/appointments"
                    className="block rounded-lg px-4 py-3 font-semibold text-[#B92842] hover:bg-[#FFF2F4]"
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block rounded-lg px-4 py-3 font-semibold text-[#B92842] hover:bg-[#FFF2F4]"
                  >
                    Dashboard
                  </Link>
                </>
              )}

              {user?.role === "doctor" && (
                <Link
                  to="/admin"
                  className="block rounded-lg px-4 py-3 font-semibold text-[#B92842] hover:bg-[#FFF2F4]"
                >
                  Dashboard
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2 pt-3">
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-[#CF3650] px-4 py-3 font-semibold text-[#CF3650]"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-xl border border-[#CF3650] px-4 py-3 text-center font-semibold text-[#CF3650]"
                  >
                    Login
                  </Link>
                )}

                <Link
                  to={bookingPath}
                  className="rounded-xl bg-[#CF3650] px-4 py-3 text-center font-semibold text-white"
                >
                  {user?.role === "doctor" ? "Dashboard" : "Book Now"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
