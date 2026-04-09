import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminGetUsers, adminUpdateUser } from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";

function EditModal({ user, onClose }) {
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState(user.isAdmin || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(adminUpdateUser({ id: user._id, userData: { isAdmin } })).unwrap();
      dispatch(addNotification({ message: "Kullanıcı güncellendi." }));
    } catch {
      dispatch(addNotification({ message: "Kullanıcı güncellenemedi.", type: "error" }));
    }
    setSaving(false);
    onClose();
  };

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
          width: "340px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>
          {user.name} {user.surname}
        </div>
        <div style={{ fontSize: "13px", color: "#999", marginBottom: "24px" }}>
          {user.email}
        </div>

        <div
          className="d-flex align-items-center justify-content-between"
          style={{ marginBottom: "24px" }}
        >
          <div>
            <div style={{ fontWeight: 500, fontSize: "14px" }}>
              Admin Yetkisi
            </div>
            <div style={{ fontSize: "12px", color: "#999" }}>
              Panele tam erişim sağlar
            </div>
          </div>
          <div
            onClick={() => setIsAdmin(!isAdmin)}
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "99px",
              background: isAdmin ? "#ff6a00" : "#ddd",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: isAdmin ? "23px" : "3px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </div>
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
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersPanel() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.admin.users);
  const loading = useSelector((state) => state.admin.loading);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (users.length === 0) dispatch(adminGetUsers());
  }, []);

  const SORT_OPTIONS = [
    { value: "default", label: "Varsayılan" },
    { value: "orderCount", label: "En Çok Sipariş" },
    { value: "cancelCount", label: "En Çok İptal" },
    { value: "returnCount", label: "En Çok İade" },
  ];

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.surname?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      sortBy === "default" ? 0 : (b[sortBy] || 0) - (a[sortBy] || 0),
    );

  return (
    <div className="p-4">
      {editingUser && (
        <EditModal user={editingUser} onClose={() => setEditingUser(null)} />
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
          <span>Kullanıcılar</span>
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#999" }}>
            {filtered.length} kullanıcı
          </span>
        </div>

        <div
          className="d-flex gap-3 align-items-center mb-4"
          style={{ flexWrap: "wrap" }}
        >
          <input
            type="text"
            placeholder="İsim veya e-posta ara..."
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
                  <th style={{ padding: "8px 12px" }}>Ad Soyad</th>
                  <th style={{ padding: "8px 12px" }}>E-posta</th>
                  <th style={{ padding: "8px 12px", textAlign: "center" }}>
                    Sipariş
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "center" }}>
                    İptal
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "center" }}>
                    İade
                  </th>
                  <th style={{ padding: "8px 12px" }}>Kayıt Tarihi</th>
                  <th style={{ padding: "8px 12px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr
                    key={user._id}
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
                      <div className="d-flex align-items-center gap-2">
                        {user.name} {user.surname}
                        {user.isAdmin && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              background: "#fff3e0",
                              color: "#ff6a00",
                              borderRadius: "4px",
                              padding: "1px 6px",
                            }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#555" }}>
                      {user.email}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "center",
                        color: "#6366f1",
                        fontWeight: 600,
                      }}
                    >
                      {user.orderCount || 0}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "center",
                        color: "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {user.cancelCount || 0}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "center",
                        color: "#f97316",
                        fontWeight: 600,
                      }}
                    >
                      {user.returnCount || 0}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#999" }}>
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <button
                        className="btn orange-btn"
                        onClick={() => setEditingUser(user)}
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
                      Kullanıcı bulunamadı.
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

export default UsersPanel;
