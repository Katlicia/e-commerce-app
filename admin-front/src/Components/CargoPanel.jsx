import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetCargo,
  adminCreateCargo,
  adminUpdateCargo,
  adminDeleteCargo,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";

const EMPTY_FORM = { companyName: "", cargoPrice: "" };

function CargoPanel() {
  const dispatch = useDispatch();
  const { cargos, loading } = useSelector((state) => state.admin);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (cargos.length === 0) dispatch(adminGetCargo());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (cargo) => {
    setEditId(cargo._id);
    setForm({ companyName: cargo.companyName, cargoPrice: cargo.cargoPrice });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      companyName: form.companyName.trim(),
      cargoPrice: Number(form.cargoPrice),
    };
    if (editId) {
      dispatch(adminUpdateCargo({ id: editId, cargoData: payload })).then(() =>
        dispatch(addNotification({ message: "Kargo güncellendi." })),
      );
    } else {
      dispatch(adminCreateCargo(payload)).then(() =>
        dispatch(addNotification({ message: "Kargo eklendi." })),
      );
    }
    handleCancel();
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`"${name}" kargo firmasını silmek istediğinize emin misiniz?`)) return;
    dispatch(adminDeleteCargo(id)).then(() =>
      dispatch(addNotification({ message: `"${name}" silindi.`, type: "warning" })),
    );
  };

  const inputStyle = {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  };

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
          <span>Kargolar</span>
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#999" }}>
            {cargos.length} firma
          </span>
        </div>

        {showForm && (
          <div
            style={{
              background: "#fafafa",
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "14px" }}>
              {editId ? "Kargoyu Düzenle" : "Yeni Kargo Ekle"}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="d-flex gap-3 flex-wrap mb-3">
                <div style={{ flex: "2 1 200px" }}>
                  <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "4px" }}>
                    Firma Adı
                  </label>
                  <input
                    style={inputStyle}
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="örn. Yurtiçi Kargo"
                    required
                  />
                </div>
                <div style={{ flex: "1 1 130px" }}>
                  <label style={{ fontSize: "12px", color: "#999", display: "block", marginBottom: "4px" }}>
                    Kargo Ücreti (₺)
                  </label>
                  <input
                    style={inputStyle}
                    name="cargoPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cargoPrice}
                    onChange={handleChange}
                    placeholder="örn. 29.90"
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="orange-btn"
                  style={{ padding: "7px 20px", borderRadius: "8px", fontSize: "13px" }}
                >
                  {editId ? "Güncelle" : "Ekle"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    border: "1px solid #eee",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {!showForm && (
          <div className="mb-4">
            <button
              className="orange-btn"
              onClick={() => setShowForm(true)}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px" }}
            >
              + Yeni Kargo
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ color: "#999", fontSize: "14px" }}>Yükleniyor...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0f0f0", color: "#999", textAlign: "left" }}>
                <th style={{ padding: "8px 12px" }}>#</th>
                <th style={{ padding: "8px 12px" }}>Firma Adı</th>
                <th style={{ padding: "8px 12px" }}>Kargo Ücreti</th>
                <th style={{ padding: "8px 12px" }}></th>
              </tr>
            </thead>
            <tbody>
              {cargos.map((c, i) => (
                <tr key={c._id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "10px 12px", color: "#bbb" }}>{i + 1}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.companyName}</td>
                  <td style={{ padding: "10px 12px", color: "#444" }}>
                    {Number(c.cargoPrice).toFixed(2)}₺
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div className="d-flex gap-2">
                      <button
                        className="orange-btn"
                        onClick={() => handleEdit(c)}
                        style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px" }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.companyName)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          border: "1px solid #ffcdd2",
                          background: "#fff5f5",
                          color: "#c62828",
                          cursor: "pointer",
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {cargos.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#bbb" }}>
                    Henüz kargo firması eklenmemiş.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CargoPanel;
