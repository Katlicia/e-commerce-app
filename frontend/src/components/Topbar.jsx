import "../styles/TopBar.css";
import topbarImg from "../assets/Banners/topbar.png";

function TopBar() {
  return (
    <div className="topbar">
      <img src={topbarImg} alt="topbar" />
    </div>
  );
}

export default TopBar;
