import "../styles/Topbar.css";
import topbarImg from "../assets/topbar.png"

function Topbar() {
  return (
    <div className="topbar">
      <img src={topbarImg} alt="topbar"/>
    </div>
  )
}

export default Topbar;
