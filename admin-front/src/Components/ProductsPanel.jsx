import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminGetProducts, adminDeleteProduct } from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import { FaTrash } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";

function ProductsPanel() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.admin.products);
  const loading = useSelector((state) => state.admin.loading);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const [confirmConfig, setConfirmConfig] = useState(null);

  const handleDelete = (item) => {
    setConfirmConfig({
      message: `"${item.name}" ürününü silmek istediğinize emin misiniz?`,
      onConfirm: () => {
        dispatch(adminDeleteProduct(item._id))
          .unwrap()
          .then(() =>
            dispatch(addNotification({ message: `"${item.name}" silindi.`, type: "warning" })),
          )
          .catch(() =>
            dispatch(addNotification({ message: "Ürün silinemedi.", type: "error" })),
          );
      },
    });
  };

  useEffect(() => {
    if (products.length === 0) dispatch(adminGetProducts());
  }, []);

  const filtered = products.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.category?.name.toLowerCase().includes(q);
    const matchesStock = maxStock === "" || item.stock <= Number(maxStock);
    return matchesSearch && matchesStock;
  });

  return (
    <div className="p-4">
      {confirmConfig && (
        <ConfirmModal
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig(null)}
        />
      )}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center fw-bold mb-4 h3">
          <span>Ürünler</span>
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#999" }}>
            {filtered.length} ürün
          </span>
        </div>
        <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Ürün, marka veya kategori ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <input
            type="number"
            placeholder="Maks. stok"
            value={maxStock}
            onChange={(e) => setMaxStock(e.target.value)}
            style={{
              width: "130px",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <button
            className="btn orange-btn"
            onClick={() => navigate("/admin/products/new")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              whiteSpace: "nowrap",
            }}
          >
            + Yeni Ürün
          </button>
        </div>
        {loading ? (
          <div style={{ color: "#999", fontSize: "14px" }}>Yükleniyor...</div>
        ) : (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #f0f0f0",
                    color: "#999",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "8px 12px" }}>#</th>
                  <th style={{ padding: "8px 12px" }}>Kod</th>
                  <th style={{ padding: "8px 12px" }}>Foto</th>
                  <th style={{ padding: "8px 12px" }}>Ürün</th>
                  <th style={{ padding: "8px 12px" }}>Marka</th>
                  <th style={{ padding: "8px 12px" }}>Kategori</th>
                  <th style={{ padding: "8px 12px" }}>Fiyat</th>
                  <th style={{ padding: "8px 12px" }}>Stok</th>
                  <th style={{ padding: "8px 12px" }}>Eklenme Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr
                    key={item._id}
                    style={{ borderBottom: "1px solid #f5f5f5" }}
                  >
                    <td style={{ padding: "10px 12px", color: "#bbb" }}>
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {item.code}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <img
                        src={item.images?.[0]?.url}
                        alt={item.name}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "contain",
                          borderRadius: 6,
                          border: "1px solid #eee",
                          background: "#fafafa",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {item.name}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {item.brand}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#666" }}>
                      {item.category?.name || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {item.price}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {item.stock}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {item.createdAt.slice(0, 10)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div className="d-flex gap-2">
                        <button
                          className="btn orange-btn"
                          onClick={() =>
                            navigate(`/admin/products/${item._id}/edit`)
                          }
                          style={{
                            padding: "4px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        >
                          Düzenle
                        </button>
                        <button
                          className="btn orange-btn orange-text"
                          onClick={() => handleDelete(item)}
                          style={{ padding: "2px 12px" }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#bbb",
                      }}
                    >
                      Kategori bulunamadı.
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

export default ProductsPanel;
