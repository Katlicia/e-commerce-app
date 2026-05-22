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
import { useLocation } from "react-router-dom";
import { getHomeSections } from "../redux/homeSectionSlice";
import { getHomeLayout } from "../redux/homeLayoutSlice";

function renderSection(section, homeSections) {
  if (!section.visible) return null;

  const getSection = (key) => homeSections.find((s) => s.key === key) || {};

  switch (section.type) {
    case "featured-shortcuts":
      return <Featured key={section._id} />;

    case "product-list": {
      const sec = getSection(section.sectionKey);
      if (section.sectionKey?.startsWith("categoryRow")) {
        if (!sec.left && !sec.right) return null;
        return <CategoryRow key={section._id} left={sec.left} right={sec.right} />;
      }
      return (
        <ProductList
          key={section._id}
          id={section.sectionKey === "recent" ? "recently-viewed" : undefined}
          title={sec.title || "Ürün Listesi"}
          settings={{
            showTimer: sec.showTimer ?? false,
            timerEnd: sec.timerEnd,
            banner: sec.banner?.url || null,
            badge: sec.badge || "",
            bestSellers: section.sectionKey === "featured",
            recentlyViewed: section.sectionKey === "recent",
          }}
        />
      );
    }

    case "ad-banners":
      return <AdBanners key={section._id} type={section.bannerType} />;

    case "category-row": {
      const sec = getSection(section.sectionKey);
      if (!sec.left && !sec.right) return null;
      return (
        <CategoryRow
          key={section._id}
          left={sec.left}
          right={sec.right}
        />
      );
    }

    case "ad-bar":
      return <AdBar key={section._id} />;

    case "deal-of-day":
      return <DealOfDay key={section._id} />;

    default:
      return null;
  }
}

function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
  const sections = useSelector((state) => state.homeSection.sections);
  const layoutSections = useSelector((state) => state.homeLayout.sections);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(getHomeSections());
    dispatch(getHomeLayout());
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
      }
    }
  }, [location.state]);

  return (
    <>
      <HeaderLinks />
      <Carousel />
      {layoutSections.map((section) => renderSection(section, sections))}
    </>
  );
}

export default Home;
