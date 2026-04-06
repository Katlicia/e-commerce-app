import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetHomeSections,
  adminUpdateHomeSection,
  adminGetCategories,
  adminGetBrands,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import CategorySelect from "./CategorySelect";
import "../styles/AdminPage.css";

const sideToSelectValue = (side) => {
  if (!side?.filterValue) return "";
  if (side.filterType === "brand") return "brand:" + side.filterValue;
  return "cat:" + side.filterValue;
};

const selectValueToFilter = (val) => {
  if (!val) return { filterType: "category", filterValue: "" };
  if (val.startsWith("brand:")) return { filterType: "brand", filterValue: val.slice(6) };
  return { filterType: "category", filterValue: val.slice(4) };
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
    const payload = {
      title,
      badge,
      showTimer,
      timerStart: showTimer && timerStart ? timerStart : null,
      timerEnd: showTimer && timerEnd ? timerEnd : null,
      keepBanner,
      newBanner: newBanner || null,
    };
    const result = await dispatch(
      adminUpdateHomeSection({ key: section.key, sectionData: payload }),
    );
    setSaving(false);
    if (adminUpdateHomeSection.fulfilled.match(result)) {
      dispatch(
        addNotification({ message: "Bölüm güncellendi", type: "success" }),
      );
      onSaved(result.payload);
    } else {
      dispatch(
        addNotification({ message: "Bölüm güncellenemedi", type: "error" }),
      );
    }
  };

  return (
    <div className="card mb-4 p-4">
      <div className="mb-3">
        <label className="form-label">Başlık</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bölüm başlığı"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Rozet (Badge)</label>
        <select
          className="form-select"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
        >
          {BADGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id={`timer-${section.key}`}
          checked={showTimer}
          onChange={(e) => setShowTimer(e.target.checked)}
        />
        <label className="form-check-label" htmlFor={`timer-${section.key}`}>
          Zamanlayıcı Göster
        </label>
      </div>
      {showTimer && (
        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label">Başlangıç</label>
            <input
              type="datetime-local"
              className="form-control"
              value={timerStart}
              onChange={(e) => setTimerStart(e.target.value)}
            />
          </div>
          <div className="col-6">
            <label className="form-label">Bitiş</label>
            <input
              type="datetime-local"
              className="form-control"
              value={timerEnd}
              onChange={(e) => setTimerEnd(e.target.value)}
            />
          </div>
        </div>
      )}
      <div className="mb-3">
        <label className="form-label">Banner Görseli</label>
        {bannerPreview ? (
          <div className="d-flex align-items-start gap-3 mb-2">
            <img
              src={bannerPreview}
              alt="banner"
              style={{ height: 80, objectFit: "cover", borderRadius: 4 }}
            />
            <button className="btn btn-sm btn-danger" onClick={removeBanner}>
              Kaldır
            </button>
          </div>
        ) : (
          <p className="text-muted small">Banner yok</p>
        )}
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleBannerChange}
        />
      </div>
      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );
}

function CategoryRowSideEditor({ label, side, onChange, categories, brands }) {
  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await toBase64(file);
    onChange({ ...side, newBanner: b64, keepBanner: false, bannerPreview: b64 });
  };

  const removeBanner = () => {
    onChange({ ...side, newBanner: null, keepBanner: false, bannerPreview: null });
  };

  const bannerPreview = side.bannerPreview ?? side.banner?.url ?? null;

  const handleFilterChange = (val) => {
    const { filterType, filterValue } = selectValueToFilter(val);
    onChange({ ...side, filterType, filterValue });
  };

  return (
    <div className="border rounded p-3 mb-3">
      <h6 className="fw-semibold mb-3">{label}</h6>
      <div className="mb-2">
        <label className="form-label">Başlık</label>
        <input
          className="form-control"
          value={side.title || ""}
          onChange={(e) => onChange({ ...side, title: e.target.value })}
          placeholder="Bölüm başlığı"
        />
      </div>
      <div className="mb-2">
        <label className="form-label">Kategori / Marka</label>
        <CategorySelect
          categories={categories}
          brands={brands}
          value={sideToSelectValue(side)}
          onChange={handleFilterChange}
        />
      </div>
      <div className="mb-2">
        <label className="form-label">Banner Görseli (opsiyonel)</label>
        {bannerPreview ? (
          <div className="d-flex align-items-start gap-3 mb-2">
            <img
              src={bannerPreview}
              alt="banner"
              style={{ height: 80, objectFit: "cover", borderRadius: 4 }}
            />
            <button className="btn btn-sm btn-danger" onClick={removeBanner}>
              Kaldır
            </button>
          </div>
        ) : (
          <p className="text-muted small">Banner yok</p>
        )}
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleBannerChange}
        />
      </div>
    </div>
  );
}

function CategoryRowSectionEditor({ section, onSaved, categories, brands }) {
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
    const payload = {
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
    };
    const result = await dispatch(
      adminUpdateHomeSection({ key: section.key, sectionData: payload }),
    );
    setSaving(false);
    if (adminUpdateHomeSection.fulfilled.match(result)) {
      dispatch(addNotification({ message: "Bölüm güncellendi", type: "success" }));
      onSaved(result.payload);
    } else {
      dispatch(addNotification({ message: "Bölüm güncellenemedi", type: "error" }));
    }
  };

  return (
    <div className="card mb-4 p-4">
      <div className="mb-3">
        <label className="form-label">Başlık</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bölüm başlığı"
        />
      </div>
      <div className="row">
        <div className="col-12 col-md-6">
          <CategoryRowSideEditor label="Sol Taraf" side={left} onChange={setLeft} categories={categories} brands={brands} />
        </div>
        <div className="col-12 col-md-6">
          <CategoryRowSideEditor label="Sağ Taraf" side={right} onChange={setRight} categories={categories} brands={brands} />
        </div>
      </div>
      <button className="btn btn-primary mt-2" onClick={handleSave} disabled={saving}>
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );
}

function AdminHomeSectionsPage() {
  const dispatch = useDispatch();
  const { homeSections, categories, brands, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(adminGetHomeSections());
    dispatch(adminGetCategories());
    dispatch(adminGetBrands());
  }, []);

  const handleSaved = () => {};

  return (
    <div className="container my-5">
      <h3 className="mb-4 orange-text">Anasayfa Bölümleri</h3>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        homeSections.map((section) =>
          section.key.startsWith("categoryRow") ? (
            <CategoryRowSectionEditor
              key={section.key}
              section={section}
              onSaved={handleSaved}
              categories={categories}
              brands={brands}
            />
          ) : (
            <SectionEditor
              key={section.key}
              section={section}
              onSaved={handleSaved}
            />
          )
        )
      )}
    </div>
  );
}

export default AdminHomeSectionsPage;
