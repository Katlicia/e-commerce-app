import { CiHeart, CiSearch, CiShoppingCart, CiUser } from "react-icons/ci";
import "../styles/Header.css";
import profileIcon from "../assets/profile-icon.svg";
import shoppingCartIcon from "../assets/shopping-cart-icon.svg";
import shoppingIcon from "../assets/shopping_1.svg";
import messengerIcon from "../assets/messenger_1.svg";
import presentIcon from "../assets/present_1.svg";

const categories = [
  "Gıda Mutfak",
  "Kağıt Ürünleri",
  "Ofis Kırtasiye",
  "Temizlik Ürünleri",
  "Çok Al Az Öde",
  "Listeli Ürünler",
];

const featuredLinks = [
  { label: "Kampanyalar", colorClass: "header-link-blue", icon: presentIcon },
  {
    label: "Ayın Ürünleri",
    colorClass: "header-link-orange",
    icon: messengerIcon,
  },
  { label: "Hemen Al", colorClass: "header-link-green", icon: shoppingIcon },
];

function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-main d-flex align-items-center gap-3 gap-lg-4 py-3 flex-wrap flex-lg-nowrap">
          <form className="header-search flex-grow-1 w-100 w-lg-auto">
            <input
              className="header-search-input"
              type="text"
              placeholder="Urun, marka veya kategorilerde ara"
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

      <div className="header-nav-wrapper">
        <div className="container">
          <div className="header-nav">
            <nav className="header-categories">
              {categories.map((item) => (
                <a key={item} className="header-nav-link" href="#0">
                  {item}
                </a>
              ))}
            </nav>

            <div className="header-featured-links">
              {featuredLinks.map((item) => (
                <a
                  key={item.label}
                  className={`header-nav-link ${item.colorClass}`}
                  href="#0"
                >
                  <img style={{ paddingBottom: "3px" }} src={item.icon} />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
