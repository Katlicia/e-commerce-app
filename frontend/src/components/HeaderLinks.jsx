import shoppingIcon from "../assets/Links/shopping_1.svg";
import messengerIcon from "../assets/Links/messenger_1.svg";
import presentIcon from "../assets/Links/present_1.svg";
import "../styles/Header.css";

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

function HeaderLinks() {
  return (
    <div
      className="header-nav-wrapper"
      style={{ borderBottom: "1px solid #e9ecef" }}
    >
      <div className="container">
        <div className="header-nav">
          <nav className="header-categories">
            {categories.map((item) => (
              <a key={item} className="header-nav-link" href="#0">
                {item}
              </a>
            ))}
          </nav>

          <div
            className="header-featured-links"
            style={{ borderLeft: "1px solid #eef1f3", paddingLeft: "15px" }}
          >
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
  );
}

export default HeaderLinks;
