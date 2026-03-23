import caykurLogo from "../assets/Brands/caykurLogo.png";
import kahveciLogo from "../assets/Brands/kahveciLogo.png";
import sleepyLogo from "../assets/Brands/sleepyLogo.png";
import jacobsLogo from "../assets/Brands/jacobsLogo.png";
import omoLogo from "../assets/Brands/omoLogo.png";
import bicLogo from "../assets/Brands/bicLogo.png";
import dogusLogo from "../assets/Brands/dogusLogo.png";
import "../styles/BrandLogos.css";

function BrandLogos() {
  return (
    <div className="container my-4">
      <div className="row flex-nowrap overflow-x-auto brand-list g-3 desktop-gap">
        <div className="col-4 col-md-3 col-lg d-flex justify-content-center">
          <img src={caykurLogo} className="img-fluid" />
        </div>
        <div className="col-4 col-md-3 col-lg d-flex justify-content-center">
          <img src={kahveciLogo} className="img-fluid" />
        </div>
        <div className="col-4 col-md-3 col-lg d-flex justify-content-center">
          <img src={sleepyLogo} className="img-fluid" />
        </div>
        <div className="col-4 col-md-3 col-lg d-flex justify-content-center">
          <img src={jacobsLogo} className="img-fluid" />
        </div>
        <div className="col-4 col-md-3 col-lg d-flex justify-content-center">
          <img src={omoLogo} className="img-fluid" />
        </div>
        <div className="col-4 col-md-3 col-lg d-flex justify-content-center">
          <img src={bicLogo} className="img-fluid" />
        </div>
        <div className="col-4 col-md-3 col-lg d-flex justify-content-center">
          <img src={dogusLogo} className="img-fluid" />
        </div>
      </div>
    </div>
  );
}

export default BrandLogos;
