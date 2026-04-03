import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  adminGetProducts,
  adminDeleteProduct,
  adminGetCategories,
} from "../redux/adminSlice";
import "../styles/AdminPage.css";

const BADGE_LABELS = {
  yeni: "Yeni",
  "gunun-firsati": "Günün Fırsatı",
  "en-cok-satan": "En Çok Satan",
  indirimli: "İndirimli",
};

function CheckboxFilterPanel({
  title,
  items,
  selected,
  onToggle,
  getLabel,
  getValue,
}) {
  const [panelSearch, setPanelSearch] = useState("");

  const visible = items.filter((item) =>
    getLabel(item).toLowerCase().includes(panelSearch.toLowerCase()),
  );

  return (
    <div className="admin-filter-panel">
      <div className="admin-filter-panel-header">
        <span className="admin-filter-panel-title">{title}</span>
        {selected.size > 0 && (
          <button
            className="admin-filter-clear-btn"
            onClick={() => selected.forEach((v) => onToggle(v))}
          >
            Temizle ({selected.size})
          </button>
        )}
      </div>
      <input
        type="text"
        className="form-control form-control-sm admin-filter-search"
        placeholder={`${title} ara...`}
        value={panelSearch}
        onChange={(e) => setPanelSearch(e.target.value)}
      />
      <div className="admin-filter-list">
        {visible.length === 0 && (
          <p className="admin-filter-empty">Sonuç yok</p>
        )}
        {visible.map((item) => {
          const val = getValue(item);
          return (
            <label key={val} className="admin-filter-item">
              <input
                type="checkbox"
                checked={selected.has(val)}
                onChange={() => onToggle(val)}
              />
              <span>{getLabel(item)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function AdminProductsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories, loading } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedBrands, setSelectedBrands] = useState(new Set());

  useEffect(() => {
    dispatch(adminGetProducts());
    dispatch(adminGetCategories());
  }, []);

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat ? cat.name : "-";
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`"${name}" ürünü silmek istediğinize emin misiniz?`))
      return;
    dispatch(adminDeleteProduct(id));
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
  };

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return [...set].sort();
  }, [products]);

  const getDescendantIds = (categoryId) => {
    const ids = new Set([categoryId]);
    const queue = [categoryId];
    while (queue.length) {
      const current = queue.shift();
      const node = categories.find((c) => c._id === current);
      node?.children?.forEach((child) => {
        ids.add(child._id);
        queue.push(child._id);
      });
    }
    return ids;
  };

  const allowedCategoryIds = useMemo(() => {
    if (selectedCategories.size === 0) return null;
    const ids = new Set();
    selectedCategories.forEach((catId) => {
      getDescendantIds(catId).forEach((id) => ids.add(id));
    });
    return ids;
  }, [selectedCategories, categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.brand?.toLowerCase().includes(q)
      )
        return false;
      if (allowedCategoryIds && !allowedCategoryIds.has(p.category))
        return false;
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;
      return true;
    });
  }, [products, search, allowedCategoryIds, selectedBrands]);

  const hasFilters =
    search || selectedCategories.size > 0 || selectedBrands.size > 0;

  const clearAll = () => {
    setSearch("");
    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/")}
            >
              ← Geri
            </button>
            <h4 className="fw-bold mb-0">Ürün Yönetimi</h4>
          </div>
          <Link
            to="/admin/products/new"
            className="btn orange-btn rounded px-4"
          >
            + Yeni Ürün
          </Link>
        </div>

        <div className="d-flex gap-2 align-items-center mb-3">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 360 }}
            placeholder="Ürün adı veya marka ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {hasFilters && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={clearAll}
            >
              Tümünü Temizle
            </button>
          )}
          <span
            className="text-muted ms-auto"
            style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}
          >
            {hasFilters
              ? `${filtered.length} / ${products.length} ürün`
              : `Toplam ${products.length} ürün`}
          </span>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-3">
            <div className="d-flex flex-column gap-3">
              <CheckboxFilterPanel
                title="Kategori"
                items={categories}
                selected={selectedCategories}
                onToggle={toggleCategory}
                getLabel={(c) => c.name}
                getValue={(c) => c._id}
              />
              <CheckboxFilterPanel
                title="Marka"
                items={brands.map((b) => b)}
                selected={selectedBrands}
                onToggle={toggleBrand}
                getLabel={(b) => b}
                getValue={(b) => b}
              />
            </div>
          </div>

          <div className="col-12 col-lg-9">
            {loading ? (
              <p className="text-muted">Yükleniyor...</p>
            ) : (
              <div className="table-responsive">
                <table className="table admin-table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Görsel</th>
                      <th>Ürün Adı</th>
                      <th>Marka</th>
                      <th>Fiyat</th>
                      <th>Stok</th>
                      <th>Kategori</th>
                      <th>Rozet</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <img src={p.images?.[0]?.url} alt={p.name} />
                        </td>
                        <td className="fw-semibold">{p.name}</td>
                        <td>{p.brand}</td>
                        <td>
                          {Number(p.discountedPrice || p.price).toFixed(2)}₺
                        </td>
                        <td>{p.stock}</td>
                        <td>{getCategoryName(p.category)}</td>
                        <td>
                          {p.badge ? (
                            <span className="badge bg-warning text-dark admin-badge">
                              {BADGE_LABELS[p.badge] || p.badge}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                navigate(`/admin/products/${p._id}/edit`)
                              }
                            >
                              Düzenle
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(p._id, p.name)}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-4">
                          {hasFilters
                            ? "Filtreyle eşleşen ürün bulunamadı."
                            : "Ürün bulunamadı."}
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

export default AdminProductsPage;
