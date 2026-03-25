import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter } from "react-router-dom";
import Header from "./layout/Header.jsx";
import Footer from "./layout/Footer.jsx";
import Carousel from "./components/Carousel.jsx";
import Featured from "./components/Featured.jsx";
import ProductList from "./components/ProductList.jsx";
import HeaderLinks from "./components/HeaderLinks.jsx";
import AdBanners from "./components/AdBanners.jsx";
import CategoryRow from "./components/CategoryRow.jsx";
import Brands from "./components/Brands.jsx";
import PopularLinks from "./components/PopularLinks.jsx";
import TopBar from "./components/Topbar.jsx";
import AdBar from "./components/AdBar.jsx";
import DealOfDay from "./components/DealOfDay.jsx";
import banner from "./assets/Banners/banner.png";
import banner1 from "./assets/Banners/banner1.png";
import banner2 from "./assets/Banners/banner2.png";
import banner3 from "./assets/Banners/banner3.png";
import liptonBanner from "./assets/Banners/lipton-banner.png";
import cifBanner from "./assets/Banners/cif-banner.png";

function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <Header />
      <HeaderLinks />
      <Carousel />
      <Featured />
      <ProductList
        title="Kaçırılmayacak Fırsatlar"
        settings={{ showTimer: true, banner: banner }}
      />
      <ProductList title="Yeni Gelenler" />
      <AdBanners banners={[banner1, banner2, banner3]} />
      <ProductList title="Önerilen Ürünler" />
      <CategoryRow left="Okul Kırtasiye" right="Temizlik" />
      <AdBar />
      <ProductList title="Son Gezdiğin Ürünler" />
      <AdBanners banners={[liptonBanner, cifBanner]} />
      <DealOfDay />
      <Brands />
      <PopularLinks />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
