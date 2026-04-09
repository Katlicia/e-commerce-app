function ConfirmModal({ message, onConfirm, onClose }) {
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
        zIndex: 1100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "28px",
          width: "360px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{ fontWeight: 700, fontSize: "16px", marginBottom: "12px" }}
        >
          Emin misiniz?
        </div>
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "24px" }}>
          {message}
        </p>
        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #eee",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            İptal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn orange-btn"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
