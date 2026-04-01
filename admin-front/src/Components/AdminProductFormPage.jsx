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

  const [descriptions, setDescriptions] = useState([""]);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(adminGetCategories());
    if (isEdit) dispatch(getProductDetail(id));
  }, [id]);

  useEffect(() => {
    if (isEdit && product?._id === id) {
      formik.setValues({
        name: product.name || "",
        brand: product.brand || "",
        price: product.price || "",
        discountPercent: product.discountPercent || "",
        stock: product.stock || "",
        badge: product.badge || "",
        category: product.category?._id || product.category || "",
      });
      setDescriptions(
        Array.isArray(product.description) && product.description.length > 0
          ? product.description
          : [""],
      );
      setExistingImages(product.images || []);
    }
  }, [product]);

  const formik = useFormik({
    initialValues: {
      name: "",
      brand: "",
      price: "",
      discountPercent: "",
      stock: "",
      badge: "",
      category: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.name) errors.name = "Ürün adı zorunludur";
      if (!values.brand) errors.brand = "Marka zorunludur";
      if (!values.price || isNaN(values.price))
        errors.price = "Geçerli bir fiyat giriniz";
      if (!values.stock || isNaN(values.stock))
        errors.stock = "Geçerli bir stok giriniz";
      if (!values.category) errors.category = "Kategori seçiniz";
      if (!isEdit && newImages.length === 0)
        errors.images = "En az 1 görsel ekleyiniz";
      return errors;
    },
    onSubmit: async (values) => {
      setSubmitting(true);
      const base64Images = await Promise.all(newImages.map(toBase64));

      const payload = {
        name: values.name,
        brand: values.brand,
        price: Number(values.price),
        stock: Number(values.stock),
        category: values.category,
        description: descriptions.filter((d) => d.trim()),
        ...(values.badge && { badge: values.badge }),
        ...(values.discountPercent && {
          discountPercent: Number(values.discountPercent),
        }),
        ...(base64Images.length > 0 && { images: base64Images }),
      };

      if (isEdit) {
        await dispatch(adminUpdateProduct({ id, productData: payload }));
      } else {
        await dispatch(adminCreateProduct(payload));
      }

      setSubmitting(false);
      navigate("/admin/products");
    },
  });

  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const addDescription = () => setDescriptions((prev) => [...prev, ""]);

  const removeDescription = (idx) =>
    setDescriptions((prev) => prev.filter((_, i) => i !== idx));

  const updateDescription = (idx, value) =>
    setDescriptions((prev) => prev.map((d, i) => (i === idx ? value : d)));

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
                      onChange={formik.handleChange}
                    >
                      {BADGES.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-form-card mb-4">
                <h6 className="fw-bold mb-3">Açıklamalar</h6>
                <div className="d-flex flex-column gap-2">
                  {descriptions.map((desc, idx) => (
                    <div key={idx} className="admin-desc-item">
                      <input
                        className="form-control"
                        placeholder={`Özellik ${idx + 1}`}
                        value={desc}
                        onChange={(e) => updateDescription(idx, e.target.value)}
                      />
                      {descriptions.length > 1 && (
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
                <h6 className="fw-bold mb-3">Görseller</h6>
                {isEdit && existingImages.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {existingImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt=""
                        className="admin-image-preview"
                      />
                    ))}
                    <p
                      className="text-muted w-100 mb-0"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Yeni görsel seçilirse mevcut görseller değiştirilir.
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  className="form-control"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {formik.submitCount > 0 && formik.errors.images && (
                  <p
                    className="text-danger mb-0 mt-1"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {formik.errors.images}
                  </p>
                )}
                {newImages.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    {newImages.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="admin-image-preview"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="admin-form-card">
                <h6 className="fw-bold mb-3">Kategori</h6>
                <select
                  className="form-select"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Kategori seçiniz</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.parent ? `↳ ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
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
                  className="btn btn-primary w-100 rounded mt-4 py-2 fw-semibold"
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
