import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../utils/api";
import toast from "react-hot-toast";

const AuthContext =
  createContext(null);

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
  try {
    const res = await api.post("/auth/logout");

    setUser(null);

    toast.success(
      res.data?.message || "Logged out successfully."
    );
  } catch (error) {
    console.error("Logout request failed:", error);

    // Frontend session phir bhi clear kar dein.
    setUser(null);

    toast.error(
      error.response?.data?.message ||
        "Logout failed. Please try again."
    );
  }
};
  // ==========================================
  // RESTORE SESSION
  // ==========================================

  useEffect(() => {
    let active = true;

    const restoreSession =
      async () => {
        try {
          const res =
            await api.get(
              "/auth/me"
            );

          if (active) {
            setUser(
              res.data.user
            );
          }
        } catch {
          if (active) {
            setUser(null);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
  const handleSessionExpired = () => {
    setUser(null);
  };

  window.addEventListener(
    "auth:session-expired",
    handleSessionExpired
  );

  return () => {
    window.removeEventListener(
      "auth:session-expired",
      handleSessionExpired
    );
  };
}, []);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (
    email,
    password,
    role
  ) => {
    const res =
      await api.post(
        "/auth/login",
        {
          email,
          password,
          role,
        }
      );

    setUser(res.data.user);

    return res.data.user;
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (
    data
  ) => {
    const payload = {
      ...data,
      role: "patient",
    };

    const res =
      await api.post(
        "/auth/register/patient",
        payload
      );

    setUser(res.data.user);

    return res.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);