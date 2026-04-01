import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  adminGetProducts,
  adminDeleteProduct,
  adminGetCategories,
} from "../redux/adminSlice";
import "../styles/AdminPage.css";

const BADGE_LABELS = {
  yeni: "Yeni",
  "gunun-firsati": "Günün Fırsatı",
  "en-cok-satan": "En Çok Satan",
  indirimli: "İndirimli",
};

function AdminProductsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(adminGetProducts());
    dispatch(adminGetCategories());
  }, []);

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat ? cat.name : "-";
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`"${name}" ürünü silmek istediğinize emin misiniz?`))
      return;
    dispatch(adminDeleteProduct(id));
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Ürün Yönetimi</h4>
          <Link
            to="/admin/products/new"
            className="btn btn-primary rounded px-4"
          >
            + Yeni Ürün
          </Link>
        </div>

        {loading ? (
          <p className="text-muted">Yükleniyor...</p>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Görsel</th>
                  <th>Ürün Adı</th>
                  <th>Marka</th>
                  <th>Fiyat</th>
                  <th>Stok</th>
                  <th>Kategori</th>
                  <th>Rozet</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img src={p.images?.[0]?.url} alt={p.name} />
                    </td>
                    <td className="fw-semibold">{p.name}</td>
                    <td>{p.brand}</td>
                    <td>{Number(p.discountedPrice || p.price).toFixed(2)}₺</td>
                    <td>{p.stock}</td>
                    <td>{getCategoryName(p.category)}</td>
                    <td>
                      {p.badge ? (
                        <span className="badge bg-warning text-dark admin-badge">
                          {BADGE_LABELS[p.badge] || p.badge}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            navigate(`/admin/products/${p._id}/edit`)
                          }
                        >
                          Düzenle
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(p._id, p.name)}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      Ürün bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProductsPage;
