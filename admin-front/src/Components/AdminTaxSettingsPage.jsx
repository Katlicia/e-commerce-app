import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  adminGetTaxSettings,
  adminUpdateTaxSettings,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import "../styles/AdminPage.css";

function AdminTaxSettingsPage() {
  const dispatch = useDispatch();
  const { taxSettings, loading } = useSelector((state) => state.admin);

  const [form, setForm] = useState({
    freeShippingThreshold: "",
    kdv1Rate: "",
    kdv20Rate: "",
  });
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(adminGetTaxSettings());
  }, []);

  useEffect(() => {
    if (taxSettings) {
      setForm({
        freeShippingThreshold: taxSettings.freeShippingThreshold,
        kdv1Rate: taxSettings.kdv1Rate,
        kdv20Rate: taxSettings.kdv20Rate,
      });
    }
  }, [taxSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      adminUpdateTaxSettings({
        freeShippingThreshold: Number(form.freeShippingThreshold),
        kdv1Rate: Number(form.kdv1Rate),
        kdv20Rate: Number(form.kdv20Rate),
      }),
    ).then(() => dispatch(addNotification({ message: "Ayarlar kaydedildi." })));
  };

  return (
    <div className="admin-page">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/")}
          >
            ← Geri
          </button>
          <h4 className="fw-bold mb-0">Vergi & Kargo Ayarları</h4>
        </div>

        {loading && !taxSettings ? (
          <p className="text-muted">Yükleniyor...</p>
        ) : (
          <form onSubmit={handleSubmit} className="admin-form-card">
            <div className="mb-4">
              <label className="admin-form-label">
                Ücretsiz Kargo Eşiği (₺)
              </label>
              <input
                className="form-control"
                name="freeShippingThreshold"
                type="number"
                min="0"
                step="0.01"
                value={form.freeShippingThreshold}
                onChange={handleChange}
                required
              />
              <small className="text-muted">
                Bu tutarın üzerindeki siparişlerde kargo ücretsiz olur.
              </small>
            </div>

            <div className="mb-4">
              <label className="admin-form-label">KDV %1 Oranı</label>
              <div className="input-group">
                <input
                  className="form-control"
                  name="kdv1Rate"
                  type="number"
                  min="0"
                  max="1"
                  step="0.001"
                  value={form.kdv1Rate}
                  onChange={handleChange}
                  required
                />
                <span className="input-group-text">
                  = %{(Number(form.kdv1Rate) * 100).toFixed(1)}
                </span>
              </div>
              <small className="text-muted">Örn: 0.01 → %1</small>
            </div>

            <div className="mb-4">
              <label className="admin-form-label">KDV %20 Oranı</label>
              <div className="input-group">
                <input
                  className="form-control"
                  name="kdv20Rate"
                  type="number"
                  min="0"
                  max="1"
                  step="0.001"
                  value={form.kdv20Rate}
                  onChange={handleChange}
                  required
                />
                <span className="input-group-text">
                  = %{(Number(form.kdv20Rate) * 100).toFixed(1)}
                </span>
              </div>
              <small className="text-muted">Örn: 0.20 → %20</small>
            </div>

            <div className="d-flex align-items-center gap-3">
              <button
                type="submit"
                className="btn orange-btn px-4"
                disabled={loading}
              >
                Kaydet
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => navigate("/")}
              >
                İptal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminTaxSettingsPage;
