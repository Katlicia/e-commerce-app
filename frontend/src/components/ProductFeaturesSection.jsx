import { useState } from "react";
import "../styles/ProductFeaturesSection.css";

const TABS = ["Açıklama", "Özellikler", "Yorumlar", "Taksit Seçenekleri"];

function ProductFeaturesSection({ product }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!product) return null;

  const { description, images, reviews, price, features } = product;

  const descriptions = description
    ? description
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s + " ")
    : [];

  const featureArray = features
    ? features.map((s) => s.trim() + " ").filter(Boolean)
    : [];

  return (
    <div className="pfs-wrapper container my-4">
      <div className="pfs-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`pfs-tab ${activeTab === i ? "active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="pfs-content">
        {activeTab === 0 && (
          <div>
            {descriptions.length > 0 &&
              descriptions.map((d, i) => (
                <p key={i} className="pfs-description d-inline">
                  {d}
                </p>
              ))}

            <div className="row g-4 mt-2">
              <div className="col-lg-6">
                <h6 className="pfs-section-title">ÖNE ÇIKAN ÖZELLİKLER</h6>
                <ul className="pfs-feature-list">
                  {features?.length > 0 ? (
                    featureArray.map((f, i) => <li key={i}>{f.trim()}</li>)
                  ) : (
                    <li>Ürün özellikleri mevcut değil.</li>
                  )}
                </ul>
              </div>
              {images?.length > 0 && (
                <div className="col-lg-6">
                  <img
                    src={images[0].url}
                    alt={product.name}
                    className="pfs-media-img"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 1 &&
          (features?.length > 0 ? (
            <ul className="pfs-feature-list">
              {features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : (
            <p className="pfs-empty">Ürün özellikleri henüz eklenmemiş.</p>
          ))}

        {activeTab === 2 && (
          <div>
            {reviews && reviews.length > 0 ? (
              reviews.map((r, i) => (
                <div key={i} className="pfs-review">
                  <div className="pfs-review-header">
                    <strong>{r.name}</strong>
                    <span className="pfs-review-rating">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p className="pfs-review-comment">{r.comment}</p>
                </div>
              ))
            ) : (
              <p className="pfs-empty">Henüz yorum yapılmamış.</p>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <table className="table table-bordered pfs-installment-table">
            <thead>
              <tr>
                <th>Banka</th>
                <th>3 Taksit</th>
                <th>6 Taksit</th>
                <th>9 Taksit</th>
                <th>12 Taksit</th>
              </tr>
            </thead>
            <tbody>
              {["Garanti", "İş Bankası", "Yapı Kredi", "Akbank", "Ziraat"].map(
                (bank) => (
                  <tr key={bank}>
                    <td>{bank}</td>
                    <td>{((price / 3) * 1.03).toFixed(2)}₺</td>
                    <td>{((price / 6) * 1.05).toFixed(2)}₺</td>
                    <td>{((price / 9) * 1.08).toFixed(2)}₺</td>
                    <td>{((price / 12) * 1.12).toFixed(2)}₺</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ProductFeaturesSection;
