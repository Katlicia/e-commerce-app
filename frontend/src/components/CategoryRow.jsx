import ProductCard from "./ProductCard";
import BannerCard from "./BannerCard";
import { useEffect, useRef, useState } from "react";
import "../styles/ProductList.css";
import "../styles/CategoryRow.css";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function CategorySection({ title, image, filterType, filterValue }) {
  const rowRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filterValue) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url;
        if (filterType === "brand") {
          url = `/products?brand=${encodeURIComponent(filterValue)}`;
        } else {
          const catRes = await axiosInstance.get(`/categories/${filterValue}`);
          url = `/products?category=${catRes.data._id}`;
        }
        const prodRes = await axiosInstance.get(url);
        const data = prodRes.data;
        setProducts(Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        console.error("CategorySection fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filterType, filterValue]);

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
            {image && (
              <div className="col-category">
                <BannerCard image={image} />
              </div>
            )}
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
  const navigate = useNavigate();

  const getNavUrl = (side) => {
    if (!side?.filterValue) return "#";
    if (side.filterType === "brand") return `/products?brand=${encodeURIComponent(side.filterValue)}`;
    return `/products?category=${side.filterValue}`;
  };

  return (
    <div className="container my-4">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div onClick={() => navigate(getNavUrl(left))}>
            <CategorySection
              title={left.title}
              image={left.banner?.url || null}
              filterType={left.filterType || "category"}
              filterValue={left.filterValue}
            />
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div onClick={() => navigate(getNavUrl(right))}>
            <CategorySection
              title={right.title}
              image={right.banner?.url || null}
              filterType={right.filterType || "category"}
              filterValue={right.filterValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryRow;
