import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import "../styles/Featured.css";
import simsekLogo from "../assets/Featured/simsek.svg";
import sepetLogo from "../assets/Featured/sepet.svg";
import cayLogo from "../assets/Featured/cay.svg";
import kutuLogo from "../assets/Featured/kutu.svg";
import boyaLogo from "../assets/Featured/boya.svg";
import termosLogo from "../assets/Featured/termos.svg";
import stokLogo from "../assets/Featured/stok.svg";

const items = [
  {
    icon: simsekLogo,
    label: "Flaş İndirimler",
    filter: { badge: "indirimli" },
  },
  { icon: sepetLogo, label: "Çok Satanlar", filter: { badge: "en-cok-satan" } },
  { icon: cayLogo, label: "Çay Çeşitleri", filter: { category: "caylar" } },
  {
    icon: kutuLogo,
    label: "Çok Al Az Öde",
    filter: { category: "cok-al-az-ode" },
  },
  {
    icon: boyaLogo,
    label: "Editörden",
    filter: { category: "editorun-secimi" },
  },
  {
    icon: termosLogo,
    label: "Hediyeli Ürünler",
    filter: { category: "hediyeli-urunler" },
  },
  { icon: stokLogo, label: "Stokları Eritiyoruz", filter: { stockLte: 20 } },
];

function buildTo(filter) {
  if (filter?.badge) return `/products?badge=${filter.badge}`;
  if (filter?.category) return `/products?category=${filter.category}`;
  if (filter?.stockLte != null) return `/products?stockLte=${filter.stockLte}`;
  return "/products";
}

async function fetchCount(filter) {
  try {
    if (filter?.badge) {
      const res = await axiosInstance.get(
        `/products?badge=${filter.badge}&limit=1`,
      );
      return res.data.total ?? null;
    }
    if (filter?.category) {
      const catRes = await axiosInstance.get(`/categories/${filter.category}`);
      if (!catRes.data?._id) return null;
      const res = await axiosInstance.get(
        `/products?category=${catRes.data._id}&limit=1`,
      );
      return res.data.total ?? null;
    }
    if (filter?.stockLte != null) {
      const res = await axiosInstance.get(
        `/products?stockLte=${filter.stockLte}&limit=1`,
      );
      return res.data.total ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

function Featured() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    items.forEach((item, idx) => {
      fetchCount(item.filter).then((count) => {
        if (count !== null) {
          setCounts((prev) => ({ ...prev, [idx]: count }));
        }
      });
    });
  }, []);

  return (
    <div className="featured-wrapper">
      <div className="container">
        <div className="featured-list">
          {items.map((item, idx) => (
            <Link
              key={item.label}
              to={buildTo(item.filter)}
              className="featured-item"
            >
              <img src={item.icon} alt={item.label} className="featured-icon" />
              <span className="featured-label">{item.label}</span>
              <span className="featured-count">
                {counts[idx] != null ? `${counts[idx]} Ürün` : "Çok Yakında"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Featured;
