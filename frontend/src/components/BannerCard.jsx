function BannerCard({ image }) {
  return (
    <div className="card h-100">
      <img
        src={image}
        className="card-img img-fluid h-100"
        style={{ objectFit: "cover", cursor: "pointer" }}
      />
    </div>
  );
}

export default BannerCard;
