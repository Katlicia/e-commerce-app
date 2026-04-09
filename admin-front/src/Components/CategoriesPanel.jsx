import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetCategories,
  adminUpdateCategory,
  adminCreateCategory,
  adminDeleteCategory,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import { FaTrash } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";

function EditModal({ category, categories, onClose }) {
  const dispatch = useDispatch();
  const isNew = !category;
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [parent, setParent] = useState(category?.parent || "");
  const [saving, setSaving] = useState(false);
  const [parentSearch, setParentSearch] = useState(
    categories.find((c) => c._id === category?.parent)?.name || "",
  );
  const [parentOpen, setParentOpen] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await dispatch(
          adminCreateCategory({ name, slug, parent: parent || null }),
        ).unwrap();
        dispatch(addNotification({ message: "Kategori oluşturuldu." }));
      } else {
        await dispatch(
          adminUpdateCategory({
            id: category._id,
            categoryData: { name, slug, parent: parent || null },
          }),
        ).unwrap();
        dispatch(addNotification({ message: "Kategori güncellendi." }));
      }
    } catch {
      dispatch(
        addNotification({
          message: isNew
            ? "Kategori oluşturulamadı."
            : "Kategori güncellenemedi.",
          type: "error",
        }),
      );
    }
    setSaving(false);
    onClose();
  };

  const getDescendantIds = (id) => {
    const result = new Set([id]);
    const queue = [id];
    while (queue.length) {
      const current = queue.shift();
      categories
        .filter((c) => c.parent === current)
        .forEach((c) => {
          result.add(c._id);
          queue.push(c._id);
        });
    }
    return result;
  };
  const excluded = category?._id ? getDescendantIds(category._id) : new Set();
  const parentOptions = categories.filter((c) => !excluded.has(c._id));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "28px",
          width: "380px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{ fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}
        >
          {isNew ? "Yeni Kategori" : "Kategori Düzenle"}
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              fontSize: "12px",
              color: "#999",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Kategori Adı
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              fontSize: "12px",
              color: "#999",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px", position: "relative" }}>
          <label
            style={{
              fontSize: "12px",
              color: "#999",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Üst Kategori
          </label>
          <input
            value={parentSearch}
            onChange={(e) => {
              setParentSearch(e.target.value);
              setParentOpen(true);
            }}
            onFocus={() => setParentOpen(true)}
            onBlur={() => setParentOpen(false)}
            placeholder="Kategori ara..."
            style={{
              width: "100%",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
            }}
          />
          {parentOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                maxHeight: "180px",
                overflowY: "auto",
                zIndex: 10,
              }}
            >
              <div
                onMouseDown={() => {
                  setParent("");
                  setParentSearch("");
                  setParentOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: "#bbb",
                  cursor: "pointer",
                }}
              >
                — Yok —
              </div>
              {parentOptions
                .filter((c) =>
                  c.name.toLowerCase().includes(parentSearch.toLowerCase()),
                )
                .map((c) => (
                  <div
                    key={c._id}
                    onMouseDown={() => {
                      setParent(c._id);
                      setParentSearch(c.name);
                      setParentOpen(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      fontSize: "13px",
                      cursor: "pointer",
                      background: parent === c._id ? "#fff3e0" : "transparent",
                      color: parent === c._id ? "#ff6a00" : "#222",
                    }}
                  >
                    {c.name}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
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
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#ff6a00",
              color: "#fff",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {saving ? "Kaydediliyor..." : isNew ? "Oluştur" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriesPanel() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.admin.categories);
  const loading = useSelector((state) => state.admin.loading);
  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const handleDelete = (category) => {
    setConfirmConfig({
      message: `"${category.name}" kategorisini silmek istediğinize emin misiniz?`,
      onConfirm: () => {
        dispatch(adminDeleteCategory(category._id))
          .unwrap()
          .then(() =>
            dispatch(
              addNotification({
                message: `"${category.name}" silindi.`,
                type: "warning",
              }),
            ),
          )
          .catch(() =>
            dispatch(
              addNotification({
                message: "Kategori silinemedi.",
                type: "error",
              }),
            ),
          );
      },
    });
  };

  useEffect(() => {
    if (categories.length === 0) dispatch(adminGetCategories());
  }, []);

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c._id.toString(), c]),
  );

  const childCount = (id) =>
    categories.filter((c) => c.parent?.toString() === id?.toString()).length;

  const getDescendantIds = (id) => {
    const result = new Set([id]);
    const queue = [id];
    while (queue.length) {
      const current = queue.shift();
      categories
        .filter((c) => c.parent?.toString() === current)
        .forEach((c) => {
          result.add(c._id.toString());
          queue.push(c._id.toString());
        });
    }
    return result;
  };

  const filtered = categories.filter((cat) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q);
    const matchesFilter =
      !filterCategoryId ||
      getDescendantIds(filterCategoryId).has(cat._id.toString());
    return matchesSearch && matchesFilter;
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
      {editingCategory && (
        <EditModal
          category={editingCategory}
          categories={categories}
          onClose={() => setEditingCategory(null)}
        />
      )}
      {creatingCategory && (
        <EditModal
          category={null}
          categories={categories}
          onClose={() => setCreatingCategory(false)}
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
          <span>Kategoriler</span>
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#999" }}>
            {filtered.length} kategori
          </span>
        </div>

        <div
          className="d-flex flex-wrap gap-2 align-items-center"
          style={{ marginBottom: "20px" }}
        >
          <>
            <input
              type="text"
              placeholder="Kategori ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: "180px",
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <div
              style={{
                position: "relative",
                flex: 1,
                minWidth: "180px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                value={filterSearch}
                onChange={(e) => {
                  setFilterSearch(e.target.value);
                  setFilterOpen(true);
                }}
                onFocus={() => setFilterOpen(true)}
                onBlur={() => setFilterOpen(false)}
                placeholder={
                  filterCategoryId
                    ? categories.find((c) => c._id === filterCategoryId)?.name
                    : "Kategori filtrele..."
                }
                style={{
                  width: "100%",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "8px 36px 8px 12px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              {filterCategoryId && (
                <span
                  onClick={() => {
                    setFilterCategoryId("");
                    setFilterSearch("");
                  }}
                  style={{
                    position: "absolute",
                    right: "10px",
                    cursor: "pointer",
                    color: "#bbb",
                    fontSize: "16px",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  ×
                </span>
              )}
              {filterOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 10,
                  }}
                >
                  <div
                    onMouseDown={() => {
                      setFilterCategoryId("");
                      setFilterSearch("");
                      setFilterOpen(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      fontSize: "13px",
                      color: "#bbb",
                      cursor: "pointer",
                    }}
                  >
                    Tüm Kategoriler
                  </div>
                  {categories
                    .filter((c) =>
                      c.name.toLowerCase().includes(filterSearch.toLowerCase()),
                    )
                    .map((c) => (
                      <div
                        key={c._id}
                        onMouseDown={() => {
                          setFilterCategoryId(c._id);
                          setFilterSearch("");
                          setFilterOpen(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          fontSize: "13px",
                          cursor: "pointer",
                          background:
                            filterCategoryId === c._id
                              ? "#fff3e0"
                              : "transparent",
                          color:
                            filterCategoryId === c._id ? "#ff6a00" : "#222",
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
          <button
            className="btn orange-btn"
            onClick={() => setCreatingCategory(true)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            + Yeni Kategori
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
                  <th style={{ padding: "8px 12px" }}>Kategori</th>
                  <th style={{ padding: "8px 12px" }}>Slug</th>
                  <th style={{ padding: "8px 12px" }}>Üst Kategori</th>
                  <th style={{ padding: "8px 12px" }}>Alt Kategori Sayısı</th>
                  <th style={{ padding: "8px 12px" }}>Kayıt Tarihi</th>
                  <th style={{ padding: "8px 12px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category, i) => (
                  <tr
                    key={category._id}
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
                      {category.name}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {category.slug}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {categoryMap[category.parent]?.name ?? <span>—</span>}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {childCount(category._id)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {category.createdAt.slice(0, 10)}
                    </td>
                    <td
                      className="d-flex align-items-center gap-3"
                      style={{ padding: "10px 12px" }}
                    >
                      <button
                        className="btn orange-btn"
                        onClick={() => setEditingCategory(category)}
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
                        style={{ padding: "2px 12px" }}
                        onClick={() => handleDelete(category)}
                      >
                        <FaTrash />
                      </button>
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

export default CategoriesPanel;
