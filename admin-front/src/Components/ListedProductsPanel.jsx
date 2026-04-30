import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetListedProducts,
  adminCreateListedProducts,
  adminUpdateListedProducts,
  adminDeleteListedProducts,
  adminGetProducts,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import { FaTrash, FaEdit } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";

const inputStyle = {
  border: "1px solid #eee",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  background: "#fff",
};

const labelStyle = {
  fontSize: "12px",
  color: "#999",
  display: "block",
  marginBottom: "4px",
};

const EMPTY_FORM = { name: "", discountPercent: 0, products: [] };

function fmt(n) {
  return Number(n).toFixed(2).replace(".", ",");
}

function ListedProductsForm({ initial, onSave, onCancel, allProducts }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          discountPercent: initial.discountPercent ?? 0,
          products: (initial.products || []).map((item) => ({
            product: item.product._id || item.product,
            quantity: item.quantity || 1,
          })),
        }
      : EMPTY_FORM,
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(search.toLowerCase())),
  );

  const isAdded = (id) => form.products.some((item) => item.product === id);

  const addProduct = (p) => {
    if (isAdded(p._id)) return;
    set("products", [...form.products, { product: p._id, quantity: 1 }]);
  };

  const removeProduct = (id) => {
    set(
      "products",
      form.products.filter((item) => item.product !== id),
    );
  };

  const setQuantity = (id, qty) => {
    set(
      "products",
      form.products.map((item) =>
        item.product === id ? { ...item, quantity: Math.max(1, Number(qty)) } : item,
      ),
    );
  };

  const getProduct = (id) => allProducts.find((p) => p._id === id);

  const computedTotal = form.products.reduce((sum, item) => {
    const p = getProduct(item.product);
    return sum + (p?.price || 0) * item.quantity;
  }, 0);

  const discountedTotal =
    form.discountPercent > 0
      ? +(computedTotal * (1 - form.discountPercent / 100)).toFixed(2)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.products.length === 0) return;
    setSaving(true);
    await onSave({
      name: form.name.trim(),
      discountPercent: Number(form.discountPercent) || 0,
      products: form.products,
    });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fafafa",
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "24px",
      }}
    >
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label style={labelStyle}>Liste Adı *</label>
          <input
            style={inputStyle}
            placeholder="ör. Kırtasiye İhtiyaç Listesi"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <label style={labelStyle}>İndirim % (0–100)</label>
          <input
            style={inputStyle}
            type="number"
            min={0}
            max={100}
            value={form.discountPercent}
            onChange={(e) => set("discountPercent", e.target.value)}
          />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <div
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              width: "100%",
            }}
          >
            {form.discountPercent > 0 && discountedTotal !== null ? (
              <>
                <del style={{ color: "#aaa", fontSize: 12 }}>{fmt(computedTotal)}₺</del>
                <span
                  style={{ fontWeight: 700, color: "#f83b0a", marginLeft: 8 }}
                >
                  {fmt(discountedTotal)}₺
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 700 }}>{fmt(computedTotal)}₺</span>
            )}
          </div>
        </div>
      </div>

      {/* Eklenen ürünler */}
      {form.products.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Listedeki Ürünler ({form.products.length})</label>
          <div
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {form.products.map((item) => {
              const p = getProduct(item.product);
              if (!p) return null;
              return (
                <div
                  key={item.product}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  {p.images?.[0]?.url && (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      style={{
                        width: 36,
                        height: 36,
                        objectFit: "contain",
                        borderRadius: 4,
                        border: "1px solid #eee",
                      }}
                    />
                  )}
                  <span
                    style={{ flex: 1, fontSize: 13, color: "#333" }}
                  >
                    {p.name}
                  </span>
                  <span style={{ fontSize: 12, color: "#aaa", minWidth: 60 }}>
                    {fmt(p.price)}₺
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.product, item.quantity - 1)}
                      style={{
                        width: 24,
                        height: 24,
                        border: "1px solid #eee",
                        borderRadius: 4,
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#666",
                        lineHeight: 1,
                      }}
                    >
                      −
                    </button>
                    <span style={{ minWidth: 24, textAlign: "center", fontSize: 13 }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.product, item.quantity + 1)}
                      style={{
                        width: 24,
                        height: 24,
                        border: "1px solid #eee",
                        borderRadius: 4,
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#666",
                        lineHeight: 1,
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(item.product)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      fontSize: 14,
                      padding: "2px 4px",
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ürün arama */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Ürün Ara & Ekle</label>
        <input
          style={inputStyle}
          placeholder="Ürün adı veya kodu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search.trim() && (
          <div
            style={{
              marginTop: 4,
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 8,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {filteredProducts.length === 0 ? (
              <p
                style={{
                  padding: "10px 12px",
                  fontSize: 13,
                  color: "#aaa",
                  margin: 0,
                }}
              >
                Ürün bulunamadı
              </p>
            ) : (
              filteredProducts.slice(0, 20).map((p) => {
                const added = isAdded(p._id);
                return (
                  <div
                    key={p._id}
                    onClick={() => !added && addProduct(p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderBottom: "1px solid #f5f5f5",
                      cursor: added ? "default" : "pointer",
                      opacity: added ? 0.5 : 1,
                      background: added ? "#f9f9f9" : "#fff",
                    }}
                  >
                    {p.images?.[0]?.url && (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        style={{
                          width: 32,
                          height: 32,
                          objectFit: "contain",
                          borderRadius: 4,
                        }}
                      />
                    )}
                    <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: "#aaa" }}>
                      {fmt(p.price)}₺
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: added ? "#aaa" : "#ff6a00",
                      }}
                    >
                      {added ? "Eklendi" : "+ Ekle"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn orange-btn rounded-pill px-4"
          disabled={saving || !form.name.trim() || form.products.length === 0}
        >
          {saving ? "Kaydediliyor..." : initial ? "Güncelle" : "Oluştur"}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary rounded-pill px-4"
          style={{ fontSize: 13 }}
          onClick={onCancel}
        >
          İptal
        </button>
      </div>
    </form>
  );
}

function ListedProductsPanel() {
  const dispatch = useDispatch();
  const { listedProducts, products, loading } = useSelector((s) => s.admin);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    dispatch(adminGetListedProducts());
    if (!products.length) dispatch(adminGetProducts());
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleSave = async (payload) => {
    if (editItem) {
      const result = await dispatch(
        adminUpdateListedProducts({ id: editItem._id, payload }),
      );
      if (adminUpdateListedProducts.fulfilled.match(result)) {
        dispatch(addNotification({ message: "Liste güncellendi", type: "success" }));
        handleCancel();
      }
    } else {
      const result = await dispatch(adminCreateListedProducts(payload));
      if (adminCreateListedProducts.fulfilled.match(result)) {
        dispatch(addNotification({ message: "Liste oluşturuldu", type: "success" }));
        handleCancel();
      }
    }
  };

  const handleDelete = (item) => {
    setConfirm({
      message: `"${item.name}" listesini silmek istediğinize emin misiniz?`,
      onConfirm: () => {
        dispatch(adminDeleteListedProducts(item._id)).then(() => {
          dispatch(
            addNotification({ message: `"${item.name}" silindi`, type: "warning" }),
          );
        });
        setConfirm(null);
      },
    });
  };

  return (
    <div className="p-4">
      {confirm && (
        <ConfirmModal {...confirm} onClose={() => setConfirm(null)} />
      )}

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="fw-bold" style={{ fontSize: 16 }}>
            Ürün Listeleri
          </span>
          <span style={{ fontSize: 13, color: "#aaa" }}>
            {listedProducts.length} liste
          </span>
        </div>

        {showForm && (
          <ListedProductsForm
            initial={editItem}
            onSave={handleSave}
            onCancel={handleCancel}
            allProducts={products}
          />
        )}

        {!showForm && (
          <button
            className="btn orange-btn rounded-pill mb-4"
            style={{ fontSize: 13, padding: "6px 20px" }}
            onClick={() => setShowForm(true)}
          >
            + Yeni Liste Oluştur
          </button>
        )}

        {loading && !listedProducts.length ? (
          <p style={{ color: "#aaa", fontSize: 13 }}>Yükleniyor...</p>
        ) : listedProducts.length === 0 ? (
          <p style={{ color: "#aaa", fontSize: 13 }}>Henüz liste yok.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {listedProducts.map((list) => (
              <div
                key={list._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: "16px 20px",
                  background: "#fafafa",
                }}
              >
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        margin: 0,
                        marginBottom: 6,
                      }}
                    >
                      {list.name}
                    </p>

                    <div className="d-flex flex-column gap-1 mb-3">
                      {(list.products || []).map((item) => {
                        const p = item.product;
                        if (!p || typeof p !== "object") return null;
                        return (
                          <div
                            key={p._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 13,
                              color: "#444",
                            }}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: "#ff6a00",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <svg
                                width="10"
                                height="8"
                                viewBox="0 0 10 8"
                                fill="none"
                              >
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="#fff"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            <span style={{ flex: 1 }}>{p.name}</span>
                            <span style={{ color: "#aaa", fontSize: 12 }}>
                              {item.quantity} Adet
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      {list.discountPercent > 0 && (
                        <span
                          style={{
                            background: "#e8f5e9",
                            color: "#2e7d32",
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "2px 10px",
                            borderRadius: 999,
                          }}
                        >
                          %{list.discountPercent} indirim
                        </span>
                      )}
                      {list.discountedTotal ? (
                        <>
                          <del style={{ fontSize: 13, color: "#aaa" }}>
                            {fmt(list.total)}₺
                          </del>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: 18,
                              color: "#f83b0a",
                            }}
                          >
                            {fmt(list.discountedTotal)}₺
                          </span>
                        </>
                      ) : (
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 18,
                            color: "#f83b0a",
                          }}
                        >
                          {fmt(list.total)}₺
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#aaa" }}>KDV Dahil</span>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm"
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 8,
                        padding: "5px 10px",
                        fontSize: 13,
                        color: "#555",
                      }}
                      onClick={() => handleEdit(list)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{
                        border: "1px solid #fee2e2",
                        borderRadius: 8,
                        padding: "5px 10px",
                        fontSize: 13,
                        color: "#ef4444",
                        background: "#fff5f5",
                      }}
                      onClick={() => handleDelete(list)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListedProductsPanel;