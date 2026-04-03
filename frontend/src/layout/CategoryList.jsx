import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../redux/productSlice.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Loading from "../components/Loading.jsx";
import { getKeyword } from "../redux/generalSlice.jsx";
import CategoryNode from "../components/CategoryNode.jsx";
import FilterSection from "../components/FilterSection.jsx";
import { FaFilter } from "react-icons/fa6";
import "../styles/CategoryList.css";
import axiosInstance from "../utils/axiosInstance.js";

function CategoryList() {
  const dispatch = useDispatch();
  const { products, total, loading } = useSelector((state) => state.product);
  const { keyword } = useSelector((state) => state.general);
  const [price, setPrice] = useState({ min: "", max: "" });
  const [appliedPrice, setAppliedPrice] = useState({ min: "", max: "" });
  const [selectedSort, setSelectedSort] = useState("");
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  useEffect(() => {
    const slugParam = searchParams.get("category");
    if (!slugParam) return;
    axiosInstance
      .get(`/categories/${slugParam}`)
      .then((res) => {
        if (res.data._id) setSelectedCategories([res.data._id.toString()]);
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    axiosInstance
      .get(`/categories`)
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    if (selectedCategories.length > 0)
      query.set("category", selectedCategories.join(","));
    axiosInstance
      .get(`/products/brands?${query.toString()}`)
      .then((res) => setBrands(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, [selectedCategories]);

  useEffect(() => {
    dispatch(
      getProducts({
        keyword,
        brand: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
        category:
          selectedCategories.length > 0
            ? selectedCategories.join(",")
            : undefined,
        minPrice: appliedPrice.min || undefined,
        maxPrice: appliedPrice.max || undefined,
        sort: selectedSort || undefined,
        page,
      }),
    );
  }, [
    dispatch,
    keyword,
    selectedBrands,
    selectedCategories,
    appliedPrice,
    selectedSort,
    page,
  ]);

  const handleCategorySelect = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
    setPage(1);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
    setPage(1);
  };

  const handleApplyPrice = () => {
    setAppliedPrice(price);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPrice({ min: "", max: "" });
    setAppliedPrice({ min: "", max: "" });
    setSelectedSort("");
    setPage(1);
    dispatch(getKeyword(""));
  };

  const hasFilters =
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    appliedPrice.min ||
    appliedPrice.max;
  const activeFilterCount =
    selectedBrands.length +
    selectedCategories.length +
    (appliedPrice.min ? 1 : 0) +
    (appliedPrice.max ? 1 : 0);
  const hasMore = products.length < total;

  const filterContent = (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">FİLTRELER</h6>
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

      <FilterSection
        title="KATEGORİ"
        open={openSections.category}
        onToggle={() => toggleSection("category")}
      >
        {categories.map((cat) => (
          <CategoryNode
            key={cat._id}
            cat={cat}
            level={0}
            selectedCategory={selectedCategories}
            onSelect={handleCategorySelect}
          />
        ))}
      </FilterSection>

      {brands.length > 0 && (
        <FilterSection
          title="MARKALAR"
          open={openSections.brand}
          onToggle={() => toggleSection("brand")}
        >
          {brands.map((brand) => (
            <div
              key={brand}
              className="d-flex align-items-center py-1 rounded"
              style={{ paddingLeft: "4px" }}
            >
              <input
                type="checkbox"
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                style={{
                  accentColor: "#dc3545",
                  marginRight: 6,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onChange={() => handleBrandChange(brand)}
              />
              <label
                htmlFor={`brand-${brand}`}
                className={`flex-grow-1 mb-0 ${selectedBrands.includes(brand) ? "text-danger fw-semibold" : ""}`}
                style={{ fontSize: "0.875rem", cursor: "pointer" }}
              >
                {brand}
              </label>
            </div>
          ))}
        </FilterSection>
      )}

      <FilterSection
        title="FİYAT ARALIĞI"
        open={openSections.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="d-flex gap-2 justify-content-center text-center">
          <input
            className="border w-50 text-center rounded py-1"
            type="number"
            placeholder="0"
            value={price.min}
            onChange={(e) =>
              setPrice((prev) => ({ ...prev, min: e.target.value }))
            }
          />
          <div className="text-muted">─</div>
          <input
            className="border w-50 text-center rounded py-1"
            type="number"
            placeholder="10000"
            value={price.max}
            onChange={(e) =>
              setPrice((prev) => ({ ...prev, max: e.target.value }))
            }
          />
        </div>
        <button
          className="btn btn-sm orange-btn w-100 mt-2"
          onClick={handleApplyPrice}
        >
          Uygula
        </button>
      </FilterSection>
    </>
  );

  return (
    <div className="container py-4">
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="filterOffcanvas"
        aria-labelledby="filterOffcanvasLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-bold" id="filterOffcanvasLabel">
            FİLTRELER
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Kapat"
          />
        </div>
        <div className="offcanvas-body">{filterContent}</div>
        <div className="p-3 border-top">
          <button className="btn orange-btn w-100" data-bs-dismiss="offcanvas">
            Filtreleri Uygula
          </button>
        </div>
      </div>

      <div className="row">
        {/* Masaüstü sidebar */}
        <aside className="col-lg-3 mb-4 d-none d-lg-block">
          <div className="border rounded-3 p-3">{filterContent}</div>
        </aside>

        <main className="col-12 col-lg-9">
          {/* Mobil: Filtrele + Sırala çubuğu */}
          <div className="d-flex d-lg-none gap-2 mb-3">
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-2 flex-grow-1 justify-content-center"
              data-bs-toggle="offcanvas"
              data-bs-target="#filterOffcanvas"
              aria-controls="filterOffcanvas"
            >
              <FaFilter />
              Filtrele
              {activeFilterCount > 0 && (
                <span
                  className="badge bg-danger rounded-pill"
                  style={{ fontSize: "0.65rem" }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select
              className="form-select"
              style={{ fontSize: "0.875rem" }}
              value={selectedSort}
              onChange={handleSortChange}
            >
              <option value="">Sırala</option>
              <option value="price">En Düşük Fiyat</option>
              <option value="-price">En Yüksek Fiyat</option>
              <option value="-createdAt">En Yeni</option>
            </select>
          </div>

          <div className="d-none d-lg-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              {keyword ? (
                <>
                  <strong>"{keyword}"</strong> için {total} sonuç bulundu
                </>
              ) : (
                <>{total} ürün listeleniyor</>
              )}
            </span>
            <select
              className="form-select w-auto"
              style={{ fontSize: "0.875rem" }}
              value={selectedSort}
              onChange={handleSortChange}
            >
              <option value="">Önerilen Sıralama</option>
              <option value="price">En Düşük Fiyat</option>
              <option value="-price">En Yüksek Fiyat</option>
              <option value="-createdAt">En Yeni</option>
            </select>
          </div>

          {/* Mobil: ürün sayısı */}
          <div className="d-lg-none mb-2">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              {keyword ? (
                <>
                  <strong>"{keyword}"</strong> için {total} sonuç bulundu
                </>
              ) : (
                <>{total} ürün listeleniyor</>
              )}
            </span>
          </div>

          {loading && page === 1 ? (
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
            <>
              <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
                {products.map((product) => (
                  <div className="col" key={product._id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-4">
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loading}
                  >
                    {loading ? "Yükleniyor..." : "Daha Fazla Göster"}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default CategoryList;
