import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetBanner,
  adminUpdateBanner,
  adminGetCategories,
  adminGetBrands,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import CategorySelect from "./CategorySelect";

const BANNER_TYPES = [
  { value: "carousel", label: "Ana Sayfa Slider (Carousel)" },
  { value: "topbar", label: "Üst Banner (TopBar)" },
  { value: "adbanner-1", label: "Ara Banner 1 (AdBanner - Üst)" },
  { value: "adbanner-2", label: "Ara Banner 2 (AdBanner - Alt)" },
];

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const inputStyle = {
  border: "1px solid #eee",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  background: "#fff",
};

function BannersPanel() {
  const dispatch = useDispatch();
  const { banners, categories, brands, loading } = useSelector((state) => state.admin);

  const [activeType, setActiveType] = useState("carousel");
  const [imageList, setImageList] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(adminGetCategories());
    dispatch(adminGetBrands());
  }, []);

  useEffect(() => {
    dispatch(adminGetBanner(activeType));
  }, [activeType]);

  useEffect(() => {
    const imgs = banners[activeType] || [];
    setImageList(imgs.map((img) => ({ type: "existing", ...img })));
  }, [banners, activeType]);

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      type: "new",
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageList((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImageList((prev) => {
      const item = prev[idx];
      if (item.type === "new") URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateLink = (idx, value) =>
    setImageList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, link: value } : item)),
    );

  const moveImage = (idx, dir) => {
    setImageList((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const keepImages = imageList
      .filter((i) => i.type === "existing")
      .map(({ public_id, url, link }) => ({ public_id, url, link }));

    const newFiles = imageList.filter((i) => i.type === "new").map((i) => i.file);
    const newImages = await Promise.all(newFiles.map(toBase64));

    dispatch(adminUpdateBanner({ type: activeType, bannerData: { keepImages, newImages } }))
      .unwrap()
      .then(() => dispatch(addNotification({ message: "Banner güncellendi." })))
      .catch(() => dispatch(addNotification({ message: "Banner güncellenemedi.", type: "error" })))
      .finally(() => setSaving(false));
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
        <div className="fw-bold mb-4 h3">Banner Yönetimi</div>

        {/* Banner tipi seçimi */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "6px" }}>
            Banner Bölümü
          </label>
          <select
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
            style={inputStyle}
          >
            {BANNER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Görseller */}
        <div
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
            Görseller{" "}
            <span style={{ fontWeight: 400, fontSize: "12px", color: "#999" }}>
              ({imageList.length} görsel)
            </span>
          </div>

          {loading ? (
            <div style={{ color: "#999", fontSize: "14px" }}>Yükleniyor...</div>
          ) : (
            <>
              {imageList.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>
                  {imageList.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                      {/* Görsel önizleme */}
                      <div
                        style={{
                          position: "relative",
                          flexShrink: 0,
                          border: item.type === "new" ? "2px dashed #ff6a00" : "1px solid #eee",
                          borderRadius: "8px",
                          overflow: "hidden",
                          width: 120,
                          height: 80,
                          background: "#fafafa",
                        }}
                      >
                        {item.type === "new" && (
                          <span
                            style={{
                              position: "absolute",
                              top: 4,
                              left: 4,
                              background: "#ff6a00",
                              color: "#fff",
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: "4px",
                              zIndex: 1,
                            }}
                          >
                            Yeni
                          </span>
                        )}
                        <img
                          src={item.type === "existing" ? item.url : item.preview}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      {/* Sıra ve sil butonları */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, -1)}
                          style={{
                            border: "1px solid #eee",
                            borderRadius: "6px",
                            background: "#fff",
                            width: 32,
                            height: 28,
                            cursor: idx === 0 ? "default" : "pointer",
                            opacity: idx === 0 ? 0.4 : 1,
                            fontSize: "13px",
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{
                            border: "1px solid #ffcdd2",
                            borderRadius: "6px",
                            background: "#fff5f5",
                            color: "#c62828",
                            width: 32,
                            height: 28,
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          ×
                        </button>
                        <button
                          type="button"
                          disabled={idx === imageList.length - 1}
                          onClick={() => moveImage(idx, 1)}
                          style={{
                            border: "1px solid #eee",
                            borderRadius: "6px",
                            background: "#fff",
                            width: 32,
                            height: 28,
                            cursor: idx === imageList.length - 1 ? "default" : "pointer",
                            opacity: idx === imageList.length - 1 ? 0.4 : 1,
                            fontSize: "13px",
                          }}
                        >
                          ↓
                        </button>
                      </div>

                      {/* Link seçimi */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "4px" }}>
                          Kategori Linki{" "}
                          <span style={{ color: "#bbb" }}>(boş bırakılırsa tıklanamaz)</span>
                        </label>
                        <CategorySelect
                          categories={categories}
                          brands={brands}
                          value={item.link || ""}
                          onChange={(slug) => updateLink(idx, slug)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <label
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px dashed #ff6a00",
                    color: "#ff6a00",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Görsel Ekle
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAddImages}
                  />
                </label>
                <button
                  className="orange-btn"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding: "8px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BannersPanel;
