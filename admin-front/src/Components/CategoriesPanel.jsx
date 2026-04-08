import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminGetCategories } from "../redux/adminSlice";

function CategoriesPanel() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.admin.categories);
  const loading = useSelector((state) => state.admin.loading);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (categories.length === 0) dispatch(adminGetCategories());
  }, []);

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c._id.toString(), c]),
  );

  const filtered = categories.filter((cat) => {
    const q = search.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(q) || cat.slug?.toLowerCase().includes(q)
    );
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
        <div className="d-flex justify-content-between align-items-center fw-bold mb-4 h3">
          <span>Kategoriler</span>
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#999" }}>
            {filtered.length} kategori
          </span>
        </div>

        <input
          type="text"
          placeholder="Kategori ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #eee",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "13px",
            marginBottom: "20px",
            outline: "none",
          }}
        />

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
                      {category.children.length}
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
                    <td style={{ padding: "10px 12px" }}>
                      <button
                        className="orange-btn"
                        style={{
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      >
                        Düzenle
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
