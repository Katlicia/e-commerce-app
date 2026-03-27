import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import HeaderLinks from "../components/HeaderLinks";
import ProductCard from "../components/ProductCard";
import { CiHeart } from "react-icons/ci";
import "../styles/FavouritesPage.css";
import ProductList from "../components/ProductList";

function FavouritesPage() {
  const { favourites } = useSelector((state) => state.cart);
  const [displayed, setDisplayed] = useState(favourites);
  const [fadingIds, setFadingIds] = useState(new Set());
  const prevIds = useRef(new Set(favourites.map((f) => f._id || f.id)));

  useEffect(() => {
    const currentIds = new Set(favourites.map((f) => f._id || f.id));
    const removed = [...prevIds.current].filter((id) => !currentIds.has(id));

    if (removed.length > 0) {
      setFadingIds(new Set(removed));
      setTimeout(() => {
        setDisplayed(favourites);
        setFadingIds(new Set());
      }, 350);
    } else {
      setDisplayed(favourites);
    }

    prevIds.current = currentIds;
  }, [favourites]);

  return (
    <>
      <HeaderLinks />
      <div className="container my-4">
        <div className="pd-breadcrumb mb-3">
          <Link to="/">Anasayfa</Link>
          {" / "}
          <span style={{ color: "black" }}>Favorileriniz</span>
        </div>

        <h5 className="fw-semibold mb-4">
          Favorileriniz{" "}
          <span className="text-muted fw-normal">({favourites.length})</span>
        </h5>

        {displayed.length === 0 ? (
          <div className="text-center py-5">
            <CiHeart style={{ fontSize: "64px" }} />
            <p className="fs-5 text-muted">Henüz favori ürününüz yok.</p>
            <Link to="/products" className="btn rounded-pill px-4 orange-btn">
              Ürünleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {displayed.map((item) => {
              const id = item._id || item.id;
              return (
                <div
                  key={id}
                  className={`col-6 col-md-4 col-lg-3 fav-item${fadingIds.has(id) ? " fading" : ""}`}
                >
                  <ProductCard product={item} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ProductList title="Sevebileceğiniz Diğer Ürünler" />
    </>
  );
}

export default FavouritesPage;
