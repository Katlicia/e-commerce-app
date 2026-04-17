import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminGetAllAdBanners,
  adminGetCategories,
  adminGetBrands,
  adminGetHomeLayout,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import CategorySelect from "./CategorySelect";

const FIXED_BANNERS = [
  { type: "carousel", label: "Ana Sayfa Slider" },
  { type: "topbar", label: "Üst Banner" },
];

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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
  background: "#fff",
};

function ImageEditor({ type, label }) {
  const dispatch = useDispatch();
  const { banners, categories, brands, loading } = useSelector((s) => s.admin);
  const bannerData = banners[type];
  const images = bannerData?.images || [];

  const [imageList, setImageList] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFetching(true);
    setImageList([]);
    dispatch(adminGetBanner(type))
      .unwrap()
      .then((payload) => {
        setImageList(
          (payload.data?.images || []).map((img) => ({
            kind: "existing",
            ...img,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [type]);

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    setImageList((prev) => [
      ...prev,
      ...files.map((file) => ({
        kind: "new",
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImageList((prev) => {
      const item = prev[idx];
      if (item.kind === "new") URL.revokeObjectURL(item.preview);
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
      .filter((i) => i.kind === "existing")
      .map(({ public_id, url, link }) => ({ public_id, url, link }));
    const newImages = await Promise.all(
      imageList.filter((i) => i.kind === "new").map((i) => toBase64(i.file)),
    );

    dispatch(
      adminUpdateBanner({ type, bannerData: { label, keepImages, newImages } }),
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

      {fetching ? (
        <div style={{ color: "#999", fontSize: "14px" }}>Yükleniyor...</div>
      ) : (
        <>
          {imageList.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              {imageList.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      flexShrink: 0,
                      border:
                        item.kind === "new"
                          ? "2px dashed #ff6a00"
                          : "1px solid #eee",
                      borderRadius: "8px",
                      overflow: "hidden",
                      width: 120,
                      height: 80,
                      background: "#fafafa",
                    }}
                  >
                    {item.kind === "new" && (
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
                      src={item.kind === "existing" ? item.url : item.preview}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      flexShrink: 0,
                    }}
                  >
                    {[
                      [-1, "↑"],
                      [0, "×"],
                      [1, "↓"],
                    ].map(([dir, icon]) => (
                      <button
                        key={icon}
                        type="button"
                        disabled={
                          dir === -1
                            ? idx === 0
                            : dir === 1
                              ? idx === imageList.length - 1
                              : false
                        }
                        onClick={() =>
                          dir === 0 ? removeImage(idx) : moveImage(idx, dir)
                        }
                        style={{
                          border:
                            dir === 0 ? "1px solid #ffcdd2" : "1px solid #eee",
                          borderRadius: "6px",
                          background: dir === 0 ? "#fff5f5" : "#fff",
                          color: dir === 0 ? "#c62828" : "inherit",
                          width: 32,
                          height: 28,
                          cursor: "pointer",
                          fontSize: dir === 0 ? "14px" : "13px",
                          fontWeight: dir === 0 ? 700 : 400,
                          opacity:
                            (dir === -1 && idx === 0) ||
                            (dir === 1 && idx === imageList.length - 1)
                              ? 0.4
                              : 1,
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Kategori Linki{" "}
                      <span style={{ color: "#bbb" }}>
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

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
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
              className="btn orange-btn"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "8px 24px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BannersPanel() {
  const dispatch = useDispatch();
  const { adBanners } = useSelector((s) => s.admin);

  const [activeType, setActiveType] = useState("carousel");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingType, setDeletingType] = useState(null);

  const activeLabel =
    FIXED_BANNERS.find((b) => b.type === activeType)?.label ||
    adBanners.find((b) => b.type === activeType)?.label ||
    "";

  useEffect(() => {
    dispatch(adminGetAllAdBanners());
    dispatch(adminGetCategories());
    dispatch(adminGetBrands());
  }, []);

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    const type = "adbanner-" + slugify(newLabel);
    setCreating(true);
    dispatch(
      adminUpdateBanner({
        type,
        bannerData: { label: newLabel.trim(), keepImages: [], newImages: [] },
      }),
    )
      .unwrap()
      .then(() => {
        dispatch(adminGetAllAdBanners());
        dispatch(addNotification({ message: "Banner oluşturuldu." }));
        setActiveType(type);
        setNewLabel("");
        setShowNewForm(false);
      })
      .catch(() =>
        dispatch(
          addNotification({ message: "Banner oluşturulamadı.", type: "error" }),
        ),
      )
      .finally(() => setCreating(false));
  };

  const handleDelete = (type) => {
    setDeletingType(type);
    dispatch(adminDeleteBanner(type))
      .unwrap()
      .then(() => {
        dispatch(addNotification({ message: "Banner silindi." }));
        dispatch(adminGetHomeLayout());
        setActiveType("carousel");
      })
      .catch(() =>
        dispatch(
          addNotification({ message: "Banner silinemedi.", type: "error" }),
        ),
      )
      .finally(() => setDeletingType(null));
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

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "24px",
            alignItems: "center",
          }}
        >
          {FIXED_BANNERS.map((b) => (
            <button
              key={b.type}
              onClick={() => setActiveType(b.type)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                border:
                  activeType === b.type
                    ? "1px solid #ff6a00"
                    : "1px solid #eee",
                background: activeType === b.type ? "#fff4ee" : "#fff",
                color: activeType === b.type ? "#ff6a00" : "#555",
              }}
            >
              {b.label}
            </button>
          ))}

          {adBanners.map((b) => (
            <div
              key={b.type}
              style={{ display: "flex", alignItems: "center", gap: "2px" }}
            >
              <button
                onClick={() => setActiveType(b.type)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px 0 0 20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  borderTop:
                    activeType === b.type
                      ? "1px solid #ff6a00"
                      : "1px solid #eee",
                  borderBottom:
                    activeType === b.type
                      ? "1px solid #ff6a00"
                      : "1px solid #eee",
                  borderLeft:
                    activeType === b.type
                      ? "1px solid #ff6a00"
                      : "1px solid #eee",
                  borderRight: "none",
                  background: activeType === b.type ? "#fff4ee" : "#fff",
                  color: activeType === b.type ? "#ff6a00" : "#555",
                }}
              >
                {b.label}
              </button>
              <button
                onClick={() => handleDelete(b.type)}
                disabled={deletingType === b.type}
                title="Banner'ı sil"
                style={{
                  padding: "7px 8px",
                  borderRadius: "0 20px 20px 0",
                  fontSize: "12px",
                  cursor: "pointer",
                  borderTop:
                    activeType === b.type
                      ? "1px solid #ff6a00"
                      : "1px solid #eee",
                  borderBottom:
                    activeType === b.type
                      ? "1px solid #ff6a00"
                      : "1px solid #eee",
                  borderRight:
                    activeType === b.type
                      ? "1px solid #ff6a00"
                      : "1px solid #eee",
                  borderLeft: "none",
                  background: activeType === b.type ? "#fff4ee" : "#fff",
                  color: "#c62828",
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>
          ))}

          {showNewForm ? (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setShowNewForm(false);
                }}
                placeholder="Banner adı"
                style={{ ...inputStyle, width: 160 }}
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newLabel.trim()}
                className="btn orange-btn"
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                {creating ? "..." : "Oluştur"}
              </button>
              <button
                onClick={() => {
                  setShowNewForm(false);
                  setNewLabel("");
                }}
                style={{
                  padding: "6px 10px",
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
          ) : (
            <button
              onClick={() => setShowNewForm(true)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                cursor: "pointer",
                border: "1px dashed #ff6a00",
                background: "#fff",
                color: "#ff6a00",
                fontWeight: 600,
              }}
            >
              + Yeni Banner
            </button>
          )}
        </div>

        <ImageEditor key={activeType} type={activeType} label={activeLabel} />
      </div>
    </div>
  );
}

export default BannersPanel;
