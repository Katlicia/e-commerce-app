import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/Carousel.css";
import bicLogo from "../assets/Carousel/bic-logo.png";
import dogusLogo from "../assets/Carousel/dogus-logo.png";
import nestleLogo from "../assets/Carousel/nestle-logo.png";
import selpakLogo from "../assets/Carousel/selpak-logo.png";
import sleepyLogo from "../assets/Carousel/sleepy-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { getBanner } from "../redux/bannerSlice";

function Carousel() {
  const dispatch = useDispatch();
  const sliderRef = useRef(null);
  const images = useSelector((state) => state.banner.banners["carousel"]);

  useEffect(() => {
    dispatch(getBanner("carousel"));
  }, []);

  if (!images || images.length === 0) return null;

  const slides = images;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: false,
    pauseOnFocus: false,
    arrows: false,
  };

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={() => sliderRef.current.slickPrev()}
        >
          &#8249;
        </button>
        <Slider.default ref={sliderRef} {...settings}>
          {slides.map((img, i) => (
            <div key={i} className="carousel-slide">
              <img src={img.url} alt={`slide-${i}`} />
            </div>
          ))}
        </Slider.default>
        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={() => sliderRef.current.slickNext()}
        >
          &#8250;
        </button>
      </div>
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
