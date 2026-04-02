import { useSelector } from "react-redux";

function OrderModal({ show, status, onClose }) {
  const orderNo = useSelector((state) => state.order.currentOrder?.orderNo);
  const orderError = useSelector((state) => state.order.error);
  if (!show) return null;

  return (
    <>
      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title orange-text fw-bold">
                {status === "success"
                  ? "Siparişiniz Alındı"
                  : "Sipariş Oluşturulamadı"}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              <p>
                {status === "success"
                  ? `Siparişiniz başarıyla alındı. ` +
                    `Sipariş numaranız: ${orderNo}`
                  : orderError || "Sipariş oluşturulamadı."}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn orange-btn"
                onClick={onClose}
              >
                {status === "success" ? "Siparişlerim" : "Kapat"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
    </>
  );
}

export default OrderModal;
