import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import { ProductCard } from "./HomeProductList";

const CARD_WIDTH = 150;
const CARD_HEIGHT = 280;

function BannerCard({ image }) {
  return (
    <View
      className="bg-bg-faint rounded-md mr-3 overflow-hidden border border-border-subtle"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      <Image
        source={{ uri: image }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </View>
  );
}

function CategorySection({ title, image, filterType, filterValue }) {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filterValue) return;
    setLoading(true);

    const fetch = async () => {
      try {
        let url;
        if (filterType === "brand") {
          url = `/products?brand=${encodeURIComponent(filterValue)}`;
        } else {
          const catRes = await axiosInstance.get(`/categories/${filterValue}`);
          url = `/products?category=${catRes.data._id}`;
        }
        const res = await axiosInstance.get(url);
        const data = res.data;
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [filterType, filterValue]);

  const navFilter =
    filterType === "brand" ? { brand: filterValue } : { category: filterValue };

  const listData = image
    ? [{ __banner: true, url: image }, ...products]
    : products;

  return (
    <View className="mb-2">
      <View className="flex-row items-center justify-between px-4 mb-2">
        <Text className="text-md font-bold text-text-primary">{title}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProductList", { filter: navFilter })}
        >
          <Text className="text-sm text-text-subtle font-semibold">Tümü</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="h-48 items-center justify-center">
          <ActivityIndicator color="#ff7700" />
        </View>
      ) : (
        <FlatList
          data={listData}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          keyExtractor={(item, i) => (item.__banner ? "banner" : item._id)}
          renderItem={({ item }) =>
            item.__banner ? (
              <BannerCard image={item.url} />
            ) : (
              <ProductCard product={item} />
            )
          }
        />
      )}
    </View>
  );
}

export default function HomeCategoryRow({ left, right }) {
  if (!left && !right) return null;

  return (
    <View className="my-3">
      {left && (
        <CategorySection
          title={left.title}
          image={left.banner?.url || null}
          filterType={left.filterType || "category"}
          filterValue={left.filterValue}
        />
      )}
      {right && (
        <CategorySection
          title={right.title}
          image={right.banner?.url || null}
          filterType={right.filterType || "category"}
          filterValue={right.filterValue}
        />
      )}
    </View>
  );
}
