import { useEffect, useRef, useState } from "react";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import CampaignCard from "./CampaignCard";
import Loading from "./Loading";
import "../styles/ProductList.css";

function CampaignList({ title = "Diğer Kampanyalarımız", excludeId }) {
  const rowRef = useRef(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/campaigns")
      .then((res) => {
        const now = new Date();
        const active = res.data.filter(
          (c) =>
            c._id !== excludeId &&
            c.isActive &&
            new Date(c.startDate) <= now &&
            new Date(c.endDate) >= now,
        );
        setCampaigns(active);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [excludeId]);

  if (!loading && campaigns.length === 0) return null;

  return (
    <div className="container my-4">
      {title && (
        <div className="chances-bar d-flex justify-content-between align-items-center px-2 mb-2">
          <h2 className="chances-title">{title}</h2>
        </div>
      )}

      <div className="position-relative">
        <button
          className="product-arrow product-arrow-left"
          onClick={() => rowRef.current.scrollBy({ left: -600, behavior: "smooth" })}
        >
          <FaArrowAltCircleLeft />
        </button>

        {loading ? (
          <Loading />
        ) : (
          <div className="row g-3 product-row" ref={rowRef}>
            {campaigns.map((c) => (
              <div key={c._id} className="col-6 col-md-4 col-lg-5-custom">
                <CampaignCard campaign={c} />
              </div>
            ))}
          </div>
        )}

        <button
          className="product-arrow product-arrow-right"
          onClick={() => rowRef.current.scrollBy({ left: 600, behavior: "smooth" })}
        >
          <FaArrowAltCircleRight />
        </button>
      </div>
    </div>
  );
}

export default CampaignList;
