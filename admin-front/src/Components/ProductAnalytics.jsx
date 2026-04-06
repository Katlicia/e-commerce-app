import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminGetProducts } from "../redux/adminSlice";

function ProductAnalytics() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.admin.products);
  const loading = useSelector((state) => state.admin.loading);

  useEffect(() => {
    if (products.length === 0) dispatch(adminGetProducts());
  }, []);

  const top10 = [...products]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 10);

  const maxSold = top10[0]?.soldCount || 1;

  return (
    <div className="p-4">
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        <div className="fw-bold mb-4 h3">En Çok Satan Ürünler</div>

        {loading ? (
          <div style={{ color: "#999", fontSize: "14px" }}>Yükleniyor...</div>
        ) : top10.length === 0 ? (
          <div style={{ color: "#999", fontSize: "14px" }}>
            Ürün bulunamadı.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {top10.map((product, index) => (
              <div
                key={product._id}
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "24px",
                    minWidth: "24px",
                    fontWeight: 700,
                    fontSize: "14px",
                    textAlign: "right",
                  }}
                >
                  {index + 1}.
                </div>

                <img
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#222",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: "4px",
                    }}
                  >
                    {product.name}
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "#f0f0f0",
                      borderRadius: "99px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${((product.soldCount || 0) / maxSold) * 100}%`,
                        background: "#ff6a00",
                        borderRadius: "99px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#444",
                    minWidth: "40px",
                    textAlign: "right",
                  }}
                >
                  {product.soldCount || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductAnalytics;
