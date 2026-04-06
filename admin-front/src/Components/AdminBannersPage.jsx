import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  adminGetBanner,
  adminUpdateBanner,
  adminGetCategories,
  adminGetBrands,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import CategorySelect from "./CategorySelect";
import "../styles/AdminPage.css";

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

function AdminBannersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { banners, categories, brands, loading } = useSelector(
    (state) => state.admin,
  );

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

    const newFiles = imageList
      .filter((i) => i.type === "new")
      .map((i) => i.file);
    const newImages = await Promise.all(newFiles.map(toBase64));

    dispatch(
      adminUpdateBanner({
        type: activeType,
        bannerData: { keepImages, newImages },
      }),
    )
      .unwrap()
      .then(() => dispatch(addNotification({ message: "Banner güncellendi." })))
      .catch(() =>
        dispatch(
          addNotification({ message: "Banner güncellenemedi.", type: "error" }),
        ),
      )
      .finally(() => setSaving(false));
  };

  return (
    <div className="admin-page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/")}
          >
            ← Geri
          </button>
          <h4 className="fw-bold mb-0">Banner Yönetimi</h4>
        </div>

        <div className="admin-form-card mb-4">
          <label className="admin-form-label">Banner Bölümü</label>
          <select
            className="form-select"
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
          >
            {BANNER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form-card">
          <h6 className="fw-bold mb-3">
            Görseller
            <span
              className="text-muted fw-normal ms-2"
              style={{ fontSize: "0.8rem" }}
            >
              ({imageList.length} görsel)
            </span>
          </h6>

          {loading ? (
            <p className="text-muted">Yükleniyor...</p>
          ) : (
            <>
              {imageList.length > 0 && (
                <div className="d-flex flex-column gap-3 mb-3">
                  {imageList.map((item, idx) => (
                    <div key={idx} className="d-flex gap-3 align-items-center">
                      <div
                        className={`admin-img-card mb-0${item.type === "new" ? " is-new" : ""}`}
                        style={{ flexShrink: 0 }}
                      >
                        {item.type === "new" && (
                          <span className="admin-img-new-badge">Yeni</span>
                        )}
                        <img
                          src={
                            item.type === "existing" ? item.url : item.preview
                          }
                          alt=""
                        />
                        <div className="admin-img-card-actions">
                          <button
                            type="button"
                            title="Sola taşı"
                            disabled={idx === 0}
                            onClick={() => moveImage(idx, -1)}
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            className="delete-btn"
                            title="Sil"
                            onClick={() => removeImage(idx)}
                          >
                            ×
                          </button>
                          <button
                            type="button"
                            title="Sağa taşı"
                            disabled={idx === imageList.length - 1}
                            onClick={() => moveImage(idx, 1)}
                          >
                            →
                          </button>
                        </div>
                      </div>
                      <div className="flex-fill">
                        <label className="admin-form-label">
                          Kategori Linki{" "}
                          <span className="text-muted fw-normal">
                            (boş bırakılırsa tıklanamaz)
                          </span>
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

              <div className="d-flex gap-2 align-items-center flex-wrap">
                <label className="admin-img-add-btn">
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
                  className="btn orange-btn px-4"
                  onClick={handleSave}
                  disabled={saving}
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

export default AdminBannersPage;
