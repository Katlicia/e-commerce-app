import "../styles/TopBar.css";
import topbarImg from "../assets/Banners/topbar.png";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getBanner } from "../redux/bannerSlice";

function TopBar() {
  const dispatch = useDispatch();
  const images = useSelector((state) => state.banner.banners["topbar"]);

  useEffect(() => {
    dispatch(getBanner("topbar"));
  }, []);

  const src = images?.length > 0 ? images[0].url : topbarImg;

  return (
    <div className="topbar">
      <img src={src} alt="topbar" />
    </div>
  );
}

export default TopBar;
