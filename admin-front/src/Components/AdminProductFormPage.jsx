import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { getProductDetail } from "../redux/productSlice";
import {
  adminGetCategories,
  adminCreateProduct,
  adminUpdateProduct,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import "../styles/AdminPage.css";

const BADGES = [
  { value: "", label: "Rozet yok" },
  { value: "yeni", label: "Yeni" },
  { value: "gunun-firsati", label: "Günün Fırsatı" },
  { value: "en-cok-satan", label: "En Çok Satan" },
  { value: "indirimli", label: "İndirimli" },
];

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories } = useSelector((state) => state.admin);
  const { product } = useSelector((state) => state.product);

  const [features, setFeatures] = useState([""]);
  const [imageList, setImageList] = useState([]);
  const [descImageList, setDescImageList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    dispatch(adminGetCategories());
    if (isEdit) dispatch(getProductDetail(id));
  }, [id]);

  useEffect(() => {
    if (isEdit && product?._id === id) {
      formik.setValues({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        price: product.price || "",
        discountPercent: product.discountPercent || "",
        stock: product.stock || "",
        badge: product.badge || "",
        newUntil: product.newUntil
          ? new Date(product.newUntil).toISOString().split("T")[0]
          : "",
        category: product.category?._id || product.category || "",
      });
      setFeatures(
        Array.isArray(product.features) && product.features.length > 0
          ? product.features
          : [""],
      );
      setImageList(
        (product.images || []).map((img) => ({ type: "existing", ...img })),
      );
      setDescImageList(
        (product.descriptionImages || []).map((img) => ({ type: "existing", ...img })),
      );
    }
  }, [product]);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      brand: "",
      price: "",
      discountPercent: "",
      stock: "",
      badge: "",
      newUntil: "",
      category: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.name) errors.name = "Ürün adı zorunludur";
      if (!values.description) errors.description = "Açıklama zorunludur";
      if (!values.brand) errors.brand = "Marka zorunludur";
      if (!values.price || isNaN(values.price))
        errors.price = "Geçerli bir fiyat giriniz";
      if (!values.stock || isNaN(values.stock))
        errors.stock = "Geçerli bir stok giriniz";
      if (!values.category) errors.category = "Kategori seçiniz";
      if (imageList.length === 0) errors.images = "En az 1 görsel ekleyiniz";
      return errors;
    },
    onSubmit: async (values) => {
      setSubmitting(true);

      const newFiles = imageList
        .filter((i) => i.type === "new")
        .map((i) => i.file);
      const base64New = await Promise.all(newFiles.map(toBase64));

      const newDescFiles = descImageList
        .filter((i) => i.type === "new")
        .map((i) => i.file);
      const base64NewDesc = await Promise.all(newDescFiles.map(toBase64));

      const basePayload = {
        name: values.name,
        description: values.description,
        brand: values.brand,
        price: Number(values.price),
        stock: Number(values.stock),
        category: values.category,
        features: features.filter((d) => d.trim()),
        badge: values.badge || "",
        discountPercent: values.discountPercent
          ? Number(values.discountPercent)
          : 0,
        ...(values.badge === "yeni" && values.newUntil
          ? { newUntil: values.newUntil }
          : {}),
      };

      let payload;
      if (isEdit) {
        const keepImages = imageList
          .filter((i) => i.type === "existing")
          .map(({ public_id, url }) => ({ public_id, url }));
        const keepDescriptionImages = descImageList
          .filter((i) => i.type === "existing")
          .map(({ public_id, url }) => ({ public_id, url }));
        payload = {
          ...basePayload,
          keepImages,
          newImages: base64New,
          keepDescriptionImages,
          newDescriptionImages: base64NewDesc,
        };
      } else {
        payload = { ...basePayload, images: base64New, descriptionImages: base64NewDesc };
      }

      try {
        if (isEdit) {
          await dispatch(
            adminUpdateProduct({ id, productData: payload }),
          ).unwrap();
          dispatch(addNotification({ message: "Ürün güncellendi." }));
        } else {
          await dispatch(adminCreateProduct(payload)).unwrap();
          dispatch(addNotification({ message: "Ürün eklendi." }));
        }
      } catch {
        dispatch(
          addNotification({
            message: isEdit ? "Ürün güncellenemedi." : "Ürün eklenemedi.",
            type: "error",
          }),
        );
      }

      setSubmitting(false);
    },
  });

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

  const moveImage = (idx, dir) => {
    setImageList((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleAddDescImages = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      type: "new",
      file,
      preview: URL.createObjectURL(file),
    }));
    setDescImageList((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeDescImage = (idx) => {
    setDescImageList((prev) => {
      const item = prev[idx];
      if (item.type === "new") URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const moveDescImage = (idx, dir) => {
    setDescImageList((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const addDescription = () => setFeatures((prev) => [...prev, ""]);

  const removeDescription = (idx) =>
    setFeatures((prev) => prev.filter((_, i) => i !== idx));

  const updateDescription = (idx, value) =>
    setFeatures((prev) => prev.map((d, i) => (i === idx ? value : d)));

  return (
    <div className="admin-page">
      <div className="container">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => navigate("/admin/products")}
          >
            ← Geri
          </button>
          <h4 className="fw-bold mb-0">
            {isEdit ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
          </h4>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div className="admin-form-card mb-4">
                <h6 className="fw-bold mb-3">Temel Bilgiler</h6>
                {isEdit && product?.code && (
                  <div className="mb-3">
                    <label className="admin-form-label">Ürün Kodu</label>
                    <input
                      className="form-control"
                      value={product.code}
                      disabled
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="admin-form-label">Ürün Adı</label>
                  <input
                    className="form-control"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
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
                  <label className="admin-form-label">Açıklama</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p
                      className="text-danger mb-0 mt-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {formik.errors.description}
                    </p>
                  )}
                </div>
                <div className="mb-3">
                  <label className="admin-form-label">Marka</label>
                  <input
                    className="form-control"
                    name="brand"
                    value={formik.values.brand}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.brand && formik.errors.brand && (
                    <p
                      className="text-danger mb-0 mt-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {formik.errors.brand}
                    </p>
                  )}
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="admin-form-label">Fiyat (₺)</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.price && formik.errors.price && (
                      <p
                        className="text-danger mb-0 mt-1"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {formik.errors.price}
                      </p>
                    )}
                  </div>
                  <div className="col-6">
                    <label className="admin-form-label">İndirim (%)</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      max="100"
                      name="discountPercent"
                      value={formik.values.discountPercent}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  <div className="col-6">
                    <label className="admin-form-label">Stok</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      name="stock"
                      value={formik.values.stock}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.stock && formik.errors.stock && (
                      <p
                        className="text-danger mb-0 mt-1"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {formik.errors.stock}
                      </p>
                    )}
                  </div>
                  <div className="col-6">
                    <label className="admin-form-label">Rozet</label>
                    <select
                      className="form-select"
                      name="badge"
                      value={formik.values.badge}
                      onChange={(e) => {
                        const val = e.target.value;
                        formik.setFieldValue("badge", val);
                        if (val === "yeni" && !formik.values.newUntil) {
                          const d = new Date();
                          d.setDate(d.getDate() + 30);
                          formik.setFieldValue("newUntil", d.toISOString().split("T")[0]);
                        }
                      }}
                    >
                      {BADGES.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formik.values.badge === "yeni" && (
                    <div className="col-6">
                      <label className="admin-form-label">Yeni Rozet Son Tarihi</label>
                      <input
                        className="form-control"
                        type="date"
                        name="newUntil"
                        value={formik.values.newUntil}
                        onChange={formik.handleChange}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-card mb-4">
                <h6 className="fw-bold mb-3">Özellikler</h6>
                <div className="d-flex flex-column gap-2">
                  {features.map((desc, idx) => (
                    <div key={idx} className="admin-desc-item">
                      <input
                        className="form-control"
                        placeholder={`Özellik ${idx + 1}`}
                        value={desc}
                        onChange={(e) => updateDescription(idx, e.target.value)}
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeDescription(idx)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary mt-2"
                  onClick={addDescription}
                >
                  + Özellik Ekle
                </button>
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

                {imageList.length > 0 && (
                  <div className="admin-img-grid mb-3">
                    {imageList.map((item, idx) => (
                      <div
                        key={idx}
                        className={`admin-img-card${item.type === "new" ? " is-new" : ""}`}
                      >
                        {item.type === "new" && (
                          <span className="admin-img-new-badge">Yeni</span>
                        )}
                        {idx === 0 && (
                          <span className="admin-img-main-badge">Kapak</span>
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
                    ))}
                  </div>
                )}

                <label className="admin-img-add-btn">
                  + Görsel Ekle
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAddImages}
                  />
                </label>

                {formik.submitCount > 0 && formik.errors.images && (
                  <p
                    className="text-danger mb-0 mt-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {formik.errors.images}
                  </p>
                )}
              </div>

              <div className="admin-form-card mt-4">
                <h6 className="fw-bold mb-3">
                  Açıklama Görselleri
                  <span
                    className="text-muted fw-normal ms-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    ({descImageList.length} görsel)
                  </span>
                </h6>

                {descImageList.length > 0 && (
                  <div className="admin-img-grid mb-3">
                    {descImageList.map((item, idx) => (
                      <div
                        key={idx}
                        className={`admin-img-card${item.type === "new" ? " is-new" : ""}`}
                      >
                        {item.type === "new" && (
                          <span className="admin-img-new-badge">Yeni</span>
                        )}
                        <img
                          src={item.type === "existing" ? item.url : item.preview}
                          alt=""
                        />
                        <div className="admin-img-card-actions">
                          <button
                            type="button"
                            title="Sola taşı"
                            disabled={idx === 0}
                            onClick={() => moveDescImage(idx, -1)}
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            className="delete-btn"
                            title="Sil"
                            onClick={() => removeDescImage(idx)}
                          >
                            ×
                          </button>
                          <button
                            type="button"
                            title="Sağa taşı"
                            disabled={idx === descImageList.length - 1}
                            onClick={() => moveDescImage(idx, 1)}
                          >
                            →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <label className="admin-img-add-btn">
                  + Görsel Ekle
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAddDescImages}
                  />
                </label>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="admin-form-card">
                <h6 className="fw-bold mb-3">Kategori</h6>
                {formik.values.category && (
                  <p className="mb-2" style={{ fontSize: "0.85rem" }}>
                    <span className="text-muted">Seçili: </span>
                    <span className="fw-semibold">
                      {categories.find((c) => c._id === formik.values.category)?.name || "—"}
                    </span>
                  </p>
                )}
                <input
                  type="text"
                  className="form-control form-control-sm mb-2"
                  placeholder="Kategori ara..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
                <div
                  style={{
                    maxHeight: 220,
                    overflowY: "auto",
                    border: "1px solid #dee2e6",
                    borderRadius: 6,
                  }}
                >
                  {categories
                    .filter((cat) =>
                      cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
                    )
                    .map((cat) => (
                      <div
                        key={cat._id}
                        onClick={() => {
                          formik.setFieldValue("category", cat._id);
                          formik.setFieldTouched("category", true);
                        }}
                        style={{
                          padding: "7px 12px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          backgroundColor:
                            formik.values.category === cat._id
                              ? "#fff3e0"
                              : "transparent",
                          borderLeft:
                            formik.values.category === cat._id
                              ? "3px solid #f97316"
                              : "3px solid transparent",
                        }}
                      >
                        {cat.parent ? (
                          <span className="text-muted" style={{ marginRight: 4 }}>↳</span>
                        ) : null}
                        {cat.name}
                      </div>
                    ))}
                  {categories.filter((cat) =>
                    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
                  ).length === 0 && (
                    <p className="text-muted text-center py-3 mb-0" style={{ fontSize: "0.85rem" }}>
                      Sonuç yok
                    </p>
                  )}
                </div>
                {formik.touched.category && formik.errors.category && (
                  <p
                    className="text-danger mb-0 mt-1"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {formik.errors.category}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn orange-btn w-100 rounded mt-4 py-2 fw-semibold"
                  disabled={submitting}
                >
                  {submitting
                    ? "Kaydediliyor..."
                    : isEdit
                      ? "Güncelle"
                      : "Ürünü Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminProductFormPage;
