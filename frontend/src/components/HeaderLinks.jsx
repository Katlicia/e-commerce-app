import { useEffect, useState } from "react";
import shoppingIcon from "../assets/Links/shopping_1.svg";
import messengerIcon from "../assets/Links/messenger_1.svg";
import presentIcon from "../assets/Links/present_1.svg";
import "../styles/Header.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getKeyword } from "../redux/generalSlice";
import { addToCartWithSync } from "../redux/cartSlice";
import axiosInstance from "../utils/axiosInstance";
import { BsHearts } from "react-icons/bs";
import { RiShoppingBasket2Line } from "react-icons/ri";

const MONTHLY_KEY = "monthly-featured";

function HeaderLinks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [monthlyProducts, setMonthlyProducts] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/categories")
      .then((res) => setCategories(res.data.slice(0, 6)))
      .catch((err) => console.error(err));

    axiosInstance
      .get(`/featured-lists/${MONTHLY_KEY}`)
      .then((res) => setMonthlyProducts(res.data.products || []))
      .catch(() => {});
  }, []);

  const handleCategoryClick = (cat) => {
    dispatch(getKeyword(""));
    navigate("/products?category=" + cat.slug);
    setActiveMenu(null);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch(addToCartWithSync(product));
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
              <div
                key={cat._id}
                className="mega-menu-wrapper"
                onMouseEnter={() => setActiveMenu(cat._id)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <a
                  className="header-nav-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat.name}
                </a>
                {cat.children?.length > 0 && activeMenu === cat._id && (
                  <div className="mega-menu-dropdown">
                    {cat.children.map((sub) => (
                      <div key={sub._id} className="mega-menu-section">
                        <a
                          className="mega-menu-section-title"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleCategoryClick(sub)}
                        >
                          {sub.name}
                        </a>
                        {sub.children?.map((subsub) => (
                          <a
                            key={subsub._id}
                            className="mega-menu-item"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleCategoryClick(subsub)}
                          >
                            {subsub.name}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div
            className="header-featured-links"
            style={{ borderLeft: "1px solid #eef1f3", paddingLeft: "15px" }}
          >
            <a
              className="header-nav-link header-link-blue"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/campaigns")}
            >
              <img style={{ paddingBottom: "3px" }} src={presentIcon} />
              Kampanyalar
            </a>

            <div
              className="mega-menu-wrapper"
              onMouseEnter={() => setActiveMenu(MONTHLY_KEY)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <a
                className="header-nav-link header-link-orange"
                style={{ cursor: "pointer" }}
              >
                <img style={{ paddingBottom: "3px" }} src={messengerIcon} />
                Ayın Ürünleri
              </a>

              {activeMenu === MONTHLY_KEY && (
                <div className="monthly-dropdown">
                  {monthlyProducts.length === 0 ? (
                    <div className="monthly-dropdown-empty">
                      Henüz ürün eklenmedi.
                    </div>
                  ) : (
                    monthlyProducts.map((product) => (
                      <div
                        key={product._id}
                        className="monthly-dropdown-row"
                        onClick={() => {
                          navigate("/" + product._id);
                          setActiveMenu(null);
                        }}
                      >
                        <img
                          src={product.images?.[0]?.url}
                          alt={product.name}
                          className="monthly-dropdown-img"
                        />
                        <div className="monthly-dropdown-name">
                          {product.name}
                        </div>
                        <div className="monthly-dropdown-price">
                          {(
                            product.discountedPrice ?? product.price
                          )?.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          TL
                        </div>
                        <button
                          className="monthly-dropdown-btn"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          Sepete Ekle
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div
              className="mega-menu-wrapper"
              onMouseEnter={() => setActiveMenu("hemen-al")}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <a
                className="header-nav-link header-link-green"
                style={{ cursor: "pointer" }}
              >
                <img style={{ paddingBottom: "3px" }} src={shoppingIcon} />
                Hemen Al
              </a>
              {activeMenu === "hemen-al" && (
                <div className="hemen-al-dropdown">
                  <div
                    className="hemen-al-card hemen-al-card-favori"
                    onClick={() => {
                      navigate(user ? "/favourites" : "/login");
                      setActiveMenu(null);
                    }}
                  >
                    <BsHearts className="hemen-al-card-icon" />
                    Favorilerim
                  </div>
                  <div
                    className="hemen-al-card hemen-al-card-recent"
                    onClick={() => {
                      setActiveMenu(null);
                      navigate("/", { state: { scrollTo: "recently-viewed" } });
                    }}
                  >
                    <RiShoppingBasket2Line className="hemen-al-card-icon" />
                    Son Baktıklarım
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderLinks;
