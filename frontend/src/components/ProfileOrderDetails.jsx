import { useState } from "react";
import "../styles/ProfileOrderDetails.css";
import restockIcon from "../assets/Profile/restock.svg";
import pdfIcon from "../assets/Profile/pdf.svg";
import OrderSummary from "./OrderSummary";
import orderIcon from "../assets/Profile/order.svg";
import paymentIcon from "../assets/Profile/payment.svg";
import readyIcon from "../assets/Profile/ready.svg";
import cargoIcon from "../assets/Profile/cargo.svg";
import checkIcon from "../assets/Profile/check.svg";
import { cancelOrder, returnOrder, cancelPayment, refundPayment } from "../redux/orderSlice";
import { useDispatch, useSelector } from "react-redux";
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
  const dispatch = useDispatch();
  const { handleReorder } = useReorder();

  const liveOrder =
    useSelector((state) => state.order.orders.find((o) => o._id === order._id)) ||
    order;
  const { error } = useSelector((state) => state.order);

  const [actionLoading, setActionLoading] = useState(false);

  const currentIndex = STATUS_INDEX[liveOrder.status] ?? 2;
  const isActive = (i) => currentIndex !== -1 && i <= currentIndex;

  const handleCancel = async () => {
    setActionLoading(true);
    const action = liveOrder.paymentId ? cancelPayment : cancelOrder;
    await dispatch(action(liveOrder._id)).unwrap().catch(() => {});
    setActionLoading(false);
  };

  const handleReturn = async () => {
    setActionLoading(true);
    const action = liveOrder.paymentTransactionId ? refundPayment : returnOrder;
    await dispatch(action(liveOrder._id)).unwrap().catch(() => {});
    setActionLoading(false);
  };

  return (
    <div className="container">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h4 className="fw-bold mb-0">{liveOrder.orderNo} nolu siparişiniz</h4>
        <div className="d-flex gap-2">
          <button
            className="btn buttons flex-grow-1"
            onClick={() => handleReorder(liveOrder)}
          >
            <div className="d-flex justify-content-center align-items-center gap-2">
              <img src={restockIcon} width={20} alt="Restock" />
              Siparişi Tekrarla
            </div>
          </button>
          {(liveOrder.status === "Hazırlanıyor" ||
            liveOrder.status === "Teslim Edildi") && (
            <button
              className="btn buttons flex-grow-1"
              disabled={actionLoading}
              onClick={
                liveOrder.status === "Hazırlanıyor" ? handleCancel : handleReturn
              }
            >
              {actionLoading
                ? "İşleniyor..."
                : liveOrder.status === "Hazırlanıyor"
                  ? "Siparişi İptal Et"
                  : "Siparişi İade Et"}
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
        </div>
      )}
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
                <div style={{ minWidth: 0 }}>
                  <p
                    className="mb-1 fw-semibold"
                    style={{
                      fontSize: "0.9rem",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.product?.name}
                  </p>
                  {item.selectedVariants &&
                    Object.keys(item.selectedVariants).length > 0 && (
                      <div className="d-flex flex-wrap gap-1">
                        {Object.entries(item.selectedVariants).map(
                          ([label, value]) => (
                            <span
                              key={label}
                              style={{
                                fontSize: "0.72rem",
                                padding: "2px 8px",
                                borderRadius: 4,
                                background: "#f5f5f5",
                                border: "1px solid #e0e0e0",
                                color: "#555",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {label}: {value}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                </div>
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
