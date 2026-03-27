import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, decreaseCart, removeFromCart } from "../redux/cartSlice";
import HeaderLinks from "../components/HeaderLinks";
import addressIcon from "../assets/Cart/address.svg";
import checkoutIcon from "../assets/Cart/checkout.svg";
import shoppingBagIcon from "../assets/Cart/shopping-bag.svg";
import dotsIcon from "../assets/Cart/dots.svg";
import "../styles/CartPage.css";
import ProductList from "../components/ProductList";
import { FaTrash } from "react-icons/fa6";
import { RiFileExcel2Line } from "react-icons/ri";
import { FaRegBookmark } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import CartProgress from "../components/CartProgress";
import smileEmoji from "../assets/Emoji/smile.svg";

const KDV1_RATE = 0.01;
const KDV20_RATE = 0.2;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 49.9;

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart, totalAmount } = useSelector((state) => state.cart);
  const [coupon, setCoupon] = useState("");

  const totalDiscount = +cart
    .filter((item) => item.discountedPrice)
    .reduce(
      (sum, item) =>
        sum +
        (parseFloat(item.price) - parseFloat(item.discountedPrice)) *
          item.quantity,
      0,
    )
    .toFixed(2);

  const kdv1 = +(totalAmount * KDV1_RATE).toFixed(2);
  const kdv20 = +(totalAmount * KDV20_RATE).toFixed(2);
  const shipping = totalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = +(totalAmount + shipping).toFixed(2);

  return (
    <>
      <HeaderLinks />
      <div className="container my-4">
        <div className="pd-breadcrumb mb-3">
          <Link to="/">Anasayfa</Link>
          {" / "}
          <span style={{ color: "black" }}>Sepetiniz</span>
        </div>

        <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
          <div className="d-flex gap-1 align-items-center">
            <img src={shoppingBagIcon} alt="" />
            <span className="text-selected fw-semibold">Sepet</span>
          </div>
          <img className="dot-icon" src={dotsIcon} alt="" />
          <div className="d-flex gap-1 align-items-center text-muted">
            <img src={addressIcon} alt="" />
            <span>Adres</span>
          </div>
          <img className="dot-icon" src={dotsIcon} alt="" />
          <div className="d-flex gap-1 align-items-center text-muted">
            <img src={checkoutIcon} alt="" />
            <span>Ödeme</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-5">
            <p className="fs-5 text-muted">Sepetiniz boş.</p>
            <Link to="/" className="btn orange-btn mt-2 rounded-pill px-4">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="row g-4 align-items-start">
            {/* Sol: Ürün listesi */}
            <div className="col-12 col-lg-8">
              {/* Araç çubuğu */}
              <div className="cart-toolbar d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="cart-search d-flex align-items-center border rounded-2 px-3 py-1">
                  <input
                    className="form-control border-0 p-0 shadow-none"
                    placeholder="Sepette Ara"
                    style={{ fontSize: "0.875rem" }}
                  />
                  <CiSearch style={{ fontSize: "1.5rem", flexShrink: 0 }} />
                </div>
                <div
                  className="d-flex gap-3 flex-wrap"
                  style={{ fontSize: "0.8rem" }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <FaRegBookmark style={{ fontSize: "1.1rem" }} />

                    <button className="btn p-0 text-dark">
                      <strong>Sepeti Kaydet</strong>
                    </button>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <RiFileExcel2Line style={{ fontSize: "1.2rem" }} />
                    <button className="btn p-0 text-dark bold">
                      <strong>Sepeti İndir</strong>
                    </button>
                  </div>
                  <button
                    className="btn p-0 text-danger"
                    onClick={() =>
                      cart.forEach((item) =>
                        dispatch(removeFromCart(item._id || item.id)),
                      )
                    }
                  >
                    <span className="text-selected">
                      <strong>Temizle</strong>
                    </span>
                  </button>
                </div>
              </div>

              <div className="border rounded-3 overflow-hidden">
                {cart.map((item, idx) => {
                  const itemId = item._id || item.id;
                  return (
                    <div
                      key={itemId}
                      className={`cart-item-row d-flex align-items-center justify-content-between gap-3 p-3 ${idx !== cart.length - 1 ? "border-bottom" : ""}`}
                    >
                      <img
                        role="button"
                        src={item.images?.[0]?.url}
                        alt={item.name}
                        onClick={() => navigate(`/${itemId}`)}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                        className="rounded-2"
                      />

                      <div
                        role="button"
                        className="flex-grow-1 min-w-0"
                        onClick={() => navigate(`/${itemId}`)}
                      >
                        <p
                          className="mb-0 fw-semibold"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {item.name}
                        </p>
                        <div className="d-flex gap-3">
                          <p
                            className="mb-0 text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {item.discountedPrice ? (
                              <>
                                Birim:{" "}
                                <del>{Number(item.price).toFixed(2)}₺</del>{" "}
                                <span className="text-dark fw-semibold">
                                  {Number(item.discountedPrice).toFixed(2)}₺
                                </span>
                              </>
                            ) : (
                              <>Birim: {Number(item.price).toFixed(2)}₺</>
                            )}
                          </p>
                          {item.discountedPrice && (
                            <span className="discount-badge">
                              %{item.discountPercent} indirim
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="d-flex align-items-center border rounded-2"
                        style={{ flexShrink: 0 }}
                      >
                        <button
                          className="btn btn-sm px-2 py-1"
                          onClick={() =>
                            item.quantity === 1
                              ? dispatch(removeFromCart(itemId))
                              : dispatch(decreaseCart(itemId))
                          }
                        >
                          {item.quantity === 1 ? <FaTrash size={11} /> : "−"}
                        </button>
                        <span
                          className="px-2 fw-semibold"
                          style={{
                            fontSize: "0.875rem",
                            minWidth: "28px",
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-sm px-2 py-1"
                          onClick={() => dispatch(addToCart(item))}
                        >
                          +
                        </button>
                      </div>

                      <div className="d-flex gap-2">
                        <div style={{ minWidth: "72px", textAlign: "right" }}>
                          {item.discountedPrice ? (
                            <>
                              <p className="mb-0 fw-bold">
                                {(
                                  Number(item.discountedPrice) * item.quantity
                                ).toFixed(2)}
                                ₺
                              </p>
                              <del
                                className="text-muted"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {(Number(item.price) * item.quantity).toFixed(
                                  2,
                                )}
                                ₺
                              </del>
                            </>
                          ) : (
                            <p className="mb-0 fw-bold">
                              {(Number(item.price) * item.quantity).toFixed(2)}₺
                            </p>
                          )}
                        </div>

                        <button
                          className="btn text-muted p-0"
                          onClick={() => dispatch(removeFromCart(itemId))}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-12 col-lg-4 h-100">
              <div className="border rounded-3 p-3 h-100  ">
                <CartProgress
                  progress={Math.min(
                    (totalAmount / FREE_SHIPPING_THRESHOLD) * 100,
                    100,
                  )}
                  remaining={Math.max(FREE_SHIPPING_THRESHOLD - totalAmount, 0)}
                />

                <h6 className="fw-bold mb-3">Sipariş Özeti</h6>

                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <span className="text-muted">Sipariş Tutarı</span>
                  <span>{totalAmount.toFixed(2)}₺</span>
                </div>
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <span className="text-muted">KDV (%1)</span>
                  <span>{kdv1.toFixed(2)}₺</span>
                </div>
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <span className="text-muted">KDV (%20)</span>
                  <span>{kdv20.toFixed(2)}₺</span>
                </div>
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <span className="text-muted">Kargo Bedeli</span>
                  <span className={shipping === 0 ? "text-success" : ""}>
                    {shipping === 0 ? "Ücretsiz" : `${shipping.toFixed(2)}₺`}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div
                    className="d-flex justify-content-between mb-3"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <div className="d-flex gap-1">
                      <span className="text-muted">İndirimler</span>
                      <img src={smileEmoji} alt="Smile Emoji" />
                    </div>
                    <span className="text-success">
                      -{totalDiscount.toFixed(2)}₺
                    </span>
                  </div>
                )}

                <hr className="my-2" />

                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold">TOPLAM</span>
                  <span
                    className="fw-bold text-selected"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {total.toFixed(2)}₺
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 mb-3">
                  <input
                    className="form-control rounded-pill py-3 ps-4 text-muted"
                    placeholder="Kupon Kodunuz"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    style={{ fontSize: "0.875rem", backgroundColor: "#F1F5F6" }}
                  />
                  <span
                    className="border-0 px-3 text-selected"
                    style={{ fontSize: "0.9rem" }}
                  >
                    <strong>EKLE</strong>
                  </span>
                </div>

                <button className="btn orange-btn w-100 rounded-pill py-2 fw-semibold">
                  Sepeti Onayla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alt ürün listesi */}
      <div className="container">
        <ProductList title="Sepetinizdeki Ürünleri Alanlar Bunları da Aldı" />
      </div>
    </>
  );
}

export default CartPage;
