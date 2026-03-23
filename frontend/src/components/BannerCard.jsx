import banner from "../assets/banner.png";

function BannerCard() {
  return (
    <div className="card h-100">
      <img
        src={banner}
        className="card-img img-fluid h-100"
        style={{ objectFit: "cover", cursor: "pointer" }}
      />
    </div>
  );
}

export default BannerCard;
