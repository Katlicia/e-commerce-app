import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axiosInstance from "@mobile/shared/utils/axiosInstance";

const items = [
  {
    image: require("../../assets/featured/flash.png"),
    label: "Flaş İndirimler",
    bg: "#FFF3E0",
    border: "#FFB74D",
    filter: { badge: "indirimli" },
  },
  {
    image: require("../../assets/featured/cart.png"),
    label: "Çok Satanlar",
    bg: "#FFF8F0",
    border: "#ff7700",
    filter: { badge: "en-cok-satan" },
  },
  {
    image: require("../../assets/featured/tea.png"),
    label: "Çay Çeşitleri",
    bg: "#F1F8E9",
    border: "#AED581",
    filter: { category: "caylar" },
  },
  {
    image: require("../../assets/featured/box.png"),
    label: "Çok Al Az Öde",
    bg: "#E3F2FD",
    border: "#90CAF9",
    filter: { category: "cok-al-az-ode" },
  },
  {
    image: require("../../assets/featured/editor.png"),
    label: "Editörden",
    bg: "#F3E5F5",
    border: "#CE93D8",
    filter: { category: "editorun-secimi" },
  },
  {
    image: require("../../assets/featured/gift.png"),
    label: "Hediyeli Ürünler",
    bg: "#FCE4EC",
    border: "#F48FB1",
    filter: { category: "hediyeli-urunler" },
  },
  {
    image: require("../../assets/featured/stock.png"),
    label: "Stokları Eritiyoruz",
    bg: "#F5F5F5",
    border: "#BDBDBD",
    filter: { stockLte: 20 },
  },
];

async function fetchCount(filter) {
  try {
    if (filter?.badge) {
      const res = await axiosInstance.get(
        `/products?badge=${filter.badge}&limit=1`,
      );
      return res.data.total ?? null;
    }
    if (filter?.category) {
      const catRes = await axiosInstance.get(`/categories/${filter.category}`);
      if (!catRes.data?._id) return null;
      const res = await axiosInstance.get(
        `/products?category=${catRes.data._id}&limit=1`,
      );
      return res.data.total ?? null;
    }
    if (filter?.stockLte != null) {
      const res = await axiosInstance.get(
        `/products?stockLte=${filter.stockLte}&limit=1`,
      );
      return res.data.total ?? null;
    }
  } catch {
    return null;
  }
}

export default function FeaturedShortcuts() {
  const navigation = useNavigation();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    items.forEach((item, idx) => {
      fetchCount(item.filter).then((count) => {
        if (count != null) setCounts((prev) => ({ ...prev, [idx]: count }));
      });
    });
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 10,
      }}
    >
      {items.map((item, idx) => (
        <TouchableOpacity
          key={item.label}
          style={{ alignItems: "center", width: 72 }}
          onPress={() =>
            navigation.navigate("ProductList", { filter: item.filter })
          }
          activeOpacity={0.75}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: item.bg,
              borderWidth: 1.5,
              borderColor: item.border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            <Image
              source={item.image}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
            />
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: "#222",
              textAlign: "center",
            }}
            numberOfLines={2}
          >
            {item.label}
          </Text>
          {counts[idx] != null && (
            <Text style={{ fontSize: 10, color: "#999", marginTop: 1 }}>
              {counts[idx]} Ürün
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
