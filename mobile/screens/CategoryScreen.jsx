import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axiosInstance from "@mobile/shared/utils/axiosInstance";

const TOP_COUNT = 5;
const logo = require("../assets/logo.png");

export default function CategoryScreen() {
  const navigation = useNavigation();

  const [topCategories, setTopCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryImages, setCategoryImages] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await axiosInstance.get("/categories");
        const roots = (res.data || [])
          .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
          .slice(0, TOP_COUNT);

        setTopCategories(roots);
        if (roots.length > 0) setSelectedCategory(roots[0]);

        const imageEntries = await Promise.all(
          roots.map((cat) =>
            axiosInstance
              .get(`/products?category=${cat._id}&limit=1`)
              .then((r) => {
                const list = r.data.products || r.data || [];
                return [cat._id, list[0]?.images?.[0]?.url || null];
              })
              .catch(() => [cat._id, null]),
          ),
        );
        setCategoryImages(Object.fromEntries(imageEntries));
      } catch (_) {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function selectCategory(cat) {
    setSelectedCategory(cat);
    setExpandedId(null);
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function goToList(category) {
    navigation.navigate("ProductList", { filter: { category: category.slug } });
  }

  const subcategories = selectedCategory?.children || [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View
        className="flex-row items-center gap-2 px-3 py-2"
        style={{ borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}
      >
        <Image
          source={logo}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
        <TouchableOpacity
          className="flex-1 flex-row items-center bg-bg-light rounded-xl px-3 gap-2"
          style={{ height: 40 }}
          onPress={() => navigation.navigate("ProductList", {})}
          activeOpacity={0.7}
        >
          <Text style={{ flex: 1, fontSize: 13, color: "#adb5bd" }}>
            Binlerce ürün içinde ara
          </Text>
          <Ionicons name="search-outline" size={18} color="#adb5bd" />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="notifications-outline" size={22} color="#212529" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ff7700" size="large" />
        </View>
      ) : (
        <View className="flex-1 flex-row">
          {/* Left panel — top categories */}
          <View style={{ width: 80 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {topCategories.map((cat) => {
                const selected = selectedCategory?._id === cat._id;
                return (
                  <TouchableOpacity
                    key={cat._id}
                    onPress={() => selectCategory(cat)}
                    style={{
                      alignItems: "center",
                      paddingVertical: 6,
                      paddingHorizontal: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 64,
                        borderRadius: 5,
                        overflow: "hidden",
                        borderWidth: 2,
                        borderColor: selected ? "#F83B0A" : "#F5F5F5",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingBottom: 6,
                        paddingTop: 6,
                      }}
                    >
                      {categoryImages[cat._id] ? (
                        <Image
                          source={{ uri: categoryImages[cat._id] }}
                          style={{ width: 56, height: 56 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons
                          name="grid-outline"
                          size={22}
                          color="#adb5bd"
                          style={{ marginVertical: 17 }}
                        />
                      )}
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: 10,
                          textAlign: "center",
                          marginTop: 4,
                          lineHeight: 13,
                          paddingHorizontal: 4,
                          fontWeight: selected ? "600" : "400",
                        }}
                      >
                        {cat.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Right panel — subcategories */}
          <ScrollView
            style={{ flex: 1, backgroundColor: "#ffffff" }}
            showsVerticalScrollIndicator={false}
          >
            {subcategories.length === 0 ? (
              <TouchableOpacity
                onPress={() => selectedCategory && goToList(selectedCategory)}
                style={{ paddingHorizontal: 16, paddingVertical: 18 }}
              >
                <Text
                  style={{ fontSize: 13, color: "#F83B0A", fontWeight: "600" }}
                >
                  + Tüm Ürünler
                </Text>
              </TouchableOpacity>
            ) : (
              subcategories.map((sub) => {
                const expanded = expandedId === sub._id;
                const hasChildren = sub.children?.length > 0;

                return (
                  <View key={sub._id}>
                    <TouchableOpacity
                      onPress={() =>
                        hasChildren ? toggleExpand(sub._id) : goToList(sub)
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: "#f0f0f0",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: expanded ? "#F83B0A" : "#212529",
                          fontWeight: expanded ? "600" : "400",
                        }}
                      >
                        {sub.name}
                      </Text>
                      <Ionicons
                        name={expanded ? "chevron-down" : "chevron-forward"}
                        size={16}
                        color={expanded ? "#F83B0A" : "#adb5bd"}
                      />
                    </TouchableOpacity>

                    {expanded && hasChildren && (
                      <View
                        style={{
                          backgroundColor: "#fafafa",
                          paddingLeft: 16,
                        }}
                      >
                        {sub.children.map((child) => (
                          <TouchableOpacity
                            key={child._id}
                            onPress={() => goToList(child)}
                            style={{
                              paddingVertical: 13,
                              paddingRight: 16,
                              borderBottomWidth: 1,
                              borderBottomColor: "#f0f0f0",
                            }}
                          >
                            <Text style={{ fontSize: 13, color: "#424040" }}>
                              {child.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          onPress={() => goToList(sub)}
                          style={{ paddingVertical: 13, paddingRight: 16 }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#F83B0A",
                              fontWeight: "600",
                            }}
                          >
                            + Tüm Ürünler
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
