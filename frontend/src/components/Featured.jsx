import "../styles/Featured.css";
import simsekLogo from "../assets/Featured/simsek.svg";
import sepetLogo from "../assets/Featured/sepet.svg";
import cayLogo from "../assets/Featured/cay.svg";
import kutuLogo from "../assets/Featured/kutu.svg";
import boyaLogo from "../assets/Featured/boya.svg";
import termosLogo from "../assets/Featured/termos.svg";
import stokLogo from "../assets/Featured/stok.svg";

const items = [
  { icon: simsekLogo, label: "Flaş İndirimler", count: 32 },
  { icon: sepetLogo, label: "Çok Satanlar", count: 200 },
  { icon: cayLogo, label: "Çay Çeşitleri", count: 100 },
  { icon: kutuLogo, label: "Çok Al Az Öde", count: 26 },
  { icon: boyaLogo, label: "Editörden", count: 300 },
  { icon: termosLogo, label: "Hediyeli Ürünler", count: 92 },
  { icon: stokLogo, label: "Stokları Eritiyoruz", count: 8 },
];

function Featured() {
  return (
    <div className="featured-wrapper">
      <div className="container">
        <div className="featured-list">
          {items.map((item) => (
            <a key={item.label} href="#0" className="featured-item">
              <img src={item.icon} alt={item.label} className="featured-icon" />
              <span className="featured-label">{item.label}</span>
              <span className="featured-count">{item.count} Ürün</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Featured;
