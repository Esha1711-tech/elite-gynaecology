import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    country: "Pakistan",
    address: "",
    role: "patient",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only patient data is sent.
      // Doctor/Admin registration is not allowed from public registration.
      const submitData = {
        ...formData,
        role: "patient",
      };

      const user = await register(submitData);

      toast.success("Registration successful!");

      // Patient always goes to patient dashboard
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input-field";

  const labelClass = "block text-sm font-medium text-text-dark mb-1";

  return (
    <div className="min-h-screen bg-primary-light flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/logo.png"
                alt="Elite Gynaecology"
                className="h-16 w-auto object-contain"
              />
            </div>

            <h1 className="text-3xl font-bold text-accent-navy">
              Create Patient Account
            </h1>

            <p className="mt-2 text-text-light">
              Book and manage your women's healthcare appointments
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>

                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter your full name"
                  className={inputClass}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>

                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className={inputClass}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  placeholder="Create a password"
                  className={`${inputClass} pr-11`}
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-accent-navy transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="mt-1 text-xs text-text-light">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Phone + Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="03XX XXXXXXX"
                  className={inputClass}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelClass}>Country</label>

                <select
                  name="country"
                  className={inputClass}
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="Pakistan">Pakistan</option>

                  <option value="USA">USA</option>

                  <option value="UK">UK</option>

                  <option value="UAE">UAE</option>

                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Date of Birth + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date of Birth</label>

                <input
                  type="date"
                  name="dateOfBirth"
                  className={inputClass}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelClass}>Gender</label>

                <select
                  name="gender"
                  className={inputClass}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>

                  <option value="female">Female</option>

                  <option value="male">Male</option>

                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className={labelClass}>Address</label>

              <textarea
                name="address"
                rows="3"
                placeholder="Enter your address"
                className={`${inputClass} resize-none`}
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Account Type */}
            <div className="rounded-xl bg-secondary-sage/30 border border-secondary-sage p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <span className="text-accent-sage font-bold">✓</span>
                </div>

                <div>
                  <p className="font-semibold text-accent-navy">
                    Patient Account
                  </p>

                  <p className="text-sm text-text-light">
                    Register to book appointments and manage your healthcare
                    records.
                  </p>
                </div>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Patient Account"}
            </button>
          </form>

          {/* Login */}
          <p className="text-center mt-6 text-text-light">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-accent-navy font-medium hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
