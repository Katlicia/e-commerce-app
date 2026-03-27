import "../styles/ProductCard.css";
import yeniBadge from "../assets/Products/yeni.svg";
import firsatiBadge from "../assets/Products/gunun_firsati.svg";
import ensatanBadge from "../assets/Products/en_cok_satan.svg";
import indirimBadge from "../assets/Products/indirim.svg";
import {
  FaRegStar,
  FaStar,
  FaHeart,
  FaRegHeart,
  FaTrash,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  decreaseCart,
  removeFromCart,
  addToFavourites,
  removeFromFavourites,
} from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";

const BADGES = {
  yeni: yeniBadge,
  "gunun-firsati": firsatiBadge,
  "en-cok-satan": ensatanBadge,
  indirimli: indirimBadge,
};

function ProductCard({ product }) {
  const {
    _id,
    images,
    code,
    name,
    rating,
    reviews,
    price,
    discountPercent,
    discountedPrice,
    badge,
  } = product;

  const image = images?.[0]?.url || "";
  const reviewCount = reviews?.length || 0;

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { cart, favourites } = useSelector((state) => state.cart);

  const productId = product._id || product.id;
  const cartItem = cart.find((item) => (item._id || item.id) === productId);
  const isFavourite = favourites.some(
    (item) => (item._id || item.id) === productId,
  );

  const badgeIcon = BADGES[badge];

  return (
    <div
      className="card h-100 border rounded-3 p-2"
      onClick={() => navigate(`/${_id}`)}
    >
      <div className="position-relative">
        {badgeIcon && (
          <img
            src={badgeIcon}
            alt={badge}
            className="position-absolute"
            style={{ top: 8, left: 8 }}
          />
        )}
        {discountedPrice && (
          <span className="position-absolute discount-badge">
            %{discountPercent} indirim
          </span>
        )}
        <span
          className="position-absolute fav-icon"
          onClick={(e) => {
            e.stopPropagation();
            isFavourite
              ? dispatch(removeFromFavourites(productId))
              : dispatch(addToFavourites(product));
          }}
          style={{
            top: 8,
            right: 8,
            cursor: "pointer",
            fontSize: "20px",
            color: isFavourite ? "#ff7700" : "#adb5bd",
          }}
        >
          {isFavourite ? (
            <FaHeart />
          ) : (
            <FaRegHeart className="fav-icon-color" />
          )}
        </span>
        <img src={image} alt={name} className="card-img-top img-fluid" />
      </div>
      <div className="card-body d-flex flex-column gap-2 p-0 mt-2">
        <div className="flex-grow-1">
          <p className="card-subtitle mute-string">Ürün Kodu: {code}</p>
          <p className="card-title fw-semibold mb-0">{name}</p>
        </div>
        <div>
          <div className="d-flex align-items-center gap-1">
            {(() => {
              const stars = [];
              for (let i = 0; i < 5; i++) {
                stars.push(
                  <span
                    key={i}
                    style={{ color: i < rating ? "#ff7700" : "#dee2e6" }}
                  >
                    {i < rating ? <FaStar /> : <FaRegStar />}
                  </span>,
                );
              }
              return stars;
            })()}
            <span className="mute-string mt-1">({reviewCount})</span>
          </div>
          {discountedPrice ? (
            <div className="d-flex align-items-center gap-2 orange-text">
              <p
                className="card-text fw-bold mb-0"
                style={{ fontSize: "1.2rem" }}
              >
                {Number(discountedPrice).toFixed(2)}₺
              </p>
              <del className="text-muted">{Number(price).toFixed(2)}₺</del>
            </div>
          ) : (
            <p
              className="card-text fw-bold mb-0"
              style={{ fontSize: "1.2rem" }}
            >
              {Number(price).toFixed(2)}₺
            </p>
          )}
        </div>
        {cartItem ? (
          <div
            className="d-flex align-items-center justify-content-between card-button rounded-2 px-1"
            style={{ height: "38px" }}
          >
            <button
              className="btn p-0 px-2 h-100"
              style={{ color: "inherit" }}
              onClick={(e) => {
                e.stopPropagation();
                cartItem.quantity === 1
                  ? dispatch(removeFromCart(productId))
                  : dispatch(decreaseCart(productId));
              }}
            >
              {cartItem.quantity === 1 ? (
                <FaTrash />
              ) : (
                <span style={{ fontSize: "20px" }}>−</span>
              )}
            </button>
            <span className="fw-semibold">{cartItem.quantity}</span>
            <button
              className="btn p-0 px-2 h-100"
              style={{ fontSize: "20px", color: "inherit" }}
              onClick={(e) => {
                e.stopPropagation();
                dispatch(addToCart(product));
              }}
            >
              +
            </button>
          </div>
        ) : (
          <button
            className="btn card-button w-100 mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(addToCart(product));
            }}
          >
            Sepete Ekle
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
