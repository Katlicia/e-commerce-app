import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetHomeSections,
  adminCreateHomeSection,
  adminDeleteHomeSection,
  adminUpdateHomeSection,
  adminGetCategories,
  adminGetBrands,
  adminGetHomeLayout,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import CategorySelect from "./CategorySelect";

const SECTION_LABELS = {
  deals: "Kaçırılmayacak Fırsatlar",
  new: "Yeni Gelenler",
  featured: "En Çok Satanlar",
  recent: "Son Gezdiğin Ürünler",
  "categoryRow-1": "Kategori Vitrini",
};

const BADGE_OPTIONS = [
  { value: "", label: "— Yok —" },
  { value: "indirimli", label: "İndirimli" },
  { value: "yeni", label: "Yeni" },
  { value: "en-cok-satan", label: "En Çok Satan" },
  { value: "gunun-firsati", label: "Günün Fırsatı" },
];

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

function toLocalDatetimeValue(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const sideToSelectValue = (side) => {
  if (!side?.filterValue) return "";
  if (side.filterType === "brand") return "brand:" + side.filterValue;
  return "cat:" + side.filterValue;
};

const selectValueToFilter = (val) => {
  if (!val) return { filterType: "category", filterValue: "" };
  if (val.startsWith("brand:"))
    return { filterType: "brand", filterValue: val.slice(6) };
  return { filterType: "category", filterValue: val.slice(4) };
};

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

function BannerField({ preview, onChange, onRemove }) {
  return (
    <div>
      <label style={labelStyle}>Banner Görseli (opsiyonel)</label>
      {preview ? (
        <div className="d-flex align-items-center gap-3 mb-2">
          <img
            src={preview}
            alt="banner"
            style={{
              height: 64,
              objectFit: "cover",
              borderRadius: 6,
              border: "1px solid #eee",
            }}
          />
          <button
            type="button"
            onClick={onRemove}
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
          Banner yok
        </p>
      )}
      <label
        style={{
          display: "inline-block",
          padding: "8px 4px",
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
          type="file"
          accept="image/*"
          onChange={onChange}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}

function SectionEditor({ section, onSaved }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(section.title || "");
  const [badge, setBadge] = useState(section.badge || "");
  const [showTimer, setShowTimer] = useState(section.showTimer || false);
  const [timerStart, setTimerStart] = useState(
    toLocalDatetimeValue(section.timerStart),
  );
  const [timerEnd, setTimerEnd] = useState(
    toLocalDatetimeValue(section.timerEnd),
  );
  const [bannerPreview, setBannerPreview] = useState(
    section.banner?.url || null,
  );
  const [newBanner, setNewBanner] = useState(null);
  const [keepBanner, setKeepBanner] = useState(!!section.banner?.url);
  const [saving, setSaving] = useState(false);

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setNewBanner(b64);
    setBannerPreview(b64);
    setKeepBanner(false);
  };

  const removeBanner = () => {
    setNewBanner(null);
    setBannerPreview(null);
    setKeepBanner(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await dispatch(
      adminUpdateHomeSection({
        key: section.key,
        sectionData: {
          title,
          badge,
          showTimer,
          timerStart: showTimer && timerStart ? timerStart : null,
          timerEnd: showTimer && timerEnd ? timerEnd : null,
          keepBanner,
          newBanner: newBanner || null,
        },
      }),
    );
    setSaving(false);
    if (adminUpdateHomeSection.fulfilled.match(result)) {
      dispatch(
        addNotification({ message: "Bölüm güncellendi.", type: "success" }),
      );
      onSaved();
    } else {
      dispatch(
        addNotification({ message: "Bölüm güncellenemedi.", type: "error" }),
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="d-flex gap-3 flex-wrap">
        <div style={{ flex: "2 1 200px" }}>
          <label style={labelStyle}>Başlık</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bölüm başlığı"
          />
        </div>
        <div style={{ flex: "1 1 150px" }}>
          <label style={labelStyle}>Rozet</label>
          <select
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            style={inputStyle}
          >
            {BADGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label
        style={{
          ...labelStyle,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={showTimer}
          onChange={(e) => setShowTimer(e.target.checked)}
        />
        Geri sayım sayacı göster
      </label>

      {showTimer && (
        <div className="d-flex gap-3 flex-wrap">
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Başlangıç</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={timerStart}
              onChange={(e) => setTimerStart(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Bitiş</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={timerEnd}
              onChange={(e) => setTimerEnd(e.target.value)}
            />
          </div>
        </div>
      )}

      <BannerField
        preview={bannerPreview}
        onChange={handleBannerChange}
        onRemove={removeBanner}
      />

      <div>
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
    </div>
  );
}

function SideEditor({ label, side, setSide, categories, brands }) {
  const makeBannerHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setSide({ ...side, newBanner: b64, keepBanner: false, bannerPreview: b64 });
  };

  const removeBanner = () => {
    setSide({
      ...side,
      newBanner: null,
      keepBanner: false,
      bannerPreview: null,
    });
  };

  return (
    <div
      style={{
        flex: "1 1 220px",
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: "13px", color: "#555" }}>
        {label}
      </div>
      <div>
        <label style={labelStyle}>Başlık</label>
        <input
          style={inputStyle}
          value={side.title || ""}
          onChange={(e) => setSide({ ...side, title: e.target.value })}
          placeholder="Bölüm başlığı"
        />
      </div>
      <div>
        <label style={labelStyle}>Kategori / Marka</label>
        <CategorySelect
          categories={categories}
          brands={brands}
          value={sideToSelectValue(side)}
          onChange={(val) => setSide({ ...side, ...selectValueToFilter(val) })}
        />
      </div>
      <BannerField
        preview={side.bannerPreview ?? side.banner?.url ?? null}
        onChange={makeBannerHandler}
        onRemove={removeBanner}
      />
    </div>
  );
}

function CategoryRowEditor({ section, onSaved, categories, brands }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(section.title || "");
  const [left, setLeft] = useState({
    ...section.left,
    keepBanner: !!section.left?.banner?.url,
    bannerPreview: section.left?.banner?.url || null,
  });
  const [right, setRight] = useState({
    ...section.right,
    keepBanner: !!section.right?.banner?.url,
    bannerPreview: section.right?.banner?.url || null,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await dispatch(
      adminUpdateHomeSection({
        key: section.key,
        sectionData: {
          title,
          left: {
            title: left.title,
            filterType: left.filterType,
            filterValue: left.filterValue,
            keepBanner: left.keepBanner,
            newBanner: left.newBanner || null,
          },
          right: {
            title: right.title,
            filterType: right.filterType,
            filterValue: right.filterValue,
            keepBanner: right.keepBanner,
            newBanner: right.newBanner || null,
          },
        },
      }),
    );
    setSaving(false);
    if (adminUpdateHomeSection.fulfilled.match(result)) {
      dispatch(
        addNotification({ message: "Bölüm güncellendi.", type: "success" }),
      );
      onSaved();
    } else {
      dispatch(
        addNotification({ message: "Bölüm güncellenemedi.", type: "error" }),
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label style={labelStyle}>Başlık</label>
        <input
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bölüm başlığı"
        />
      </div>
      <div className="d-flex gap-3 flex-wrap">
        <SideEditor
          label="Sol Taraf"
          side={left}
          setSide={setLeft}
          categories={categories}
          brands={brands}
        />
        <SideEditor
          label="Sağ Taraf"
          side={right}
          setSide={setRight}
          categories={categories}
          brands={brands}
        />
      </div>
      <div>
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
    </div>
  );
}

function ProductListsPanel() {
  const dispatch = useDispatch();
  const { homeSections, categories, brands, loading } = useSelector(
    (state) => state.admin,
  );
  const [openKey, setOpenKey] = useState(null);
  const [showNewForm, setShowNewForm] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);

  const PROTECTED_KEYS = new Set(["deals", "new", "featured", "recent"]);

  const handleDelete = (e, key) => {
    e.stopPropagation();
    setDeletingKey(key);
    dispatch(adminDeleteHomeSection(key))
      .unwrap()
      .then(() => {
        dispatch(addNotification({ message: "Liste silindi." }));
        dispatch(adminGetHomeLayout());
        if (openKey === key) setOpenKey(null);
      })
      .catch(() =>
        dispatch(
          addNotification({ message: "Liste silinemedi.", type: "error" }),
        ),
      )
      .finally(() => setDeletingKey(null));
  };

  useEffect(() => {
    dispatch(adminGetHomeSections());
    dispatch(adminGetCategories());
    dispatch(adminGetBrands());
  }, []);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const type = showNewForm === "vitrin" ? "category-row" : "product-list";
    dispatch(adminCreateHomeSection({ title: newTitle.trim(), type }))
      .unwrap()
      .then((section) => {
        dispatch(addNotification({ message: "Liste oluşturuldu." }));
        setNewTitle("");
        setShowNewForm(null);
        setOpenKey(section.key);
      })
      .catch((err) =>
        dispatch(
          addNotification({
            message: err?.message || "Liste oluşturulamadı.",
            type: "error",
          }),
        ),
      )
      .finally(() => setCreating(false));
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="fw-bold h3 mb-0">Ürün Listeleri</div>
          {showNewForm ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setShowNewForm(null);
                    setNewTitle("");
                  }
                }}
                placeholder={
                  showNewForm === "vitrin" ? "Vitrin adı" : "Liste adı"
                }
                style={{ ...inputStyle, width: 200 }}
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newTitle.trim()}
                className="btn orange-btn"
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                }}
              >
                {creating ? "..." : "Oluştur"}
              </button>
              <button
                onClick={() => {
                  setShowNewForm(null);
                  setNewTitle("");
                }}
                style={{
                  padding: "8px 12px",
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
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowNewForm("list")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "1px solid #ff6a00",
                  background: "#fff8f4",
                  color: "#ff6a00",
                  cursor: "pointer",
                }}
              >
                + Yeni Liste
              </button>
              <button
                onClick={() => setShowNewForm("vitrin")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "1px solid #6366f1",
                  background: "#f5f3ff",
                  color: "#6366f1",
                  cursor: "pointer",
                }}
              >
                + Yeni Vitrin
              </button>
            </div>
          )}
        </div>

        {loading && homeSections.length === 0 ? (
          <div style={{ color: "#999", fontSize: "14px" }}>Yükleniyor...</div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {homeSections.map((section) => {
              const label =
                SECTION_LABELS[section.key] || section.title || section.key;
              const isOpen = openKey === section.key;
              const isCategoryRow = section.key.startsWith("categoryRow");

              return (
                <div
                  key={section.key}
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{
                      padding: "14px 18px",
                      cursor: "pointer",
                      background: isOpen ? "#fff8f4" : "#fff",
                    }}
                    onClick={() => setOpenKey(isOpen ? null : section.key)}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>
                        {label}
                      </span>
                      {section.title && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#999",
                            marginLeft: "10px",
                          }}
                        >
                          "{section.title}"
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {!PROTECTED_KEYS.has(section.key) && (
                        <button
                          onClick={(e) => handleDelete(e, section.key)}
                          disabled={deletingKey === section.key}
                          title="Sil"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px",
                            color: "#f87171",
                            padding: "2px 4px",
                            lineHeight: 1,
                          }}
                        >
                          {deletingKey === section.key ? "..." : "×"}
                        </button>
                      )}
                      <span
                        style={{
                          fontSize: "20px",
                          color: "#ff6a00",
                          lineHeight: 1,
                        }}
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      style={{
                        padding: "20px 18px",
                        borderTop: "1px solid #f0f0f0",
                        background: "#fafafa",
                      }}
                    >
                      {isCategoryRow ? (
                        <CategoryRowEditor
                          section={section}
                          onSaved={() => setOpenKey(null)}
                          categories={categories}
                          brands={brands}
                        />
                      ) : (
                        <SectionEditor
                          section={section}
                          onSaved={() => setOpenKey(null)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductListsPanel;
