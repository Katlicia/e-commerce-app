import HeaderLinks from "./HeaderLinks";
import Carousel from "./Carousel";
import Featured from "./Featured";
import ProductList from "./ProductList";
import AdBanners from "./AdBanners";
import CategoryRow from "./CategoryRow";
import AdBar from "./AdBar";
import DealOfDay from "./DealOfDay";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHomeSections } from "../redux/homeSectionSlice";

function Home() {
  const dispatch = useDispatch();
  const sections = useSelector((state) => state.homeSection.sections);

  const getSection = (key) => sections.find((s) => s.key === key) || {};

  useEffect(() => {
    window.scrollTo(0, 0);
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
      <AdBanners type="adbanner-1" />
      <ProductList
        title={getSection("featured").title || "En Çok Satanlar"}
        settings={{
          showTimer: getSection("featured").showTimer ?? false,
          timerEnd: getSection("featured").timerEnd,
          banner: getSection("featured").banner?.url || null,
          badge: getSection("featured").badge || "en-cok-satan",
          bestSellers: true,
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

      <AdBanners type="adbanner-2" />
      <DealOfDay />
    </>
  );
}

export default Home;
