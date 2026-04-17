import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  adminGetHomeLayout,
  adminUpdateHomeLayout,
  adminGetHomeSections,
  adminGetAllAdBanners,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import {
  TbGripVertical,
  TbEye,
  TbEyeOff,
  TbTrash,
  TbPlus,
  TbPencil,
  TbList,
  TbDeviceDesktop,
} from "react-icons/tb";

// Config

const TYPE_META = {
  "featured-shortcuts": { label: "Öne Çıkan Kategoriler", color: "#5eff00" },
  "product-list": { label: "Ürün Listesi", color: "#f97316" },
  "ad-banners": { label: "Reklam Bannerı", color: "#ec4899" },
  "ad-bar": { label: "Reklam Çubuğu", color: "#8b5cf6" },
  "deal-of-day": { label: "Günün Fırsatı", color: "#eab308" },
};

const ADDABLE_TYPES = [
  { type: "product-list", label: "Ürün Listesi", needsKey: true },
  { type: "ad-banners", label: "Reklam Bannerı", needsBannerType: true },
  { type: "ad-bar", label: "Reklam Çubuğu" },
  { type: "deal-of-day", label: "Günün Fırsatı" },
  { type: "featured-shortcuts", label: "Öne Çıkan Kategoriler" },
];

const EDITABLE_TYPES = new Set(["product-list", "ad-banners"]);

// List Editor

function SectionRow({
  section,
  homeSections,
  adBanners,
  onToggle,
  onRemove,
  onEdit,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id });

  const isCategoryRow =
    section.type === "product-list" &&
    section.sectionKey?.startsWith("categoryRow");

  const meta = isCategoryRow
    ? { label: "Kategori Vitrini", color: "#ff0000" }
    : TYPE_META[section.type] || { label: section.type, color: "#999" };

  const getSubLabel = () => {
    if (section.type === "product-list") {
      const sec = homeSections.find((s) => s.key === section.sectionKey);
      return sec?.title || section.sectionKey;
    }
    if (section.type === "ad-banners") {
      const found = adBanners.find((b) => b.type === section.bannerType);
      return found?.label || section.bannerType;
    }
    return null;
  };

  const subLabel = getSubLabel();

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : section.visible ? 1 : 0.5,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: "10px",
      }}
    >
      <span
        {...attributes}
        {...listeners}
        style={{
          color: "#ccc",
          cursor: "grab",
          fontSize: "18px",
          lineHeight: 1,
        }}
      >
        <TbGripVertical />
      </span>

      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: meta.color,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 600, fontSize: "14px" }}>{meta.label}</span>
        {subLabel && (
          <span style={{ fontSize: "12px", color: "#999", marginLeft: "8px" }}>
            {subLabel}
          </span>
        )}
      </div>

      {EDITABLE_TYPES.has(section.type) && (
        <button
          onClick={() => onEdit(section)}
          title="Düzenle"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            color: "#94a3b8",
            padding: "4px",
          }}
        >
          <TbPencil />
        </button>
      )}

      <button
        onClick={() => onToggle(section._id)}
        title={section.visible ? "Gizle" : "Göster"}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          color: section.visible ? "#ff6a00" : "#ccc",
          padding: "4px",
        }}
      >
        {section.visible ? <TbEye /> : <TbEyeOff />}
      </button>

      <button
        onClick={() => onRemove(section._id)}
        title="Kaldır"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          color: "#f87171",
          padding: "4px",
        }}
      >
        <TbTrash />
      </button>
    </div>
  );
}

// Desktop preview skeletons

const sk = {
  box: (w, h, r = 6, extra = {}) => ({
    width: w,
    height: h,
    borderRadius: r,
    background: "#e9ecef",
    flexShrink: 0,
    ...extra,
  }),
};

function SkNavBar() {
  return (
    <div
      style={{
        background: "#1e1e1e",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div
        style={{ width: 90, height: 10, borderRadius: 4, background: "#555" }}
      />
      <div
        style={{ display: "flex", gap: 24, flex: 1, justifyContent: "center" }}
      >
        {[80, 70, 80, 60].map((w, i) => (
          <div
            key={i}
            style={{ width: w, height: 8, borderRadius: 3, background: "#444" }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#444",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SkCarousel() {
  return (
    <div
      style={{
        position: "relative",
        background: "#dde3ea",
        height: 220,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: i === 1 ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === 1 ? "#ff6a00" : "rgba(255,255,255,0.7)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SkAdBar() {
  return (
    <div
      style={{
        background: "#f3e8ff",
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div style={sk.box(200, 10, 4)} />
      <div style={sk.box(80, 10, 4, { background: "#d8b4fe" })} />
    </div>
  );
}

function SkFeaturedShortcuts() {
  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={sk.box(160, 12, 5, { marginBottom: 16 })} />
      <div style={{ display: "flex", gap: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <div style={sk.box(56, 56, 12)} />
            <div style={sk.box(48, 8, 3)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkProductList({ label }) {
  return (
    <div style={{ padding: "20px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div>
          <div style={sk.box(180, 12, 5, { marginBottom: 6 })} />
          {label && <div style={{ fontSize: 11, color: "#aaa" }}>{label}</div>}
        </div>
        <div style={sk.box(80, 12, 4, { background: "#ffe0cc" })} />
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ flexShrink: 0, width: 110 }}>
            <div style={sk.box(110, 110, 8, { marginBottom: 8 })} />
            <div style={sk.box("90%", 9, 3, { marginBottom: 5 })} />
            <div style={sk.box("60%", 9, 3, { marginBottom: 5 })} />
            <div style={sk.box("45%", 9, 3, { background: "#ffe0cc" })} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkAdBanner({ label }) {
  return (
    <div style={{ padding: "12px 24px" }}>
      {label && (
        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>
          {label}
        </div>
      )}
      <div
        style={{
          ...sk.box("100%", 120, 10),
          background: "linear-gradient(135deg,#fde8d8,#fbd0e8)",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          gap: 24,
        }}
      >
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}
        >
          <div style={sk.box("55%", 14, 5)} />
          <div style={sk.box("40%", 10, 4)} />
          <div
            style={sk.box(90, 28, 6, { background: "#ff6a00", marginTop: 4 })}
          />
        </div>
        <div style={sk.box(100, 100, 10)} />
      </div>
    </div>
  );
}

function SkDealOfDay() {
  return (
    <div style={{ padding: "20px 24px", background: "#fffbeb" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={sk.box(200, 14, 5, { background: "#fde047" })} />
        <div style={sk.box(100, 20, 10, { background: "#fde047" })} />
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={sk.box(160, 160, 10)} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingTop: 8,
          }}
        >
          <div style={sk.box("80%", 12, 4)} />
          <div style={sk.box("60%", 10, 4)} />
          <div style={sk.box("40%", 10, 4)} />
          <div
            style={sk.box(120, 36, 8, { background: "#fde047", marginTop: 8 })}
          />
        </div>
      </div>
    </div>
  );
}

function SectionSkeletonContent({ section, homeSections, adBanners }) {
  const isCategoryRow =
    section.type === "product-list" &&
    section.sectionKey?.startsWith("categoryRow");

  switch (section.type) {
    case "ad-bar":
      return <SkAdBar />;
    case "featured-shortcuts":
      return <SkFeaturedShortcuts />;
    case "product-list": {
      const sec = homeSections.find((s) => s.key === section.sectionKey);
      const label = isCategoryRow
        ? "Kategori Vitrini"
        : sec?.title || section.sectionKey;
      return <SkProductList label={label} />;
    }
    case "ad-banners": {
      const found = adBanners.find((b) => b.type === section.bannerType);
      return <SkAdBanner label={found?.label || section.bannerType} />;
    }
    case "deal-of-day":
      return <SkDealOfDay />;
    default:
      return <div style={{ height: 40, background: "#f8f8f8" }} />;
  }
}

function DesktopPreview({ sections, homeSections, adBanners }) {
  const visibleSections = sections.filter((s) => s.visible);

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: "#f1f5f9",
          borderBottom: "1px solid #e2e8f0",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#fca5a5",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#fcd34d",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#86efac",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            color: "#94a3b8",
            border: "1px solid #e2e8f0",
          }}
        >
          www.listensi.com
        </div>
      </div>

      <SkNavBar />
      <SkCarousel />

      {visibleSections.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            color: "#ccc",
            fontSize: 13,
          }}
        >
          Tüm bölümler gizli
        </div>
      ) : (
        visibleSections.map((section) => (
          <div key={section._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
            <SectionSkeletonContent
              section={section}
              homeSections={homeSections}
              adBanners={adBanners}
            />
          </div>
        ))
      )}
    </div>
  );
}

// Add / Edit modal

function AddSectionModal({
  homeSections,
  adBanners,
  onAdd,
  onClose,
  initialSection,
}) {
  const isEdit = !!initialSection;
  const [type, setType] = useState(initialSection?.type || "product-list");
  const [sectionKey, setSectionKey] = useState(
    initialSection?.sectionKey || "",
  );
  const [bannerType, setBannerType] = useState(
    initialSection?.bannerType || "",
  );

  const selected = ADDABLE_TYPES.find((t) => t.type === type);

  const handleSubmit = () => {
    const section = { type, visible: initialSection?.visible ?? true };
    if (selected?.needsKey) {
      if (!sectionKey) return;
      section.sectionKey = sectionKey;
    }
    if (selected?.needsBannerType) {
      if (!bannerType) return;
      section.bannerType = bannerType;
    }
    onAdd(section, initialSection?._id);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "28px",
          width: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontWeight: 700, fontSize: "16px" }}>
          {isEdit ? "Bölümü Düzenle" : "Yeni Bölüm Ekle"}
        </div>

        <div>
          <label
            style={{
              fontSize: "12px",
              color: "#999",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Bölüm Tipi
          </label>
          <select
            value={type}
            disabled={isEdit}
            onChange={(e) => {
              setType(e.target.value);
              setSectionKey("");
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #eee",
              fontSize: "13px",
            }}
          >
            {ADDABLE_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {selected?.needsKey && (
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#999",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Bölüm
            </label>
            <select
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #eee",
                fontSize: "13px",
              }}
            >
              <option value="">— Seç —</option>
              {homeSections.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.title || s.key}
                </option>
              ))}
            </select>
          </div>
        )}

        {selected?.needsBannerType && (
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#999",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Reklam Bannerı
            </label>
            {adBanners.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#f87171", margin: 0 }}>
                Henüz reklam bannerı yok. Önce Banner Yönetimi&apos;nden
                ekleyin.
              </p>
            ) : (
              <select
                value={bannerType}
                onChange={(e) => setBannerType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                  fontSize: "13px",
                }}
              >
                <option value="">— Seç —</option>
                {adBanners.map((b) => (
                  <option key={b.type} value={b.type}>
                    {b.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid #eee",
              background: "#fff",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            className="btn orange-btn"
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {isEdit ? "Güncelle" : "Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main panel

function HomeLayoutPanel() {
  const dispatch = useDispatch();
  const { homeLayout, homeSections, adBanners, loading } = useSelector(
    (state) => state.admin,
  );
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState("edit");

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    dispatch(adminGetHomeLayout());
    dispatch(adminGetHomeSections());
    dispatch(adminGetAllAdBanners());
  }, []);

  useEffect(() => {
    if (homeLayout.length > 0 && !dirty) {
      setSections(homeLayout);
    }
  }, [homeLayout]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s._id === active.id);
      const newIndex = prev.findIndex((s) => s._id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setDirty(true);
  };

  const handleToggle = (id) => {
    setSections((prev) =>
      prev.map((s) => (s._id === id ? { ...s, visible: !s.visible } : s)),
    );
    setDirty(true);
  };

  const handleRemove = (id) => {
    setSections((prev) => prev.filter((s) => s._id !== id));
    setDirty(true);
  };

  const handleAdd = (newSection, editId) => {
    if (editId) {
      setSections((prev) =>
        prev.map((s) => (s._id === editId ? { ...s, ...newSection } : s)),
      );
    } else {
      setSections((prev) => [
        ...prev,
        { ...newSection, _id: `temp-${Date.now()}` },
      ]);
    }
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = sections.map(
      ({ type, visible, sectionKey, bannerType }) => ({
        type,
        visible,
        sectionKey: sectionKey || "",
        bannerType: bannerType || "",
      }),
    );
    const result = await dispatch(adminUpdateHomeLayout(payload));
    setSaving(false);
    if (adminUpdateHomeLayout.fulfilled.match(result)) {
      dispatch(
        addNotification({ message: "Layout güncellendi.", type: "success" }),
      );
      setDirty(false);
    } else {
      dispatch(
        addNotification({ message: "Layout güncellenemedi.", type: "error" }),
      );
    }
  };

  const tabStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    background: active ? "#fff" : "transparent",
    color: active ? "#ff6a00" : "#94a3b8",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
    transition: "all 0.15s",
  });

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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="fw-bold h3 mb-0">Ana Sayfa Düzeni</div>
          <div className="d-flex gap-2">
            {tab === "edit" && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ff6a00",
                  background: "#fff8f4",
                  color: "#ff6a00",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <TbPlus /> Bölüm Ekle
              </button>
            )}
            <button
              className="btn orange-btn"
              onClick={handleSave}
              disabled={saving || !dirty}
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

        {/* Tabs */}
        <div
          style={{
            display: "inline-flex",
            background: "#f1f5f9",
            borderRadius: "10px",
            padding: "3px",
            marginBottom: "20px",
            gap: 2,
          }}
        >
          <button
            style={tabStyle(tab === "edit")}
            onClick={() => setTab("edit")}
          >
            <TbList size={15} /> Düzenle
          </button>
          <button
            style={tabStyle(tab === "preview")}
            onClick={() => setTab("preview")}
          >
            <TbDeviceDesktop size={15} />
            Önizleme
            {dirty && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#f97316",
                  marginLeft: 2,
                  flexShrink: 0,
                }}
              />
            )}
          </button>
        </div>

        {/* Edit tab */}
        {tab === "edit" && (
          <>
            {loading && sections.length === 0 ? (
              <div style={{ color: "#999", fontSize: "14px" }}>
                Yükleniyor...
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {sections.map((section) => (
                      <SectionRow
                        key={section._id}
                        section={section}
                        homeSections={homeSections}
                        adBanners={adBanners}
                        onToggle={handleToggle}
                        onRemove={handleRemove}
                        onEdit={(s) => setEditingSection(s)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            {sections.length === 0 && !loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#ccc",
                  fontSize: 13,
                }}
              >
                Henüz bölüm eklenmedi
              </div>
            )}
          </>
        )}

        {/* Preview tab */}
        {tab === "preview" && (
          <DesktopPreview
            sections={sections}
            homeSections={homeSections}
            adBanners={adBanners}
          />
        )}
      </div>

      {showModal && (
        <AddSectionModal
          homeSections={homeSections}
          adBanners={adBanners}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}

      {editingSection && (
        <AddSectionModal
          homeSections={homeSections}
          adBanners={adBanners}
          onAdd={handleAdd}
          onClose={() => setEditingSection(null)}
          initialSection={editingSection}
        />
      )}
    </div>
  );
}

export default HomeLayoutPanel;
