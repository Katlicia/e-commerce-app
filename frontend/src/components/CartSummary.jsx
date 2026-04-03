import { useSelector } from "react-redux";
import smileEmoji from "../assets/Emoji/smile.svg";

function CartSummary({ cargoPrice } = {}) {
  const { cart, totalAmount } = useSelector((state) => state.cart);
  const { freeShippingThreshold, kdv1Rate, kdv20Rate } = useSelector(
    (state) => state.taxSettings,
  );

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

  const kdv1 = +(totalAmount * kdv1Rate).toFixed(2);
  const kdv20 = +(totalAmount * kdv20Rate).toFixed(2);
  const shipping =
    totalAmount >= freeShippingThreshold
      ? 0
      : cargoPrice !== undefined
        ? cargoPrice
        : undefined;
  const total = +(totalAmount + (shipping ?? 0)).toFixed(2);

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Sipariş Tutarı</span>
        <span className="fw-semibold">
          {Number(
            Number(totalAmount.toFixed(2)) + Number(totalDiscount.toFixed(2)),
          ).toFixed(2)}
          ₺
        </span>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">KDV (%1)</span>
        <span className="fw-semibold">{kdv1.toFixed(2)}₺</span>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">KDV (%20)</span>
        <span className="fw-semibold">{kdv20.toFixed(2)}₺</span>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">Kargo Bedeli</span>
        {shipping === 0 ? (
          <span className="fw-semibold text-success">Ücretsiz</span>
        ) : cargoPrice !== undefined ? (
          <span className="fw-semibold">{Number(shipping).toFixed(2)}₺</span>
        ) : (
          <span
            className="text-muted text-end"
            style={{ fontSize: "0.8rem", maxWidth: 120 }}
          >
            Adrese göre hesaplanacaktır.
          </span>
        )}
      </div>

      {totalDiscount > 0 && (
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex gap-1 align-items-center">
            <span className="text-muted">İndirimler</span>
            <img src={smileEmoji} alt="Smile Emoji" />
          </div>
          <span className="fw-semibold text-success">
            -{totalDiscount.toFixed(2)}₺
          </span>
        </div>
      )}
      <hr className="my-3" />

      <div className="d-flex justify-content-between mb-3">
        <span className="fw-bold fs-6">TOPLAM</span>
        <span className="fw-bold text-selected fs-5">{total.toFixed(2)}₺</span>
      </div>
    </div>
  );
}

export default CartSummary;
