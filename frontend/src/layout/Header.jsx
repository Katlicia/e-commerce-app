import { CiHeart, CiSearch } from "react-icons/ci";
import "../styles/Header.css";
import profileIcon from "../assets/Header/profile-icon.svg";
import shoppingCartIcon from "../assets/Header/shopping-cart-icon.svg";

function Header() {
  return (
    <header className="site-header sticky-top">
      <div className="container">
        <div className="header-main d-flex align-items-center gap-3 gap-lg-4 py-3 flex-wrap flex-lg-nowrap">
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
            <a className="header-action" href="#0">
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
                <small>Akin KARPUZ</small>
                <strong>Hesabim</strong>
              </span>
            </a>

            <a className="header-action header-action-icon-only" href="#0">
              <span className="header-heart-badge">2</span>
              <CiHeart
                style={{ fontSize: "40px" }}
                className="header-action-icon"
              />
            </a>

            <a className="header-cart" href="#0">
              <span className="header-badge">2</span>
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
              <span className="header-action-text">
                <small>Sepetiniz</small>
                <strong>280.00tl</strong>
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
