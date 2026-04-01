import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
        <Route
          path="/profile"
          element={user ? <UserProfile /> : <Navigate to="/" />}
        />
        <Route path="/products" element={<CategoryList />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/reset/:token" element={<ResetPasswordPage />} />
        <Route path="/:id" element={<ProductDetails />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
      <CartDrawer />
    </BrowserRouter>
  );
}

export default App;
