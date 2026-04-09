import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import firsatiBadge from "../assets/Products/gunun_firsati.svg";
import { FaRegStar, FaStar } from "react-icons/fa6";
import "../styles/DealOfDay.css";
import "../styles/Chances.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProducts, getDealOfDay } from "../redux/productSlice";

function getMidnight() {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight;
}

const TARGET = getMidnight();

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
  const featuredProduct = useSelector((state) => state.product.dealOfDay);

  useEffect(() => {
    dispatch(getDealOfDay());
    dispatch(getProducts({ limit: 8 })).then((res) => {
      if (res.payload?.products) setGridProducts(res.payload.products);
    });
  }, []);

  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!featuredProduct) return null;

  const image = featuredProduct.images?.[0]?.url;
  const {
    name,
    rating,
    reviews,
    price,
    discountedPrice,
    discountPercent,
    stock,
    _id,
  } = featuredProduct;
  const displayOldPrice = discountPercent ? price : null;

  return (
    <div className="container my-4">
      <div className="row g-3">
        <div className="col-12 col-lg-3">
          <div
            className="deal-featured-card"
            onClick={() => navigate(`/${_id}`)}
          >
            <h2 className="chances-title mb-3">Günün Fırsatı</h2>
            <hr style={{ color: "#8f8f8f" }} />
            <div className="position-relative">
              <img src={firsatiBadge} alt="badge" className="deal-badge w-50" />
              <img src={image} alt={name} className="w-100" />
            </div>
            <p className="fw-semibold mt-2 mb-1" style={{ fontSize: "26px" }}>
              {name}
            </p>
            <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
              {(() => {
                const stars = [];
                for (let i = 0; i < 5; i++) {
                  stars.push(
                    <span
                      key={i}
                      style={{
                        color: i < rating ? "#ff7700" : "#dee2e6",
                        fontSize: 26,
                      }}
                    >
                      {i < rating ? <FaStar /> : <FaRegStar />}
                    </span>,
                  );
                }
                return stars;
              })()}
              <span className="mute-string mt-2">({reviews?.length ?? 0})</span>
            </div>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="deal-price" style={{ fontSize: "26px" }}>
                {discountedPrice
                  ? discountedPrice.toFixed(2)
                  : price.toFixed(2)}
                ₺
              </span>
              {displayOldPrice && (
                <span className="deal-old-price" style={{ fontSize: "26px" }}>
                  {displayOldPrice.toFixed(2)}₺
                </span>
              )}
            </div>
            <p className="deal-timer-label" style={{ fontSize: "20px" }}>
              Fırsatın bitişine kalan süre
            </p>
            <div className="d-flex justify-content-center chances-timer mb-3">
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
            <p className="deal-stock-text" style={{ fontSize: "20px" }}>
              Stok: {stock} kaldı
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
