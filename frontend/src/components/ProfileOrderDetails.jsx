import "../styles/ProfileOrderDetails.css";
import restockIcon from "../assets/Profile/restock.svg";
import pdfIcon from "../assets/Profile/pdf.svg";
import OrderSummary from "./OrderSummary";
import orderIcon from "../assets/Profile/order.svg";
import paymentIcon from "../assets/Profile/payment.svg";
import readyIcon from "../assets/Profile/ready.svg";
import cargoIcon from "../assets/Profile/cargo.svg";
import checkIcon from "../assets/Profile/check.svg";
import { cancelOrder, returnOrder } from "../redux/orderSlice";
import { useDispatch } from "react-redux";
import { useReorder } from "../hooks/useReorder";

const STEPS = [
  { label: "Sipariş Alındı", icon: orderIcon },
  { label: "Ödeme Onaylandı", icon: paymentIcon },
  { label: "Hazırlanıyor", icon: readyIcon },
  { label: "Kargoya Verildi", icon: cargoIcon },
  { label: "Teslim Edildi", icon: checkIcon },
];

const STATUS_INDEX = {
  Hazırlanıyor: 2,
  "Kargoya Verildi": 3,
  "Teslim Edildi": 4,
  "İptal Edildi": -1,
  "İade Edildi": 4,
};

function ProfileOrderDetails({ order }) {
  const currentIndex = STATUS_INDEX[order.status] ?? 2;
  const isActive = (i) => currentIndex !== -1 && i <= currentIndex;

  const dispatch = useDispatch();

  const { handleReorder } = useReorder();

  return (
    <div className="container">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h4 className="fw-bold mb-0">{order.orderNo} nolu siparişiniz</h4>
        <div className="d-flex gap-2">
          <button
            className="btn buttons flex-grow-1"
            onClick={() => handleReorder(order)}
          >
            <div className="d-flex justify-content-center align-items-center gap-2">
              <img src={restockIcon} width={20} alt="Restock" />
              Siparişi Tekrarla
            </div>
          </button>
          {(order.status === "Hazırlanıyor" ||
            order.status === "Teslim Edildi") && (
            <button
              className="btn buttons flex-grow-1"
              onClick={() =>
                order.status === "Hazırlanıyor"
                  ? dispatch(cancelOrder(order._id))
                  : dispatch(returnOrder(order._id))
              }
            >
              {order.status === "Hazırlanıyor"
                ? "Siparişi İptal Et"
                : "Siparişi İade Et"}
            </button>
          )}
        </div>
      </div>
      <div className="mb-4 mt-2" style={{ overflowX: "auto" }}>
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ minWidth: 480 }}
        >
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="d-flex align-items-center"
              style={{ flex: i < STEPS.length - 1 ? 1 : "none" }}
            >
              <div
                className="d-flex flex-column align-items-center gap-1"
                style={{ overflowX: "hidden" }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: isActive(i) ? "#ff7700" : "#e0e0e0",
                    flexShrink: 0,
                  }}
                >
                  <img src={step.icon} width={24} alt={step.label} />
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                    color: isActive(i) ? "#ff7700" : "#aaa",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    margin: "0 4px",
                    marginBottom: 18,
                    borderTop: `2px dashed ${isActive(i + 1) ? "#ff7700" : "#e0e0e0"}`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="order-info-card p-3">
        <div className="d-flex flex-wrap gap-4 align-items-center justify-content-between">
          <div>
            <p className="mb-1" style={{ fontSize: "0.8rem" }}>
              Tarih
            </p>
            <p className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
              {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
          <div>
            <p className="mb-1" style={{ fontSize: "0.8rem" }}>
              Sipariş No
            </p>
            <p className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
              {order.orderNo}
            </p>
          </div>
          <div>
            <p className="mb-1" style={{ fontSize: "0.8rem" }}>
              Sipariş Durumu
            </p>
            <p className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
              {order.status}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2" role="button">
            <img src={pdfIcon} width={32} alt="PDF" />
            <span style={{ fontSize: "0.9rem" }}>Fatura Görüntüle</span>
          </div>
        </div>

        <div className="mt-3 d-flex flex-column">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="d-flex align-items-center justify-content-between py-3"
              style={{ borderBottom: "1px solid #e7e7e7" }}
            >
              <div
                className="d-flex align-items-center gap-3"
                style={{ width: "55%", minWidth: 0 }}
              >
                <img
                  src={item.product?.images?.[0]?.url}
                  alt={item.product?.name}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
                <p
                  className="mb-0 fw-semibold"
                  style={{
                    fontSize: "0.9rem",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.product?.name}
                </p>
              </div>
              <p
                className="mb-0 fw-semibold text-center"
                style={{ fontSize: "0.9rem", width: "20%", flexShrink: 0 }}
              >
                {item.quantity} Adet
              </p>
              <div className="text-end">
                <p
                  className="mb-0 fw-bold orange-text"
                  style={{ fontSize: "0.9rem" }}
                >
                  {Number(item.price).toFixed(2)}₺
                </p>
                <p
                  className="mb-0 fw-semibold text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  K.D.V Dahil
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-center justify-content-sm-end w-100">
          <div className="mt-5 w-100" style={{ maxWidth: 320 }}>
            <OrderSummary order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileOrderDetails;
