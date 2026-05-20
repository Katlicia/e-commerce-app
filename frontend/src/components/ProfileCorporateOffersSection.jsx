import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMyOffers } from "../redux/corporateOfferSlice";

const STATUS_LABEL = {
  pending: "Beklemede",
  answered: "Yanıtlandı",
};

const STATUS_STYLE = {
  pending: { background: "#fff3cd", color: "#856404" },
  answered: { background: "#d1e7dd", color: "#0f5132" },
};

export default function ProfileCorporateOffersSection() {
  const dispatch = useDispatch();
  const { offers, loading } = useSelector((state) => state.corporateOffer);

  useEffect(() => {
    dispatch(getMyOffers());
  }, [dispatch]);

  if (loading) return <p className="text-muted">Yükleniyor...</p>;

  if (offers.length === 0) {
    return (
      <p className="text-muted" style={{ fontSize: 14 }}>
        Henüz kurumsal teklifiniz yok. Ürün sayfasından "Kurumsal Teklif Al" ile
        talep oluşturabilirsiniz.
      </p>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {offers.map((offer) => {
        const product = offer.product;
        const img = product?.images?.[0]?.url;
        const price =
          product?.discountPercent > 0
            ? product?.discountedPrice
            : product?.price;
        const statusStyle = STATUS_STYLE[offer.status] || STATUS_STYLE.pending;
        const statusLabel = STATUS_LABEL[offer.status] || offer.status;
        const createdAt = offer.createdAt
          ? new Date(offer.createdAt).toLocaleDateString("tr-TR")
          : "";

        return (
          <div key={offer._id} className="border rounded p-3">
            <div className="d-flex align-items-start gap-3">
              {img && product && (
                <Link to={`/${product._id}`} style={{ flexShrink: 0 }}>
                  <img
                    src={img}
                    alt={product.name}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: "contain",
                      borderRadius: 8,
                      border: "1px solid #e5e8ec",
                    }}
                  />
                </Link>
              )}
              <div className="flex-grow-1 overflow-hidden">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  {product && (
                    <Link
                      to={`/${product._id}`}
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#212529",
                        textDecoration: "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </Link>
                  )}
                  <span
                    className="rounded-pill px-2 py-1"
                    style={{ fontSize: 11, fontWeight: 600, ...statusStyle }}
                  >
                    {statusLabel}
                  </span>
                </div>

                {price && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f83b0a" }}>
                    {Number(price).toFixed(2).replace(".", ",")}₺
                  </span>
                )}

                {offer.message && (
                  <p
                    className="mt-2 mb-0 text-muted"
                    style={{
                      fontSize: 13,
                      borderLeft: "3px solid #dee2e6",
                      paddingLeft: 8,
                    }}
                  >
                    {offer.message}
                  </p>
                )}

                {offer.reply && (
                  <div
                    className="mt-2"
                    style={{
                      borderLeft: "3px solid #f83b0a",
                      paddingLeft: 8,
                    }}
                  >
                    <p className="mb-0" style={{ fontSize: 11, fontWeight: 600, color: "#f83b0a" }}>
                      Yanıt
                    </p>
                    <p className="mb-0" style={{ fontSize: 13, color: "#212529" }}>
                      {offer.reply}
                    </p>
                  </div>
                )}

                <p className="mb-0 text-muted mt-2" style={{ fontSize: 12 }}>
                  {offer.fullName} &bull; {offer.email}
                  {createdAt && <> &bull; {createdAt}</>}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
