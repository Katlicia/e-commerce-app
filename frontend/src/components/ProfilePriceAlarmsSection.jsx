import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMyPriceAlarms, deletePriceAlarm } from "../redux/priceAlarmSlice";

export default function ProfilePriceAlarmsSection() {
  const dispatch = useDispatch();
  const { alarms, loading, error } = useSelector((state) => state.priceAlarm);

  useEffect(() => {
    dispatch(getMyPriceAlarms());
  }, [dispatch]);

  const handleDelete = (productId) => {
    if (window.confirm("Bu fiyat alarmını silmek istediğinize emin misiniz?")) {
      dispatch(deletePriceAlarm(productId));
    }
  };

  if (loading) return <p className="text-muted">Yükleniyor...</p>;

  if (error) return <p className="text-danger" style={{ fontSize: 14 }}>{error}</p>;

  if (alarms.length === 0) {
    return (
      <p className="text-muted" style={{ fontSize: 14 }}>
        Henüz fiyat alarmınız yok. Ürün sayfasından "Fiyat Alarmı Kur" ile ekleyebilirsiniz.
      </p>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {alarms.map((alarm) => {
        const product = alarm.product;
        if (!product) return null;
        const img = product.images?.[0]?.url;
        const price =
          product.discountPercent > 0 ? product.discountedPrice : product.price;

        return (
          <div
            key={alarm._id}
            className="d-flex align-items-center gap-3 border rounded p-3"
          >
            {img && (
              <Link to={`/${product._id}`}>
                <img
                  src={img}
                  alt={product.name}
                  style={{
                    width: 72,
                    height: 72,
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid #e5e8ec",
                    flexShrink: 0,
                  }}
                />
              </Link>
            )}
            <div className="flex-grow-1 overflow-hidden">
              <Link
                to={`/${product._id}`}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#212529",
                  textDecoration: "none",
                  display: "block",
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {product.name}
              </Link>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#f83b0a" }}>
                {Number(price).toFixed(2).replace(".", ",")}₺
              </span>
              {product.discountPercent > 0 && (
                <del style={{ fontSize: 12, color: "#6c757d", marginLeft: 6 }}>
                  {Number(product.price).toFixed(2).replace(".", ",")}₺
                </del>
              )}
              <p className="mb-0 text-muted mt-1" style={{ fontSize: 12 }}>
                Alarm e-postası: {alarm.email}
              </p>
            </div>
            <button
              className="btn btn-outline-danger btn-sm rounded-pill px-3"
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              onClick={() => handleDelete(product._id)}
            >
              Alarmı Sil
            </button>
          </div>
        );
      })}
    </div>
  );
}
