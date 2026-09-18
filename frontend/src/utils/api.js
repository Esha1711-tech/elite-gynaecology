import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// SESSION EXPIRY HANDLING
// ==========================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status;

    const requestUrl =
      error.config?.url || "";

    // Don't trigger expiry handling when
    // login/register itself returns 401.
    const isAuthRequest =
      requestUrl.includes(
        "/auth/login"
      ) ||
      requestUrl.includes(
        "/auth/register"
      );

    if (
      status === 401 &&
      !isAuthRequest
    ) {
      window.dispatchEvent(
        new CustomEvent(
          "auth:session-expired"
        )
      );
    }

    return Promise.reject(error);
  }
);

export default api;