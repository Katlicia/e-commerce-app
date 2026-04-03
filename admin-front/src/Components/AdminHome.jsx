import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";

function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="container my-5">
      <div className="d-flex gap-4 orange-text flex-column">
        <div
          className="admin-panel-card flex-fill d-flex align-items-center justify-content-center"
          onClick={() => navigate("/admin/orders")}
        >
          <h2>Siparişler</h2>
        </div>
        <div className="d-flex gap-4">
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
        <div className="d-flex gap-4">
          <div
            className="admin-panel-card flex-fill d-flex align-items-center justify-content-center"
            onClick={() => navigate("/admin/cargo")}
          >
            <h2>Kargo</h2>
          </div>
          <div
            className="admin-panel-card flex-fill d-flex align-items-center justify-content-center"
            onClick={() => navigate("/admin/tax-settings")}
          >
            <h2>Vergi Ayarları</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
