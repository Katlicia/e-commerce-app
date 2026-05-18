const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err);

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Sunucu hatası oluştu."
      : err.message || "Sunucu hatası oluştu.";

  res.status(status).json({ message });
};

module.exports = errorHandler;
