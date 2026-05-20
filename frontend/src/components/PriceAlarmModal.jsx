import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import bellIcon from "../assets/ProductDetails/bell.svg";

export default function PriceAlarmModal({ open, onClose, product, hasAlarm, onAlarmChange }) {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open) {
      setSuccess(false);
      setErrorMsg("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  async function handleSetAlarm() {
    setLoading(true);
    setErrorMsg("");
    try {
      await axiosInstance.post("/price-alarms", { productId: product._id });
      onAlarmChange(true);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveAlarm() {
    setLoading(true);
    setErrorMsg("");
    try {
      await axiosInstance.delete(`/price-alarms/${product._id}`);
      onAlarmChange(false);
      onClose();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const userEmail = user?.email || null;

  const renderBody = () => {
    if (!user) {
      return (
        <>
          <p style={{ fontSize: 13, color: "#6c757d", lineHeight: 1.7, marginBottom: 20 }}>
            Fiyat alarmı kurabilmek için{" "}
            <Link to="/login" style={{ color: "#ff7700", fontWeight: 600 }}>
              giriş yapın
            </Link>
            .
          </p>
        </>
      );
    }

    if (!userEmail) {
      return (
        <p style={{ fontSize: 13, color: "#6c757d", lineHeight: 1.7, marginBottom: 20 }}>
          Fiyat alarmı kurabilmek için hesabınıza bir e-posta adresi eklemeniz gerekmektedir.
        </p>
      );
    }

    return (
      <>
        <p style={{ fontSize: 13, color: "#495057", lineHeight: 1.7, marginBottom: 20 }}>
          Ürünün fiyatı düşünce{" "}
          <strong style={{ color: "#ff7700" }}>{userEmail}</strong>{" "}
          adresinize bildirim göndereceğiz.
        </p>

        {errorMsg && (
          <p style={{ fontSize: 12, color: "#f83b0a", marginBottom: 12 }}>{errorMsg}</p>
        )}

        {success ? (
          <p style={{ fontSize: 14, color: "#37a446", fontWeight: 700 }}>
            ✓ Fiyat alarmı kuruldu!
          </p>
        ) : (
          <button
            onClick={hasAlarm ? handleRemoveAlarm : handleSetAlarm}
            disabled={loading}
            className="btn rounded-pill w-100"
            style={{
              background: hasAlarm ? "#e9ecef" : "#f83b0a",
              color: hasAlarm ? "#495057" : "#fff",
              fontWeight: 700,
              fontSize: 14,
              padding: "12px 0",
            }}
          >
            {loading
              ? "İşleniyor..."
              : hasAlarm
              ? "Alarmı Kaldır"
              : "Fiyat Alarmı Kur"}
          </button>
        )}
      </>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: 16,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 400,
          margin: "0 16px",
          textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 22,
            color: "#adb5bd",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Fiyat Alarmı</p>

        <img src={bellIcon} alt="Bell" style={{ width: 64, height: 64, marginBottom: 16 }} />

        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 12,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product?.name}
        </p>

        {renderBody()}
      </div>
    </div>
  );
}
