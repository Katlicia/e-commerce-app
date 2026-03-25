import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter } from "react-router-dom";
import Header from "./layout/Header.jsx";
import Footer from "./layout/Footer.jsx";
import Topbar from "./components/Topbar.jsx";
import Carousel from "./components/Carousel.jsx";
import Featured from "./components/Featured.jsx";
import ProductList from "./components/ProductList.jsx";
import HeaderLinks from "./components/HeaderLinks.jsx";
import AdBanners from "./components/AdBanners.jsx";
import Brands from "./components/Brands.jsx";
import PopularLinks from "./components/PopularLinks.jsx";

function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <Header />
      <HeaderLinks />
      <Carousel />
      <Featured />
      <ProductList title="Kaçırılmayacak Fırsatlar" showTimer />
      <ProductList title="Yeni Gelenler" />
      <AdBanners />
      <ProductList title="Önerilen Ürünler" />
      <Brands />
      <PopularLinks />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
