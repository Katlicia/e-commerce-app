import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetTaxSettings,
  adminUpdateTaxSettings,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";

const inputStyle = {
  border: "1px solid #eee",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};

const labelStyle = {
  fontSize: "13px",
  color: "#808080",
  fontWeight: "bold",
  display: "block",
  marginBottom: "4px",
};

function TaxSettingsPanel() {
  const dispatch = useDispatch();
  const { taxSettings, loading } = useSelector((state) => state.admin);

  const [form, setForm] = useState({
    freeShippingThreshold: "",
    kdv1Rate: "",
    kdv20Rate: "",
  });

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
    <div className="p-4">
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        <div className="fw-bold mb-4 h3">Vergi & Kargo Ayarları</div>

        {loading && !taxSettings ? (
          <div style={{ color: "#999", fontSize: "14px" }}>Yükleniyor...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div>
                <label style={labelStyle}>Ücretsiz Kargo Eşiği (₺)</label>
                <input
                  style={inputStyle}
                  name="freeShippingThreshold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.freeShippingThreshold}
                  onChange={handleChange}
                  required
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#bbb",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Bu tutarın üzerindeki siparişlerde kargo ücretsiz olur.
                </span>
              </div>

              <div>
                <label style={labelStyle}>KDV %1 Oranı</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    name="kdv1Rate"
                    type="number"
                    min="0"
                    max="1"
                    step="0.001"
                    value={form.kdv1Rate}
                    onChange={handleChange}
                    required
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      whiteSpace: "nowrap",
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      background: "#fafafa",
                    }}
                  >
                    = %{(Number(form.kdv1Rate) * 100).toFixed(1)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#bbb",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Örn: 0.01 → %1
                </span>
              </div>

              <div>
                <label style={labelStyle}>KDV %20 Oranı</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    name="kdv20Rate"
                    type="number"
                    min="0"
                    max="1"
                    step="0.001"
                    value={form.kdv20Rate}
                    onChange={handleChange}
                    required
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      whiteSpace: "nowrap",
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      background: "#fafafa",
                    }}
                  >
                    = %{(Number(form.kdv20Rate) * 100).toFixed(1)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#bbb",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Örn: 0.20 → %20
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="orange-btn"
              disabled={loading}
              style={{
                marginTop: "28px",
                padding: "9px 28px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default TaxSettingsPanel;
