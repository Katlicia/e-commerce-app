import { useState } from "react";
import "../styles/ProductCard.css";
import yeniBadge from "../assets/Products/yeni.svg";
import firsatiBadge from "../assets/Products/gunun_firsati.svg";
import ensatanBadge from "../assets/Products/en_cok_satan.svg";
import indirimBadge from "../assets/Products/indirim.svg";
import favBadge from "../assets/Products/fav.svg";
import { FaRegStar } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";

const BADGES = {
  yeni: yeniBadge,
  "gunun-firsati": firsatiBadge,
  "en-cok-satan": ensatanBadge,
  indirimli: indirimBadge,
};

function ProductCard({ product }) {
  const {
    image,
    code,
    name,
    rating,
    reviewCount,
    price,
    oldPrice,
    badge,
    discount,
    features,
  } = product;

  const [inCart, setInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const badgeIcon = BADGES[badge];

  return (
    <div className="card h-100 border rounded-3 p-2 position-relative">
      {badgeIcon && (
        <img
          src={badgeIcon}
          alt={badge}
          className="position-absolute"
          style={{ top: 20, left: 10 }}
        />
      )}
      <img
        src={favBadge}
        alt="favBadge"
        className="position-absolute"
        style={{ top: 20, right: 10 }}
      />
      <img
        src={image}
        alt={name}
        className="card-img-top img-fluid"
        style={{ borderBottom: "1px solid lightgrey" }}
      />
      {discount && (
        // FIX ABSOLUTE POS
        <span
          className={`position-absolute px-2 rounded-2 discount-tag ${discount.startsWith("%") ? "discount-tag-green" : "discount-tag-blue"}`}
          style={{ top: 200, left: 10 }}
        >
          {discount}
        </span>
      )}
      <div className="card-body d-flex flex-column gap-2 p-0 mt-2">
        <div className="flex-grow-1">
          <p className="card-subtitle mute-string">Ürün Kodu: {code}</p>
          <p className="card-title fw-semibold mb-0">{name}</p>
        </div>
        <div>
          <div className="d-flex align-items-center gap-1">
            {(() => {
              const stars = [];
              for (let i = 0; i < 5; i++) {
                stars.push(
                  <span
                    key={i}
                    style={{
                      color: i < rating ? "#ff7700" : "#dee2e6",
                    }}
                  >
                    {i < rating ? <FaStar /> : <FaRegStar />}
                  </span>,
                );
              }
              return stars;
            })()}
            <span className="mute-string mt-1">({reviewCount})</span>
          </div>
          <p className="card-text fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
            {price}₺
          </p>
        </div>
        <button className="btn card-button w-100 mt-auto">Sepete Ekle</button>
      </div>
    </div>
  );
}

export default ProductCard;
