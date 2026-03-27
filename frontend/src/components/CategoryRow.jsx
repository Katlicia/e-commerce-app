import ProductCard from "./ProductCard";
import BannerCard from "./BannerCard";
import { useEffect, useRef, useState } from "react";
import "../styles/ProductList.css";
import "../styles/CategoryRow.css";
import okulBanner from "../assets/Banners/okul.png";
import arabaBanner from "../assets/Banners/araba.png";
import Loading from "./Loading";

const BASE_URL = "http://localhost:5000";

function CategorySection({ title, image, categorySlug }) {
  const rowRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categorySlug) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const catRes = await fetch(`${BASE_URL}/categories/${categorySlug}`);
        const category = await catRes.json();
        const prodRes = await fetch(
          `${BASE_URL}/products?category=${category._id}`,
        );
        const data = await prodRes.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("CategorySection fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <h2 className="chances-title">{title}</h2>
        <a href="#0" className="category-section-all">
          Tümü
        </a>
      </div>
      <div className="position-relative">
        {loading ? (
          <Loading />
        ) : (
          <div className="row g-2 product-row" ref={rowRef}>
            <div className="col-category">
              <BannerCard image={image} />
            </div>
            {products.map((product) => (
              <div key={product._id} className="col-category">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryRow({ left, right }) {
  return (
    <div className="container my-4">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <CategorySection
            title={left.title}
            image={okulBanner}
            categorySlug={left.slug}
          />
        </div>
        <div className="col-12 col-lg-6">
          <CategorySection
            title={right.title}
            image={arabaBanner}
            categorySlug={right.slug}
          />
        </div>
      </div>
    </div>
  );
}

export default CategoryRow;
