import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";

function CampaignCard({ campaign }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!campaign.coupon?.code) return;
    navigator.clipboard.writeText(campaign.coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      onClick={() => navigate(`/campaigns/${campaign._id}`)}
      style={{
        border: "1px solid #f0f0f0",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#fff",
        cursor: "pointer",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        if (campaign.products?.length > 0)
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {campaign.image?.url ? (
        <img
          src={campaign.image.url}
          alt={campaign.title}
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#bbb",
            fontSize: "13px",
          }}
        >
          Görsel yok
        </div>
      )}

      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: "15px",
            color: "#212529",
            marginBottom: "8px",
            lineHeight: 1.35,
          }}
        >
          {campaign.title}
        </div>

        {campaign.coupon?.code && (
          <button
            onClick={handleCopy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: copied ? "#2e7d32" : "#1565c0",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {copied ? (
              <IoCheckmarkOutline size={15} />
            ) : (
              <IoCopyOutline size={15} />
            )}
            {campaign.coupon.code}
          </button>
        )}

        <div style={{ marginTop: "8px", fontSize: "11px", color: "#bbb" }}>
          {new Date(campaign.startDate).toLocaleDateString("tr-TR")} —{" "}
          {new Date(campaign.endDate).toLocaleDateString("tr-TR")}
        </div>
      </div>
    </div>
  );
}

export default CampaignCard;
