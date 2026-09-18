import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    role: "patient",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/auth/forgot-password",
        {
          email: formData.email.trim(),
          role: formData.role,
        }
      );

      setSubmitted(true);

      toast.success(
        response.data?.message ||
          "If the account exists, a reset link has been sent."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to process password reset request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-secondary-pink/30 to-secondary-sage/30 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Elite Gynaecology Lahore"
            className="h-24 w-auto mx-auto mb-3 rounded-xl"
          />

          <h2 className="text-2xl font-bold text-accent-navy">
            Forgot Password?
          </h2>

          <p className="text-text-light mt-2">
            Enter your registered email and we'll send
            you a secure password reset link.
          </p>
        </div>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-light" />

                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field pl-10"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Account Type
              </label>

              <div className="flex gap-6">
                {["patient", "doctor"].map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value,
                        })
                      }
                      className="text-accent-navy focus:ring-accent-navy"
                    />

                    <span className="capitalize text-text-dark">
                      {role}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-5">
              <Mail className="h-10 w-10 mx-auto mb-3 text-green-600" />

              <h3 className="font-semibold text-text-dark">
                Check Your Email
              </h3>

              <p className="text-sm text-text-light mt-2">
                If an account exists with the information
                provided, a password reset link has been
                sent.
              </p>

              <p className="text-sm text-text-light mt-2">
                The link expires in 15 minutes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-accent-navy font-medium hover:underline"
            >
              Try another email
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-accent-navy font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;