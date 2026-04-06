import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminGetOrders } from "../redux/adminSlice";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTH_LABELS = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];
const EXCLUDED = ["İptal Edildi", "İade Edildi"];
const currentYear = new Date().getFullYear();
const START_YEAR = 2025;
const YEARS = Array.from(
  { length: currentYear - START_YEAR + 1 },
  (_, i) => currentYear - i,
);

function formatCurrency(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₺`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K ₺`;
  return `${Number(value).toFixed(2)} ₺`;
}

function buildMonthlyData(orders, year) {
  const totals = Array(12).fill(0);

  orders.forEach((order) => {
    if (EXCLUDED.includes(order.status)) return;
    const date = new Date(order.createdAt);
    if (date.getFullYear() === year) {
      totals[date.getMonth()] += order.totalAmount;
    }
  });

  const nowMonth = year === currentYear ? new Date().getMonth() : 11;
  return MONTH_LABELS.map((month, i) => ({
    month,
    total: i <= nowMonth ? totals[i] : null,
  }));
}

function SalesAnalytics() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.admin.orders);
  const loading = useSelector((state) => state.admin.loading);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    if (orders.length === 0) dispatch(adminGetOrders());
  }, []);

  const data = buildMonthlyData(orders, selectedYear);
  const total = data.reduce((sum, d) => sum + (d.total || 0), 0);

  return (
    <div className="p-4">
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center fw-bold mb-3 h3">
          <span>Satış Değerlendirmesi</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "14px",
              fontWeight: "normal",
              color: "#444",
              cursor: "pointer",
            }}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 orange-text">
          <span style={{ fontSize: "28px", fontWeight: 700 }}>
            {loading ? "..." : formatCurrency(total)}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={true}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#999" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#999" }}
              tickFormatter={formatCurrency}
              width={70}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Ciro"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #eee",
                fontSize: "13px",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Ciro"
              stroke="#ff6a00"
              strokeWidth={2}
              fill="url(#colorTotal)"
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesAnalytics;
