import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Appointments from "./pages/Appointments";
import HealthRecords from "./pages/HealthRecords";
import ServiceDetail from "./pages/ServiceDetail";
import NotFound from "./pages/NotFound";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();

  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password/") ||
    location.pathname === "/blog" ||
    location.pathname.startsWith("/blog/");

  return (
    <div className="min-h-screen flex flex-col bg-primary-light">
      {/* Scroll page to top whenever route changes */}
      <ScrollToTop />

      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
  path="/services/:slug"
  element={<ServiceDetail />}
/>

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />}/>

          <Route path="/reset-password/:token" element={<ResetPassword />}/>

          <Route path="/blog" element={<Blog />} />

          <Route path="/blog/:slug" element={<BlogDetail />} />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <Appointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/health-records"
            element={
              <ProtectedRoute allowedRoles={["patient", "doctor"]}>
                <HealthRecords />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideFooter && <Footer />}

      <Toaster position="top-right" />
    </div>
  );
}

export default App;