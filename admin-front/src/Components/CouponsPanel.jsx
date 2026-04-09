import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const inputStyle = {
  border: "1px solid #eee",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};

const labelStyle = {
  fontSize: "12px",
  color: "#999",
  display: "block",
  marginBottom: "4px",
};

const errorStyle = { color: "#ef4444", fontSize: "11px", marginTop: "3px" };

const couponSchema = Yup.object({
  code: Yup.string().required("Kupon kodu zorunludur"),
  discountType: Yup.string().oneOf(["fixed", "percent"]).required(),
  discountValue: Yup.number()
    .typeError("Geçerli bir sayı girin")
    .positive("Pozitif olmalı")
    .required("İndirim değeri zorunludur"),
  minOrderAmount: Yup.number()
    .typeError("Geçerli bir sayı girin")
    .min(0)
    .nullable(),
  maxDiscount: Yup.number()
    .typeError("Geçerli bir sayı girin")
    .min(0)
    .nullable(),
  usageLimit: Yup.number()
    .typeError("Geçerli bir sayı girin")
    .integer("Tam sayı olmalı")
    .min(1)
    .nullable(),
  expiryDate: Yup.date()
    .typeError("Geçerli bir tarih girin")
    .required("Son tarih zorunludur"),
  isActive: Yup.boolean(),
});

const EMPTY = {
  code: "",
  discountType: "fixed",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  expiryDate: "",
  isActive: true,
};

function toInputDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 10);
}

function formatDiscount(coupon) {
  if (coupon.discountType === "percent") return `%${coupon.discountValue}`;
  return `${Number(coupon.discountValue).toLocaleString("tr-TR")}₺`;
}

function daysLeft(expiryDate) {
  const diff = new Date(expiryDate) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function CouponsPanel() {
  const dispatch = useDispatch();
  const { coupons, loading } = useSelector((state) => state.admin);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }

  useEffect(() => {
    if (coupons.length === 0) dispatch(adminGetCoupons());
  }, []);

  const formik = useFormik({
    initialValues: EMPTY,
    validationSchema: couponSchema,
    onSubmit: (values, { resetForm }) => {
      const payload = {
        code: values.code.trim().toUpperCase(),
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        minOrderAmount:
          values.minOrderAmount !== "" ? Number(values.minOrderAmount) : 0,
        maxDiscount:
          values.maxDiscount !== "" ? Number(values.maxDiscount) : null,
        usageLimit: values.usageLimit !== "" ? Number(values.usageLimit) : null,
        expiryDate: values.expiryDate,
        isActive: values.isActive,
      };

      if (editId) {
        dispatch(adminUpdateCoupon({ id: editId, couponData: payload })).then(
          () => dispatch(addNotification({ message: "Kupon güncellendi." })),
        );
      } else {
        dispatch(adminCreateCoupon(payload)).then(() =>
          dispatch(addNotification({ message: "Kupon eklendi." })),
        );
      }
      resetForm();
      setEditId(null);
      setShowForm(false);
    },
  });

  const handleEdit = (coupon) => {
    setEditId(coupon._id);
    formik.setValues({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount ?? "",
      maxDiscount: coupon.maxDiscount ?? "",
      usageLimit: coupon.usageLimit ?? "",
      expiryDate: toInputDate(coupon.expiryDate),
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    formik.resetForm();
    setEditId(null);
    setShowForm(false);
  };

  const handleDelete = (id, code) => {
    setConfirm({
      message: `"${code}" kuponunu silmek istediğinize emin misiniz?`,
      onConfirm: () =>
        dispatch(adminDeleteCoupon(id)).then(() =>
          dispatch(
            addNotification({ message: `"${code}" silindi.`, type: "warning" }),
          ),
        ),
    });
  };

  const handleToggleActive = (coupon) => {
    dispatch(
      adminUpdateCoupon({
        id: coupon._id,
        couponData: { isActive: !coupon.isActive },
      }),
    ).then(() =>
      dispatch(
        addNotification({
          message: `"${coupon.code}" ${!coupon.isActive ? "aktif edildi." : "devre dışı bırakıldı."}`,
        }),
      ),
    );
  };

  const f = formik.values;
  const e = formik.errors;
  const t = formik.touched;

  return (
    <div className="p-4">
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
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
          <span>Kuponlar</span>
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#999" }}>
            {coupons.length} kupon
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
            <div
              style={{
                fontWeight: 600,
                fontSize: "14px",
                marginBottom: "14px",
              }}
            >
              {editId ? "Kuponu Düzenle" : "Yeni Kupon Ekle"}
            </div>
            <form onSubmit={formik.handleSubmit}>
              <div className="d-flex gap-3 flex-wrap mb-3">
                <div style={{ flex: "2 1 160px" }}>
                  <label style={labelStyle}>Kupon Kodu</label>
                  <input
                    style={inputStyle}
                    name="code"
                    value={f.code}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="örn. YAZA50"
                  />
                  {t.code && e.code && <div style={errorStyle}>{e.code}</div>}
                </div>
                <div style={{ flex: "1 1 130px" }}>
                  <label style={labelStyle}>İndirim Tipi</label>
                  <select
                    style={inputStyle}
                    name="discountType"
                    value={f.discountType}
                    onChange={formik.handleChange}
                  >
                    <option value="fixed">Sabit (₺)</option>
                    <option value="percent">Yüzde (%)</option>
                  </select>
                </div>
                <div style={{ flex: "1 1 130px" }}>
                  <label style={labelStyle}>
                    {f.discountType === "percent"
                      ? "İndirim (%)"
                      : "İndirim (₺)"}
                  </label>
                  <input
                    style={inputStyle}
                    name="discountValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={f.discountValue}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="örn. 50"
                  />
                  {t.discountValue && e.discountValue && (
                    <div style={errorStyle}>{e.discountValue}</div>
                  )}
                </div>
              </div>

              <div className="d-flex gap-3 flex-wrap mb-3">
                <div style={{ flex: "1 1 140px" }}>
                  <label style={labelStyle}>Min. Sipariş (₺)</label>
                  <input
                    style={inputStyle}
                    name="minOrderAmount"
                    type="number"
                    min="0"
                    value={f.minOrderAmount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="örn. 500"
                  />
                  {t.minOrderAmount && e.minOrderAmount && (
                    <div style={errorStyle}>{e.minOrderAmount}</div>
                  )}
                </div>
                {f.discountType === "percent" && (
                  <div style={{ flex: "1 1 140px" }}>
                    <label style={labelStyle}>Maks. İndirim (₺)</label>
                    <input
                      style={inputStyle}
                      name="maxDiscount"
                      type="number"
                      min="0"
                      value={f.maxDiscount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="örn. 200"
                    />
                    {t.maxDiscount && e.maxDiscount && (
                      <div style={errorStyle}>{e.maxDiscount}</div>
                    )}
                  </div>
                )}
                <div style={{ flex: "1 1 140px" }}>
                  <label style={labelStyle}>Kullanım Limiti</label>
                  <input
                    style={inputStyle}
                    name="usageLimit"
                    type="number"
                    min="1"
                    value={f.usageLimit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Boş = sınırsız"
                  />
                  {t.usageLimit && e.usageLimit && (
                    <div style={errorStyle}>{e.usageLimit}</div>
                  )}
                </div>
                <div style={{ flex: "1 1 160px" }}>
                  <label style={labelStyle}>Son Kullanma Tarihi</label>
                  <input
                    style={inputStyle}
                    name="expiryDate"
                    type="date"
                    value={f.expiryDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {t.expiryDate && e.expiryDate && (
                    <div style={errorStyle}>{e.expiryDate}</div>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={f.isActive}
                  onChange={formik.handleChange}
                />
                <label
                  htmlFor="isActive"
                  style={{ fontSize: "13px", cursor: "pointer" }}
                >
                  Aktif
                </label>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn orange-btn"
                  style={{
                    padding: "7px 20px",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
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
              className="btn orange-btn"
              onClick={() => setShowForm(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              + Yeni Kupon
            </button>
          </div>
        )}

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
                  <th style={{ padding: "8px 12px" }}>Kod</th>
                  <th style={{ padding: "8px 12px" }}>İndirim</th>
                  <th style={{ padding: "8px 12px" }}>Min. Sipariş</th>
                  <th style={{ padding: "8px 12px" }}>Kullanım</th>
                  <th style={{ padding: "8px 12px" }}>Son Tarih</th>
                  <th style={{ padding: "8px 12px" }}>Durum</th>
                  <th style={{ padding: "8px 12px" }}></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c, i) => {
                  const expired = new Date(c.expiryDate) < new Date();
                  const limitReached =
                    c.usageLimit !== null && c.usedCount >= c.usageLimit;
                  return (
                    <tr
                      key={c._id}
                      style={{ borderBottom: "1px solid #f5f5f5" }}
                    >
                      <td style={{ padding: "10px 12px", color: "#bbb" }}>
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontWeight: 700,
                          letterSpacing: 1,
                        }}
                      >
                        {c.code}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {formatDiscount(c)}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#444" }}>
                        {c.minOrderAmount > 0
                          ? `${Number(c.minOrderAmount).toLocaleString("tr-TR")}₺`
                          : "—"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: limitReached ? "#ef4444" : "#444",
                        }}
                      >
                        {c.usedCount}
                        {c.usageLimit !== null ? ` / ${c.usageLimit}` : ""}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: expired ? "#ef4444" : "#444",
                        }}
                      >
                        {new Date(c.expiryDate).toLocaleDateString("tr-TR")}
                        {!expired && (
                          <span style={{ color: "#999", marginLeft: 4 }}>
                            ({daysLeft(c.expiryDate)} gün)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <button
                          onClick={() => handleToggleActive(c)}
                          style={{
                            padding: "2px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            border: "none",
                            cursor: "pointer",
                            background: c.isActive ? "#d1fae5" : "#fee2e2",
                            color: c.isActive ? "#065f46" : "#991b1b",
                            fontWeight: 600,
                          }}
                        >
                          {c.isActive ? "Aktif" : "Pasif"}
                        </button>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div className="d-flex gap-2">
                          <button
                            className="btn orange-btn"
                            onClick={() => handleEdit(c)}
                            style={{
                              padding: "4px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          >
                            Düzenle
                          </button>
                          <button
                            className="btn orange-btn orange-text"
                            onClick={() => handleDelete(c._id, c.code)}
                            style={{ padding: "2px 12px" }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {coupons.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#bbb",
                      }}
                    >
                      Henüz kupon eklenmemiş.
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

export default CouponsPanel;
