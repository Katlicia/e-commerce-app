import cartImg from "../assets/Cart/cargo.svg";
import "../styles/CartDrawer.css";

function CartProgress({ progress, remaining }) {
  return (
    <div>
      <div className="cart-shipping-bar mb-3">
        <div
          className="cart-shipping-progress"
          style={{ width: `${progress}%` }}
        />
        <div className="cart-shipping-truck" style={{ left: `${progress}%` }}>
          <img src={cartImg} style={{ width: "28px", height: "28px" }} />
        </div>
      </div>
      <p className="cart-shipping-text text-center mb-3">
        {remaining === 0 ? (
          <>
            Kargo <strong style={{ color: "#f83b0a" }}>ücretsiz!</strong>
          </>
        ) : (
          <>
            Sepetinize <strong>{remaining.toFixed(2)} TL</strong> daha
            eklerseniz. <strong className="text-danger">KARGO ÜCRETSİZ</strong>
          </>
        )}
      </p>
    </div>
  );
}

export default CartProgress;
