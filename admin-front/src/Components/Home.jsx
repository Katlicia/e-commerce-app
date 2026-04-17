import { useState } from "react";
import AdminLayout from "./AdminLayout";
import Analytics from "./Analytics";
import UsersPanel from "./UsersPanel";
import CategoriesPanel from "./CategoriesPanel";
import ProductsPanel from "./ProductsPanel";
import OrdersPanel from "./OrdersPanel";
import CargoPanel from "./CargoPanel";
import TaxSettingsPanel from "./TaxSettingsPanel";
import BannersPanel from "./BannersPanel";
import ProductListsPanel from "./ProductListsPanel";
import CouponsPanel from "./CouponsPanel";
import FeaturedListsPanel from "./FeaturedListsPanel";
import CampaignsPanel from "./CampaignsPanel";
import HomeLayoutPanel from "./HomeLayoutPanel";

const PAGES = {
  analytics: <Analytics />,
  users: <UsersPanel />,
  categories: <CategoriesPanel />,
  products: <ProductsPanel />,
  orders: <OrdersPanel />,
  cargos: <CargoPanel />,
  taxSettings: <TaxSettingsPanel />,
  banners: <BannersPanel />,
  productLists: <ProductListsPanel />,
  coupons: <CouponsPanel />,
  featuredLists: <FeaturedListsPanel />,
  campaigns: <CampaignsPanel />,
  homeLayout: <HomeLayoutPanel />,
};

function Home() {
  const [active, setActive] = useState("analytics");

  return (
    <AdminLayout activeKey={active} onMenuClick={setActive}>
      {PAGES[active]}
    </AdminLayout>
  );
}

export default Home;
