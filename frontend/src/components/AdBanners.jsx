import "../styles/AdBanners.css";

function AdBanners({ banners = [] }) {
  return (
    <div className="container my-4 d-flex gap-1 banner-list">
      {banners.map((src, i) => (
        <div key={i} className="flex-fill">
          <img className="rounded img-fluid w-100" src={src} />
        </div>
      ))}
    </div>
  );
}

export default AdBanners;
