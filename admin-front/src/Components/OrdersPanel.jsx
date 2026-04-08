import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminGetOrders } from "../redux/adminSlice";

function CategoriesPanel() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.admin.orders);
  const loading = useSelector((state) => state.admin.loading);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (orders.length === 0) dispatch(adminGetOrders());
  }, []);

  const orderMap = Object.fromEntries(orders.map((o) => [o._id.toString(), o]));

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNo?.toLowerCase().includes(q) ||
      o.user?.name.toLowerCase().includes(q) ||
      o.guestEmail?.toLowerCase().includes(q)
    );
  });

  console.log(orderMap);

  return (
    <div className="p-4">
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

        <input
          type="text"
          placeholder="Sipariş veya kişi ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #eee",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "13px",
            marginBottom: "20px",
            outline: "none",
          }}
        />

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
                {filtered.map((order, i) => (
                  <tr
                    key={order._id}
                    style={{ borderBottom: "1px solid #f5f5f5" }}
                  >
                    <td style={{ padding: "10px 12px", color: "#bbb" }}>
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {order.orderNo}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {order.user?.name
                        ? order.user?.name + " " + order.user?.surname
                        : order.guestEmail}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {order.status}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {order.totalAmount.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {order.cargoCompany}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {order.address.district + "/" + order.address.city}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {order.createdAt.slice(0, 10)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <button
                        className="orange-btn"
                        onClick={() => setEditingUser(user)}
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
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
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

export default CategoriesPanel;
