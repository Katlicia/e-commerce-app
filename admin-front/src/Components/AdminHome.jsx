import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";

function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="container my-5">
      <h1 className="text-center mb-5">Admin Paneli</h1>
      <div className="d-flex gap-4 orange-text">
        <div
          className="admin-panel-card flex-fill d-flex align-items-center justify-content-center"
          onClick={() => navigate("/admin/products")}
        >
          <h2>Ürünler</h2>
        </div>
        <div
          className="admin-panel-card flex-fill d-flex align-items-center justify-content-center"
          onClick={() => navigate("/admin/categories")}
        >
          <h2>Kategoriler</h2>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
