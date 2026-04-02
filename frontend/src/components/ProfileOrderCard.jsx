import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cancelOrder } from "../redux/orderSlice";
import { addToCartWithSync } from "../redux/cartSlice";
import {
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";

function ProfileOrderCard({ order, onDetailClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleReorder = () => {
    order.items.forEach(({ product, quantity }) => {
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCartWithSync(product));
      }
    });
    navigate("/checkout");
  };

  const images =
    order.items
      ?.map((item) => item.product?.images?.[0]?.url)
      .filter(Boolean) ?? [];
  const extraCount = Math.max(0, images.length - 4);
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        weekday: "long",
      })
    : "";

  return (
    <div className="order-card">
      <div className="order-card-header" onClick={() => setOpen((v) => !v)}>
        <div>
          <p className="order-meta-label mb-0">Tarih</p>
          <p className="order-meta-value mb-0">{date}</p>
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
            {Number(order.totalAmount).toFixed(2)}₺
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
              {images.slice(0, 4).map((url, i) => (
                <img key={i} src={url} alt="" className="order-product-img" />
              ))}
              {extraCount > 0 && (
                <span className="fw-semibold text-muted">+{extraCount}</span>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2"
                style={{ fontSize: "0.82rem" }}
                onClick={handleReorder}
              >
                <FiRefreshCw size={14} />
                Siparişi Tekrarla
              </button>
              <button
                className="btn rounded-pill d-flex align-items-center gap-2"
                style={{
                  fontSize: "0.82rem",
                  backgroundColor:
                    order.status === "Hazırlanıyor" ? "#ff7700" : "#ccc",
                  color: "white",
                }}
                disabled={order.status !== "Hazırlanıyor"}
                onClick={() => dispatch(cancelOrder(order._id))}
              >
                <FiXCircle size={16} />
                Siparişi İptal Et
              </button>
              <div
                className="d-flex flex-column align-items-center text-muted"
                role="button"
                style={{ fontSize: "0.75rem", gap: 2 }}
                onClick={onDetailClick}
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
