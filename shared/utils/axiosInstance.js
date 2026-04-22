import axios from "axios";

const axiosInstance = axios.create({
  withCredentials: true,
});

// Web:    configureAxios(import.meta.env.VITE_API_URL)
// Mobile: configureAxios(process.env.EXPO_PUBLIC_API_URL)
export const configureAxios = (baseURL) => {
  axiosInstance.defaults.baseURL = baseURL;
};

export default axiosInstance;
