import { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";

function ProfileOrderCard({ order }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="order-card">
      <div className="order-card-header" onClick={() => setOpen((v) => !v)}>
        <div>
          <p className="order-meta-label mb-0">Tarih</p>
          <p className="order-meta-value mb-0">{order.date}</p>
        </div>
        <div>
          <p className="order-meta-label mb-0">Sipariş No</p>
          <p className="order-meta-value mb-0">{order.orderNo}</p>
        </div>
        <div>
          <p className="order-meta-label mb-0">Sipariş Durumu</p>
          <p className="order-meta-value mb-0">{order.status}</p>
        </div>
        <div>
          <p className="order-meta-label mb-0">Toplam Tutar</p>
          <p className="order-meta-value mb-0 orange-text">
            {order.total.toFixed(2)}₺
          </p>
        </div>
        {open ? (
          <FiChevronUp size={18} className="text-muted" />
        ) : (
          <FiChevronDown size={18} className="text-muted" />
        )}
      </div>

      <div className={`order-card-body${open ? " open" : ""}`}>
        <div className="order-card-body-inner">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2">
              {order.images.slice(0, 4).map((url, i) => (
                <img key={i} src={url} alt="" className="order-product-img" />
              ))}
              {order.extraCount > 0 && (
                <span className="fw-semibold text-muted">
                  +{order.extraCount}
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2"
                style={{ fontSize: "0.82rem" }}
              >
                <FiRefreshCw size={14} />
                Siparişi Tekrarla
              </button>
              <button
                className="btn rounded-pill d-flex align-items-center gap-2"
                style={{
                  fontSize: "0.82rem",
                  backgroundColor: "#ff7700",
                  color: "white",
                }}
              >
                <FiXCircle size={14} />
                Siparişi İptal Et
              </button>
              <div
                className="d-flex flex-column align-items-center text-muted"
                role="button"
                style={{ fontSize: "0.75rem", gap: 2 }}
              >
                <FiEye size={18} />
                Detay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileOrderCard;
