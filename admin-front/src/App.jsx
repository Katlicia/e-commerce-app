import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./Components/LoginPage.jsx";
import AdminHome from "./Components/AdminHome.jsx";
import AdminHeader from "./Components/AdminHeader.jsx";
import AdminProductFormPage from "./Components/AdminProductFormPage.jsx";
import AdminProductsPage from "./Components/AdminProductsPage.jsx";
import AdminCategoriesPage from "./Components/AdminCategoriesPage.jsx";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <AdminHeader />
      <Routes>
        <Route
          path="/"
          element={user ? <AdminHome /> : <Navigate to="/login" />}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
