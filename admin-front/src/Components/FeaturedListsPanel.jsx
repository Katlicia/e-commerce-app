import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetProducts,
  adminGetFeaturedList,
  adminUpdateFeaturedList,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";

const LIST_KEY = "monthly-featured";

const inputStyle = {
  border: "1px solid #eee",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  background: "#fff",
};

function FeaturedListsPanel() {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.admin);
  const featuredList = useSelector(
    (state) => state.admin.featuredLists[LIST_KEY],
  );

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!products.length) dispatch(adminGetProducts());
    dispatch(adminGetFeaturedList(LIST_KEY));
  }, []);

  useEffect(() => {
    if (featuredList) {
      setSelectedIds(featuredList.products.map((p) => p._id || p));
    }
  }, [featuredList]);

  const selectedProducts = products.filter((p) => selectedIds.includes(p._id));
  const filteredProducts = products.filter(
    (p) =>
      !selectedIds.includes(p._id) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addProduct = (id) => setSelectedIds((prev) => [...prev, id]);
  const removeProduct = (id) =>
    setSelectedIds((prev) => prev.filter((pid) => pid !== id));

  const handleSave = async () => {
    setSaving(true);
    const result = await dispatch(
      adminUpdateFeaturedList({ key: LIST_KEY, products: selectedIds }),
    );
    setSaving(false);
    if (adminUpdateFeaturedList.fulfilled.match(result)) {
      dispatch(
        addNotification({ message: "Liste kaydedildi.", type: "success" }),
      );
    } else {
      dispatch(
        addNotification({ message: "Kaydetme başarısız.", type: "error" }),
      );
    }
  };

  return (
    <div className="p-4">
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        <div className="fw-bold mb-1 h3">Ayın Ürünleri</div>
        <p style={{ fontSize: "13px", color: "#999", marginBottom: "24px" }}>
          Listede {selectedIds.length} ürün var.
        </p>

        <div className="row g-4">
          {/* Sol: Listedeki ürünler */}
          <div className="col-12 col-lg-6">
            <div
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  background: "#fff8f4",
                  borderBottom: "1px solid #f0f0f0",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Listede Olanlar ({selectedIds.length})
              </div>
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {selectedProducts.length === 0 ? (
                  <p
                    style={{
                      padding: "20px 16px",
                      color: "#bbb",
                      fontSize: "13px",
                    }}
                  >
                    Henüz ürün eklenmedi.
                  </p>
                ) : (
                  selectedProducts.map((p) => (
                    <div
                      key={p._id}
                      className="d-flex align-items-center gap-3"
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid #f8f8f8",
                      }}
                    >
                      {p.images?.[0]?.url && (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 6,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#999" }}>
                          {p.price?.toFixed(2).toLocaleString("tr-TR")} ₺
                        </div>
                      </div>
                      <button
                        onClick={() => removeProduct(p._id)}
                        style={{
                          border: "1px solid #ffcdd2",
                          background: "#fff5f5",
                          color: "#c62828",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "12px",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        Kaldır
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sağ: Ürün ekle */}
          <div className="col-12 col-lg-6">
            <div
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  background: "#fafafa",
                }}
              >
                <input
                  style={inputStyle}
                  placeholder="Ürün ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {filteredProducts.length === 0 ? (
                  <p
                    style={{
                      padding: "20px 16px",
                      color: "#bbb",
                      fontSize: "13px",
                    }}
                  >
                    {search ? "Sonuç bulunamadı." : "Tüm ürünler listede."}
                  </p>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p._id}
                      className="d-flex align-items-center gap-3"
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid #f8f8f8",
                      }}
                    >
                      {p.images?.[0]?.url && (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 6,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#999" }}>
                          {p.price?.toFixed(2).toLocaleString("tr-TR")} ₺
                        </div>
                      </div>
                      <button
                        onClick={() => addProduct(p._id)}
                        style={{
                          border: "1px solid #c8e6c9",
                          background: "#f1f8f1",
                          color: "#2e7d32",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "12px",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        + Ekle
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            className="btn orange-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 32px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeaturedListsPanel;
