import { useSelector } from "react-redux";
import smileEmoji from "../assets/Emoji/smile.svg";

const KDV1_RATE = 0.01;
const KDV20_RATE = 0.2;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 49.9;

function CartSummary() {
  const { cart, totalAmount } = useSelector((state) => state.cart);

  const totalDiscount = +cart
    .filter((item) => item.discountedPrice)
    .reduce(
      (sum, item) =>
        sum +
        (parseFloat(item.price) - parseFloat(item.discountedPrice)) *
          item.quantity,
      0,
    )
    .toFixed(2);

  const kdv1 = +(totalAmount * KDV1_RATE).toFixed(2);
  const kdv20 = +(totalAmount * KDV20_RATE).toFixed(2);
  const shipping = totalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = +(totalAmount + shipping).toFixed(2);

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Sipariş Tutarı</span>
        <span className="fw-semibold">{totalAmount.toFixed(2)}₺</span>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">KDV (%1)</span>
        <span className="fw-semibold">{kdv1.toFixed(2)}₺</span>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">KDV (%20)</span>
        <span className="fw-semibold">{kdv20.toFixed(2)}₺</span>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Kargo Bedeli</span>
        <span className={`fw-semibold ${shipping === 0 ? "text-success" : ""}`}>
          {shipping === 0 ? "Ücretsiz" : `${shipping.toFixed(2)}₺`}
        </span>
      </div>

      {totalDiscount > 0 && (
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex gap-1 align-items-center">
            <span className="text-muted">İndirimler</span>
            <img src={smileEmoji} alt="Smile Emoji" />
          </div>
          <span className="fw-semibold text-success">-{totalDiscount.toFixed(2)}₺</span>
        </div>
      )}
      <hr className="my-3" />

      <div className="d-flex justify-content-between mb-3">
        <span className="fw-bold fs-6">TOPLAM</span>
        <span className="fw-bold text-selected fs-5">
          {total.toFixed(2)}₺
        </span>
      </div>
    </div>
  );
}

export default CartSummary;
