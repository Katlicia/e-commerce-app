import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const STATUS_LABEL = { pending: "Beklemede", answered: "Yanıtlandı" };
const STATUS_COLOR = {
  pending: { background: "#fff3cd", color: "#856404" },
  answered: { background: "#d1e7dd", color: "#0f5132" },
};

function CorporateOffersPanel() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTexts, setReplyTexts] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [markingAnswered, setMarkingAnswered] = useState({});
  const [filter, setFilter] = useState("all");

  const fetchOffers = async () => {
    try {
      const { data } = await axiosInstance.get("/corporate-offers");
      setOffers(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleReply = async (offer) => {
    const text = replyTexts[offer._id]?.trim();
    if (!text) return;
    setSubmitting((s) => ({ ...s, [offer._id]: true }));
    try {
      const { data } = await axiosInstance.patch(
        `/corporate-offers/${offer._id}/reply`,
        { reply: text },
      );
      setOffers((prev) => prev.map((o) => (o._id === data._id ? data : o)));
      setReplyTexts((s) => ({ ...s, [offer._id]: "" }));
    } catch {
      alert("Yanıt gönderilemedi.");
    } finally {
      setSubmitting((s) => ({ ...s, [offer._id]: false }));
    }
  };

  const handleMarkAnswered = async (offer) => {
    setMarkingAnswered((s) => ({ ...s, [offer._id]: true }));
    try {
      const { data } = await axiosInstance.patch(
        `/corporate-offers/${offer._id}/status`,
        { status: "answered" },
      );
      setOffers((prev) => prev.map((o) => (o._id === data._id ? data : o)));
    } catch {
      alert("Durum güncellenemedi.");
    } finally {
      setMarkingAnswered((s) => ({ ...s, [offer._id]: false }));
    }
  };

  const filtered =
    filter === "all" ? offers : offers.filter((o) => o.status === filter);

  const counts = {
    all: offers.length,
    pending: offers.filter((o) => o.status === "pending").length,
    answered: offers.filter((o) => o.status === "answered").length,
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#888" }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h4 style={{ fontWeight: 700, marginBottom: 20, color: "#1a1a1a" }}>
        Kurumsal Teklifler
      </h4>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #e0e0e0" }}>
        {[
          { key: "all", label: "Tümü" },
          { key: "pending", label: "Beklemede" },
          { key: "answered", label: "Yanıtlandı" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              background: "none",
              border: "none",
              borderBottom: filter === tab.key ? "2px solid #ff6a00" : "2px solid transparent",
              color: filter === tab.key ? "#ff6a00" : "#666",
              fontWeight: filter === tab.key ? 700 : 400,
              fontSize: 14,
              padding: "8px 14px",
              cursor: "pointer",
              marginBottom: -1,
            }}
          >
            {tab.label}{" "}
            <span
              style={{
                background: filter === tab.key ? "#ff6a00" : "#e0e0e0",
                color: filter === tab.key ? "#fff" : "#555",
                borderRadius: 99,
                fontSize: 11,
                padding: "1px 7px",
                fontWeight: 600,
              }}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: "#888", textAlign: "center", marginTop: 48 }}>
          Teklif bulunamadı.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((offer) => {
            const statusStyle = STATUS_COLOR[offer.status] || STATUS_COLOR.pending;
            const statusLabel = STATUS_LABEL[offer.status] || offer.status;
            const createdAt = new Date(offer.createdAt).toLocaleDateString("tr-TR");
            const img = offer.product?.images?.[0]?.url;
            const isAnswered = offer.status === "answered";

            return (
              <div
                key={offer._id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
                  padding: 20,
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {img && (
                    <img
                      src={img}
                      alt={offer.product?.name}
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "contain",
                        borderRadius: 8,
                        border: "1px solid #f0f0f0",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ background: "#fff3e0", color: "#e65100", borderRadius: 6, fontSize: 11, fontWeight: 600, padding: "2px 8px" }}>
                        {offer.product?.name || "Ürün silinmiş"}
                      </span>
                      <span style={{ borderRadius: 99, fontSize: 11, fontWeight: 600, padding: "2px 8px", ...statusStyle }}>
                        {statusLabel}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
                      {offer.fullName}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                      {offer.email} &bull; {createdAt}
                    </p>
                  </div>

                  {/* Mark answered button — only when pending */}
                  {!isAnswered && (
                    <button
                      onClick={() => handleMarkAnswered(offer)}
                      disabled={markingAnswered[offer._id]}
                      style={{
                        flexShrink: 0,
                        background: "#e9ecef",
                        color: "#495057",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 13px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: markingAnswered[offer._id] ? 0.5 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {markingAnswered[offer._id] ? "..." : "Yanıtlandı İşaretle"}
                    </button>
                  )}
                </div>

                {/* Customer message */}
                {offer.message && (
                  <p style={{ margin: "12px 0 0", fontSize: 13, color: "#444", borderLeft: "3px solid #dee2e6", paddingLeft: 10, fontStyle: "italic" }}>
                    {offer.message}
                  </p>
                )}

                {/* Existing reply */}
                {offer.reply && (
                  <div style={{ marginTop: 12, borderLeft: "3px solid #ff6a00", paddingLeft: 12 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: "#ff6a00" }}>
                      Admin Yanıtı
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "#222" }}>
                      {offer.reply}
                    </p>
                  </div>
                )}

                {/* Reply input — hidden when answered */}
                {!isAnswered && (
                  <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <textarea
                      rows={2}
                      placeholder="Yanıt yaz..."
                      value={replyTexts[offer._id] || ""}
                      onChange={(e) =>
                        setReplyTexts((s) => ({ ...s, [offer._id]: e.target.value }))
                      }
                      style={{
                        flex: 1,
                        borderRadius: 8,
                        border: "1px solid #e0e0e0",
                        padding: "8px 12px",
                        fontSize: 13,
                        resize: "none",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    <button
                      onClick={() => handleReply(offer)}
                      disabled={submitting[offer._id] || !replyTexts[offer._id]?.trim()}
                      style={{
                        background: "#ff6a00",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 18px",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        opacity: submitting[offer._id] || !replyTexts[offer._id]?.trim() ? 0.5 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {submitting[offer._id] ? "..." : "Yanıtla"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CorporateOffersPanel;
