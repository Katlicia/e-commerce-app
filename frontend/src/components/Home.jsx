import HeaderLinks from "./HeaderLinks";
import Carousel from "./Carousel";
import Featured from "./Featured";
import ProductList from "./ProductList";
import AdBanners from "./AdBanners";
import CategoryRow from "./CategoryRow";
import AdBar from "./AdBar";
import DealOfDay from "./DealOfDay";
import Brands from "./Brands";
import PopularLinks from "./PopularLinks";
import banner from "../assets/Banners/banner.png";
import banner1 from "../assets/Banners/banner1.png";
import banner2 from "../assets/Banners/banner2.png";
import banner3 from "../assets/Banners/banner3.png";
import liptonBanner from "../assets/Banners/lipton-banner.png";
import cifBanner from "../assets/Banners/cif-banner.png";

function Home() {
  return (
    <>
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
    </>
  );
}

export default Home;
