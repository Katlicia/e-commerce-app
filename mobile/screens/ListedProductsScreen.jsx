import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  addToCartWithSync,
  addBundleDiscount,
} from "@mobile/shared/redux/cartSlice";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import ScreenHeader from "../components/ScreenHeader";
import { fmt } from "@mobile/shared/utils/format";

function ListCard({ item }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);

  const isInCart = (item.products || []).some((p) => {
    const product = p.product;
    if (!product || typeof product !== "object") return false;
    return cart.some((c) => (c._id || c.id) === product._id);
  });

  function handleAddAllToCart() {
    for (const p of item.products || []) {
      const product = p.product;
      if (!product || typeof product !== "object") continue;
      for (let i = 0; i < (p.quantity || 1); i++) {
        dispatch(addToCartWithSync(product));
      }
    }

    if (item.discountPercent > 0) {
      dispatch(
        addBundleDiscount({
          listId: item._id,
          name: item.name,
          percent: item.discountPercent,
          requiredProducts: (item.products || [])
            .filter((p) => p.product && typeof p.product === "object")
            .map((p) => ({ productId: p.product._id, quantity: p.quantity })),
        }),
      );
    }
  }

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginBottom: 14,
        borderWidth: 1.5,
        borderRadius: 12,
        borderColor: "#D0D0D0",
        padding: 16,
      }}
    >
      {/* Title */}
      <Text className="text-2xl font-sans-bold mb-4" numberOfLines={2}>
        {item.name}
      </Text>

      {/* Product rows */}
      <View style={{ gap: 10, marginBottom: 14 }}>
        {(item.products || []).map((p) => {
          const product = p.product;
          if (!product || typeof product !== "object") return null;
          return (
            <View
              key={product._id}
              style={{ flexDirection: "row", alignItems: "start", gap: 8 }}
            >
              <Image
                source={require("../assets/check.png")}
                className="mt-1"
                style={{ width: 18, height: 18 }}
              />
              <View className="flex-1">
                <Text className="text-base font-sans">{product.name}</Text>
                <Text className="text-xs font-sans text-text-subtle">
                  {p.quantity} Adet
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View>
        {item.discountPercent > 0 && (
          <View className="self-start bg-success-light rounded-md py-1.5 px-2">
            <Text className="text-discount-green text-xs font-sans-semibold">
              %{item.discountPercent} indirim
            </Text>
          </View>
        )}
      </View>
      <View className="flex-col">
        {item.discountedTotal ? (
          <>
            <Text className="text-xl font-sans-medium text-text-muted line-through">
              {fmt(item.total)}₺
            </Text>
            <View className="flex-row items-end gap-3">
              <Text
                className="font-sans-bold"
                style={{
                  fontSize: 33,
                }}
              >
                {fmt(item.discountedTotal)}₺
              </Text>
              <Text className="mb-2 text-2xs font-sans">K.D.V Dahil</Text>
            </View>
          </>
        ) : (
          <Text className="text-2xl font-sans-extrabold text-text-primary">
            {fmt(item.total)}₺
          </Text>
        )}
      </View>
      <TouchableOpacity
        className={`mt-4 rounded-md py-3 items-center justify-center ${isInCart ? "bg-success" : "bg-brand-red"}`}
        onPress={
          isInCart
            ? () => navigation.navigate("MainTabs", { screen: "Cart" })
            : handleAddAllToCart
        }
      >
        <Text className="text-white font-sans-medium text-md">
          {isInCart ? "Sepette" : "Sepete Ekle"}
        </Text>
      </TouchableOpacity>
    </View>
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
