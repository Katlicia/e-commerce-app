import SalesAnalytics from "./SalesAnalytics";
import OrderAnalytics from "./OrderAnalytics";
import ProductAnalytics from "./ProductAnalytics";

function Analytics() {
  return (
    <div style={{ overflowX: "hidden" }}>
      <SalesAnalytics />
      <OrderAnalytics />
      <ProductAnalytics />
    </div>
  );
}

export default Analytics;
