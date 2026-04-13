import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetCampaigns,
  adminCreateCampaign,
  adminUpdateCampaign,
  adminDeleteCampaign,
  adminGetProducts,
  adminGetCoupons,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import { FaTrash } from "react-icons/fa";
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

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

function toInputDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 10);
}

const EMPTY_FORM = {
  title: "",
  description: "",
  products: [],
  startDate: "",
  endDate: "",
  coupon: "",
  isActive: true,
};

function CampaignForm({ initial, onSave, onCancel, allProducts, coupons }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(initial?.image?.url || null);
  const [newImage, setNewImage] = useState(null);
  const [keepImage, setKeepImage] = useState(!!initial?.image?.url);
  const [productSearch, setProductSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setNewImage(b64);
    setImagePreview(b64);
    setKeepImage(false);
  };

  const removeImage = () => {
    setNewImage(null);
    setImagePreview(null);
    setKeepImage(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggleProduct = (id) => {
    set(
      "products",
      form.products.includes(id)
        ? form.products.filter((p) => p !== id)
        : [...form.products, id],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) return;
    setSaving(true);
    await onSave({
      title: form.title,
      description: form.description,
      products: form.products,
      startDate: form.startDate,
      endDate: form.endDate,
      coupon: form.coupon || null,
      isActive: form.isActive,
      newImage: newImage || null,
      keepImage,
      image: newImage || null,
    });
    setSaving(false);
  };

  const visibleProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fafafa",
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{ fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}
      >
        {initial ? "Kampanyayı Düzenle" : "Yeni Kampanya"}
      </div>

      <div className="d-flex gap-3 flex-wrap mb-3">
        <div style={{ flex: "2 1 200px" }}>
          <label style={labelStyle}>Başlık *</label>
          <input
            style={inputStyle}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Kampanya başlığı"
            required
          />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={labelStyle}>Başlangıç *</label>
          <input
            type="date"
            style={inputStyle}
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            required
          />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={labelStyle}>Bitiş *</label>
          <input
            type="date"
            style={inputStyle}
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label style={labelStyle}>Açıklama</label>
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Kampanya açıklaması"
        />
      </div>

      {/* Görsel */}
      <div className="mb-3">
        <label style={labelStyle}>Görsel</label>
        {imagePreview ? (
          <div className="d-flex align-items-center gap-3 mb-2">
            <img
              src={imagePreview}
              alt="preview"
              style={{
                height: 80,
                maxWidth: 200,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #eee",
              }}
            />
            <button
              type="button"
              onClick={removeImage}
              style={{
                border: "1px solid #ffcdd2",
                background: "#fff5f5",
                color: "#c62828",
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Kaldır
            </button>
          </div>
        ) : (
          <p style={{ fontSize: "12px", color: "#bbb", marginBottom: "6px" }}>
            Görsel seçilmedi
          </p>
        )}
        <label
          style={{
            display: "inline-block",
            padding: "7px 14px",
            borderRadius: "8px",
            border: "1px dashed #ff6a00",
            color: "#ff6a00",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Görsel Seç
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* İndirim kodu */}
      <div className="mb-3">
        <label style={labelStyle}>İndirim Kodu</label>
        <select
          style={inputStyle}
          value={form.coupon}
          onChange={(e) => set("coupon", e.target.value)}
        >
          <option value="">— Seç —</option>
          {coupons.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} —{" "}
              {c.discountType === "percent"
                ? `%${c.discountValue}`
                : `${c.discountValue}₺`}
            </option>
          ))}
        </select>
      </div>

      {/* Ürünler */}
      <div className="mb-3">
        <label style={labelStyle}>
          Ürünler ({form.products.length} seçildi)
        </label>
        <input
          style={{ ...inputStyle, marginBottom: "8px" }}
          placeholder="Ürün ara..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: "8px",
            maxHeight: 220,
            overflowY: "auto",
            background: "#fff",
          }}
        >
          {visibleProducts.length === 0 ? (
            <div style={{ padding: "12px", color: "#bbb", fontSize: "13px" }}>
              Ürün bulunamadı.
            </div>
          ) : (
            visibleProducts.map((p) => {
              const selected = form.products.includes(p._id);
              return (
                <label
                  key={p._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderBottom: "1px solid #f8f8f8",
                    cursor: "pointer",
                    background: selected ? "#fff8f4" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleProduct(p._id)}
                    style={{ accentColor: "#ff6a00", flexShrink: 0 }}
                  />
                  {p.images?.[0]?.url && (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      style={{
                        width: 36,
                        height: 36,
                        objectFit: "cover",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span style={{ fontSize: "13px", flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: "12px", color: "#999", flexShrink: 0 }}>
                    {p.price?.toLocaleString("tr-TR")} ₺
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 mb-3">
        <input
          type="checkbox"
          id="campIsActive"
          checked={form.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
        />
        <label
          htmlFor="campIsActive"
          style={{ fontSize: "13px", cursor: "pointer" }}
        >
          Aktif
        </label>
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn orange-btn"
          disabled={saving}
          style={{ padding: "7px 20px", borderRadius: "8px", fontSize: "13px" }}
        >
          {saving ? "Kaydediliyor..." : initial ? "Güncelle" : "Ekle"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            border: "1px solid #eee",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          İptal
        </button>
      </div>
    </form>
  );
}

function CampaignsPanel() {
  const dispatch = useDispatch();
  const { campaigns, products, coupons, loading } = useSelector(
    (state) => state.admin,
  );
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    dispatch(adminGetCampaigns());
    if (!products.length) dispatch(adminGetProducts());
    if (!coupons.length) dispatch(adminGetCoupons());
  }, []);

  const handleSave = async (payload) => {
    if (editItem) {
      const result = await dispatch(
        adminUpdateCampaign({ id: editItem._id, campaignData: payload }),
      );
      if (adminUpdateCampaign.fulfilled.match(result)) {
        dispatch(addNotification({ message: "Kampanya güncellendi.", type: "success" }));
        setEditItem(null);
        setShowForm(false);
      }
    } else {
      const result = await dispatch(adminCreateCampaign(payload));
      if (adminCreateCampaign.fulfilled.match(result)) {
        dispatch(addNotification({ message: "Kampanya eklendi.", type: "success" }));
        setShowForm(false);
      }
    }
  };

  const handleEdit = (campaign) => {
    setEditItem({
      ...campaign,
      products: campaign.products.map((p) => p._id || p),
      coupon: campaign.coupon?._id || campaign.coupon || "",
      startDate: toInputDate(campaign.startDate),
      endDate: toInputDate(campaign.endDate),
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id, title) => {
    setConfirm({
      message: `"${title}" kampanyasını silmek istediğinize emin misiniz?`,
      onConfirm: () =>
        dispatch(adminDeleteCampaign(id)).then(() =>
          dispatch(
            addNotification({ message: `"${title}" silindi.`, type: "warning" }),
          ),
        ),
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditItem(null);
  };

  return (
    <div className="p-4">
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
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
          <span>Kampanyalar</span>
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#999" }}>
            {campaigns.length} kampanya
          </span>
        </div>

        {showForm && (
          <CampaignForm
            initial={editItem}
            onSave={handleSave}
            onCancel={handleCancel}
            allProducts={products}
            coupons={coupons}
          />
        )}

        {!showForm && (
          <div className="mb-4">
            <button
              className="btn orange-btn"
              onClick={() => setShowForm(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              + Yeni Kampanya
            </button>
          </div>
        )}

        {loading && campaigns.length === 0 ? (
          <div style={{ color: "#999", fontSize: "14px" }}>Yükleniyor...</div>
        ) : campaigns.length === 0 ? (
          <div style={{ color: "#bbb", fontSize: "13px" }}>
            Henüz kampanya eklenmemiş.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {campaigns.map((c) => {
              const now = new Date();
              const active =
                c.isActive &&
                new Date(c.startDate) <= now &&
                new Date(c.endDate) >= now;
              const expired = new Date(c.endDate) < now;

              return (
                <div
                  key={c._id}
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  {c.image?.url && (
                    <img
                      src={c.image.url}
                      alt={c.title}
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 8,
                        flexShrink: 0,
                        border: "1px solid #f0f0f0",
                      }}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        marginBottom: "3px",
                      }}
                    >
                      {c.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      {new Date(c.startDate).toLocaleDateString("tr-TR")} —{" "}
                      {new Date(c.endDate).toLocaleDateString("tr-TR")}
                      {c.coupon && (
                        <span
                          style={{
                            marginLeft: 8,
                            background: "#fff8e1",
                            color: "#e65100",
                            padding: "1px 6px",
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          {c.coupon.code}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: "#bbb", marginTop: 2 }}>
                      {c.products.length} ürün
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      flexShrink: 0,
                      background: expired
                        ? "#f5f5f5"
                        : active
                          ? "#d1fae5"
                          : "#fff3e0",
                      color: expired ? "#bbb" : active ? "#065f46" : "#e65100",
                    }}
                  >
                    {expired ? "Sona Erdi" : active ? "Aktif" : "Pasif"}
                  </span>

                  <div className="d-flex gap-2 flex-shrink-0">
                    <button
                      className="btn orange-btn"
                      onClick={() => handleEdit(c)}
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
                      onClick={() => handleDelete(c._id, c.title)}
                      style={{ padding: "4px 10px" }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CampaignsPanel;
