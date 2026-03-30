import { useNavigate } from "react-router-dom";
import "../styles/AdBanners.css";
import { useDispatch } from "react-redux";
import { getKeyword } from "../redux/generalSlice";

function AdBanners({ banners = [], slugs = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sendKeyword = (value) => {
    dispatch(getKeyword(value));
    navigate("/products");
  };

  return (
    <div className="container my-4 d-flex gap-1 banner-list">
      {banners.map((src, i) => (
        <div key={i} className="flex-fill">
          <img
            className={`rounded img-fluid w-100${slugs[i] ? " banner-clickable" : ""}`}
            src={src}
            onClick={() => {
              sendKeyword(slugs[i]);
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default AdBanners;
