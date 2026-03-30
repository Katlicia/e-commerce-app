import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import "../styles/ProductList.css";
import "../styles/Chances.css";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";
import BannerCard from "./BannerCard";
import Loading from "./Loading";

const BASE_URL = "http://localhost:5000";

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

function ProductList({ title, settings = {} }) {
  const { showTimer, banner, badge } = settings;
  const rowRef = useRef(null);
  const [time, setTime] = useState(getTimeLeft());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showTimer) return;
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, [showTimer]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = badge
          ? `${BASE_URL}/products/badge/${badge}`
          : `${BASE_URL}/products`;
        const res = await fetch(url);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("ProductList fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [badge]);

  function scrollLeft() {
    rowRef.current.scrollBy({ left: -600, behavior: "smooth" });
  }

  function scrollRight() {
    rowRef.current.scrollBy({ left: 600, behavior: "smooth" });
  }

  return (
    <div className="container my-4">
      {title && (
        <div className="chances-bar d-flex justify-content-between align-items-center px-2 mb-2">
          <h2 className="chances-title">{title}</h2>
          {showTimer && (
            <div className="chances-timer">
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
          )}
        </div>
      )}
      <div className="position-relative">
        <button
          className="product-arrow product-arrow-left"
          onClick={scrollLeft}
        >
          <FaArrowAltCircleLeft />
        </button>
        {loading ? (
          <Loading />
        ) : (
          <div className="row g-3 product-row" ref={rowRef}>
            {banner && (
              <div className="col-6 col-md-4 col-lg-5-custom">
                <BannerCard image={banner} />
              </div>
            )}
            {products.map((product) => (
              <div key={product._id} className="col-6 col-md-4 col-lg-5-custom">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
        <button
          className="product-arrow product-arrow-right"
          onClick={scrollRight}
        >
          <FaArrowAltCircleRight />
        </button>
      </div>
    </div>
  );
}

export default ProductList;
