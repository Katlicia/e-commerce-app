import HeaderLinks from "./HeaderLinks";
import Carousel from "./Carousel";
import Featured from "./Featured";
import ProductList from "./ProductList";
import AdBanners from "./AdBanners";
import CategoryRow from "./CategoryRow";
import AdBar from "./AdBar";
import DealOfDay from "./DealOfDay";
import banner from "../assets/Banners/banner.png";
import banner1 from "../assets/Banners/banner1.png";
import banner2 from "../assets/Banners/banner2.png";
import banner3 from "../assets/Banners/banner3.png";
import liptonBanner from "../assets/Banners/lipton-banner.png";
import cifBanner from "../assets/Banners/cif-banner.png";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBanner } from "../redux/bannerSlice";
import { getHomeSections } from "../redux/homeSectionSlice";

const FALLBACK_AD1 = [
  { url: banner1, link: "" },
  { url: banner2, link: "" },
  { url: banner3, link: "" },
];
const FALLBACK_AD2 = [
  { url: liptonBanner, link: "lipton" },
  { url: cifBanner, link: "cif" },
];

function Home() {
  const dispatch = useDispatch();
  const adBanner1 = useSelector((state) => state.banner.banners["adbanner-1"]);
  const adBanner2 = useSelector((state) => state.banner.banners["adbanner-2"]);
  const sections = useSelector((state) => state.homeSection.sections);

  const getSection = (key) => sections.find((s) => s.key === key) || {};

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(getBanner("adbanner-1"));
    dispatch(getBanner("adbanner-2"));
    dispatch(getHomeSections());
  }, []);

  return (
    <>
      <HeaderLinks />
      <Carousel />
      <Featured />
      <ProductList
        title={getSection("deals").title || "Kaçırılmayacak Fırsatlar"}
        settings={{
          showTimer: getSection("deals").showTimer ?? false,
          timerEnd: getSection("deals").timerEnd,
          banner: getSection("deals").banner?.url || null,
          badge: getSection("deals").badge || "indirimli",
        }}
      />
      <ProductList
        title={getSection("new").title || "Yeni Gelenler"}
        settings={{
          showTimer: getSection("new").showTimer ?? false,
          timerEnd: getSection("new").timerEnd,
          banner: getSection("new").banner?.url || null,
          badge: getSection("new").badge || "yeni",
        }}
      />
      <AdBanners images={adBanner1?.length > 0 ? adBanner1 : FALLBACK_AD1} />
      <ProductList
        title={getSection("featured").title || "Önerilen Ürünler"}
        settings={{
          showTimer: getSection("featured").showTimer ?? false,
          timerEnd: getSection("featured").timerEnd,
          banner: getSection("featured").banner?.url || null,
          badge: getSection("featured").badge || "en-cok-satan",
        }}
      />
      {getSection("categoryRow-1").left && getSection("categoryRow-1").right ? (
        <CategoryRow
          left={getSection("categoryRow-1").left}
          right={getSection("categoryRow-1").right}
        />
      ) : null}
      <AdBar />
      <ProductList
        title={getSection("recent").title || "Son Gezdiğin Ürünler"}
        settings={{
          showTimer: getSection("recent").showTimer ?? false,
          timerEnd: getSection("recent").timerEnd,
          banner: getSection("recent").banner?.url || null,
          badge: getSection("recent").badge || "",
          recentlyViewed: true,
        }}
      />

      <AdBanners images={adBanner2?.length > 0 ? adBanner2 : FALLBACK_AD2} />
      <DealOfDay />
    </>
  );
}

export default Home;
