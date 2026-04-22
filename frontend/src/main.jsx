import { createRoot } from "react-dom/client";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.jsx";
import { Toaster } from "react-hot-toast";
import { configureAxios, configureStorage } from "../../shared/index.js";

configureAxios(import.meta.env.VITE_API_URL);
configureStorage({
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, val) => localStorage.setItem(key, val),
  removeItem: (key) => localStorage.removeItem(key),
});

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <Toaster position="bottom-right" toastOptions={{ duration: 5000 }} />
  </Provider>,
);
