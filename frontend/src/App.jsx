import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Header from "./layout/Header.jsx";
import Footer from "./layout/Footer.jsx";
import Carousel from "./components/Carousel.jsx";
import Featured from "./components/Featured.jsx";
import ProductList from "./components/ProductList.jsx";
import HeaderLinks from "./components/HeaderLinks.jsx";
import AdBanners from "./components/AdBanners.jsx";
import CategoryRow from "./components/CategoryRow.jsx";
import Brands from "./components/Brands.jsx";
import PopularLinks from "./components/PopularLinks.jsx";
import TopBar from "./components/Topbar.jsx";
import AdBar from "./components/AdBar.jsx";
import DealOfDay from "./components/DealOfDay.jsx";
import CartDrawer from "./components/CartDrawer.jsx";

import Home from "./components/Home.jsx";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <TopBar />
      <Header />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <RegisterPage />}
        />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
      <CartDrawer />
    </BrowserRouter>
  );
}

export default App;
