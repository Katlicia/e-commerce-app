import { useEffect, useRef, useState } from "react";

function CategorySelect({ categories, brands = [], value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const q = search.toLowerCase();
  const filteredCats = categories.filter((c) =>
    c.name.toLowerCase().includes(q),
  );
  const filteredBrands = brands.filter((b) => b.toLowerCase().includes(q));

  const selectedCat = categories.find((c) => "cat:" + c.slug === value);
  const selectedBrand = brands.find((b) => "brand:" + b === value) ?? null;
  const displayLabel = selectedCat
    ? selectedCat.parent
      ? `↳ ${selectedCat.name}`
      : selectedCat.name
    : selectedBrand
      ? selectedBrand
      : null;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setSearch("");
    setOpen(false);
  };

  const noResults = filteredCats.length === 0 && filteredBrands.length === 0;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        className="form-control d-flex align-items-center justify-content-between"
        style={{ cursor: "pointer", minHeight: 38 }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={displayLabel ? "" : "text-muted"}>
          {displayLabel ?? "— Tıklanamaz —"}
        </span>
        <span style={{ fontSize: 10, color: "#999" }}>▼</span>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "#fff",
            border: "1px solid #dee2e6",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxHeight: 280,
            display: "flex",
            flexDirection: "column",
            padding: 10,
          }}
        >
          <div
            style={{ padding: "6px 8px", borderBottom: "1px solid #dee2e6" }}
          >
            <input
              className="form-control form-control-sm"
              placeholder="Kategori veya marka ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div style={{ overflowY: "auto" }}>
            <div
              className="dropdown-item"
              style={{ cursor: "pointer", color: "#999" }}
              onClick={() => handleSelect("")}
            >
              — Tıklanamaz —
            </div>

            {filteredCats.length > 0 && (
              <div
                className="dropdown-item disabled text-uppercase fw-semibold"
                style={{
                  fontSize: "0.7rem",
                  color: "#aaa",
                  pointerEvents: "none",
                }}
              >
                Kategoriler
              </div>
            )}
            {filteredCats.map((cat) => (
              <div
                key={cat._id}
                className={`dropdown-item${"cat:" + cat.slug === value ? " active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => handleSelect("cat:" + cat.slug)}
              >
                {cat.parent ? `↳ ${cat.name}` : cat.name}
              </div>
            ))}

            {filteredBrands.length > 0 && (
              <div
                className="dropdown-item disabled text-uppercase fw-semibold"
                style={{
                  fontSize: "0.7rem",
                  color: "#aaa",
                  pointerEvents: "none",
                }}
              >
                Markalar
              </div>
            )}
            {filteredBrands.map((brand) => (
              <div
                key={brand}
                className={`dropdown-item${"brand:" + brand === value ? " active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => handleSelect("brand:" + brand)}
              >
                {brand}
              </div>
            ))}

            {noResults && (
              <div className="dropdown-item text-muted">Sonuç bulunamadı</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CategorySelect;
