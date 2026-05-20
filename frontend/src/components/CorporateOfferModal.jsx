import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../utils/axiosInstance";
import briefcaseIcon from "../assets/ProductDetails/briefcase.svg";

export default function CorporateOfferModal({ open, onClose, product }) {
  const { user } = useSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open) {
      setFullName(
        user?.name && user?.surname ? `${user.name} ${user.surname}` : "",
      );
      setEmail(user?.email || "");
      setMessage("");
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg("Ad Soyad ve e-posta alanları zorunludur.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await axiosInstance.post("/corporate-offers", {
        productId: product._id,
        fullName: fullName.trim(),
        email: email.trim(),
        message: message.trim(),
      });
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

  const inputStyle = {
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid #dee2e6",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    marginBottom: 10,
    color: "#222",
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
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth: 440,
          margin: "0 16px",
          maxHeight: "90vh",
          overflowY: "auto",
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

        <div className="d-flex align-items-center gap-2 mb-4">
          <img src={briefcaseIcon} alt="Briefcase" style={{ width: 22, height: 22 }} />
          <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Kurumsal Teklif</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              ...inputStyle,
              background: "#f5f5f5",
              color: "#7b7b7b",
              marginBottom: 10,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product?.name}
          </div>

          <input
            type="text"
            placeholder="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            type="email"
            placeholder="E-posta Adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />

          <textarea
            placeholder="Mesajınız (isteğe bağlı)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <p style={{ fontSize: 13, color: "#6c757d", textAlign: "center", marginBottom: 16 }}>
            Talebiniz yanıtlandığında e-posta alacaksınız.
          </p>

          {errorMsg && (
            <p style={{ fontSize: 12, color: "#f83b0a", marginBottom: 10, textAlign: "center" }}>
              {errorMsg}
            </p>
          )}

          {success ? (
            <p style={{ fontSize: 14, color: "#37a446", fontWeight: 700, textAlign: "center", padding: "12px 0" }}>
              ✓ Talebiniz alındı!
            </p>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="btn rounded-pill w-100"
              style={{
                background: "#f83b0a",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                padding: "12px 0",
              }}
            >
              {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
