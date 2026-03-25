import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import tempIcon from "../assets/temp.png";
import "../styles/ProductList.css";
import "../styles/Chances.css";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";
import BannerCard from "./BannerCard";

const products = [
  {
    id: 1,
    name: "Selpak Extra Rulo Kağıt Havlu 8'Li Paket",
    price: "128.00",
    image: tempIcon,
    badge: null,
    code: 123123,
    rating: 4,
    reviewCount: 68,
  },
  {
    id: 11,
    name: "Selpak Extra Rulo Kağıt Havlu 8'Li Paket Selpak Extra Rulo Kağıt Havlu 8'Li Paket",
    price: "128.00",
    image: tempIcon,
    badge: null,
    code: 123123,
    rating: 4,
    reviewCount: 68,
  },
  {
    id: 2,
    name: "Doğuş Filiz Çay 1kg",
    price: "96.00",
    image: tempIcon,
    badge: "yeni",
    code: 123124,
    rating: 5,
    reviewCount: 120,
  },
  {
    id: 3,
    name: "Ülker Cizi Peynirli Kraker 75g",
    price: "28.00",
    image: tempIcon,
    badge: "gunun-firsati",
    discount: "Seçenekli Ürün",
    code: 123125,
    rating: 4,
    reviewCount: 44,
  },
  {
    id: 4,
    name: "Nescafe Classic 1kg",
    price: "128.00",
    image: tempIcon,
    badge: "en-cok-satan",
    code: 123126,
    rating: 5,
    reviewCount: 200,
  },
  {
    id: 5,
    name: "Fiskars Makas Seti",
    price: "134.00",
    oldPrice: "148.00",
    image: tempIcon,
    badge: "indirimli",
    discount: "%10 indirim",
    code: 123127,
    rating: 3,
    reviewCount: 31,
  },
  {
    id: 6,
    name: "Selpak Extra Rulo Kağıt Havlu 8'Li Paket",
    price: "128.00",
    image: tempIcon,
    badge: null,
    code: 123128,
    rating: 4,
    reviewCount: 55,
  },
  {
    id: 7,
    name: "Jacobs Monarch Filtre Kahve 500g",
    price: "210.00",
    oldPrice: "240.00",
    image: tempIcon,
    badge: "indirimli",
    discount: "%12 indirim",
    code: 123129,
    rating: 5,
    reviewCount: 88,
  },
];

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

function ProductList({ title, showTimer }) {
  const rowRef = useRef(null);
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    if (!showTimer) return;
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, [showTimer]);

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
        <div className="row g-3 product-row" ref={rowRef}>
          <div className="col-6 col-md-4 col-lg-5-custom">
            <BannerCard />
          </div>
          {products.map((product) => (
            <div key={product.id} className="col-6 col-md-4 col-lg-5-custom">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
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
