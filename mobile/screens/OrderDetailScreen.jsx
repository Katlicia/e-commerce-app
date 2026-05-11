import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  cancelOrder,
  returnOrder,
  cancelPayment,
  refundPayment,
} from "@mobile/shared/redux/orderSlice";
import {
  syncClearCart,
  addToCartWithSync,
} from "@mobile/shared/redux/cartSlice";
import { fmt } from "@mobile/shared/utils/format";
import ScreenHeader from "../components/ScreenHeader";

const STEPS = [
  { label: "Sipariş\nAlındı", icon: require("../assets/Profile/ship.png") },
  { label: "Ödeme\nOnaylandı", icon: require("../assets/Profile/cart.png") },
  { label: "Hazırlanıyor", icon: require("../assets/Profile/cycle.png") },
  { label: "Kargoya\nVerildi", icon: require("../assets/Profile/cargo.png") },
  { label: "Teslim\nEdildi", icon: require("../assets/Profile/check.png") },
];

const STATUS_INDEX = {
  Hazırlanıyor: 2,
  "Kargoya Verildi": 3,
  "Teslim Edildi": 4,
  "İptal Edildi": -1,
  "İade Edildi": 4,
};

const STATUS_STYLE = {
  Hazırlanıyor: { bg: "#fff3cd", text: "#856404" },
  "Kargoya Verildi": { bg: "#cfe2ff", text: "#084298" },
  "Teslim Edildi": { bg: "#d1e7dd", text: "#0f5132" },
  "İptal Edildi": { bg: "#f8d7da", text: "#842029" },
  "İade Edildi": { bg: "#e2d9f3", text: "#432874" },
};

export default function OrderDetailScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { orderId } = route.params ?? {};
  const { bottom } = useSafeAreaInsets();
  const [actionLoading, setActionLoading] = useState(false);

  const order = useSelector((state) =>
    state.order.orders.find((o) => o._id === orderId),
  );
  const { error } = useSelector((state) => state.order);

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#F83B0A" />
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = STATUS_INDEX[order.status] ?? 2;
  const isActive = (i) => currentIndex !== -1 && i <= currentIndex;
  const statusStyle = STATUS_STYLE[order.status] ?? {
    bg: "#f8f9fa",
    text: "#495057",
  };

  const handleCancel = async () => {
    Alert.alert(
      "Siparişi İptal Et",
      "Bu siparişi iptal etmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "İptal Et",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            const action = order.paymentId ? cancelPayment : cancelOrder;
            await dispatch(action(order._id))
              .unwrap()
              .catch(() => {});
            setActionLoading(false);
          },
        },
      ],
    );
  };

  const handleReturn = async () => {
    Alert.alert(
      "Siparişi İade Et",
      "Bu siparişi iade etmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "İade Et",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            const action = order.paymentTransactionId
              ? refundPayment
              : returnOrder;
            await dispatch(action(order._id))
              .unwrap()
              .catch(() => {});
            setActionLoading(false);
          },
        },
      ],
    );
  };

  const handleReorder = async () => {
    const outOfStock = [];
    const addableItems = order.items.filter(({ product, skuId, quantity }) => {
      if (!product) return false;
      if (product.hasVariants && skuId) {
        const sku = (product.skus || []).find(
          (s) => s._id?.toString() === skuId?.toString(),
        );
        if ((sku?.stock ?? 0) <= 0) {
          outOfStock.push(product.name);
          return false;
        }
        return true;
      }
      if ((product.stock ?? 1) <= 0) {
        outOfStock.push(product.name);
        return false;
      }
      return true;
    });

    if (addableItems.length === 0) {
      Alert.alert(
        "Stok Yok",
        "Siparişinizdeki ürünler şu an stokta bulunmamaktadır.",
      );
      return;
    }

    if (outOfStock.length > 0) {
      Alert.alert(
        "Bazı Ürünler Stokta Yok",
        outOfStock.join(", ") + " sepete eklenemedi.",
      );
    }

    await dispatch(syncClearCart());

    addableItems.forEach(({ product, quantity, skuId, selectedVariants }) => {
      let addCount = quantity;
      let productToAdd = product;

      if (product.hasVariants && skuId) {
        const sku = (product.skus || []).find(
          (s) => s._id?.toString() === skuId?.toString(),
        );
        if (sku) {
          addCount = Math.min(quantity, sku.stock ?? quantity);
          const skuDiscountedPrice = product.discountPercent
            ? +(sku.price * (1 - product.discountPercent / 100)).toFixed(2)
            : undefined;
          productToAdd = {
            ...product,
            price: sku.price,
            discountedPrice: skuDiscountedPrice,
          };
        }
      } else {
        addCount = Math.min(quantity, product.stock ?? quantity);
      }

      const variants =
        selectedVariants instanceof Map
          ? Object.fromEntries(selectedVariants)
          : (selectedVariants ?? {});

      for (let i = 0; i < addCount; i++) {
        dispatch(addToCartWithSync(productToAdd, variants, skuId ?? null));
      }
    });

    navigation.navigate("Checkout");
  };

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <ScreenHeader title={`Sipariş Detayı`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        {error && (
          <View className="mx-4 mb-2 px-4 py-3 bg-red-50 rounded-lg border border-red-200">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}

        {/* Stepper */}
        <View className="mb-4 py-5">
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              paddingHorizontal: 12,
            }}
          >
            {STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <View style={{ alignItems: "center", width: 48 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isActive(i) ? "#F83B0A" : "#e9ecef",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={step.icon}
                      style={{ width: 22, height: 22, tintColor: "#fff" }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={{
                      color: isActive(i) ? "#F83B0A" : "#adb5bd",
                      fontSize: 12,
                      lineHeight: 14,
                      textAlign: "center",
                      marginTop: 4,
                    }}
                    numberOfLines={2}
                  >
                    {step.label}
                  </Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View
                    style={{
                      flex: 1,
                      height: 2,
                      marginTop: 19,
                      borderTopWidth: 2,
                      borderStyle: "dashed",
                      borderColor: isActive(i + 1) ? "#ff7700" : "#dee2e6",
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          {order.status === "İptal Edildi" && (
            <View
              className="mx-5 mt-3 py-2 px-4 rounded-full self-start"
              style={{ backgroundColor: statusStyle.bg }}
            >
              <Text
                className="text-xs font-sans-semibold"
                style={{ color: statusStyle.text }}
              >
                Sipariş İptal Edildi
              </Text>
            </View>
          )}
          {order.status === "İade Edildi" && (
            <View
              className="mx-5 mt-3 py-2 px-4 rounded-full self-start"
              style={{ backgroundColor: statusStyle.bg }}
            >
              <Text
                className="text-xs font-sans-semibold"
                style={{ color: statusStyle.text }}
              >
                Sipariş İade Edildi
              </Text>
            </View>
          )}
        </View>

        {/* Order info */}
        <View className="smb-4 px-4 py-4">
          <View className="flex-row flex-wrap gap-4 mb-4">
            <View className="flex-1" style={{ minWidth: 100 }}>
              <Text className="text-xs text-text-muted mb-1">Tarih</Text>
              <Text className="text-sm font-sans-semibold text-text-primary">
                {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View className="flex-1" style={{ minWidth: 100 }}>
              <Text className="text-xs text-text-muted mb-1">Sipariş No</Text>
              <Text className="text-sm font-sans-semibold text-text-primary">
                {order.orderNo}
              </Text>
            </View>
            <View className="flex-1" style={{ minWidth: 100 }}>
              <Text className="text-xs text-text-muted mb-1">Durum</Text>
              <View
                className="self-start rounded-full px-2 py-0.5"
                style={{ backgroundColor: statusStyle.bg }}
              >
                <Text
                  className="text-xs font-sans-semibold"
                  style={{ color: statusStyle.text }}
                >
                  {order.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Items */}
          {order.items.map((item, i) => (
            <View
              key={i}
              className="flex-row items-center py-3"
              style={{
                borderTopWidth: 1,
                borderColor: "#e9ecef",
                justifyContent: "space-between",
                minHeight: 72,
              }}
            >
              <View
                className="rounded-md overflow-hidden bg-bg-light border border-border-subtle"
                style={{ width: 56, height: 56 }}
              >
                {item.product?.images?.[0]?.url ? (
                  <Image
                    source={{ uri: item.product.images[0].url }}
                    style={{ width: 56, height: 56 }}
                    resizeMode="contain"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="cube-outline" size={24} color="#adb5bd" />
                  </View>
                )}
              </View>

              <View style={{ maxWidth: 120, gap: 4 }}>
                <Text className="text-sm text-text-primary" numberOfLines={2}>
                  {item.product?.name}
                </Text>
                {item.selectedVariants &&
                  Object.keys(item.selectedVariants).length > 0 && (
                    <View className="flex-row flex-wrap gap-1">
                      {Object.entries(item.selectedVariants).map(
                        ([label, value]) => (
                          <View
                            key={label}
                            className="rounded px-2 py-0.5 bg-bg-light border border-border-subtle"
                          >
                            <Text className="text-xs text-text-secondary">
                              {label}: {value}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  )}
              </View>

              <Text className="text-xs font-sans-semibold" style={{ width: 44, textAlign: "center" }}>
                {item.quantity} Adet
              </Text>
              <View className="items-center" style={{ width: 90 }}>
                <Text
                  className="text-lg font-sans-bold"
                  style={{ color: "#F83B0A" }}
                >
                  {fmt(item.price)} ₺
                </Text>
                <Text className="text-sm">K.D.V Dahil</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Order summary */}
        <View className="bg-white mx-4 rounded-xl border border-border-subtle mb-6 px-4 py-4 gap-2">
          <Text className="text-sm font-sans-bold text-text-primary mb-1">
            Sipariş Özeti
          </Text>

          <View className="flex-row justify-between">
            <Text className="text-sm text-text-secondary">Ara Toplam</Text>
            <Text className="text-sm font-sans-semibold text-text-primary">
              {fmt(subtotal)} TL
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-sm text-text-secondary">Kargo</Text>
            <Text className="text-sm font-sans-semibold text-text-primary">
              {order.cargoPrice === 0
                ? "Ücretsiz"
                : `${fmt(order.cargoPrice)} TL`}
            </Text>
          </View>

          {order.coupon?.discount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-text-secondary">
                İndirim {order.coupon.code ? `(${order.coupon.code})` : ""}
              </Text>
              <Text className="text-sm font-sans-semibold text-green-600">
                -{fmt(order.coupon.discount)} TL
              </Text>
            </View>
          )}

          <View className="border-t border-border-subtle mt-1 pt-2 flex-row justify-between">
            <Text className="text-base font-sans-bold text-text-primary">
              Toplam
            </Text>
            <Text
              className="text-base font-sans-bold"
              style={{ color: "#ff7700" }}
            >
              {fmt(order.totalAmount + (order.cargoPrice ?? 0))} TL
            </Text>
          </View>
        </View>
        {/* Action buttons */}
        <View className="flex-row gap-10 items-center justify-center px-4 mb-6">
          <TouchableOpacity
            onPress={handleReorder}
            className="px-5 border border-brand-red rounded-lg py-5 flex-row items-center justify-center gap-2"
            activeOpacity={0.75}
          >
            <Image
              source={require("../assets/Profile/restock.png")}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
            <Text className="text-sm font-sans-semibold text-brand-red">
              Siparişi Tekrarla
            </Text>
          </TouchableOpacity>

          {(order.status === "Hazırlanıyor" ||
            order.status === "Teslim Edildi") && (
            <TouchableOpacity
              onPress={
                order.status === "Hazırlanıyor" ? handleCancel : handleReturn
              }
              disabled={actionLoading}
              className="py-3 items-center justify-center px-2"
              activeOpacity={0.75}
            >
              <Text className="text-sm font-sans-semibold text-text-secondary">
                {actionLoading
                  ? "İşleniyor..."
                  : order.status === "Hazırlanıyor"
                    ? "Siparişi İptal Et"
                    : "Siparişi İade Et"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Address info */}
        {(order.address || order.billingAddress) && (
          <View className="pt-5 px-4 gap-4" style={{ paddingBottom: 32 }}>
            {order.address && (
              <View
                className="bg-white rounded-xl px-4 py-4"
                style={{ borderWidth: 1, borderColor: "#E5E8EC" }}
              >
                <Text
                  className="text-lg font-sans-bold mb-3"
                  style={{ color: "#F83B0A" }}
                >
                  Teslimat Bilgileri
                </Text>
                <Text className="text-md font-sans">
                  {order.address.address}
                </Text>
                <Text className="text-md font-sans">
                  {String(
                    order.address.city + ", " + order.address.district,
                  ).toUpperCase()}
                </Text>
                <Text className="text-md mt-1 font-sans">
                  +90{" "}
                  {String(order.address.phone).slice(0, 3) +
                    " " +
                    String(order.address.phone).slice(3, 6) +
                    " " +
                    String(order.address.phone).slice(6, 8) +
                    " " +
                    String(order.address.phone).slice(8, 10)}
                </Text>
              </View>
            )}

            {order.billingAddress?.fullName && (
              <View
                className="bg-white rounded-xl px-4 py-4"
                style={{ borderWidth: 1, borderColor: "#E5E8EC" }}
              >
                <Text
                  className="text-lg font-sans-bold mb-3"
                  style={{ color: "#F83B0A" }}
                >
                  Fatura Bilgileri
                </Text>
                <Text className="text-md font-sans">
                  {order.billingAddress.address}
                </Text>
                <Text className="text-md font-sans">
                  {String(
                    order.billingAddress.city +
                      ", " +
                      order.billingAddress.district,
                  ).toUpperCase()}
                </Text>
                <Text className="text-md mt-1 font-sans">
                  +90{" "}
                  {String(order.billingAddress.phone).slice(1, 4) +
                    " " +
                    String(order.billingAddress.phone).slice(4, 7) +
                    " " +
                    String(order.billingAddress.phone).slice(7, 9) +
                    " " +
                    String(order.billingAddress.phone).slice(9, 11)}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
