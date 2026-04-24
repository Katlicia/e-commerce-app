import React, { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { getHomeSections } from "@mobile/shared/redux/homeSectionSlice";
import { getHomeLayout } from "@mobile/shared/redux/homeLayoutSlice";

import HomeCarousel from "../components/home/HomeCarousel";
import HomeQuickLinks from "../components/home/HomeQuickLinks";
import FeaturedShortcuts from "../components/home/FeaturedShortcuts";
import HomeAdBanners from "../components/home/HomeAdBanners";
import HomeProductList from "../components/home/HomeProductList";
import HomeCategoryRow from "../components/home/HomeCategoryRow";
import HomeHeader from "../components/home/HomeHeader";

function renderSection(section, homeSections) {
  if (!section.visible) return null;

  const getSection = (key) => homeSections.find((s) => s.key === key) || {};

  switch (section.type) {
    case "ad-banners":
      return <HomeAdBanners key={section._id} type={section.bannerType} />;

    case "product-list": {
      const sec = getSection(section.sectionKey);
      if (section.sectionKey?.startsWith("categoryRow")) {
        if (!sec.left && !sec.right) return null;
        return <HomeCategoryRow key={section._id} left={sec.left} right={sec.right} />;
      }
      return (
        <HomeProductList
          key={section._id}
          title={sec.title || "Ürünler"}
          settings={{
            badge: sec.badge || "",
            bestSellers: section.sectionKey === "featured",
            recentlyViewed: section.sectionKey === "recent",
            banner: sec.banner?.url || null,
            timerEnd: sec.timerEnd || null,
          }}
        />
      );
    }

    case "category-row": {
      const sec = getSection(section.sectionKey);
      if (!sec.left && !sec.right) return null;
      return (
        <HomeCategoryRow key={section._id} left={sec.left} right={sec.right} />
      );
    }

    default:
      return null;
  }
}

export default function HomeScreen() {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const homeSections = useSelector((state) => state.homeSection.sections ?? []);
  const layoutSections = useSelector((state) => state.homeLayout.sections ?? []);

  useEffect(() => {
    dispatch(getHomeSections());
    dispatch(getHomeLayout());
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      <HomeHeader scrollRef={scrollRef} />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <FeaturedShortcuts />
        <HomeCarousel />
        <HomeQuickLinks />
        {layoutSections.map((section) => renderSection(section, homeSections))}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
