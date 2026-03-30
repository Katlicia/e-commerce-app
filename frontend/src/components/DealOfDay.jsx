import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import tempIcon from "../assets/temp.png";
import firsatiBadge from "../assets/Products/gunun_firsati.svg";
import { FaRegStar, FaStar } from "react-icons/fa6";
import "../styles/DealOfDay.css";
import "../styles/Chances.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProducts } from "../redux/productSlice";

const featuredProduct = {
  id: 1,
  image: tempIcon,
  name: "Nescafe Gold 900 Gr Teneke + Nestle Coffee Mate Kahve Kreması 2 Kg Alana Çelik Termos 1.2 Lt HEDİYE",
  rating: 5,
  reviewCount: 29,
  price: "128.00",
  oldPrice: "12.00",
  stock: 620,
  totalStock: 896,
};

const TARGET = new Date(
  Date.now() + 11 * 3600 * 1000 + 43 * 60 * 1000 + 35 * 1000,
);

function getTimeLeft() {
  const diff = Math.max(0, TARGET - Date.now());
  return {
    saat: Math.floor(diff / 3600000),
    dakika: Math.floor((diff % 3600000) / 60000),
    saniye: Math.floor((diff % 60000) / 1000),
  };
}

function DealOfDay() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [gridProducts, setGridProducts] = useState([]);

  useEffect(() => {
    dispatch(getProducts({ limit: 8 })).then((res) => {
      if (res.payload) setGridProducts(res.payload);
    });
  }, []);

  const [time, setTime] = useState(getTimeLeft());
  const {
    image,
    name,
    rating,
    reviewCount,
    price,
    oldPrice,
    stock,
    totalStock,
  } = featuredProduct;
  const stockPercent = Math.round((stock / totalStock) * 100);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="container my-4">
      <div className="row g-3">
        <div className="col-12 col-lg-3">
          <div
            className="deal-featured-card"
            onClick={() => navigate(`/${featuredProduct.id}`)}
          >
            <h2 className="chances-title mb-3">Günün Fırsatı</h2>
            <hr style={{ color: "#8f8f8f" }} />
            <div className="position-relative">
              <img src={firsatiBadge} alt="badge" className="deal-badge w-50" />
              <img src={image} alt={name} className="w-100" />
            </div>
            <p className="fw-semibold mt-2 mb-1" style={{ fontSize: "13px" }}>
              {name}
            </p>
            <div className="d-flex align-items-center gap-1 mb-1">
              {(() => {
                const stars = [];
                for (let i = 0; i < 5; i++) {
                  stars.push(
                    <span
                      key={i}
                      style={{
                        color: i < rating ? "#ff7700" : "#dee2e6",
                        fontSize: 13,
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
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="deal-price">{price}₺</span>
              <span className="deal-old-price">{oldPrice}₺</span>
            </div>
            <p className="deal-timer-label">Fırsatın bitişine kalan süre</p>
            <div className="chances-timer mb-3">
              {[
                { value: time.saat, label: "Saat" },
                { value: time.dakika, label: "Dakika" },
                { value: time.saniye, label: "Saniye" },
              ].map((u) => (
                <div key={u.label} className="chances-box">
                  <span className="chances-value">
                    {String(u.value).padStart(2, "0")}
                  </span>
                  <span className="chances-label">{u.label}</span>
                </div>
              ))}
            </div>
            <div className="progress mb-1" style={{ height: "6px" }}>
              <div
                className="progress-bar deal-progress-bar"
                style={{ width: `${stockPercent}%` }}
              />
            </div>
            <p className="deal-stock-text">
              Stok: {stock}/{totalStock} kaldı
            </p>
          </div>
        </div>

        <div className="col-12 col-lg-9">
          <div className="row row-cols-2 row-cols-md-4 g-3">
            {gridProducts.map((product) => (
              <div key={product._id} className="col">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealOfDay;
