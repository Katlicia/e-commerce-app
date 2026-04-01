import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../redux/adminSlice";
import "../styles/AdminPage.css";

const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.admin);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParent, setEditParent] = useState("");
  const [editSubs, setEditSubs] = useState([]);

  useEffect(() => {
    dispatch(adminGetCategories());
  }, []);

  const formik = useFormik({
    initialValues: { name: "", slug: "", parent: "" },
    validate: (values) => {
      const errors = {};
      if (!values.name) errors.name = "Kategori adı zorunludur";
      if (!values.slug) errors.slug = "Slug zorunludur";
      return errors;
    },
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        name: values.name,
        slug: values.slug,
        ...(values.parent && { parent: values.parent }),
      };
      dispatch(adminCreateCategory(payload));
      resetForm();
    },
  });

  const handleNameChange = (e) => {
    formik.setFieldValue("name", e.target.value);
    formik.setFieldValue("slug", toSlug(e.target.value));
  };

  const handleDelete = (id, name) => {
    if (
      !window.confirm(
        `"${name}" kategorisini ve alt kategorilerini silmek istediğinize emin misiniz?`,
      )
    )
      return;
    dispatch(adminDeleteCategory(id));
    if (editingCategory?._id === id) setEditingCategory(null);
  };

  const handleEditClick = (cat) => {
    if (editingCategory?._id === cat._id) {
      setEditingCategory(null);
      return;
    }
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    const parentCat = categories.find((c) => c._id === cat.parent?.toString());
    setEditParent(parentCat?.slug || "");
    const subs = categories
      .filter((c) => c.parent?.toString() === cat._id)
      .map((s) => ({ _id: s._id, name: s.name, slug: s.slug }));
    setEditSubs(subs);
  };

  const handleEditNameChange = (e) => {
    setEditName(e.target.value);
    setEditSlug(toSlug(e.target.value));
  };

  const handleSubNameChange = (index, value) => {
    setEditSubs((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, name: value, slug: toSlug(value) } : s,
      ),
    );
  };

  const handleSubSlugChange = (index, value) => {
    setEditSubs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, slug: value } : s)),
    );
  };

  const handleAddSub = () => {
    setEditSubs((prev) => [...prev, { name: "", slug: "" }]);
  };

  const handleRemoveSub = (index) => {
    setEditSubs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditSave = async () => {
    if (!editName || !editSlug) return;
    await dispatch(
      adminUpdateCategory({
        id: editingCategory._id,
        categoryData: {
          name: editName,
          slug: editSlug,
          parent: editParent || "",
          subcategories: editSubs,
        },
      }),
    );
    setEditingCategory(null);
  };

  const getParentName = (parentId) => {
    if (!parentId) return "-";
    const parent = categories.find((c) => c._id === parentId?.toString());
    return parent ? parent.name : "-";
  };

  return (
    <div className="admin-page">
      <div className="container">
        <h4 className="fw-bold mb-4">Kategori Yönetimi</h4>

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            {editingCategory ? (
              <div className="admin-form-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Kategori Düzenle</h6>
                  <button
                    className="btn btn-danger"
                    onClick={() => setEditingCategory(null)}
                  >
                    İptal
                  </button>
                </div>

                <div className="mb-3">
                  <label className="admin-form-label">Kategori Adı</label>
                  <input
                    className="form-control"
                    value={editName}
                    onChange={handleEditNameChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="admin-form-label">Slug</label>
                  <input
                    className="form-control"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="admin-form-label">
                    Üst Kategori (opsiyonel)
                  </label>
                  <select
                    className="form-select"
                    value={editParent}
                    onChange={(e) => setEditParent(e.target.value)}
                  >
                    <option value="">Ana kategori</option>
                    {categories
                      .filter((c) => c._id !== editingCategory._id)
                      .map((cat) => (
                        <option key={cat._id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="admin-form-label mb-0">
                      Alt Kategoriler
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleAddSub}
                    >
                      + Ekle
                    </button>
                  </div>
                  {editSubs.length === 0 && (
                    <p
                      className="text-muted mb-0"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Alt kategori yok.
                    </p>
                  )}
                  {editSubs.map((sub, index) => (
                    <div key={index} className="border rounded p-2 mb-2">
                      <div className="mb-1">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Adı"
                          value={sub.name}
                          onChange={(e) =>
                            handleSubNameChange(index, e.target.value)
                          }
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Slug"
                          value={sub.slug}
                          onChange={(e) =>
                            handleSubSlugChange(index, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveSub(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-primary w-100 rounded py-2 fw-semibold"
                  onClick={handleEditSave}
                >
                  Kaydet
                </button>
              </div>
            ) : (
              <div className="admin-form-card">
                <h6 className="fw-bold mb-3">Yeni Kategori Ekle</h6>
                <form onSubmit={formik.handleSubmit}>
                  <div className="mb-3">
                    <label className="admin-form-label">Kategori Adı</label>
                    <input
                      className="form-control"
                      name="name"
                      value={formik.values.name}
                      onChange={handleNameChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p
                        className="text-danger mb-0 mt-1"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {formik.errors.name}
                      </p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="admin-form-label">Slug</label>
                    <input
                      className="form-control"
                      name="slug"
                      value={formik.values.slug}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.slug && formik.errors.slug && (
                      <p
                        className="text-danger mb-0 mt-1"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {formik.errors.slug}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="admin-form-label">
                      Üst Kategori (opsiyonel)
                    </label>
                    <select
                      className="form-select"
                      name="parent"
                      value={formik.values.parent}
                      onChange={formik.handleChange}
                    >
                      <option value="">Ana kategori</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100 rounded py-2 fw-semibold"
                  >
                    Kategori Ekle
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="col-12 col-lg-8">
            {loading ? (
              <p className="text-muted">Yükleniyor...</p>
            ) : (
              <div className="table-responsive">
                <table className="table admin-table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Kategori Adı</th>
                      <th>Slug</th>
                      <th>Üst Kategori</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr
                        key={cat._id}
                        className={
                          editingCategory?._id === cat._id
                            ? "table-warning"
                            : ""
                        }
                      >
                        <td className="fw-semibold">{cat.name}</td>
                        <td className="text-muted">{cat.slug}</td>
                        <td>{getParentName(cat.parent)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleEditClick(cat)}
                            >
                              Düzenle
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDelete(cat._id, cat.name)}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">
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
      </div>
    </div>
  );
}

export default AdminCategoriesPage;
