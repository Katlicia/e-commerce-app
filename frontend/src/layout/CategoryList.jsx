import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../redux/productSlice.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Loading from "../components/Loading.jsx";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

const BASE_URL = "http://localhost:5000";

function CategoryDropdown({ cat, selectedCategory, onSelect }) {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  const toggle = () => {
    if (!open && children.length === 0) {
      setLoadingChildren(true);
      fetch(`${BASE_URL}/categories/${cat.slug}/children`)
        .then((r) => r.json())
        .then((data) => setChildren(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoadingChildren(false));
    }
    setOpen((prev) => !prev);
  };

  const isParentSelected = selectedCategory === cat._id;

  return (
    <div className="mb-1">
      <div
        className="d-flex align-items-center justify-content-between px-2 py-1 rounded"
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={toggle}
      >
        <span
          className={`fw-semibold ${isParentSelected ? "text-danger" : ""}`}
          style={{ fontSize: "0.875rem" }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(cat._id);
          }}
        >
          {cat.name}
        </span>
        <span style={{ fontSize: "0.7rem", color: "#adb5bd" }}>
          {loadingChildren ? (
            <span className="spinner-border spinner-border-sm" />
          ) : open ? (
            <FaChevronUp />
          ) : (
            <FaChevronDown />
          )}
        </span>
      </div>

      {open && (
        <div className="ms-3 mt-1">
          {children.length === 0 && !loadingChildren ? (
            <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
              Alt kategori yok.
            </p>
          ) : (
            children.map((child) => (
              <div className="form-check mb-1" key={child._id}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="category"
                  id={`cat-${child._id}`}
                  checked={selectedCategory === child._id}
                  onChange={() =>
                    onSelect(selectedCategory === child._id ? "" : child._id)
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor={`cat-${child._id}`}
                  style={{ fontSize: "0.85rem", cursor: "pointer" }}
                >
                  {child.name}
                </label>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CategoryList() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const { keyword } = useSelector((state) => state.general);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  useEffect(() => {
    fetch(`${BASE_URL}/categories/roots`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    dispatch(
      getProducts({
        keyword,
        brand: selectedBrand || undefined,
        category: selectedCategory || undefined,
      }),
    );
  }, [dispatch, keyword, selectedBrand, selectedCategory]);

  const clearFilters = () => {
    setSelectedBrand("");
    setSelectedCategory("");
  };

  const hasFilters = selectedBrand || selectedCategory;

  return (
    <div className="container py-4">
      <div className="row">
        {/* Sol filtre paneli */}
        <aside className="col-12 col-lg-3 mb-4">
          <div className="border rounded-3 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Filtreler</h6>
              {hasFilters && (
                <button
                  className="btn btn-link btn-sm p-0 text-danger"
                  style={{ fontSize: "0.8rem" }}
                  onClick={clearFilters}
                >
                  Temizle
                </button>
              )}
            </div>

            {/* Kategori filtresi */}
            {categories.length > 0 && (
              <div className="mb-4">
                <p
                  className="fw-semibold mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  Kategori
                </p>
                {categories.map((cat) => (
                  <CategoryDropdown
                    key={cat._id}
                    cat={cat}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                ))}
              </div>
            )}

            {/* Marka filtresi */}
            {brands.length > 0 && (
              <div>
                <p
                  className="fw-semibold mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  Marka
                </p>
                {brands.map((brand) => (
                  <div className="form-check" key={brand}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="brand"
                      id={`brand-${brand}`}
                      checked={selectedBrand === brand}
                      onChange={() =>
                        setSelectedBrand(selectedBrand === brand ? "" : brand)
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`brand-${brand}`}
                      style={{ fontSize: "0.875rem" }}
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Sağ ürün listesi */}
        <main className="col-12 col-lg-9">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              {keyword ? (
                <>
                  <strong>"{keyword}"</strong> için {products.length} sonuç
                  bulundu
                </>
              ) : (
                <>{products.length} ürün listeleniyor</>
              )}
            </span>
            <select
              className="form-select w-auto"
              style={{ fontSize: "0.875rem" }}
            >
              <option>Önerilen Sıralama</option>
              <option>En Düşük Fiyat</option>
              <option>En Yüksek Fiyat</option>
              <option>En Çok Satan</option>
              <option>En Yeni</option>
            </select>
          </div>

          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="fs-5">Ürün bulunamadı.</p>
              {(keyword || hasFilters) && (
                <button
                  className="btn btn-outline-secondary btn-sm mt-2"
                  onClick={clearFilters}
                >
                  Filtreleri temizle
                </button>
              )}
            </div>
          ) : (
            <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
              {products.map((product) => (
                <div className="col" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CategoryList;
