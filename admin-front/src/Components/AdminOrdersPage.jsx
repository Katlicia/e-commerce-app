import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminGetOrders } from "../redux/adminSlice";
import "../styles/AdminPage.css";

const STATUS_BADGE = {
  Hazırlanıyor: "bg-warning text-dark",
  "Kargoya Verildi": "bg-primary",
  "Teslim Edildi": "bg-success",
  "İptal Edildi": "bg-danger",
  "İade Edildi": "bg-secondary",
};

function AdminOrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(adminGetOrders());
  }, []);

  const filtered = orders.filter((o) =>
    o.orderNo.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admin-page">
      <div className="container">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/")}
          >
            ← Geri
          </button>
          <h4 className="fw-bold mb-0">Sipariş Yönetimi</h4>
        </div>

        <div className="d-flex align-items-center gap-3 mb-3">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 280 }}
            placeholder="Sipariş koduna göre ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span
            className="text-muted ms-auto"
            style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}
          >
            {search
              ? `${filtered.length} / ${orders.length} sipariş`
              : `Toplam ${orders.length} sipariş`}
          </span>
        </div>

        {loading ? (
          <p className="text-muted">Yükleniyor...</p>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Sipariş No</th>
                  <th>Müşteri</th>
                  <th>Tarih</th>
                  <th>Tutar</th>
                  <th>Kargo</th>
                  <th>Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id}>
                    <td className="fw-semibold">{order.orderNo}</td>
                    <td>
                      {order.user
                        ? `${order.user.name} ${order.user.surname}`
                        : order.guestEmail || "-"}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td>
                      {(
                        Number(order.totalAmount) +
                        Number(order.cargoPrice || 0)
                      ).toFixed(2)}
                      ₺
                    </td>
                    <td>{order.cargoCompany || "-"}</td>
                    <td>
                      <span
                        className={`badge ${STATUS_BADGE[order.status]} admin-badge`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn orange-btn btn-sm"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      {search
                        ? "Aramayla eşleşen sipariş bulunamadı."
                        : "Henüz sipariş yok."}
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

export default AdminOrdersPage;
