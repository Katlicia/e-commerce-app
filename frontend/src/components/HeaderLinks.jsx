import { useEffect, useState } from "react";
import shoppingIcon from "../assets/Links/shopping_1.svg";
import messengerIcon from "../assets/Links/messenger_1.svg";
import presentIcon from "../assets/Links/present_1.svg";
import "../styles/Header.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getKeyword } from "../redux/generalSlice";
import axiosInstance from "../utils/axiosInstance";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/categories")
      .then((res) => setCategories(res.data.slice(0, 6)))
      .catch((err) => console.error(err));
  }, []);

  const handleCategoryClick = (cat) => {
    dispatch(getKeyword(""));
    navigate("/products?category=" + cat.slug);
  };

  return (
    <div
      className="header-nav-wrapper"
      style={{ borderBottom: "1px solid #e9ecef" }}
    >
      <div className="container">
        <div className="header-nav">
          <nav className="header-categories">
            {categories.map((cat) => (
              <a
                key={cat._id}
                className="header-nav-link"
                style={{ cursor: "pointer" }}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.name}
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
