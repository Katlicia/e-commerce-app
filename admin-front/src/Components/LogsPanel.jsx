import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";

const ENTITY_COLORS = {
  Ürün: { background: "#e8f5e9", color: "#2e7d32" },
  Sipariş: { background: "#e3f2fd", color: "#1565c0" },
  Kategori: { background: "#fff3e0", color: "#e65100" },
  Kupon: { background: "#fce4ec", color: "#c62828" },
  "S&C": { background: "#f3e5f5", color: "#6a1b9a" },
};

const ACTION_COLORS = {
  Oluşturuldu: { background: "#e8f5e9", color: "#2e7d32" },
  Güncellendi: { background: "#e3f2fd", color: "#1565c0" },
  Silindi: { background: "#ffebee", color: "#c62828" },
  "Durum Güncellendi": { background: "#fff3e0", color: "#e65100" },
  Cevaplandı: { background: "#f3e5f5", color: "#6a1b9a" },
};

function Badge({ label, colorMap }) {
  const style = colorMap[label] || { background: "#f5f5f5", color: "#555" };
  return (
    <span
      style={{
        ...style,
        borderRadius: "5px",
        padding: "2px 8px",
        fontSize: "11px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      if (entityFilter) params.set("entity", entityFilter);
      if (search) params.set("search", search);
      const { data } = await axiosInstance.get(`/admin/logs?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ fontWeight: 700, margin: 0, color: "#1a1a1a" }}>
          Aktivite Logları
          {!loading && (
            <span
              style={{ fontSize: "13px", fontWeight: 400, color: "#888", marginLeft: "10px" }}
            >
              {total} kayıt
            </span>
          )}
        </h4>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {/* Entity filter */}
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
              background: "#fff",
            }}
          >
            <option value="">Tüm kategoriler</option>
            {Object.keys(ENTITY_COLORS).map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "6px" }}>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Admin adı veya detay ara..."
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "13px",
                outline: "none",
                width: "220px",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#ff6a00",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Ara
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#888" }}>
          Yükleniyor...
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#888" }}>
          Log bulunamadı.
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                {["Tarih", "Admin", "İşlem", "Kategori", "Detay"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#888",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log._id}
                  style={{ borderBottom: "1px solid #f9f9f9" }}
                >
                  <td
                    style={{
                      padding: "10px 16px",
                      fontSize: "12px",
                      color: "#aaa",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(log.createdAt).toLocaleString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontSize: "13px",
                      color: "#333",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.adminName}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <Badge label={log.action} colorMap={ACTION_COLORS} />
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <Badge label={log.entity} colorMap={ENTITY_COLORS} />
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontSize: "13px",
                      color: "#555",
                      maxWidth: "300px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.detail || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginTop: "20px",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              border: "1px solid #e0e0e0",
              background: "#fff",
              borderRadius: "6px",
              padding: "6px 14px",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
              fontSize: "13px",
            }}
          >
            ‹
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  border: "1px solid #e0e0e0",
                  background: p === page ? "#ff6a00" : "#fff",
                  color: p === page ? "#fff" : "#333",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontWeight: p === page ? 700 : 400,
                  fontSize: "13px",
                }}
              >
                {p}
              </button>
            ))}
          <button
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              border: "1px solid #e0e0e0",
              background: "#fff",
              borderRadius: "6px",
              padding: "6px 14px",
              cursor: page === pages ? "not-allowed" : "pointer",
              opacity: page === pages ? 0.4 : 1,
              fontSize: "13px",
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default LogsPanel;
