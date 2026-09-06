import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ============================================
  // LOGOUT
  // ============================================
  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  // ============================================
  // SCROLL TO HOME PAGE SECTION
  // ============================================
  const scrollToSection = (sectionId) => {
    setMobileOpen(false);

    // Already on Home page
    if (window.location.pathname === "/") {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    // If user is on another page, first go Home
    navigate("/");

    // Wait for Home page to render
    setTimeout(() => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      {/* =====================================================
          MAIN NAVBAR
      ====================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* =================================================
              LOGO
          ================================================== */}
          <button
            type="button"
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-3 group"
          >
            <img
              src="/logo-mark.png"
              alt="Elite Gynaecology"
              className="h-12 w-12 object-contain"
            />

            <div className="text-left">
              <h1 className="text-lg font-bold text-accent-navy leading-tight">
                Elite Gynaecology
              </h1>

              <p className="text-xs text-text-light">Lahore</p>
            </div>
          </button>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}
          <div className="hidden lg:flex items-center gap-7">
            {/* HOME */}
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className="text-text-dark hover:text-accent-sage font-medium transition"
            >
              Home
            </button>

            {/* ABOUT */}
            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className="text-text-dark hover:text-accent-sage font-medium transition"
            >
              About
            </button>

            {/* SERVICES */}
            <button
              type="button"
              onClick={() => scrollToSection("services")}
              className="text-text-dark hover:text-accent-sage font-medium transition"
            >
              Services
            </button>

            {/* DOCTOR */}
            <button
              type="button"
              onClick={() => scrollToSection("doctor")}
              className="text-text-dark hover:text-accent-sage font-medium transition"
            >
              Doctor
            </button>

            {/* CONTACT */}
            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="text-text-dark hover:text-accent-sage font-medium transition"
            >
              Contact
            </button>

            {/* <Link
              to="/blog"
              className="text-text-dark hover:text-accent-sage font-medium transition"
            >
              Blog
            </Link> */}

            {/* =================================================
                PATIENT LINKS
            ================================================== */}
            {user?.role === "patient" && (
              <>
                <Link
                  to="/appointments"
                  className="text-text-dark hover:text-accent-sage font-medium transition"
                >
                  Appointments
                </Link>
                <Link
                  to="/dashboard"
                  className="text-text-dark hover:text-accent-sage font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/health-records"
                  className="text-text-dark hover:text-accent-sage font-medium transition"
                >
                  Health Records
                </Link>
              </>
            )}

            {/* =================================================
                DOCTOR / ADMIN LINK
            ================================================== */}
            {user?.role === "doctor" && (
              <Link
                to="/admin"
                className="text-text-dark hover:text-accent-sage font-medium transition"
              >
                Dashboard
              </Link>
            )}

            {/* =================================================
                AUTH SECTION
            ================================================== */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-text-light">
                  Hi, {user.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-medium text-red-500 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-accent-navy font-medium hover:bg-secondary-sage transition"
                >
                  Login
                </Link>

                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================== */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-lg text-accent-navy hover:bg-secondary-sage transition"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <span
              className={`block w-6 h-0.5 bg-current transition ${
                mobileOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />

            <span
              className={`block w-6 h-0.5 bg-current transition ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`block w-6 h-0.5 bg-current transition ${
                mobileOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-5 space-y-2">
            {/* HOME */}
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className="w-full text-left px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
            >
              Home
            </button>

            {/* ABOUT */}
            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className="w-full text-left px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
            >
              About
            </button>

            {/* SERVICES */}
            <button
              type="button"
              onClick={() => scrollToSection("services")}
              className="w-full text-left px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
            >
              Services
            </button>

            {/* DOCTOR */}
            <button
              type="button"
              onClick={() => scrollToSection("doctor")}
              className="w-full text-left px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
            >
              Our Doctor
            </button>

            {/* CONTACT */}
            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="w-full text-left px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
            >
              Contact
            </button>

            {/* BLOG */}
            <Link
              to="/blog"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
            >
              Blog
            </Link>

            {/* =================================================
                PATIENT MOBILE LINKS
            ================================================== */}
            {user?.role === "patient" && (
              <>
                <Link
                  to="/appointments"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
                >
                  Appointments
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
                >
                  Dashboard
                </Link>
                \n\n{" "}
                <Link
                  to="/health-records"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
                >
                  Health Records
                </Link>
              </>
            )}

            {/* =================================================
                DOCTOR MOBILE DASHBOARD
            ================================================== */}
            {user?.role === "doctor" && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-text-dark font-medium hover:bg-secondary-sage hover:text-accent-navy transition"
              >
                Dashboard
              </Link>
            )}

            {/* =================================================
                MOBILE AUTH
            ================================================== */}
            <div className="pt-3 mt-3 border-t border-slate-100">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-text-light">
                    Logged in as{" "}
                    <span className="font-semibold text-accent-navy">
                      {user.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg text-red-500 font-medium hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-4 py-3 rounded-lg text-accent-navy font-medium border border-slate-200 hover:bg-secondary-sage transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-4 py-3 rounded-lg bg-accent-navy text-white font-medium hover:bg-accent-sage transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
