import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getTaxSettings } from "./redux/taxSettingsSlice";
import { fetchMe } from "./redux/authSlice";
import { fetchCart } from "./redux/cartSlice";
import { fetchFavourites } from "./redux/favouriteSlice";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Header from "./layout/Header.jsx";
import Footer from "./layout/Footer.jsx";
import TopBar from "./components/TopBar.jsx";
import CartDrawer from "./components/CartDrawer.jsx";

import Home from "./components/Home.jsx";
import CategoryList from "./layout/CategoryList.jsx";
import CartPage from "./pages/CartPage.jsx";
import FavouritesPage from "./pages/FavouritesPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import CampaignPage from "./pages/CampaignPage.jsx";
import CampaignDetailPage from "./pages/CampaignDetailPage.jsx";

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMe()).then((action) => {
      if (action.payload) {
        dispatch(fetchCart());
        dispatch(fetchFavourites());
      }
    });
    dispatch(getTaxSettings());
  }, []);

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
        <Route
          path="/profile"
          element={user ? <UserProfile /> : <Navigate to="/" />}
        />
        <Route path="/products" element={<CategoryList />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/reset/:token" element={<ResetPasswordPage />} />
        <Route path="/campaigns" element={<CampaignPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/:id" element={<ProductDetails />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
      <CartDrawer />
    </BrowserRouter>
  );
}

export default App;
