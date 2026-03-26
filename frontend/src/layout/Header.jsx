import { CiHeart, CiSearch } from "react-icons/ci";
import "../styles/Header.css";
import profileIcon from "../assets/Header/profile-icon.svg";
import shoppingCartIcon from "../assets/Header/shopping-cart-icon.svg";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { Link } from "react-router-dom";
import logo from "../assets/Footer/logo.svg";
import { useEffect } from "react";
import { calculateCart } from "../redux/cartSlice";

function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { favourites, cart, totalAmount } = useSelector((store) => store.cart);

  useEffect(() => {
    dispatch(calculateCart());
  }, [])

  return (
    <header className="site-header sticky-top">
      <div className="container">
        <div className="header-main d-flex align-items-center gap-3 gap-lg-4 py-3 flex-wrap flex-lg-nowrap">
          <Link to="/" className="logo-width">
            <img src={logo} />
          </Link>
          <form className="header-search flex-grow-1 w-100 w-lg-auto">
            <input
              className="header-search-input"
              type="text"
              placeholder="Ürün, marka veya kategorilerde ara"
            />
            <button className="header-search-button" type="button">
              <CiSearch style={{ fontSize: "35px" }} />
            </button>
          </form>

          <div className="header-actions ms-lg-auto">
            {user ? (
              <div className="dropdown">
                <div
                  className="header-action"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={profileIcon}
                    style={{
                      width: "40px",
                      backgroundColor: "#F1F2F6",
                      padding: "5px",
                      borderRadius: "10px",
                    }}
                  />
                  <span className="header-action-text">
                    <small>
                      {user.name.charAt(0).toUpperCase() + user.name.slice(1)}{" "}
                      {user.surname.toUpperCase()}
                    </small>
                    <strong>Hesabım</strong>
                  </span>
                </div>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profilim
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => dispatch(logoutUser())}
                    >
                      Çıkış Yap
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link className="header-action" to="/login">
                <img
                  src={profileIcon}
                  style={{
                    width: "40px",
                    backgroundColor: "#F1F2F6",
                    padding: "5px",
                    borderRadius: "10px",
                  }}
                />
                <span className="header-action-text">
                  <small>Hoş geldiniz</small>
                  <strong>Giriş Yap</strong>
                </span>
              </Link>
            )}

            <a className="header-action header-action-icon-only" href="#0">
              <span className="header-heart-badge">{favourites.length}</span>
              <CiHeart
                style={{ fontSize: "40px" }}
                className="header-action-icon"
              />
            </a>

            <a
              className="header-cart"
              href="#0"
              data-bs-toggle="offcanvas"
              data-bs-target="#cartDrawer"
              aria-controls="cartDrawer"
            >
              <div className="position-relative">
                <img
                  src={shoppingCartIcon}
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#F1F2F6",
                    padding: "5px",
                    borderRadius: "10px",
                  }}
                />
                <span className="header-badge">{cart.length}</span>
              </div>
              <span className="header-action-text">
                <small>Sepetiniz</small>
                <strong>{totalAmount}₺</strong>
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
