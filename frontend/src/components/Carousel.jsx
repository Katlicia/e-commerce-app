import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/Carousel.css";
import icerikFoto from "../assets/icerik.png";
import bicLogo from "../assets/bic-logo.png";
import dogusLogo from "../assets/dogus-logo.png";
import nestleLogo from "../assets/nestle-logo.png";
import selpakLogo from "../assets/selpak-logo.png";
import sleepyLogo from "../assets/sleepy-logo.png";

function Carousel() {
  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <div className="carousel-container">
      <Slider.default {...settings}>
        <div className="d-flex justify-content-center align-items-center">
          <img
            src={icerikFoto}
            className="img-fluid"
            style={{ marginTop: "25px" }}
          />
        </div>
      </Slider.default>
      <div className="logos d-flex justify-content-center align-items-center">
        <img src={sleepyLogo} className="img-fluid" />
        <img src={bicLogo} className="img-fluid" />
        <img src={dogusLogo} className="img-fluid" />
        <img src={nestleLogo} className="img-fluid" />
        <img src={selpakLogo} className="img-fluid" />
      </div>
    </div>
  );
}

export default Carousel;
