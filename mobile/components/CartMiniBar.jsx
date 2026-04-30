import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { navigate } from "../navigation/navigationRef";
import { fmt } from "@mobile/shared/utils/format";

const HIDDEN_ROUTES = new Set([
  "Cart",
  "Checkout",
  "OrderSuccess",
  "Login",
  "Register",
  "ForgotPassword",
]);

const TAB_ROUTES = new Set(["Home", "Category", "Kampanyalar", "Profile"]);

export default function CartMiniBar({ currentRoute }) {
  const insets = useSafeAreaInsets();
  const { cart, totalAmount, appliedCoupon, bundleDiscounts } = useSelector(
    (state) => state.cart,
  );

  if (!cart.length || HIDDEN_ROUTES.has(currentRoute)) return null;

  const couponDiscount = appliedCoupon?.discount ?? 0;
  const bundleDiscountAmount = +bundleDiscounts
    .reduce((total, bundle) => {
      const bundleSubtotal = bundle.requiredProducts.reduce((sum, req) => {
        const item = cart.find((c) => (c._id || c.id) === req.productId);
        if (!item) return sum;
        return (
          sum + parseFloat(item.discountedPrice || item.price) * req.quantity
        );
      }, 0);
      return total + bundleSubtotal * (bundle.percent / 100);
    }, 0)
    .toFixed(2);

  const finalTotal = Math.max(
    0,
    totalAmount - couponDiscount - bundleDiscountAmount,
  );
  const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);

  const bottomOffset = TAB_ROUTES.has(currentRoute)
    ? 56 + insets.bottom
    : insets.bottom;

  return (
    <View
      style={{
        position: "absolute",
        left: 12,
        right: 0,
        bottom: bottomOffset,
        backgroundColor: "#ffffff",
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        }}
        onPress={() => navigate("Cart")}
        activeOpacity={0.85}
      >
        <View style={{ position: "relative" }}>
          <Ionicons name="cart" size={26} color="#ff7700" />
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -6,
              backgroundColor: "#ff3b30",
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 3,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
              {totalQuantity > 99 ? "99+" : totalQuantity}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: "#6c757d" }}>
            {totalQuantity} ürün
          </Text>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#212529" }}>
            {fmt(finalTotal)}₺
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#ff7700",
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            Sepete Git
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
