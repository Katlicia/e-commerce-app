import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getProductDetail,
  createReview,
  updateReview,
  deleteReview,
} from "../redux/productSlice";
import {
  addToCartWithSync,
  decreaseCartWithSync,
  removeFromCartWithSync,
} from "../redux/cartSlice";
import { FaTrash } from "react-icons/fa6";
import {
  addToFavouritesWithSync,
  removeFromFavouritesWithSync,
} from "../redux/favouriteSlice";
import { FaStar, FaRegStar } from "react-icons/fa6";
import HeaderLinks from "../components/HeaderLinks";
import axiosInstance from "../utils/axiosInstance";
import "../styles/ProductDetails.css";

import ProductList from "../components/ProductList";
import AddToListDropdown from "../components/AddToListDropdown";

import paymentLogos from "../assets/ProductDetails/payment.png";
import boxIcon from "../assets/ProductDetails/box-icon.svg";
import carIcon from "../assets/ProductDetails/car.svg";
import cargoIcon from "../assets/ProductDetails/cargo.svg";
import dotIcon from "../assets/ProductDetails/dot.svg";
import starsIcon from "../assets/ProductDetails/stars.svg";
import eyeIcon from "../assets/ProductDetails/eye-icon.svg";
import heartIcon from "../assets/ProductDetails/heart.svg";
import clipboardIcon from "../assets/ProductDetails/clipboard.svg";
import briefcaseIcon from "../assets/ProductDetails/briefcase.svg";
import bellIcon from "../assets/ProductDetails/bell.svg";
import ProductFeaturesSection from "../components/ProductFeaturesSection";
import CouponBanner from "../components/CouponBanner";
import { getKeyword } from "../redux/generalSlice";

const TARGET = new Date(
  Date.now() +
    1 * 24 * 3600 * 1000 +
    20 * 3600 * 1000 +
    4 * 60 * 1000 +
    2 * 1000,
);

function getTimeLeft() {
  const diff = Math.max(0, TARGET - Date.now());
  return {
    gun: Math.floor(diff / 86400000),
    saat: Math.floor((diff % 86400000) / 3600000),
    dakika: Math.floor((diff % 3600000) / 60000),
    saniye: Math.floor((diff % 60000) / 1000),
  };
}

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product } = useSelector((state) => state.product);
  const { favourites } = useSelector((state) => state.favourite);
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [selectedVariants, setSelectedVariants] = useState({});
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [listDropdownOpen, setListDropdownOpen] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    dispatch(getProductDetail(id));
    setActiveImg(0);
    setSelectedVariants({});
    if (user) {
      axiosInstance.post(`/users/me/visited/${id}`).catch(() => {});
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!product || product._id !== id) return;
    if (!product.hasVariants || !product.skus?.length) return;
    const firstAvailable = product.skus.find((s) => s.stock > 0);
    if (!firstAvailable) return;
    const attrs = firstAvailable.attributes || {};
    setSelectedVariants(attrs instanceof Map ? Object.fromEntries(attrs) : { ...attrs });
  }, [product?._id]);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    window.scrollTo(0, 0);
    return () => clearInterval(interval);
  }, []);

  if (!product || !product._id) return null;

  const productId = product._id;
  const images = product.images || [];
  const currentImg = images[activeImg]?.url || "";
  const isFavourite = favourites.some((f) => (f._id || f.id) === productId);
  const features = product.features
    ? product.features.map((s) => s.trim()).filter(Boolean)
    : [];
  const skus = product.skus || [];
  const variantOptionEntries = product.hasVariants && product.variantOptions
    ? Object.entries(product.variantOptions)
    : [];

  const matchedSku = variantOptionEntries.length > 0
    ? skus.find((sku) => {
        const attrs = sku.attributes || {};
        return variantOptionEntries.every(([k]) => attrs[k] === selectedVariants[k]);
      }) ?? null
    : null;

  function isOptionAvailable(label, optValue) {
    return skus.some((sku) => {
      const attrs = sku.attributes || {};
      if (attrs[label] !== optValue) return false;
      for (const [k, v] of Object.entries(selectedVariants)) {
        if (k === label) continue;
        if (v && attrs[k] !== v) return false;
      }
      return sku.stock > 0;
    });
  }

  const allGroupsSelected = variantOptionEntries.every(([k]) => selectedVariants[k]);
  const price = product.hasVariants
    ? (matchedSku ? matchedSku.price : product.price || 0)
    : product.price || 0;
  const discountPercent = product.discountPercent || null;
  const discountedPrice = discountPercent && price
    ? +(price * (1 - discountPercent / 100)).toFixed(2)
    : null;
  const activeStock = product.hasVariants
    ? (matchedSku ? matchedSku.stock : 0)
    : product.stock;
  const addToCartDisabled = product.hasVariants
    ? !allGroupsSelected || !matchedSku || matchedSku.stock <= 0
    : product.stock <= 0;
  const skuId = matchedSku?._id?.toString() ?? null;
  const cartItem = cart.find((item) => {
    if ((item._id || item.id) !== productId) return false;
    if (skuId) return item.skuId === skuId;
    return !item.skuId;
  });

  const myReview = user
    ? product.reviews?.find(
        (r) =>
          (r.user?.toString?.() ?? r.user) ===
          (user._id?.toString?.() ?? user._id),
      )
    : null;

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    await dispatch(
      createReview({ productId, comment: reviewComment, rating: reviewRating }),
    ).unwrap();
    setReviewComment("");
    setReviewRating(5);
    setReviewSubmitting(false);
    setReviewSuccess(true);
    dispatch(getProductDetail(id));
    setTimeout(() => setReviewSuccess(false), 3000);
  }

  async function handleReviewUpdate(e) {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    await dispatch(
      updateReview({ productId, comment: reviewComment, rating: reviewRating }),
    ).unwrap();
    setEditMode(false);
    setReviewSubmitting(false);
    setReviewSuccess(true);
    dispatch(getProductDetail(id));
    setTimeout(() => setReviewSuccess(false), 3000);
  }

  async function handleReviewDelete() {
    await dispatch(deleteReview({ productId })).unwrap();
    dispatch(getProductDetail(id));
  }

  function handleEditStart() {
    setReviewComment(myReview.comment);
    setReviewRating(myReview.rating);
    setEditMode(true);
  }

  function handleEditCancel() {
    setEditMode(false);
    setReviewComment("");
    setReviewRating(5);
  }

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      dispatch(
        addToCartWithSync(
          { ...product, price, discountedPrice, image: currentImg },
          selectedVariants,
          skuId,
        ),
      );
    }
  }

  function handleCategoryClick(cat) {
    dispatch(getKeyword(""));
    navigate("/products?category=" + cat.slug);
  }

  function handleBrandClick(item) {
    dispatch(getKeyword(""));
    navigate("/products?brand=" + item.brand);
  }

  return (
    <>
      <HeaderLinks />
      <div className="container my-4">
        <div className="pd-breadcrumb mb-3">
          <Link to="/">Anasayfa</Link>
          {product.category?.parent && (
            <>
              {" / "}
              <a
                style={{ cursor: "pointer" }}
                onClick={() => handleCategoryClick(product.category.parent)}
              >
                {product.category.parent.name}
              </a>
            </>
          )}
          {product.category && (
            <>
              {" / "}
              <a
                style={{ cursor: "pointer" }}
                onClick={() => handleCategoryClick(product.category)}
              >
                {product.category.name}
              </a>
            </>
          )}
          {" / "}
          <span style={{ color: "black" }}>{product.name}</span>
        </div>

        <div className="product-details-wrapper">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="pd-timer-banner border">
                <div className="d-flex">
                  <img src={starsIcon} alt="Stars" />
                  <div className="d-flex flex-column pd-timer-label">
                    <span className="star-header">Günün Yıldızları!</span>{" "}
                    <span style={{ color: "#424040" }}>
                      Acele Et, Fırsatları Kaçırma!
                    </span>
                  </div>
                </div>
                <span className="pd-timer-value text-center  border p-3 rounded w-100">
                  {time.gun} Gün : {String(time.saat).padStart(2, "0")} Saat :{" "}
                  {String(time.dakika).padStart(2, "0")} Dakika :{" "}
                  {String(time.saniye).padStart(2, "0")} Saniye
                </span>
              </div>

              <img
                src={currentImg}
                alt={product.name}
                className="pd-main-image"
              />

              {images.length >= 1 && (
                <div className="pd-thumbnails">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={`görsel-${i}`}
                      className={`pd-thumb ${i === activeImg ? "active" : ""}`}
                      onClick={() => setActiveImg(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="col-lg-6 d-flex flex-column gap-3">
              <h1 className="pd-name">{product.name}</h1>

              <div className="pd-meta">
                <span className="r-border">
                  Marka:{" "}
                  <a
                    href="#0"
                    className="pd-brand"
                    onClick={() => handleBrandClick(product)}
                  >
                    {product.brand || "—"}
                  </a>
                </span>
                <span className="d-flex align-items-center gap-1 r-border">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      style={{
                        color: i < product.rating ? "#ff7700" : "#dee2e6",
                      }}
                    >
                      {i < product.rating ? <FaStar /> : <FaRegStar />}
                    </span>
                  ))}
                  <span>
                    {String(product.reviews?.length || 0).padStart(1, "0")}{" "}
                    Yorum
                  </span>
                </span>
                {product.code && (
                  <span className="pd-code">
                    Ürün Kodu: <strong>{product.code}</strong>
                  </span>
                )}
              </div>

              <hr className="my-0" style={{ color: "var(--border-color)" }} />

              <div className="d-flex align-items-center flex-wrap gap-2">
                {discountedPrice ? (
                  <>
                    <span className="pd-price">
                      {Number(discountedPrice).toFixed(2).replace(".", ",")}₺
                    </span>
                    <del className="muted-text">
                      {Number(price).toFixed(2).replace(".", ",")}₺
                    </del>
                    <span className="pd-price-sub">KDV Dahil</span>

                    <span className="pd-discount-badge d-flex">
                      %{discountPercent} indirim
                    </span>
                  </>
                ) : (
                  <>
                    <span className="pd-price">
                      {Number(price).toFixed(2).replace(".", ",")}₺
                    </span>
                    <span className="pd-price-sub">KDV Dahil</span>
                  </>
                )}
              </div>

              {product.hasVariants &&
                variantOptionEntries.map(([label, options]) => (
                  <div key={label}>
                    <p className="mb-2" style={{ fontSize: 14, fontWeight: 600 }}>
                      {label}:{" "}
                      {selectedVariants[label] && (
                        <span style={{ fontWeight: 400, color: "#555" }}>
                          {selectedVariants[label]}
                        </span>
                      )}
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {options.map((optValue) => {
                        const available = isOptionAvailable(label, optValue);
                        const isSelected = selectedVariants[label] === optValue;
                        return (
                          <button
                            key={optValue}
                            type="button"
                            disabled={!available}
                            onClick={() =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [label]: prev[label] === optValue ? undefined : optValue,
                              }))
                            }
                            style={{
                              padding: "5px 14px",
                              fontSize: 13,
                              borderRadius: 6,
                              border: isSelected ? "2px solid #ff7700" : "1px solid #dee2e6",
                              background: isSelected ? "#fff3e0" : available ? "#fff" : "#f5f5f5",
                              color: isSelected ? "#ff7700" : available ? "#333" : "#bbb",
                              cursor: available ? "pointer" : "not-allowed",
                              fontWeight: isSelected ? 600 : 400,
                              textDecoration: !available ? "line-through" : "none",
                            }}
                          >
                            {optValue}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {features.length > 0 && (
                <ul className="pd-features mb-0">
                  {features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}

              <div className="pd-viewers">
                <img src={eyeIcon} alt="Eye Icon" />
                <span>
                  <strong>{Math.floor(Math.random() * 200 + 50)}</strong> kişi
                  şu anda bu ürünü inceliyor
                </span>
              </div>

              {activeStock > 0 && activeStock <= 20 && (
                <div className="d-flex justify-content-between align-items-center">
                  <span className="pd-stock-warning">
                    Acele Edin! Sadece{" "}
                    <span className="pd-stock-count">
                      {String(activeStock).padStart(2, "0")} adet
                    </span>{" "}
                    stok kaldı.
                  </span>
                  <a href="#0" className="pd-taksit-link">
                    Taksit Seçenekleri
                  </a>
                </div>
              )}

              <div className="d-flex gap-3 align-items-center">
                {cartItem ? (
                  <div
                    className="d-flex align-items-center justify-content-between pd-add-btn rounded-pill px-2"
                    style={{ minWidth: 140 }}
                  >
                    <button
                      className="btn p-0 px-2 h-100"
                      style={{ color: "inherit" }}
                      onClick={() =>
                        cartItem.quantity === 1
                          ? dispatch(removeFromCartWithSync(productId, skuId))
                          : dispatch(decreaseCartWithSync(productId, skuId))
                      }
                    >
                      {cartItem.quantity === 1 ? (
                        <FaTrash size={14} />
                      ) : (
                        <span style={{ fontSize: 20 }}>−</span>
                      )}
                    </button>
                    <span className="fw-semibold">{cartItem.quantity}</span>
                    {cartItem.quantity >= activeStock ? (
                      <span></span>
                    ) : (
                      <button
                        className="btn p-0 px-2 h-100"
                        style={{ color: "inherit", fontSize: 20 }}
                        onClick={() => dispatch(addToCartWithSync({ ...product, price, discountedPrice }, selectedVariants, skuId))}
                      >
                        +
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="pd-qty-control rounded-pill">
                      <button
                        className="pd-qty-btn"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      >
                        −
                      </button>
                      <span className="pd-qty-num">{quantity}</span>
                      <button
                        className="pd-qty-btn"
                        onClick={() => setQuantity((q) => q + 1)}
                        disabled={quantity >= activeStock}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="pd-add-btn rounded-pill"
                      onClick={handleAddToCart}
                      disabled={addToCartDisabled}
                    >
                      {addToCartDisabled ? "STOKTA YOK" : "SEPETE EKLE"}
                    </button>
                  </>
                )}
              </div>

              <div className="pd-actions">
                <button
                  className="pd-action-btn"
                  onClick={() =>
                    isFavourite
                      ? dispatch(removeFromFavouritesWithSync(productId))
                      : dispatch(addToFavouritesWithSync(product))
                  }
                >
                  <img src={heartIcon} alt="Heart Icon" />
                  <span>FAVORİYE EKLE</span>
                </button>
                <div style={{ position: "relative", flex: 1, maxWidth: 70 }}>
                  <button
                    className="pd-action-btn"
                    style={{ width: "100%" }}
                    onClick={() => setListDropdownOpen((v) => !v)}
                  >
                    <img src={clipboardIcon} alt="Clipboard Icon" />
                    <span>LİSTEYE EKLE</span>
                  </button>
                  <AddToListDropdown
                    product={product}
                    open={listDropdownOpen}
                    onClose={() => setListDropdownOpen(false)}
                  />
                </div>
                <button className="pd-action-btn">
                  <img src={briefcaseIcon} alt="Briefcase Icon" />
                  <span>KURUMSAL TEKLİF</span>
                </button>
                <button className="pd-action-btn">
                  <img src={bellIcon} alt="Bell Icon" />
                  <span>FİYAT ALARMI</span>
                </button>
              </div>

              <hr className="my-0" />

              <div className="pd-shipping">
                <div className="pd-shipping-item">
                  <img src={carIcon} alt="Truck Icon" />
                  <img src={dotIcon} alt="Dot Icon" />
                  <span>
                    <strong style={{ color: "#37a446" }}>Stokta Var</strong>{" "}
                    <strong>15:00</strong>'a kadar verilen siparişler{" "}
                    <strong>aynı gün kargo</strong>
                  </span>
                </div>
                <div className="pd-shipping-item">
                  <img
                    src={cargoIcon}
                    alt="Cargo Icon"
                    style={{ marginRight: "3px" }}
                  />
                  <span>
                    <strong>15 gün</strong> içerisinde koşulsuz iade imkânı
                  </span>
                </div>
              </div>

              <CouponBanner />

              <div
                className="d-flex gap-3 flex-wrap"
                style={{ fontSize: 12, color: "#6c757d" }}
              >
                {[
                  "500₺ ve Üzeri Ücretsiz Kargo",
                  "Güvenli Alışveriş Kolay İade",
                  "Hızlı Teslimat",
                ].map((t, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center border p-3  b-box"
                  >
                    <img src={boxIcon} className="me-2" alt="Box Icon" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2">
                <img
                  src={paymentLogos}
                  alt="payment logo"
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProductList title={"Benzer Ürünler"} />
      <ProductFeaturesSection product={product} />

      <div className="container my-5">
        <h5 className="fw-bold mb-4">
          Yorumlar ({product.reviews?.length || 0})
        </h5>

        {user ? (
          myReview && !editMode ? (
            <div className="pd-review-form mb-5">
              <p className="fw-semibold mb-2" style={{ fontSize: 14 }}>
                Yorumunuz
              </p>
              <div className="d-flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: 22,
                      color: star <= myReview.rating ? "#ff7700" : "#dee2e6",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p
                className="border rounded p-3 mb-3"
                style={{ fontSize: 14, background: "#fafafa" }}
              >
                {myReview.comment}
              </p>
              {reviewSuccess && (
                <p className="text-success mb-2" style={{ fontSize: 13 }}>
                  Yorumunuz güncellendi!
                </p>
              )}
              <div className="d-flex gap-2">
                <button
                  className="btn pd-add-btn rounded-pill px-4"
                  onClick={handleEditStart}
                >
                  Düzenle
                </button>
                <button
                  className="btn btn-outline-danger rounded-pill px-4"
                  style={{ fontSize: 14 }}
                  onClick={handleReviewDelete}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ) : myReview && editMode ? (
            <form onSubmit={handleReviewUpdate} className="pd-review-form mb-5">
              <div className="mb-3">
                <label
                  className="fw-semibold mb-2 d-block"
                  style={{ fontSize: 14 }}
                >
                  Puanınız
                </label>
                <div className="d-flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        fontSize: 22,
                        cursor: "pointer",
                        color: star <= reviewRating ? "#ff7700" : "#dee2e6",
                      }}
                      onClick={() => setReviewRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label
                  className="fw-semibold mb-2 d-block"
                  style={{ fontSize: 14 }}
                >
                  Yorumunuz
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn pd-add-btn rounded-pill px-4"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  style={{ fontSize: 14 }}
                  onClick={handleEditCancel}
                >
                  İptal
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReviewSubmit} className="pd-review-form mb-5">
              <div className="mb-3">
                <label
                  className="fw-semibold mb-2 d-block"
                  style={{ fontSize: 14 }}
                >
                  Puanınız
                </label>
                <div className="d-flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        fontSize: 22,
                        cursor: "pointer",
                        color: star <= reviewRating ? "#ff7700" : "#dee2e6",
                      }}
                      onClick={() => setReviewRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label
                  className="fw-semibold mb-2 d-block"
                  style={{ fontSize: 14 }}
                >
                  Yorumunuz
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ürün hakkında görüşlerinizi yazın..."
                />
              </div>
              {reviewSuccess && (
                <p className="text-success mb-2" style={{ fontSize: 13 }}>
                  Yorumunuz eklendi!
                </p>
              )}
              <button
                type="submit"
                className="btn pd-add-btn rounded-pill px-4"
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? "Gönderiliyor..." : "Yorum Yap"}
              </button>
            </form>
          )
        ) : (
          <div className="pd-review-login mb-5">
            <p style={{ fontSize: 14, color: "#6c757d" }}>
              Yorum yapabilmek için{" "}
              <Link to="/login" style={{ color: "#ff4d2d", fontWeight: 600 }}>
                giriş yapın
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDetails;
