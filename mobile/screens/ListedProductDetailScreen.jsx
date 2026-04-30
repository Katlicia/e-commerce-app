import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import ScreenHeader from "../components/ScreenHeader";
import { fmt } from "@mobile/shared/utils/format";
import { addToCartWithSync, addBundleDiscount } from "@mobile/shared/redux/cartSlice";

export default function ListedProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { listId } = route.params;

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/listed-products/${listId}`)
      .then((res) => setList(res.data))
      .catch(() => navigation.goBack())
      .finally(() => setLoading(false));
  }, [listId]);

  const handleAddAllToCart = async () => {
    if (!list) return;
    setAdding(true);

    // Add each product to cart (quantity times)
    for (const item of list.products) {
      const product = item.product;
      if (!product || typeof product !== "object") continue;
      for (let i = 0; i < (item.quantity || 1); i++) {
        dispatch(addToCartWithSync(product));
      }
    }

    // Register bundle discount so CartScreen can validate and display it
    if (list.discountPercent > 0) {
      dispatch(
        addBundleDiscount({
          listId: list._id,
          name: list.name,
          percent: list.discountPercent,
          requiredProducts: list.products
            .filter((p) => p.product && typeof p.product === "object")
            .map((p) => ({ productId: p.product._id, quantity: p.quantity })),
        }),
      );
    }

    setTimeout(() => {
      setAdding(false);
      navigation.navigate("MainTabs", { screen: "Cart" });
    }, 300);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }} edges={["top"]}>
      <ScreenHeader title="Liste Detayı" />

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#ff7700" size="large" />
        </View>
      ) : !list ? null : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: insets.bottom + 96,
            }}
          >
            {/* Card matching the design */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.07,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              }}
            >
              {/* List name */}
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#212529",
                  marginBottom: 16,
                }}
              >
                {list.name}
              </Text>

              {/* Product rows */}
              <View style={{ gap: 10, marginBottom: 20 }}>
                {(list.products || []).map((item) => {
                  const product = item.product;
                  if (!product || typeof product !== "object") return null;
                  return (
                    <TouchableOpacity
                      key={product._id}
                      style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                      onPress={() =>
                        navigation.navigate("ProductDetail", {
                          productId: product._id,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      {/* Orange checkmark circle */}
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: "#ff6a00",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      </View>

                      {/* Name + quantity */}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: "#212529",
                          }}
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#adb5bd", marginTop: 1 }}>
                          {item.quantity} Adet
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: "#f0f0f0",
                  marginBottom: 16,
                }}
              />

              {/* Discount badge */}
              {list.discountPercent > 0 && (
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: "#e8f5e9",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{ fontSize: 12, fontWeight: "700", color: "#2e7d32" }}
                  >
                    %{list.discountPercent} indirim
                  </Text>
                </View>
              )}

              {/* Price block */}
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
                {list.discountedTotal ? (
                  <>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#adb5bd",
                        textDecorationLine: "line-through",
                      }}
                    >
                      {fmt(list.total)}₺
                    </Text>
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "900",
                        color: "#212529",
                        letterSpacing: -0.5,
                      }}
                    >
                      {fmt(list.discountedTotal)}₺
                    </Text>
                  </>
                ) : (
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "900",
                      color: "#212529",
                      letterSpacing: -0.5,
                    }}
                  >
                    {fmt(list.total)}₺
                  </Text>
                )}
                <Text style={{ fontSize: 12, color: "#adb5bd" }}>K.D.V Dahil</Text>
              </View>
            </View>
          </ScrollView>

          {/* Fixed bottom button */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: insets.bottom + 12,
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderTopColor: "#f0f0f0",
            }}
          >
            <TouchableOpacity
              onPress={handleAddAllToCart}
              disabled={adding}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#ff6a00",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {adding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: 15,
                    letterSpacing: 0.3,
                  }}
                >
                  Sepete Ekle
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
