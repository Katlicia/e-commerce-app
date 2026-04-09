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
  Legend,
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
const currentYear = new Date().getFullYear();
const START_YEAR = 2025;
const YEARS = Array.from(
  { length: currentYear - START_YEAR + 1 },
  (_, i) => currentYear - i,
);

const TRACKED_STATUSES = [
  { key: "Teslim Edildi", label: "Teslim Edildi", color: "#22c55e" },
  { key: "İptal Edildi", label: "İptal Edildi", color: "#ff0000" },
  { key: "İade Edildi", label: "İade Edildi", color: "#4882ff" },
  { key: "Hazırlanıyor", label: "Hazırlanıyor", color: "#ffa15e" },
  { key: "Kargoya Verildi", label: "Kargoya Verildi", color: "#78e4ff" },
];

function buildMonthlyData(orders, year) {
  const counts = {};
  TRACKED_STATUSES.forEach(({ key }) => {
    counts[key] = Array(12).fill(0);
  });

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    if (date.getFullYear() !== year) return;
    if (counts[order.status] !== undefined) {
      counts[order.status][date.getMonth()]++;
    }
  });

  const nowMonth = year === currentYear ? new Date().getMonth() : 11;
  return MONTH_LABELS.map((month, i) => {
    const row = { month };
    TRACKED_STATUSES.forEach(({ key }) => {
      row[key] = i <= nowMonth ? counts[key][i] : null;
    });
    return row;
  });
}

function OrderAnalytics() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.admin.orders);
  const loading = useSelector((state) => state.admin.loading);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    if (orders.length === 0) dispatch(adminGetOrders());
  }, []);

  const data = buildMonthlyData(orders, selectedYear);

  const totals = {};
  TRACKED_STATUSES.forEach(({ key }) => {
    totals[key] = data.reduce((sum, d) => sum + (d[key] || 0), 0);
  });

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
          <span>Sipariş Analizi</span>
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

        <div className="d-flex gap-4 mb-4">
          {TRACKED_STATUSES.map(({ key, label, color }) => (
            <div key={key}>
              <div
                style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}
              >
                {label}
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color }}>
                {loading ? "..." : totals[key]}
              </div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {TRACKED_STATUSES.map(({ key, color }) => (
                <linearGradient
                  key={key}
                  id={`grad-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
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
              allowDecimals={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #eee",
                fontSize: "13px",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }}
            />
            {TRACKED_STATUSES.map(({ key, label, color }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={2}
                fill={"url(#colorTotal)"}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default OrderAnalytics;
