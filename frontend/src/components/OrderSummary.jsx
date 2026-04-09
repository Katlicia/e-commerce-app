function OrderSummary({ order }) {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = order.cargoPrice ?? 0;
  const isFree = shipping === 0;

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Sipariş Tutarı</span>
        <span className="fw-semibold">{itemsTotal.toFixed(2)}₺</span>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">
          Kargo Bedeli{order.cargoCompany ? ` (${order.cargoCompany})` : ""}
        </span>
        <span className={`fw-semibold ${isFree ? "text-success" : ""}`}>
          {isFree ? "Ücretsiz" : `${shipping.toFixed(2)}₺`}
        </span>
      </div>
      {order.coupon?.discount > 0 && (
        <div className="d-flex justify-content-between mb-3">
          <span className="text-muted">Kupon ({order.coupon.code})</span>
          <span className="fw-semibold text-success">
            -{Number(order.coupon.discount).toFixed(2)}₺
          </span>
        </div>
      )}
      <hr className="my-3" />
      <div className="d-flex justify-content-between mb-3">
        <span className="fw-bold fs-6">TOPLAM</span>
        <span className="fw-bold text-selected">
          {(order.totalAmount + shipping).toFixed(2)}₺
        </span>
      </div>
    </div>
  );
}

export default OrderSummary;
