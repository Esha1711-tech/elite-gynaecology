import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!strongPassword.test(formData.password)) {
      toast.error(
        "Password must contain uppercase, lowercase, number and special character."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!token) {
      toast.error("Invalid password reset link.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        `/auth/reset-password/${encodeURIComponent(
          token
        )}`,
        {
          password: formData.password,
          confirmPassword:
            formData.confirmPassword,
        }
      );

      toast.success(
        response.data?.message ||
          "Password reset successfully."
      );

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to reset password."
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
            Create New Password
          </h2>

          <p className="text-text-light mt-2">
            Enter a strong new password for your
            account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-light" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                className="input-field pl-10 pr-10"
                placeholder="New password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">
              Confirm Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-light" />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                className="input-field pl-10 pr-10"
                placeholder="Confirm password"
                value={
                  formData.confirmPassword
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword:
                      e.target.value,
                  })
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-text-light">
            Password must be at least 8 characters
            and contain uppercase, lowercase, a
            number and a special character.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link
            to="/login"
            className="text-accent-navy font-medium hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;