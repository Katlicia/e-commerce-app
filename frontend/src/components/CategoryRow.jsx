import ProductCard from "./ProductCard";
import BannerCard from "./BannerCard";
import { useRef } from "react";
import "../styles/ProductList.css";
import "../styles/CategoryRow.css";
import okulBanner from "../assets/Banners/okul.png";
import arabaBanner from "../assets/Banners/araba.png";

import tempIcon from "../assets/temp.png";
const products = [
  {
    id: 1,
    name: "Faber Castell Sulu Boya 21 Renk Büyük Boy",
    price: "128.00",
    oldPrice: "148.00",
    image: tempIcon,
    badge: null,
    code: 123123,
    rating: 4,
    reviewCount: 68,
  },
  {
    id: 2,
    name: "Fatih Pastel Boya 12 Renk King Size",
    price: "128.00",
    oldPrice: "148.00",
    image: tempIcon,
    badge: null,
    code: 123124,
    rating: 5,
    reviewCount: 88,
  },
  {
    id: 3,
    name: "Selpak Extra Rulo Kağıt Havlu 8'Li Paket",
    price: "128.00",
    oldPrice: "148.00",
    image: tempIcon,
    badge: null,
    code: 123125,
    rating: 4,
    reviewCount: 68,
  },
  {
    id: 4,
    name: "Selpak Extra Rulo Kağıt Havlu 8'Li Paket",
    price: "128.00",
    oldPrice: "148.00",
    image: tempIcon,
    badge: null,
    code: 123126,
    rating: 5,
    reviewCount: 88,
  },
];

function CategorySection({ title, image }) {
  const rowRef = useRef(null);

  function scrollLeft() {
    rowRef.current.scrollBy({ left: -400, behavior: "smooth" });
  }

  function scrollRight() {
    rowRef.current.scrollBy({ left: 400, behavior: "smooth" });
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <h2 className="chances-title">{title}</h2>
        <a href="#0" className="category-section-all">
          Tümü
        </a>
      </div>
      <div className="position-relative">
        <div className="row g-2 product-row" ref={rowRef}>
          <div className="col-category">
            <BannerCard image={image} />
          </div>
          {products.map((product) => (
            <div key={product.id} className="col-category">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ left, right }) {
  return (
    <div className="container my-4">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <CategorySection title={left} image={okulBanner} />
        </div>
        <div className="col-12 col-lg-6">
          <CategorySection title={right} image={arabaBanner} />
        </div>
      </div>
    </div>
  );
}

export default CategoryRow;
