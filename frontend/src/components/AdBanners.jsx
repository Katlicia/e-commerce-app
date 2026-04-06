import { useNavigate } from "react-router-dom";
import "../styles/AdBanners.css";
import { useDispatch } from "react-redux";
import { getKeyword } from "../redux/generalSlice";

function AdBanners({ images = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = (link) => {
    if (!link) return;
    if (link.startsWith("cat:")) {
      dispatch(getKeyword(""));
      navigate("/products?category=" + link.slice(4));
    } else if (link.startsWith("brand:")) {
      dispatch(getKeyword(""));
      navigate("/products?brand=" + encodeURIComponent(link.slice(6)));
    } else {
      dispatch(getKeyword(""));
      navigate("/products?category=" + link);
    }
  };

  return (
    <div className="container my-4 d-flex gap-1 banner-list">
      {images.map((img, i) => (
        <div key={i} className="flex-fill">
          <img
            className={`rounded img-fluid w-100${img.link ? " banner-clickable" : ""}`}
            src={img.url}
            onClick={() => handleClick(img.link)}
          />
        </div>
      ))}
    </div>
  );
}

export default AdBanners;
