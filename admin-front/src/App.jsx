import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./Components/LoginPage.jsx";
import AdminHome from "./Components/AdminHome.jsx";
import AdminHeader from "./Components/AdminHeader.jsx";
import AdminProductFormPage from "./Components/AdminProductFormPage.jsx";
import AdminProductsPage from "./Components/AdminProductsPage.jsx";
import AdminCategoriesPage from "./Components/AdminCategoriesPage.jsx";
import AdminCargoPage from "./Components/AdminCargoPage.jsx";
import AdminTaxSettingsPage from "./Components/AdminTaxSettingsPage.jsx";
import AdminOrdersPage from "./Components/AdminOrdersPage.jsx";
import AdminOrderDetailPage from "./Components/AdminOrderDetailPage.jsx";
import AdminBannersPage from "./Components/AdminBannersPage.jsx";
import AdminHomeSectionsPage from "./Components/AdminHomeSectionsPage.jsx";
import AdminToast from "./Components/AdminToast.jsx";
import Home from "./Components/Home.jsx";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      {/* <AdminHeader /> */}
      <AdminToast />
      <Routes>
        <Route
          path="/"
          // element={user ? <AdminHome /> : <Navigate to="/login" />}
          element={user ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/admin/products"
          element={user?.isAdmin ? <AdminProductsPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/products/new"
          element={
            user?.isAdmin ? <AdminProductFormPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            user?.isAdmin ? <AdminProductFormPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/admin/categories"
          element={
            user?.isAdmin ? <AdminCategoriesPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/admin/cargo"
          element={user?.isAdmin ? <AdminCargoPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/tax-settings"
          element={
            user?.isAdmin ? <AdminTaxSettingsPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/admin/orders"
          element={user?.isAdmin ? <AdminOrdersPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/orders/:id"
          element={
            user?.isAdmin ? <AdminOrderDetailPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/admin/banners"
          element={user?.isAdmin ? <AdminBannersPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/home-sections"
          element={
            user?.isAdmin ? <AdminHomeSectionsPage /> : <Navigate to="/" />
          }
        />
        <Route path="*" element={user ? <Home /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
