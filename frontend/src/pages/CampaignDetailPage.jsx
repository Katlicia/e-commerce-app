import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Loading from "../components/Loading";
import CampaignList from "../components/CampaignList";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";
import clockIcon from "../assets/Campaigns/clock.svg";

function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    axiosInstance
      .get(`/campaigns/${id}`)
      .then((res) => setCampaign(res.data))
      .catch(() => navigate("/campaigns"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    if (!campaign?.coupon?.code) return;
    navigator.clipboard.writeText(campaign.coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading)
    return (
      <div className="container py-5">
        <Loading />
      </div>
    );
  if (!campaign) return null;

  return (
    <>
      <div className="container py-4">
        <nav style={{ fontSize: "13px", color: "#999", marginBottom: "20px" }}>
          <Link to="/" style={{ color: "#999", textDecoration: "none" }}>
            Ana Sayfa
          </Link>
          <span style={{ margin: "0 6px" }}>/</span>
          <Link
            to="/campaigns"
            style={{ color: "#999", textDecoration: "none" }}
          >
            Kampanyalar
          </Link>
          <span style={{ margin: "0 6px" }}>/</span>
          <span style={{ color: "#212529" }}>{campaign.title}</span>
        </nav>

        <div className="row g-4 mb-5">
          <div className="col-12 col-lg-6">
            <div className="d-flex flex-column">
              {campaign.image?.url ? (
                <img
                  src={campaign.image.url}
                  alt={campaign.title}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4/3",
                    background: "#f5f5f5",
                    borderRadius: "12px",
                  }}
                />
              )}
              <div className="mt-5">
                <div className="pd-timer-banner border">
                  <div className="d-flex">
                    <img src={clockIcon} alt="Stars" />
                    <div className="d-flex flex-column pd-timer-label ms-2">
                      <span
                        className="star-header"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Günün Yıldızları!
                      </span>{" "}
                      <span style={{ color: "#424040", fontSize: "0.7rem" }}>
                        Acele Et, Fırsatları Kaçırma!
                      </span>
                    </div>
                  </div>
                  <span className="pd-timer-value text-center  border p-3 rounded w-100">
                    {new Date(campaign.startDate).toLocaleDateString("tr-TR")} —{" "}
                    {new Date(campaign.endDate).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <h4 className="fw-bold mb-3" style={{ lineHeight: 1.3 }}>
              {campaign.title}
            </h4>

            {campaign.products?.length > 0 && (
              <button
                className="btn mb-4"
                onClick={() => navigate(`/products?campaign=${campaign._id}`)}
                style={{
                  background: "#ff6a00",
                  color: "#fff",
                  fontWeight: 700,
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                }}
              >
                HEMEN AL &nbsp;→
              </button>
            )}

            {campaign.description && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#444",
                  lineHeight: 1.6,
                  marginBottom: "20px",
                }}
              >
                {campaign.description}
              </p>
            )}

            {campaign.coupon?.code && (
              <div className="mb-4">
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  Kupon Kullanımı
                </div>
                <ol
                  style={{
                    paddingLeft: "15px",
                    margin: 0,
                    fontSize: "13px",
                    color: "#555",
                  }}
                >
                  <li>Üye girişi yapın.</li>
                  <li>
                    Sepetinize {campaign.coupon?.minOrderAmount} TL ve üzeri
                    ürün ekleyin.
                  </li>
                  <li>
                    Sepetinizin üst kısmında ki alandan indirimi uygula butonuna
                    basın.
                  </li>
                  <li>İndirimin toplam tutardan düştüğünü göreceksiniz.</li>
                </ol>
              </div>
            )}

            {campaign.coupon?.code && (
              <button
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "1px solid black",
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  cursor: "pointer",
                  color: copied ? "#2e7d32" : "#F83B0A",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  transition: "background 0.15s",
                }}
              >
                {campaign.coupon.code}
                {copied ? (
                  <IoCheckmarkOutline size={18} />
                ) : (
                  <IoCopyOutline size={18} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <CampaignList excludeId={id} />
    </>
  );
}

export default CampaignDetailPage;
