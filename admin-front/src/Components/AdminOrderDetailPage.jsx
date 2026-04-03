import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { adminGetOrders, adminUpdateOrderStatus } from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";
import "../styles/AdminPage.css";

const STATUS_OPTIONS = [
  "Hazırlanıyor",
  "Kargoya Verildi",
  "Teslim Edildi",
  "İptal Edildi",
  "İade Edildi",
];

const STATUS_BADGE = {
  Hazırlanıyor: "bg-warning text-dark",
  "Kargoya Verildi": "bg-primary",
  "Teslim Edildi": "bg-success",
  "İptal Edildi": "bg-danger",
  "İade Edildi": "bg-secondary",
};

function AdminOrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state) => state.admin);

  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    if (orders.length === 0) dispatch(adminGetOrders());
  }, []);

  const order = orders.find((o) => o._id === id);

  useEffect(() => {
    if (order) setEditStatus(order.status);
  }, [order]);

  const handleSave = () => {
    dispatch(adminUpdateOrderStatus({ id, status: editStatus })).then(() =>
      dispatch(addNotification({ message: "Sipariş durumu güncellendi." })),
    );
  };

  if (loading || !order) {
    return (
      <div className="admin-page">
        <div className="container">
          <p className="text-muted">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="admin-page">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/admin/orders")}
          >
            ← Geri
          </button>
          <h4 className="fw-bold mb-0">Sipariş Detayı</h4>
          <span
            className={`badge ${STATUS_BADGE[order.status]} admin-badge ms-1`}
          >
            {order.status}
          </span>
        </div>

        <div className="row g-4">
          {/* Sol kolon */}
          <div className="col-12 col-lg-7">
            {/* Ürünler */}
            <div className="admin-form-card mb-4">
              <h6 className="fw-bold mb-3">Ürünler</h6>
              <div className="d-flex flex-column gap-3">
                {order.items.map((item, i) => (
                  <div key={i} className="d-flex align-items-center gap-3">
                    <img
                      src={item.product?.images?.[0]?.url}
                      alt={item.product?.name}
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "contain",
                        border: "1px solid #dee2e6",
                        borderRadius: 8,
                        background: "#f8f9fa",
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex-grow-1">
                      <p
                        className="mb-0 fw-semibold"
                        style={{ fontSize: "0.875rem" }}
                      >
                        {item.product?.name || "Ürün silinmiş"}
                      </p>
                      <p
                        className="mb-0 text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {item.quantity} adet × {Number(item.price).toFixed(2)}₺
                      </p>
                    </div>
                    <span
                      className="fw-semibold"
                      style={{ fontSize: "0.875rem", flexShrink: 0 }}
                    >
                      {(item.quantity * item.price).toFixed(2)}₺
                    </span>
                  </div>
                ))}
              </div>
              <hr className="my-3" />
              <div className="d-flex justify-content-between">
                <span className="text-muted">Ürünler Toplamı</span>
                <span className="fw-semibold">{itemsTotal.toFixed(2)}₺</span>
              </div>
              {order.cargoPrice > 0 && (
                <div className="d-flex justify-content-between mt-1">
                  <span className="text-muted">Kargo</span>
                  <span className="fw-semibold">
                    {Number(order.cargoPrice).toFixed(2)}₺
                  </span>
                </div>
              )}
              <div className="d-flex justify-content-between mt-1">
                <span className="fw-bold">Toplam</span>
                <span className="fw-bold orange-text">
                  {(itemsTotal + (order.cargoPrice || 0)).toFixed(2)}₺
                </span>
              </div>
            </div>

            {/* Teslimat adresi */}
            <div className="admin-form-card">
              <h6 className="fw-bold mb-3">Teslimat Adresi</h6>
              <p className="mb-1 fw-semibold">{order.address.fullName}</p>
              <p className="mb-1 text-muted">{order.address.phone}</p>
              <p className="mb-1">{order.address.address}</p>
              <p className="mb-0 text-muted">
                {order.address.district} / {order.address.city}
              </p>
            </div>
          </div>

          {/* Sağ kolon */}
          <div className="col-12 col-lg-5 d-flex flex-column gap-4">
            {/* Sipariş bilgileri */}
            <div className="admin-form-card">
              <h6 className="fw-bold mb-3">Sipariş Bilgileri</h6>
              <div
                className="d-flex flex-column gap-2"
                style={{ fontSize: "0.875rem" }}
              >
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Sipariş No</span>
                  <span className="fw-semibold">{order.orderNo}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tarih</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Müşteri</span>
                  <span>
                    {order.user
                      ? `${order.user.name} ${order.user.surname}`
                      : order.guestEmail || "-"}
                  </span>
                </div>
                {order.user?.email && (
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">E-posta</span>
                    <span>{order.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Kargo bilgileri */}
            <div className="admin-form-card">
              <h6 className="fw-bold mb-3">Kargo Bilgileri</h6>
              <div
                className="d-flex flex-column gap-2"
                style={{ fontSize: "0.875rem" }}
              >
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Kargo Şirketi</span>
                  <span className="fw-semibold">
                    {order.cargoCompany || "-"}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Kargo Ücreti</span>
                  <span>
                    {order.cargoPrice === 0 ? (
                      <span className="text-success fw-semibold">Ücretsiz</span>
                    ) : (
                      `${Number(order.cargoPrice).toFixed(2)}₺`
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-form-card">
              <h6 className="fw-bold mb-3">Sipariş Durumu</h6>
              <select
                className="form-select mb-3"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn orange-btn px-4"
                  onClick={handleSave}
                  disabled={editStatus === order.status}
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailPage;
