import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store.jsx";
import { Provider } from "react-redux";
import { configureRefreshCallback } from "./utils/axiosInstance";
import { logoutUser } from "./redux/authSlice.jsx";

configureRefreshCallback(() => {
  store.dispatch(logoutUser());
});

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
