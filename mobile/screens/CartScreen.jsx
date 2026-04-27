import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
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

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, totalAmount } = useSelector((state) => state.cart);
  const freeShippingThreshold = useSelector(
    (state) => state.taxSettings.freeShippingThreshold ?? 500,
  );

  const remaining = Math.max(freeShippingThreshold - totalAmount, 0);
  const progress = Math.min((totalAmount / freeShippingThreshold) * 100, 100);

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
          Sepetim ({cart.reduce((s, i) => s + i.quantity, 0)} ürün)
        </Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => `${item._id || item.id}-${item.skuId ?? ""}`}
        renderItem={({ item }) => <CartItem item={item} />}
        contentContainerStyle={{ paddingBottom: 8 }}
        style={{ backgroundColor: "white" }}
        ListFooterComponent={
          <View className="bg-white">
            {/* Free shipping progress */}
            {remaining > 0 ? (
              <View className="mx-4 mt-4 mb-2 bg-bg-light rounded-xl px-4 py-3">
                <Text className="text-xs text-text-secondary text-center">
                  Ücretsiz kargo için{" "}
                  <Text className="font-bold text-primary">
                    {remaining.toFixed(2)}₺
                  </Text>{" "}
                  daha ekle
                </Text>
                <View className="h-1.5 bg-border-light rounded-full mt-2 overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            ) : (
              <View className="mx-4 mt-4 mb-2 bg-success-light rounded-xl px-4 py-3 flex-row items-center justify-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color="#3DB860" />
                <Text className="text-xs font-semibold text-discount-green">
                  Ücretsiz kargo kazandınız!
                </Text>
              </View>
            )}

            {/* Order summary */}
            <View className="mx-4 mt-3 mb-4 bg-bg-light rounded-xl p-4 gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-text-secondary">Ara Toplam</Text>
                <Text className="text-sm font-semibold text-text-primary">
                  {totalAmount.toFixed(2)}₺
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-text-secondary">Kargo</Text>
                <Text
                  className={`text-sm font-semibold ${remaining === 0 ? "text-discount-green" : "text-text-primary"}`}
                >
                  {remaining === 0
                    ? "Ücretsiz"
                    : "Adrese göre hesaplanacaktır."}
                </Text>
              </View>
              <View className="border-t border-border-subtle pt-2 mt-1 flex-row justify-between">
                <Text className="text-base font-bold text-text-primary">
                  Toplam
                </Text>
                <Text className="text-base font-bold text-price-red">
                  {totalAmount.toFixed(2)}₺
                </Text>
              </View>
            </View>

            <View className="px-4 pb-6">
              <TouchableOpacity
                className="bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2"
                onPress={() => navigation.navigate("Checkout")}
                activeOpacity={0.85}
              >
                <Text className="text-white font-bold text-base">
                  Siparişi Tamamla
                </Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
