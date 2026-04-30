import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import ScreenHeader from "../components/ScreenHeader";
import { fmt } from "@mobile/shared/utils/format";

function ListCard({ item }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{ marginHorizontal: 12, marginBottom: 14 }}
      onPress={() =>
        navigation.navigate("ListedProductDetail", { listId: item._id })
      }
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: "800",
            color: "#212529",
            marginBottom: 12,
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Product rows (max 5) */}
        <View style={{ gap: 10, marginBottom: 14 }}>
          {(item.products || []).slice(0, 5).map((p) => {
            const product = p.product;
            if (!product || typeof product !== "object") return null;
            return (
              <View
                key={product._id}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "#ff6a00",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Ionicons name="checkmark" size={11} color="#fff" />
                </View>
                <Text
                  style={{ flex: 1, fontSize: 13, color: "#444" }}
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text style={{ fontSize: 11, color: "#adb5bd" }}>
                  {p.quantity} Adet
                </Text>
              </View>
            );
          })}
          {item.products?.length > 5 && (
            <Text style={{ fontSize: 12, color: "#adb5bd", marginLeft: 26 }}>
              +{item.products.length - 5} ürün daha
            </Text>
          )}
        </View>

        {/* Price row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {item.discountPercent > 0 && (
              <View
                style={{
                  backgroundColor: "#e8f5e9",
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "700", color: "#2e7d32" }}
                >
                  %{item.discountPercent} indirim
                </Text>
              </View>
            )}
            {item.discountedTotal ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#adb5bd",
                    textDecorationLine: "line-through",
                  }}
                >
                  {fmt(item.total)}₺
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "800", color: "#f83b0a" }}
                >
                  {fmt(item.discountedTotal)}₺
                </Text>
              </View>
            ) : (
              <Text
                style={{ fontSize: 16, fontWeight: "800", color: "#f83b0a" }}
              >
                {fmt(item.total)}₺
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ListedProductsScreen() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/listed-products");
      setLists(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f8f9fa" }}
      edges={["top"]}
    >
      <ScreenHeader title="Hazır Listeler" />

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#ff7700" size="large" />
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ListCard item={item} />}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
              }}
            >
              <Ionicons name="list-outline" size={48} color="#adb5bd" />
              <Text style={{ color: "#adb5bd", marginTop: 12, fontSize: 15 }}>
                Henüz hazır liste yok
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
