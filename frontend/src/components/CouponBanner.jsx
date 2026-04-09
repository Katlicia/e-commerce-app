import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

function formatDiscount(coupon) {
  if (coupon.discountType === "percent") return `%${coupon.discountValue}`;
  return `${Number(coupon.discountValue).toLocaleString("tr-TR")}₺`;
}

function daysLeft(expiryDate) {
  const diff = new Date(expiryDate) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function CouponBanner() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/coupons/active")
      .then((res) => setCoupons(res.data))
      .catch(() => {});
  }, []);

  if (coupons.length === 0) return null;

  return (
    <div>
      <p className="fw-bold mb-2" style={{ fontSize: 14 }}>
        Kuponlar
      </p>
      <div className="d-flex gap-2 flex-wrap">
        {coupons.map((c) => (
          <div key={c._id} className="pd-coupon flex-grow-1">
            <span style={{ fontSize: 10, color: "#6c757d" }}>
              Alt Limit: {Number(c.minOrderAmount).toLocaleString("tr-TR")}₺ •
              Son {daysLeft(c.expiryDate)} Gün
            </span>
            <span className="pd-coupon-amount">{formatDiscount(c)}</span>
            <button
              className="pd-coupon-btn"
              onClick={() => navigator.clipboard?.writeText(c.code)}
            >
              {c.code}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CouponBanner;
