import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import CartSummaryBar from "../components/CartSummaryBar";
import {
  addToCartWithSync,
  decreaseCartWithSync,
  removeFromCartWithSync,
  setAppliedCoupon,
  clearAppliedCoupon,
} from "@mobile/shared/redux/cartSlice";
import { fmt } from "@mobile/shared/utils/format";
import axiosInstance from "@mobile/shared/utils/axiosInstance";

function CartItem({ item }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const itemId = item._id || item.id;
  const image = item.images?.[0]?.url;
  const displayPrice = item.discountedPrice || item.price;

  const availableStock =
    item.skuId && Array.isArray(item.skus)
      ? (item.skus.find((s) => s._id?.toString() === item.skuId?.toString())
          ?.stock ?? 0)
      : (item.stock ?? 0);

  return (
    <View className="flex-row gap-3 py-3 border-b border-border-subtle mx-4">
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: itemId })
        }
      >
        <Image
          source={{ uri: image }}
          style={{ width: 80, height: 80 }}
          className="rounded-lg bg-bg-faint"
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View className="flex-1 justify-between">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ProductDetail", { productId: itemId })
          }
        >
          <Text
            className="text-sm font-medium text-text-primary"
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </TouchableOpacity>

        {item.selectedVariants &&
          Object.keys(item.selectedVariants).length > 0 && (
            <View className="flex-row flex-wrap gap-1 mt-0.5">
              {Object.entries(item.selectedVariants).map(([label, value]) => (
                <View key={label} className="bg-bg-light rounded px-1.5 py-0.5">
                  <Text className="text-2xs text-text-secondary">
                    {label}: {value}
                  </Text>
                </View>
              ))}
            </View>
          )}

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-1">
            <Text className="text-base font-bold text-price-red">
              {Number(displayPrice).toFixed(2)}₺
            </Text>
            {item.discountedPrice && (
              <Text className="text-xs text-text-muted line-through">
                {Number(item.price).toFixed(2)}₺
              </Text>
            )}
          </View>

          <View className="flex-row items-center border border-border-input rounded-lg overflow-hidden">
            <TouchableOpacity
              className="px-3 py-1.5 items-center justify-center"
              onPress={() =>
                item.quantity === 1
                  ? dispatch(removeFromCartWithSync(itemId, item.skuId))
                  : dispatch(decreaseCartWithSync(itemId, item.skuId))
              }
            >
              {item.quantity === 1 ? (
                <Ionicons name="trash-outline" size={14} color="#f83b0a" />
              ) : (
                <Text className="text-price-red font-bold text-base">−</Text>
              )}
            </TouchableOpacity>
            <Text className="px-3 text-sm font-semibold text-text-primary">
              {item.quantity}
            </Text>
            {item.quantity >= availableStock ? (
              <View className="px-3 py-1.5" />
            ) : (
              <TouchableOpacity
                className="px-3 py-1.5 items-center justify-center"
                onPress={() =>
                  dispatch(
                    addToCartWithSync(item, item.selectedVariants, item.skuId),
                  )
                }
              >
                <Text className="text-price-red font-bold text-base">+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { cart, totalAmount, appliedCoupon, bundleDiscounts } = useSelector(
    (state) => state.cart,
  );
  const user = useSelector((state) => state.auth.user);

  const handleApplyCoupon = async () => {
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const { data } = await axiosInstance.post("/coupons/apply", {
        code: trimmed,
        orderTotal: totalAmount,
      });
      dispatch(setAppliedCoupon(data));
      setCouponCode("");
    } catch (err) {
      setCouponError(err?.response?.data?.message ?? "Kupon uygulanamadı.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearAppliedCoupon());
    setCouponError("");
  };

  const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);

  if (cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
        <ScreenHeader title="Sepet" />
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Image
            source={require("../assets/Cart/cart_icon.png")}
            style={{ width: 64, height: 64 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-semibold text-text-primary">
            Sepetinizde ürün bulunmamaktadır.
          </Text>
          <TouchableOpacity
            className="bg-brand-red rounded-sm px-8 py-3 mt-2"
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.85}
          >
            <Text className="text-white font-semibold text-base">
              Alışverişe Devam Et
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      <ScreenHeader title={`Sepetim (${totalQuantity} ürün)`} />

      <FlatList
        data={cart}
        keyExtractor={(item) => `${item._id || item.id}-${item.skuId ?? ""}`}
        renderItem={({ item }) => <CartItem item={item} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        style={{ backgroundColor: "white" }}
      />

      {/* Coupon Section */}
      <View className="bg-white border-t border-border-subtle px-4 py-3">
        {appliedCoupon ? (
          <View className="flex-row items-center justify-between bg-success-light rounded-lg px-3 py-2.5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="pricetag" size={16} color="#2a9d4e" />
              <View>
                <Text className="text-sm font-semibold text-discount-green">
                  {appliedCoupon.code}
                </Text>
                <Text className="text-xs text-discount-green">
                  -{fmt(appliedCoupon.discount)}₺ indirim uygulandı
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleRemoveCoupon} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color="#2a9d4e" />
            </TouchableOpacity>
          </View>
        ) : user ? (
          <>
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 border border-border-input rounded-lg px-3 py-2 text-sm text-text-primary"
                placeholder="Kupon kodunuzu girin"
                placeholderTextColor="#aaa"
                value={couponCode}
                onChangeText={(t) => {
                  setCouponCode(t);
                  if (couponError) setCouponError("");
                }}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleApplyCoupon}
              />
              <TouchableOpacity
                className="bg-primary rounded-lg px-4 items-center justify-center"
                onPress={handleApplyCoupon}
                disabled={couponLoading}
                activeOpacity={0.8}
              >
                {couponLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-sm">
                    Uygula
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {couponError ? (
              <Text className="text-xs text-price-red mt-1.5">
                {couponError}
              </Text>
            ) : null}
          </>
        ) : (
          <View className="flex-row items-center gap-2 py-1">
            <Ionicons name="pricetag-outline" size={16} color="#aaa" />
            <Text className="text-sm text-text-muted">
              Kupon kullanmak için{" "}
              <Text
                className="text-primary font-medium"
                onPress={() => navigation.navigate("Login")}
              >
                giriş yapın
              </Text>
            </Text>
          </View>
        )}
      </View>

      <CartSummaryBar />
    </SafeAreaView>
  );
}
