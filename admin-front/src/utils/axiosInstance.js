import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let _onRefreshFailed = null;
export const configureRefreshCallback = (cb) => {
  _onRefreshFailed = cb;
};

let _isRefreshing = false;
let _pendingQueue = [];

const processPendingQueue = (error) => {
  _pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  _pendingQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest.url?.includes("/refresh") ||
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _pendingQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        await axiosInstance.post("/refresh", {});
        processPendingQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processPendingQueue(refreshError);
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
