import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PopularLinks.css";

const popularSearches = [
  "Ayın Ürünleri",
  "Karton Bardak",
  "A4 Fotokopi Kağıdı",
  "Çamaşır Suları",
  "Türk Kahvesi",
  "Plastik Klasör",
  "Çöp Poşeti",
  "Kahve Kreması",
  "İkinci El",
  "Tükenmez Kalem",
  "Telli Dosya",
  "Tuvalet Kağıdı",
  "Kalemlik",
  "Kağıt Havlu",
  "Zımba",
  "Powerbank",
  "Karton Koli",
];

function flatten(tree) {
  return tree.flatMap((cat) => [cat, ...flatten(cat.children || [])]);
}

function PopularLinks() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/categories")
      .then((res) => setCategories(flatten(res.data).slice(0, 27)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <div className="container">
        <div className="hero-text-wrapper">
          <hr />
          <span className="hero-text">
            <strong>Binlerce ürünü Listensi kalitesi ile hemen alın.</strong> İş
            yeri alışverişinin en iyisi
          </span>
        </div>
        <div className="row py-4">
          <div className="col-12 col-lg-7 mb-4 mb-lg-0">
            <h6 className="fw-bold mb-3">Popüler Kategoriler</h6>
            <div className="row row-cols-3 g-1">
              {categories.map((cat) => (
                <div key={cat._id} className="col">
                  <a
                    className="text-muted text-decoration-none popular-link"
                    style={{ fontSize: "13px" }}
                  >
                    {cat.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <h6 className="fw-bold mb-3">Popüler Aramalar</h6>
            <div className="row row-cols-2 g-1">
              {popularSearches.map((item, i) => (
                <div key={i} className="col">
                  <a
                    href="#0"
                    className="text-muted text-decoration-none popular-link"
                    style={{ fontSize: "13px" }}
                  >
                    {item}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PopularLinks;
