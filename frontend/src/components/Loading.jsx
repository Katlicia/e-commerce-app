function Loading() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "40vh" }}
    >
      <div className="spinner-border" role="status" style={{ color: "#f05a28" }}>
        <span className="visually-hidden">Yükleniyor...</span>
      </div>
    </div>
  );
}

export default Loading;
