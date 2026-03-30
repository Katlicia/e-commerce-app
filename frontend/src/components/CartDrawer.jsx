import { useSelector, useDispatch } from "react-redux";
import { decreaseCartWithSync, addToCartWithSync, removeFromCartWithSync } from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa6";
import "../styles/CartDrawer.css";
import { PiShoppingCartLight } from "react-icons/pi";
import CartProgress from "./CartProgress";

const FREE_SHIPPING_THRESHOLD = 500;

function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, totalAmount } = useSelector((state) => state.cart);

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - totalAmount, 0);
  const progress = Math.min((totalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id="cartDrawer"
      aria-labelledby="cartDrawerLabel"
    >
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold" id="cartDrawerLabel">
          Sepet
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Kapat"
        />
      </div>

      <div className="offcanvas-body d-flex flex-column p-0">
        {cart.length === 0 ? (
          <div className="cart-empty flex-grow-1 d-flex flex-column align-items-center justify-content-center gap-2">
            <PiShoppingCartLight className="cart-empty-icon" />
            <p className="fw-semibold mb-0">Sepetiniz Boş</p>
          </div>
        ) : (
          <div className="cart-items flex-grow-1 overflow-auto px-3 py-2">
            {cart.map((item) => {
              const itemId = item._id || item.id;
              return (
                <div
                  key={itemId}
                  className="cart-item d-flex gap-3 py-3 border-bottom"
                >
                  <img
                    src={item.images?.[0]?.url}
                    alt={item.name}
                    className="cart-item-img rounded-2"
                  />
                  <div className="flex-grow-1 d-flex flex-column justify-content-between">
                    <p className="cart-item-name mb-1">{item.name}</p>
                    {item.discountedPrice ? (
                      <div className="d-flex justify-content-between">
                        <div className="d-flex align-items-center gap-1">
                          <p className="cart-item-price fw-bold mb-0">
                            {(
                              parseFloat(item.discountedPrice) * item.quantity
                            ).toFixed(2)}
                            ₺
                          </p>
                          <del
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {(parseFloat(item.price) * item.quantity).toFixed(
                              2,
                            )}
                            ₺
                          </del>
                        </div>
                        <span
                          className="discount-badge"
                          style={{ alignSelf: "flex-start" }}
                        >
                          %{item.discountPercent} indirim
                        </span>
                      </div>
                    ) : (
                      <p className="cart-item-price fw-bold mb-0">
                        {(parseFloat(item.price) * item.quantity).toFixed(2)}₺
                      </p>
                    )}

                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div className="cart-qty-control d-flex align-items-center">
                        <button
                          className="btn cart-qty-btn"
                          onClick={() =>
                            item.quantity === 1
                              ? dispatch(removeFromCartWithSync(itemId))
                              : dispatch(decreaseCartWithSync(itemId))
                          }
                        >
                          {item.quantity === 1 ? <FaTrash size={12} /> : "−"}
                        </button>
                        <span className="cart-qty-num">{item.quantity}</span>
                        <button
                          className="btn cart-qty-btn"
                          onClick={() => dispatch(addToCartWithSync(item))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="cart-footer px-3 pt-3 pb-4">
          <CartProgress progress={progress} remaining={remaining} />

          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-bold">ARA TOPLAM:</span>
            <span className="fw-bold text-danger">
              {totalAmount.toFixed(2)} TL
            </span>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary flex-grow-1 rounded-pill"
              data-bs-dismiss="offcanvas"
            >
              Alışverişe Devam Et
            </button>
            <button
              className="btn orange-btn flex-grow-1 rounded-pill"
              onClick={() => navigate("/cart")}
              data-bs-dismiss="offcanvas"
            >
              Sepete Git
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
