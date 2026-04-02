import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCartWithSync,
  decreaseCartWithSync,
  removeFromCartWithSync,
  syncClearCart,
} from "../redux/cartSlice";
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
import { CiSearch, CiShoppingBasket } from "react-icons/ci";
import CartProgress from "../components/CartProgress";
import CartSummary from "../components/CartSummary";

const FREE_SHIPPING_THRESHOLD = 500;

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart, totalAmount } = useSelector((state) => state.cart);
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <CiShoppingBasket style={{ fontSize: "64px" }} />
            <p className="fs-5 text-muted">Sepetiniz boş.</p>
            <Link to="/" className="btn orange-btn mt-2 rounded-pill px-4">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="row g-4 align-items-start">
            <div className="col-12 col-lg-8">
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
                      cart.forEach((item) => dispatch(syncClearCart()))
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
                              ? dispatch(removeFromCartWithSync(itemId))
                              : dispatch(decreaseCartWithSync(itemId))
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
                          onClick={() => dispatch(addToCartWithSync(item))}
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
                <CartSummary />
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

                <Link to="/checkout">
                  <button className="btn orange-btn w-100 rounded-pill py-2 fw-semibold">
                    Sepeti Onayla
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProductList title="Sepetinizdeki Ürünleri Alanlar Bunları da Aldı" />
    </>
  );
}

export default CartPage;
