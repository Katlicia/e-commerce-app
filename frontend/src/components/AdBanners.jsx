import banner1 from "../assets/Banners/banner1.png";
import banner2 from "../assets/Banners/banner2.png";
import banner3 from "../assets/Banners/banner3.png";
import "../styles/AdBanners.css";

function AdBanners() {
  return (
    <div className="container my-4 d-flex gap-1 banner-list">
      <div>
        <img className="rounded" src={banner1} />
      </div>
      <div>
        <img className="rounded" src={banner2} />
      </div>
      <div>
        <img className="rounded" src={banner3} />
      </div>
    </div>
  );
}

export default AdBanners;
