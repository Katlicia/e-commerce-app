import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  adminGetCargo,
  adminCreateCargo,
  adminUpdateCargo,
  adminDeleteCargo,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import "../styles/AdminPage.css";

const EMPTY_FORM = { companyName: "", cargoPrice: "" };

function AdminCargoPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cargos, loading } = useSelector((state) => state.admin);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(adminGetCargo());
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
    if (
      !window.confirm(
        `"${name}" kargo firmasını silmek istediğinize emin misiniz?`,
      )
    )
      return;
    dispatch(adminDeleteCargo(id)).then(() =>
      dispatch(
        addNotification({ message: `"${name}" silindi.`, type: "warning" }),
      ),
    );
  };

  return (
    <div className="admin-page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/")}
            >
              ← Geri
            </button>
            <h4 className="fw-bold mb-0">Kargo Yönetimi</h4>
          </div>
          {!showForm && (
            <button
              className="btn orange-btn rounded px-4"
              onClick={() => setShowForm(true)}
            >
              + Yeni Kargo
            </button>
          )}
        </div>

        {showForm && (
          <div className="admin-form-card mb-4">
            <h6 className="fw-semibold mb-3">
              {editId ? "Kargoyu Düzenle" : "Yeni Kargo Ekle"}
            </h6>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-sm-7">
                  <label className="admin-form-label">Firma Adı</label>
                  <input
                    className="form-control"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="örn. Yurtiçi Kargo"
                    required
                  />
                </div>
                <div className="col-sm-5">
                  <label className="admin-form-label">Kargo Ücreti (₺)</label>
                  <input
                    className="form-control"
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
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn orange-btn btn-sm px-4">
                  {editId ? "Güncelle" : "Ekle"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleCancel}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-muted">Yükleniyor...</p>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Firma Adı</th>
                  <th>Kargo Ücreti</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cargos.map((c) => (
                  <tr key={c._id}>
                    <td className="fw-semibold">{c.companyName}</td>
                    <td>{Number(c.cargoPrice).toFixed(2)}₺</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEdit(c)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(c._id, c.companyName)}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cargos.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      Henüz kargo firması eklenmemiş.
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

export default AdminCargoPage;
