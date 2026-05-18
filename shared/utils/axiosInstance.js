import axios from "axios";
import { storage } from "./storage";

const axiosInstance = axios.create({
  withCredentials: true,
});

// Web:    configureAxios(import.meta.env.VITE_API_URL)
// Mobile: configureAxios(process.env.EXPO_PUBLIC_API_URL)
export const configureAxios = (baseURL) => {
  axiosInstance.defaults.baseURL = baseURL;
};

// Mobile uses Bearer token auth (cookies don't persist across restarts on Android).
// Call setBearerToken(token) after login/hydrate, setBearerToken(null) on logout.
export const setBearerToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

// Injected by App.js after store is ready so the interceptor can trigger logout.
let _onRefreshFailed = null;
export const configureRefreshCallback = (cb) => {
  _onRefreshFailed = cb;
};

let _isRefreshing = false;
let _pendingQueue = [];

const processPendingQueue = (error, token = null) => {
  _pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _pendingQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, not on the /refresh or /login endpoints themselves.
    const isAuthEndpoint =
      originalRequest.url?.includes("/refresh") ||
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const refreshToken = await storage.getItem("refreshToken");
        const { data } = await axiosInstance.post("/refresh", { refreshToken });

        setBearerToken(data.token);
        await storage.setItem("token", data.token);
        if (data.refreshToken) await storage.setItem("refreshToken", data.refreshToken);

        processPendingQueue(null, data.token);
        originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processPendingQueue(refreshError);
        setBearerToken(null);
        await storage.removeItem("token");
        await storage.removeItem("refreshToken");
        if (_onRefreshFailed) _onRefreshFailed();
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
