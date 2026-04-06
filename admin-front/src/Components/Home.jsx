import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { LuUser } from "react-icons/lu";
import { TbCategory } from "react-icons/tb";
import { TbGift } from "react-icons/tb";
import { TbReceipt } from "react-icons/tb";
import { TbReportAnalytics } from "react-icons/tb";
import { TbLogout } from "react-icons/tb";
import { logoutUser } from "../redux/authSlice";
import Analytics from "./Analytics";
import UsersPanel from "./UsersPanel";
import CategoriesPanel from "./CategoriesPanel";
import ProductsPanel from "./ProductsPanel";
import OrdersPanel from "./OrdersPanel";
import { useNavigate } from "react-router";

const MENU_ITEMS = [
  { key: "analytics", label: "Analitikler", icon: <TbReportAnalytics /> },
  { key: "users", label: "Kullanıcılar", icon: <LuUser /> },
  { key: "categories", label: "Kategoriler", icon: <TbCategory /> },
  { key: "products", label: "Ürünler", icon: <TbGift /> },
  { key: "orders", label: "Siparişler", icon: <TbReceipt /> },
];

function Home() {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [active, setActive] = useState("analytics");

  const navigate = useNavigate();

  function logoutandRedirect() {
    dispatch(logoutUser());
    navigate("/login");
  }

  const activeStyle = {
    backgroundColor: "#ff6a00",
    color: "#351600",
  };

  const PAGES = {
    analytics: <Analytics />,
    users: <UsersPanel />,
    categories: <CategoriesPanel />,
    products: <ProductsPanel />,
    orders: <OrdersPanel />,
  };

  const handleMenuItemClick = (key) => {
    setActive(key);
    setToggled(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        style={{ height: "100vh" }}
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        breakPoint="md"
      >
        <Menu>
          <MenuItem
            icon={<RxHamburgerMenu />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ textAlign: "center" }}
          >
            <span className="orange-text fw-bold h4">Listensi Panel</span>
          </MenuItem>
          {MENU_ITEMS.map(({ key, label, icon }) => (
            <MenuItem
              key={key}
              icon={icon}
              onClick={() => handleMenuItemClick(key)}
              style={active === key ? activeStyle : {}}
            >
              {label}
            </MenuItem>
          ))}
        </Menu>

        <div style={{ borderTop: "1px solid #f0f0f0" }}>
          <Menu>
            <MenuItem
              icon={<TbLogout />}
              onClick={() => logoutandRedirect()}
              style={{ color: "#ef4444" }}
            >
              Çıkış Yap
            </MenuItem>
          </Menu>
        </div>
      </Sidebar>

      <main style={{ flex: 1, overflowY: "auto", background: "#f5f6fa" }}>
        <div
          className="d-md-none"
          style={{
            padding: "12px 16px",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <button
            onClick={() => setToggled(!toggled)}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: "#ff6a00",
            }}
          >
            <RxHamburgerMenu />
          </button>
        </div>

        {PAGES[active]}
      </main>
    </div>
  );
}

export default Home;
