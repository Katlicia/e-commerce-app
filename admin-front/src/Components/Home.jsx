import { useState } from "react";
import AdminLayout from "./AdminLayout";
import Analytics from "./Analytics";
import UsersPanel from "./UsersPanel";
import CategoriesPanel from "./CategoriesPanel";
import ProductsPanel from "./ProductsPanel";
import OrdersPanel from "./OrdersPanel";

const PAGES = {
  analytics: <Analytics />,
  users: <UsersPanel />,
  categories: <CategoriesPanel />,
  products: <ProductsPanel />,
  orders: <OrdersPanel />,
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
