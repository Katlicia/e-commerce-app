import { useRef } from "react";
import ProductCard from "./ProductCard";
import tempIcon from "../assets/temp.png";
import banner from "../assets/banner.png";
import "../styles/ProductList.css";
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

function ProductList() {
  const rowRef = useRef(null);

  function scrollLeft() {
    rowRef.current.scrollBy({ left: -600, behavior: "smooth" });
  }

  function scrollRight() {
    rowRef.current.scrollBy({ left: 600, behavior: "smooth" });
  }

  return (
    <div className="container my-4 position-relative">
      <button className="product-arrow product-arrow-left" onClick={scrollLeft}>
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
  );
}

export default ProductList;
