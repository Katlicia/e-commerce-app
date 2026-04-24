import axios from "axios";

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

export default axiosInstance;
