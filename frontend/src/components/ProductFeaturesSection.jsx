import { useState } from "react";
import "../styles/ProductFeaturesSection.css";

function maskName(name, surname) {
  const parts = [name, surname].filter(Boolean);
  if (parts.length === 0) return "Kullanıcı";
  return parts.map((part) => (part[0] || "") + "**").join(" ");
}

const TABS = ["Açıklama", "Özellikler", "Yorumlar", "Taksit Seçenekleri"];

function ProductFeaturesSection({ product }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!product) return null;

  const { description, descriptionImages, reviews, price, features } = product;

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
            {description && (
              <p className="pfs-description d-inline">{description}</p>
            )}

            <div className="row g-4 mt-2">
              <div className="col-lg-6">
                <h6 className="pfs-section-title">ÖNE ÇIKAN ÖZELLİKLER</h6>
                <ul className="pfs-feature-list">
                  {features?.length > 0 ? (
                    featureArray
                      .slice(0, 3)
                      .map((f, i) => <li key={i}>{f.trim()}</li>)
                  ) : (
                    <li>Ürün özellikleri mevcut değil.</li>
                  )}
                </ul>
              </div>
              {descriptionImages?.length > 0 && (
                <div className="col-lg-6 d-flex flex-column gap-3">
                  {descriptionImages.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={product.name}
                      className="pfs-media-img"
                    />
                  ))}
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
                  <div className="pfs-review-header justify-content-between">
                    <div className="d-flex flex-column">
                      <strong>{maskName(r.name, r.surname)}</strong>
                      <span className="pfs-review-rating">
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    {r.createdAt && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#adb5bd",
                          marginTop: "5px",
                        }}
                      >
                        {new Date(r.createdAt).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
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
