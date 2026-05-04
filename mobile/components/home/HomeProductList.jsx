import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import { ProductCard, BannerCard, CARD_WIDTH, CARD_HEIGHT } from "../ProductCard";

export { ProductCard, CARD_WIDTH, CARD_HEIGHT };

async function fetchProducts(settings) {
  try {
    if (settings.recentlyViewed) {
      const res = await axiosInstance.get("/users/me/visited");
      return Array.isArray(res.data) ? res.data : [];
    }
    if (settings.bestSellers) {
      const res = await axiosInstance.get("/products/best-sellers");
      return res.data.products || [];
    }
    if (settings.badge) {
      const res = await axiosInstance.get(`/products/badge/${settings.badge}`);
      return Array.isArray(res.data) ? res.data : res.data.products || [];
    }
    const res = await axiosInstance.get("/products");
    return res.data.products || [];
  } catch {
    return [];
  }
}

function useCountdown(endTime) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    if (!endTime) return;
    const target = new Date(endTime).getTime();

    const calc = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        gun: Math.floor(diff / 86400000),
        saat: Math.floor((diff % 86400000) / 3600000),
        dakika: Math.floor((diff % 3600000) / 60000),
      });
    };

    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [endTime]);

  return time;
}

function TimerDisplay({ endTime }) {
  const time = useCountdown(endTime);
  if (!time) return null;

  const blocks = [
    { value: time.gun, label: "Gün" },
    { value: time.saat, label: "Saat" },
    { value: time.dakika, label: "Dakika" },
  ];

  return (
    <View className="flex-row items-center gap-3">
      {blocks.map(({ value, label }) => (
        <View key={label} className="items-center">
          <Text className="text-price-red font-bold text-lg leading-none">
            {value}
          </Text>
          <Text className="text-price-red text-2xs">{label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeProductList({ title, settings = {} }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settings.recentlyViewed) return;
    fetchProducts(settings)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [settings.badge, settings.bestSellers]);

  useEffect(() => {
    if (!settings.recentlyViewed || !isFocused) return;
    fetchProducts(settings)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [isFocused]);

  const overrideBadge = settings.bestSellers ? "en-cok-satan" : undefined;

  const renderItem = useCallback(
    ({ item }) =>
      item.__banner ? (
        <BannerCard image={item.url} />
      ) : (
        <ProductCard product={item} overrideBadge={overrideBadge} />
      ),
    [overrideBadge],
  );

  if (loading) {
    return (
      <View className="h-48 items-center justify-center">
        <ActivityIndicator color="#ff7700" />
      </View>
    );
  }

  if (!products.length) return null;

  const listData = settings.banner
    ? [{ __banner: true, url: settings.banner }, ...products]
    : products;

  return (
    <View className="my-3">
      <View className="flex-row items-center justify-between px-4 mb-2">
        <Text className="text-2xl font-bold text-text-primary">{title}</Text>
        {settings.timerEnd ? (
          <TimerDisplay endTime={settings.timerEnd} />
        ) : (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ProductList", { filter: settings })
            }
          >
            <Text className="text-sm text-primary underline">Tümünü Gör</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={listData}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        keyExtractor={(item) => (item.__banner ? "banner" : item._id)}
        renderItem={renderItem}
      />
    </View>
  );
}
