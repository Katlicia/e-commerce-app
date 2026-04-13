import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Loading from "../components/Loading";
import CampaignCard from "../components/CampaignCard";

function CampaignPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    axiosInstance
      .get("/campaigns")
      .then((res) => {
        const now = new Date();
        const active = res.data.filter(
          (c) =>
            c.isActive &&
            new Date(c.startDate) <= now &&
            new Date(c.endDate) >= now,
        );
        setCampaigns(active);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-4">
      <nav style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>
        <Link to="/" style={{ color: "#999", textDecoration: "none" }}>
          Ana Sayfa
        </Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <span style={{ color: "#212529" }}>Kampanyalar</span>
      </nav>

      <h4 className="fw-bold mb-4">Kampanyalar</h4>

      {loading ? (
        <Loading />
      ) : campaigns.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="fs-5">Aktif kampanya bulunamadı.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {campaigns.map((c) => (
            <div className="col" key={c._id}>
              <CampaignCard campaign={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CampaignPage;
