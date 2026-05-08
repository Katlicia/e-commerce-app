import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  addToCartWithSync,
  decreaseCartWithSync,
  removeFromCartWithSync,
} from "@mobile/shared/redux/cartSlice";
import {
  addToFavouritesWithSync,
  removeFromFavouritesWithSync,
} from "@mobile/shared/redux/favouriteSlice";

export const CARD_WIDTH = 150;
export const CARD_HEIGHT = 290;
const IMAGE_HEIGHT = 130;

const BADGE_CONFIG = {
  yeni: { bg: "#F83B0A", color: "#fff", label: "YENİ" },
  "gunun-firsati": { image: require("../assets/badges/deal_of_day.png") },
  "en-cok-satan": { image: require("../assets/badges/sold.png") },
  indirimli: { image: require("../assets/badges/sale.png") },
};

export function BannerCard({ image }) {
  return (
    <View
      className="bg-bg-faint rounded-md mr-3 overflow-hidden border border-border-subtle"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      <Image
        source={{ uri: image }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </View>
  );
}

export const ProductCard = memo(function ProductCard({
  product,
  overrideBadge,
  cardWidth: cardW,
  noMargin,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const w = cardW ?? CARD_WIDTH;
  const productId = product._id || product.id;
  const image = product.images?.[0]?.url;

  const skus = product.skus || [];
  const defaultSku = product.hasVariants
    ? (skus.find((s) => (s.stock ?? 0) > 0) ?? skus[0] ?? null)
    : null;
  const defaultSkuDiscounted =
    defaultSku && product.discountPercent
      ? +(defaultSku.price * (1 - product.discountPercent / 100)).toFixed(2)
      : null;
  const displayPrice = defaultSku
    ? (defaultSkuDiscounted ?? defaultSku.price)
    : product.discountedPrice || product.price;
  const originalPrice = defaultSku
    ? defaultSkuDiscounted
      ? defaultSku.price
      : null
    : product.discountedPrice
      ? product.price
      : null;
  const outOfStock = product.hasVariants
    ? skus.every((s) => (s.stock ?? 0) <= 0)
    : (product.stock ?? 0) <= 0;

  const cartItem = useSelector((state) =>
    (state.cart.cart ?? []).find((i) => (i._id || i.id) === productId),
  );
  const isFav = useSelector((state) =>
    (state.favourite.favourites ?? []).some(
      (i) => (i._id || i.id) === productId,
    ),
  );

  const handleAddToCart = () => dispatch(addToCartWithSync(product, null, null));
  const handleIncrease = () => dispatch(addToCartWithSync(product, null, null));
  const handleDecrease = () =>
    cartItem?.quantity === 1
      ? dispatch(removeFromCartWithSync(productId))
      : dispatch(decreaseCartWithSync(productId, null));
  const handleToggleFav = () =>
    isFav
      ? dispatch(removeFromFavouritesWithSync(productId))
      : dispatch(addToFavouritesWithSync(product));

  const badgeKey = overrideBadge || product.badge;
  const badgeCfg = badgeKey ? BADGE_CONFIG[badgeKey] : null;

  return (
    <TouchableOpacity
      className={`bg-white border border-border-light rounded-sm overflow-hidden${noMargin ? "" : " mr-3"}`}
      style={{ width: w, height: CARD_HEIGHT }}
      onPress={() => navigation.navigate("ProductDetail", { productId })}
      activeOpacity={0.85}
    >
      {/* Image area */}
      <View style={{ height: IMAGE_HEIGHT }}>
        <Image
          source={{ uri: image }}
          style={{ width: w, height: IMAGE_HEIGHT }}
          resizeMode="contain"
          className="bg-bg-faint"
        />
        <TouchableOpacity
          className="absolute top-1.5 right-1.5 p-1"
          onPress={handleToggleFav}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={isFav ? "#e84040" : "#adb5bd"}
          />
        </TouchableOpacity>

        {badgeCfg && (
          badgeCfg.image ? (
            <Image
              source={badgeCfg.image}
              style={{ position: "absolute", top: 4, left: 6, width: 44, height: 44 }}
              resizeMode="contain"
            />
          ) : (
            <View className="absolute top-1.5 left-1.5 bg-brand-red rounded-xs px-1.5 py-0.5">
              <Text className="text-white text-2xs font-sans-bold">
                {badgeCfg.label}
              </Text>
            </View>
          )
        )}

        {product.discountPercent > 0 && (
          <View className="absolute bottom-2 left-2 bg-success-light rounded-xs px-1.5 py-0.5">
            <Text className="text-discount-green text-2xs font-sans-semibold">
              %{product.discountPercent} indirim
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-2" style={{ flex: 1, justifyContent: "space-between" }}>
        <View className="gap-1">
          <Text className="text-2xs font-sans text-text-muted">
            {product.code}
          </Text>
          <Text
            className="text-base font-sans-medium text-text-primary"
            numberOfLines={2}
            style={{ height: 40 }}
          >
            {product.name}
          </Text>
          <View style={{ height: 34 }}>
            {originalPrice && (
              <Text className="text-xs text-text-muted line-through">
                {Number(originalPrice).toFixed(2)}₺
              </Text>
            )}
            <Text className="text-md font-sans-bold text-price-red">
              {Number(displayPrice).toFixed(2)}₺
            </Text>
          </View>
        </View>

        {product.hasVariants ? (
          <TouchableOpacity
            className={`rounded-sm items-center py-2 ${outOfStock ? "bg-bg-light" : "bg-primary"}`}
            onPress={() => navigation.navigate("ProductDetail", { productId })}
            disabled={outOfStock}
            activeOpacity={0.85}
          >
            <Text className={`text-xs font-sans-semibold ${outOfStock ? "text-text-muted" : "text-white"}`}>
              {outOfStock ? "Stokta Yok" : "Seçenek Seç"}
            </Text>
          </TouchableOpacity>
        ) : cartItem ? (
          <View
            className="flex-row overflow-hidden rounded-md"
            style={{ borderWidth: 1.5, borderColor: "#ff7700", height: 36 }}
          >
            <TouchableOpacity
              className="flex-1 bg-primary items-center justify-center"
              onPress={handleDecrease}
            >
              {cartItem.quantity === 1 ? (
                <Ionicons name="trash-outline" size={13} color="white" />
              ) : (
                <Text className="text-white font-sans-bold text-lg" style={{ lineHeight: 20 }}>−</Text>
              )}
            </TouchableOpacity>
            <Text
              className="flex-1 text-center text-sm font-sans-semibold text-text-primary"
              style={{ lineHeight: 36 }}
            >
              {cartItem.quantity}
            </Text>
            {cartItem.quantity >= product.stock ? (
              <View className="flex-1" />
            ) : (
              <TouchableOpacity
                className="flex-1 bg-primary items-center justify-center"
                onPress={handleIncrease}
              >
                <Text className="text-white font-sans-bold text-lg" style={{ lineHeight: 20 }}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            className={`rounded-sm items-center py-2 ${outOfStock ? "bg-bg-light" : "bg-primary"}`}
            onPress={handleAddToCart}
            disabled={outOfStock}
            activeOpacity={0.85}
          >
            <Text className={`text-xs font-sans-semibold ${outOfStock ? "text-text-muted" : "text-white"}`}>
              {outOfStock ? "Stokta Yok" : "Sepete Ekle"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});
