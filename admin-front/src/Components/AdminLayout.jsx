import { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { RxHamburgerMenu } from "react-icons/rx";
import { LuUser } from "react-icons/lu";
import {
  TbCategory,
  TbGift,
  TbReceipt,
  TbReportAnalytics,
  TbLogout,
  TbTruck,
  TbReceiptTax,
  TbPhoto,
  TbLayoutList,
  TbTicket,
  TbStar,
  TbSpeakerphone,
  TbLayoutDashboard,
  TbListCheck,
  TbMessageCircleQuestion,
  TbActivityHeartbeat,
  TbBriefcase,
  TbShoppingCart,
  TbPackage,
  TbUsers,
  TbPalette,
  TbChartBar,
} from "react-icons/tb";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/authSlice";

const MENU_GROUPS = [
  {
    key: "genel",
    label: "Genel",
    icon: <TbChartBar />,
    items: [
      { key: "analytics", label: "Analitikler", icon: <TbReportAnalytics /> },
      { key: "logs", label: "Aktivite Logları", icon: <TbActivityHeartbeat /> },
    ],
  },
  {
    key: "satis",
    label: "Satış & Müşteri",
    icon: <TbShoppingCart />,
    items: [
      { key: "orders", label: "Siparişler", icon: <TbReceipt /> },
      { key: "coupons", label: "Kuponlar", icon: <TbTicket /> },
      { key: "campaigns", label: "Kampanyalar", icon: <TbSpeakerphone /> },
      { key: "corporateOffers", label: "Kurumsal Teklifler", icon: <TbBriefcase /> },
    ],
  },
  {
    key: "urun",
    label: "Ürün Yönetimi",
    icon: <TbPackage />,
    items: [
      { key: "products", label: "Ürünler", icon: <TbGift /> },
      { key: "categories", label: "Kategoriler", icon: <TbCategory /> },
      { key: "listedProducts", label: "Listeli Ürünler", icon: <TbListCheck /> },
      { key: "featuredLists", label: "Ayın Ürünleri", icon: <TbStar /> },
    ],
  },
  {
    key: "lojistik",
    label: "Lojistik",
    icon: <TbTruck />,
    items: [
      { key: "cargos", label: "Kargolar", icon: <TbTruck /> },
      { key: "taxSettings", label: "Vergi & Kargo Ayarları", icon: <TbReceiptTax /> },
    ],
  },
  {
    key: "kullanicilar",
    label: "Kullanıcılar & Destek",
    icon: <TbUsers />,
    items: [
      { key: "users", label: "Kullanıcılar", icon: <LuUser /> },
      { key: "questions", label: "Soru & Cevap", icon: <TbMessageCircleQuestion /> },
    ],
  },
  {
    key: "gorunum",
    label: "Görünüm",
    icon: <TbPalette />,
    items: [
      { key: "banners", label: "Bannerlar", icon: <TbPhoto /> },
      { key: "homeLayout", label: "Ana Sayfa Düzeni", icon: <TbLayoutDashboard /> },
      { key: "productLists", label: "Ürün Listeleri", icon: <TbLayoutList /> },
    ],
  },
];

function AdminLayout({ children, activeKey, onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);

  const activeStyle = { backgroundColor: "#ff6a00", color: "#351600" };

  const handleMenuClick = (key) => {
    if (onMenuClick) {
      onMenuClick(key);
    } else {
      navigate("/");
    }
    setToggled(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        style={{ height: "100vh", backgroundColor: "#fff" }}
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

          {MENU_GROUPS.map((group) => {
            const isGroupActive = group.items.some((item) => item.key === activeKey);
            return (
              <SubMenu
                key={group.key}
                label={group.label}
                icon={group.icon}
                defaultOpen={isGroupActive}
                style={isGroupActive ? { fontWeight: 700 } : {}}
              >
                {group.items.map(({ key, label, icon }) => (
                  <MenuItem
                    key={key}
                    icon={icon}
                    onClick={() => handleMenuClick(key)}
                    style={activeKey === key ? activeStyle : {}}
                  >
                    {label}
                  </MenuItem>
                ))}
              </SubMenu>
            );
          })}
        </Menu>

        <div style={{ borderTop: "1px solid #f0f0f0" }}>
          <Menu>
            <MenuItem
              icon={<TbLogout />}
              onClick={() => {
                dispatch(logoutUser());
                navigate("/login");
              }}
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
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
