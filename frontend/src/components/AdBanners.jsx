import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getBanner } from "../redux/bannerSlice";
import { getKeyword } from "../redux/generalSlice";
import "../styles/AdBanners.css";

function AdBanners({ type }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const images = useSelector((state) => state.banner.banners[type]);

  useEffect(() => {
    dispatch(getBanner(type));
  }, [type]);

  if (!images || images.length === 0) return null;

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
    <div className="container my-4 d-flex gap-2">
      {images.map((img, i) => (
        <div key={i} style={{ flex: 1 }}>
          <img
            className={`img-fluid rounded w-100${img.link ? " banner-clickable" : ""}`}
            src={img.url}
            onClick={() => handleClick(img.link)}
          />
        </div>
      ))}
    </div>
  );
}

export default AdBanners;
