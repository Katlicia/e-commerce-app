import "../styles/TopBar.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getBanner } from "../redux/bannerSlice";

function TopBar() {
  const dispatch = useDispatch();
  const images = useSelector((state) => state.banner.banners["topbar"]);

  useEffect(() => {
    dispatch(getBanner("topbar"));
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <div className="topbar">
      <img src={images[0].url} alt="topbar" />
    </div>
  );
}

export default TopBar;
