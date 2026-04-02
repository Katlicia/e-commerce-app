const SHIPPING_COST = 49.9;
const FREE_SHIPPING_THRESHOLD = 500;

function OrderSummary({ order }) {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Sipariş Tutarı</span>
        <span className="fw-semibold">{itemsTotal.toFixed(2)}₺</span>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Kargo Bedeli</span>
        <span className={`fw-semibold ${shipping === 0 ? "text-success" : ""}`}>
          {shipping === 0 ? "Ücretsiz" : `${shipping.toFixed(2)}₺`}
        </span>
      </div>
      <hr className="my-3" />
      <div className="d-flex justify-content-between mb-3">
        <span className="fw-bold fs-6">TOPLAM</span>
        <span className="fw-bold text-selected">
          {order.totalAmount.toFixed(2)}₺
        </span>
      </div>
    </div>
  );
}

export default OrderSummary;
