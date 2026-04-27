import React, { useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  addToCartWithSync,
  decreaseCartWithSync,
  removeFromCartWithSync,
} from "@mobile/shared/redux/cartSlice";

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

function SummaryRow({ label, value, valueClass = "" }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <Text className={`text-sm font-medium text-text-primary ${valueClass}`}>
        {value}
      </Text>
    </View>
  );
}

const fmt = (n) =>
  Number(n).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CartScreen() {
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const navigation = useNavigation();
  const { cart, totalAmount, appliedCoupon } = useSelector(
    (state) => state.cart,
  );
  const {
    freeShippingThreshold = 500,
    kdv1Rate = 0.01,
    kdv20Rate = 0.2,
  } = useSelector((state) => state.taxSettings);

  const totalDiscount = +cart
    .filter((item) => item.discountedPrice)
    .reduce(
      (sum, item) =>
        sum +
        (parseFloat(item.price) - parseFloat(item.discountedPrice)) *
          item.quantity,
      0,
    )
    .toFixed(2);

  const rawTotal = +(totalAmount + totalDiscount).toFixed(2);
  const kdv1 = +(totalAmount * kdv1Rate).toFixed(2);
  const kdv20 = +(totalAmount * kdv20Rate).toFixed(2);
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const remaining = Math.max(freeShippingThreshold - totalAmount, 0);
  const freeShipping = remaining === 0;
  const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);

  if (cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
        <View className="bg-white px-4 py-3 border-b border-border-subtle">
          <Text className="text-lg font-bold text-text-primary">Sepetim</Text>
        </View>
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="cart-outline" size={64} color="#dee2e6" />
          <Text className="text-lg font-semibold text-text-primary">
            Sepetiniz Boş
          </Text>
          <Text className="text-sm text-text-muted text-center">
            Ürünleri keşfetmek için alışverişe başlayın.
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-8 py-3 mt-2"
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.85}
          >
            <Text className="text-white font-semibold text-base">
              Alışverişe Başla
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      <View className="bg-white px-4 py-3 border-b border-border-subtle">
        <Text className="text-lg font-bold text-text-primary">
          Sepetim ({totalQuantity} ürün)
        </Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => `${item._id || item.id}-${item.skuId ?? ""}`}
        renderItem={({ item }) => <CartItem item={item} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        style={{ backgroundColor: "white" }}
      />

      {!summaryExpanded && (
        <View className="items-center py-2 bg-white">
          {freeShipping ? (
            <View className="flex-row items-center gap-1.5 bg-success-light rounded-full px-4 py-1.5">
              <Ionicons name="checkmark-circle" size={14} color="#2a9d4e" />
              <Text className="text-sm font-semibold text-discount-green">
                {fmt(freeShippingThreshold)}₺ geçtiniz kargo bedava
              </Text>
            </View>
          ) : (
            <View className="flex-row bg-success-light rounded-full px-4 py-1.5">
              <Text className="text-sm text-discount-green">
                {fmt(remaining)} TL daha eklerseniz{" "}
                <Text className="font-bold">kargo ücretsiz.</Text>
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Sticky bottom summary panel */}
      <View
        className="bg-white border-t border-border-subtle"
        style={{
          elevation: 12,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -3 },
        }}
      >
        {/* Expanded: badge içeride + detail rows */}
        {summaryExpanded && (
          <>
            <View className="items-center pt-2.5 pb-1">
              {freeShipping ? (
                <View className="flex-row items-center gap-1.5 bg-success-light rounded-full px-4 py-1.5">
                  <Ionicons name="checkmark-circle" size={14} color="#2a9d4e" />
                  <Text className="text-sm font-semibold text-discount-green">
                    {fmt(freeShippingThreshold)}₺ geçtiniz kargo bedava
                  </Text>
                </View>
              ) : (
                <View className="flex-row bg-success-light rounded-full px-4 py-1.5">
                  <Text className="text-sm text-discount-green">
                    {fmt(remaining)} TL daha eklerseniz{" "}
                    <Text className="font-bold">kargo ücretsiz.</Text>
                  </Text>
                </View>
              )}
            </View>

            <View className="px-11 pt-2 pb-2 gap-2.5">
              <SummaryRow label="Sipariş Tutarı" value={`${fmt(rawTotal)}₺`} />
              <SummaryRow label="KDV (%1)" value={`${fmt(kdv1)}₺`} />
              <SummaryRow label="KDV (%20)" value={`${fmt(kdv20)}₺`} />
              <SummaryRow
                label="Kargo Bedeli"
                value={
                  freeShipping ? "Ücretsiz" : "Adrese göre hesaplanacaktır."
                }
                valueClass={
                  freeShipping ? "text-discount-green" : "text-text-muted"
                }
              />
              {totalDiscount > 0 && (
                <SummaryRow
                  label="İndirimler 🤩"
                  value={`-${fmt(totalDiscount)}₺`}
                  valueClass="text-discount-green"
                />
              )}
              {couponDiscount > 0 && (
                <SummaryRow
                  label={`Kupon (${appliedCoupon.code})`}
                  value={`-${fmt(couponDiscount)}₺`}
                  valueClass="text-discount-green"
                />
              )}
            </View>

            <View className="h-px bg-border-subtle mx-4 mb-1" />
          </>
        )}

        {/* Total row */}
        <View className="flex-row items-center px-4 py-3 gap-3">
          <TouchableOpacity
            className="flex-row items-center gap-2 flex-1"
            onPress={() => setSummaryExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={summaryExpanded ? "chevron-down" : "chevron-up"}
              size={20}
              color="#212529"
            />
            <View>
              <View className="flex-column items-start">
                <Text className="text-sm font-semibold text-text-primary">
                  Toplam Tutar
                </Text>
                <Text className="text-xl font-bold text-text-primary">
                  {fmt(totalAmount)}₺
                </Text>
              </View>
              {freeShipping && (
                <Text className="text-sm font-medium text-discount-green">
                  Kargo Bedava
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-primary rounded-md px-10 py-3.5"
            onPress={() => navigation.navigate("Checkout")}
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold text-base">Ödeme Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
