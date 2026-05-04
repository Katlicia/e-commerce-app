import React, { useState } from "react";
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
export const CARD_HEIGHT = 300;
const IMAGE_HEIGHT = 140;

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

export function ProductCard({
  product,
  overrideBadge,
  cardWidth: cardW,
  noMargin,
  gridMode,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const w = cardW ?? CARD_WIDTH;
  const imgH = gridMode
    ? Math.round(w * (IMAGE_HEIGHT / CARD_WIDTH))
    : IMAGE_HEIGHT;

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

  const handleAddToCart = () =>
    dispatch(addToCartWithSync(product, null, null));
  const handleIncrease = () => dispatch(addToCartWithSync(product, null, null));
  const handleDecrease = () => {
    cartItem?.quantity === 1
      ? dispatch(removeFromCartWithSync(productId))
      : dispatch(decreaseCartWithSync(productId, null));
  };
  const handleToggleFav = () =>
    isFav
      ? dispatch(removeFromFavouritesWithSync(productId))
      : dispatch(addToFavouritesWithSync(product));

  return (
    <TouchableOpacity
      className={`bg-white border border-border-light rounded-sm pt-1 overflow-hidden${noMargin ? "" : " mr-3"}`}
      style={{ width: w, height: gridMode ? CARD_HEIGHT + 60 : CARD_HEIGHT }}
      onPress={() => navigation.navigate("ProductDetail", { productId })}
      activeOpacity={0.85}
    >
      <View>
        <Image
          source={{ uri: image }}
          style={{ width: w, height: imgH }}
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
            size={24}
            color={isFav ? "#e84040" : "#adb5bd"}
          />
        </TouchableOpacity>
        {(() => {
          const key = overrideBadge || product.badge;
          const cfg = key ? BADGE_CONFIG[key] : null;
          if (!cfg) return null;
          if (cfg.image) {
            return (
              <Image
                source={cfg.image}
                style={{
                  position: "absolute",
                  top: 4,
                  left: 6,
                  width: 44,
                  height: 44,
                }}
                resizeMode="contain"
              />
            );
          }
          return (
            <View
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                backgroundColor: cfg.bg,
                borderRadius: 4,
                paddingHorizontal: 5,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{ color: cfg.color, fontSize: 9, fontWeight: "700" }}
              >
                {cfg.label}
              </Text>
            </View>
          );
        })()}
        {product.discountPercent > 0 && (
          <View className="absolute bottom-2.5 left-3.5 bg-success-light rounded-xs px-1.5 py-0.5">
            <Text className="text-discount-green text-2xs font-bold">
              %{product.discountPercent} indirim
            </Text>
          </View>
        )}
      </View>

      <View
        className={gridMode ? "p-3" : "p-2"}
        style={{ flex: 1, justifyContent: "space-between" }}
      >
        <View className={gridMode ? "gap-2" : "gap-1"}>
          <Text
            className={
              gridMode ? "text-xs text-text-muted" : "text-2xs text-text-muted"
            }
          >
            Ürün Kodu: {product.code}
          </Text>
          <Text
            className={
              gridMode
                ? "text-sm text-text-primary font-medium"
                : "text-xs text-text-primary font-medium"
            }
            numberOfLines={2}
            style={gridMode ? undefined : { height: 34 }}
          >
            {product.name}
          </Text>
          <View className="flex-row items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= Math.round(product.rating) ? "star" : "star-outline"}
                size={gridMode ? 12 : 10}
                color="#ff7700"
              />
            ))}
            <Text
              className={
                gridMode
                  ? "text-xs text-text-muted ml-0.5"
                  : "text-2xs text-text-muted ml-0.5"
              }
            >
              ({product.reviews?.length ?? 0})
            </Text>
          </View>
          <View className="flex-row items-center gap-1 flex-wrap">
            <Text
              className={
                gridMode
                  ? "text-lg font-bold text-price-red"
                  : "text-md font-bold text-price-red"
              }
            >
              {Number(displayPrice).toFixed(2)}₺
            </Text>
            {originalPrice && (
              <Text
                className={
                  gridMode
                    ? "text-sm text-text-muted line-through"
                    : "text-xs text-text-muted line-through"
                }
              >
                {Number(originalPrice).toFixed(2)}₺
              </Text>
            )}
          </View>
        </View>

        {product.hasVariants ? (
          <TouchableOpacity
            className={`rounded-sm items-center ${outOfStock ? "bg-bg-light" : "bg-primary"} ${gridMode ? "py-2.5" : "py-1.5"}`}
            onPress={() => navigation.navigate("ProductDetail", { productId })}
            disabled={outOfStock}
            activeOpacity={0.85}
          >
            <Text
              className={`font-semibold ${outOfStock ? "text-text-muted" : "text-white"} ${gridMode ? "text-sm" : "text-xs"}`}
            >
              {outOfStock ? "Stokta Yok" : "Seçenek Seç"}
            </Text>
          </TouchableOpacity>
        ) : cartItem ? (
          <View
            style={{
              flexDirection: "row",
              borderWidth: 1.5,
              borderColor: "#ff7700",
              borderRadius: 10,
              overflow: "hidden",
              height: gridMode ? 40 : 32,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#ff7700",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={handleDecrease}
            >
              {cartItem.quantity === 1 ? (
                <Ionicons
                  name="trash-outline"
                  size={gridMode ? 15 : 13}
                  color="white"
                />
              ) : (
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: gridMode ? 18 : 15,
                    lineHeight: gridMode ? 22 : 18,
                  }}
                >
                  −
                </Text>
              )}
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                fontWeight: "600",
                fontSize: gridMode ? 14 : 12,
                color: "#212529",
                lineHeight: gridMode ? 40 : 32,
              }}
            >
              {cartItem.quantity}
            </Text>
            {cartItem.quantity >= product.stock ? (
              <View style={{ flex: 1 }} />
            ) : (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#ff7700",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={handleIncrease}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: gridMode ? 18 : 15,
                    lineHeight: gridMode ? 22 : 18,
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={{
              borderRadius: 8,
              alignItems: "center",
              backgroundColor: outOfStock ? "#f0f0f0" : "#ff7700",
              paddingVertical: gridMode ? 10 : 7,
            }}
            onPress={handleAddToCart}
            disabled={outOfStock}
            activeOpacity={0.85}
          >
            <Text
              style={{
                fontWeight: "600",
                color: outOfStock ? "#adb5bd" : "white",
                fontSize: gridMode ? 13 : 11,
              }}
            >
              {outOfStock ? "Stokta Yok" : "Sepete Ekle"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
