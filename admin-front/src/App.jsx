import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./Components/LoginPage.jsx";
import AdminProductFormPage from "./Components/AdminProductFormPage.jsx";
import AdminToast from "./Components/AdminToast.jsx";
import Home from "./Components/Home.jsx";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <AdminToast />
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
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
        <Route path="*" element={user ? <Home /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
