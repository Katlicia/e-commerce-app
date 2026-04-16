import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminGetOrders, adminUpdateOrderStatus } from "../redux/adminSlice";
import { addNotification } from "../redux/notificationSlice";

const STATUS_OPTIONS = [
  "Hazırlanıyor",
  "Kargoya Verildi",
  "Teslim Edildi",
  "İptal Edildi",
  "İade Edildi",
];

const STATUS_BADGE = {
  Hazırlanıyor: { background: "#fff3e0", color: "#e65100" },
  "Kargoya Verildi": { background: "#e3f2fd", color: "#1565c0" },
  "Teslim Edildi": { background: "#e8f5e9", color: "#2e7d32" },
  "İptal Edildi": { background: "#ffebee", color: "#c62828" },
  "İade Edildi": { background: "#f3e5f5", color: "#6a1b9a" },
};

function OrderDetailModal({ order, onClose }) {
  const dispatch = useDispatch();
  const [editStatus, setEditStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(
        adminUpdateOrderStatus({ id: order._id, status: editStatus }),
      ).unwrap();
      dispatch(addNotification({ message: "Sipariş durumu güncellendi." }));
    } catch {
      dispatch(
        addNotification({
          message: "Sipariş durumu güncellenemedi.",
          type: "error",
        }),
      );
    }
    setSaving(false);
    onClose();
  };

  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const badge = STATUS_BADGE[order.status] || {
    background: "#f5f5f5",
    color: "#666",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 1,
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <span style={{ fontWeight: 700, fontSize: "16px" }}>
              Sipariş Detayı
            </span>
            <span style={{ fontSize: "12px", color: "#999" }}>
              {order.orderNo}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "2px 10px",
                borderRadius: "20px",
                ...badge,
              }}
            >
              {order.status}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              color: "#999",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: "24px",
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "1 1 340px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                Ürünler
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {order.items.map((item, i) => (
                  <div key={i} className="d-flex align-items-center gap-3">
                    <img
                      src={item.product?.images?.[0]?.url}
                      alt={item.product?.name}
                      style={{
                        width: 52,
                        height: 52,
                        objectFit: "contain",
                        border: "1px solid #eee",
                        borderRadius: 8,
                        background: "#fafafa",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>
                        {item.product?.name || "Ürün silinmiş"}
                      </div>
                      {item.selectedVariants &&
                        Object.keys(item.selectedVariants).length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                              marginTop: "4px",
                            }}
                          >
                            {Object.entries(item.selectedVariants).map(
                              ([label, value]) => (
                                <span
                                  key={label}
                                  style={{
                                    fontSize: "11px",
                                    padding: "1px 7px",
                                    borderRadius: "4px",
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
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        {item.quantity} adet × {Number(item.price).toFixed(2)}₺
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {(item.quantity * item.price).toFixed(2)}₺
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  borderTop: "1px solid #f0f0f0",
                  marginTop: "12px",
                  paddingTop: "12px",
                }}
              >
                <div
                  className="d-flex justify-content-between"
                  style={{
                    fontSize: "13px",
                    color: "#999",
                    marginBottom: "4px",
                  }}
                >
                  <span>Ürünler Toplamı</span>
                  <span>{itemsTotal.toFixed(2)}₺</span>
                </div>
                {order.cargoPrice > 0 && (
                  <div
                    className="d-flex justify-content-between"
                    style={{
                      fontSize: "13px",
                      color: "#999",
                      marginBottom: "4px",
                    }}
                  >
                    <span>Kargo</span>
                    <span>{Number(order.cargoPrice).toFixed(2)}₺</span>
                  </div>
                )}
                {order.coupon?.discount > 0 && (
                  <div
                    className="d-flex justify-content-between"
                    style={{
                      fontSize: "13px",
                      color: "#2e7d32",
                      marginBottom: "4px",
                    }}
                  >
                    <span>Kupon ({order.coupon.code})</span>
                    <span>-{Number(order.coupon.discount).toFixed(2)}₺</span>
                  </div>
                )}
                <div
                  className="d-flex justify-content-between"
                  style={{ fontSize: "14px", fontWeight: 700 }}
                >
                  <span>Toplam</span>
                  <span style={{ color: "#ff6a00" }}>
                    {(order.totalAmount + (order.cargoPrice || 0)).toFixed(2)}₺
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "13px",
                  marginBottom: "10px",
                }}
              >
                Teslimat Adresi
              </div>
              <div
                style={{ fontSize: "13px", lineHeight: "1.8", color: "#444" }}
              >
                <div style={{ fontWeight: 600 }}>{order.address.fullName}</div>
                <div style={{ color: "#999" }}>{order.address.phone}</div>
                <div>{order.address.address}</div>
                <div style={{ color: "#999" }}>
                  {order.address.district} / {order.address.city}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              flex: "1 1 220px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "13px",
                  marginBottom: "10px",
                }}
              >
                Sipariş Bilgileri
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                }}
              >
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#999" }}>Sipariş No</span>
                  <span style={{ fontWeight: 600 }}>{order.orderNo}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#999" }}>Tarih</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#999" }}>Müşteri</span>
                  <span>
                    {order.user
                      ? `${order.user.name} ${order.user.surname}`
                      : order.guestEmail || "-"}
                  </span>
                </div>
                {order.user?.email && (
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "#999" }}>E-posta</span>
                    <span>{order.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "13px",
                  marginBottom: "10px",
                }}
              >
                Kargo Bilgileri
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                }}
              >
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#999" }}>Kargo Şirketi</span>
                  <span style={{ fontWeight: 600 }}>
                    {order.cargoCompany || "-"}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#999" }}>Kargo Ücreti</span>
                  <span>
                    {order.cargoPrice === 0 ? (
                      <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                        Ücretsiz
                      </span>
                    ) : (
                      `${Number(order.cargoPrice).toFixed(2)}₺`
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "13px",
                  marginBottom: "10px",
                }}
              >
                Sipariş Durumu
              </div>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  outline: "none",
                  background: "#fff",
                  marginBottom: "10px",
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                className="btn orange-btn"
                onClick={handleSave}
                disabled={saving || editStatus === order.status}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  opacity: editStatus === order.status ? 0.5 : 1,
                }}
              >
                {saving ? "Kaydediliyor..." : "Güncelle"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.admin.orders);
  const loading = useSelector((state) => state.admin.loading);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);

  useEffect(() => {
    if (orders.length === 0) dispatch(adminGetOrders());
  }, []);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.orderNo?.toLowerCase().includes(q) ||
      o.user?.name.toLowerCase().includes(q) ||
      o.guestEmail?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4">
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center fw-bold mb-4 h3">
          <span>Siparişler</span>
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#999" }}>
            {filtered.length} sipariş
          </span>
        </div>

        <div className="d-flex gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Sipariş veya kişi ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
              background: "#fff",
              minWidth: "160px",
            }}
          >
            <option value="">Tüm Durumlar</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ color: "#999", fontSize: "14px" }}>Yükleniyor...</div>
        ) : (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #f0f0f0",
                    color: "#999",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "8px 12px" }}>#</th>
                  <th style={{ padding: "8px 12px" }}>Sipariş No</th>
                  <th style={{ padding: "8px 12px" }}>Sipariş Eden</th>
                  <th style={{ padding: "8px 12px" }}>Sipariş Durumu</th>
                  <th style={{ padding: "8px 12px" }}>Tutar</th>
                  <th style={{ padding: "8px 12px" }}>Kargo</th>
                  <th style={{ padding: "8px 12px" }}>Adres</th>
                  <th style={{ padding: "8px 12px" }}>Sipariş Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const badge = STATUS_BADGE[order.status] || {
                    background: "#f5f5f5",
                    color: "#666",
                  };
                  return (
                    <tr
                      key={order._id}
                      style={{ borderBottom: "1px solid #f5f5f5" }}
                    >
                      <td style={{ padding: "10px 12px", color: "#bbb" }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                        {order.orderNo}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {order.user?.name
                          ? order.user.name + " " + order.user.surname
                          : order.guestEmail}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "2px 10px",
                            borderRadius: "20px",
                            whiteSpace: "nowrap",
                            ...badge,
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                        {order.cargoPrice
                          ? (
                              Number(order.totalAmount) +
                              Number(order.cargoPrice)
                            ).toFixed(2)
                          : Number(order.totalAmount).toFixed(2)}
                        ₺
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {order.cargoCompany}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#999" }}>
                        {order.address.district + "/" + order.address.city}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#999" }}>
                        {order.createdAt.slice(0, 10)}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <button
                          className="btn orange-btn"
                          onClick={() => setDetailOrder(order)}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#bbb",
                      }}
                    >
                      Sipariş bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPanel;
