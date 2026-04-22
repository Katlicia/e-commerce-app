import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import {
  addToCartWithSync,
  decreaseCartWithSync,
  removeFromCartWithSync,
} from "@mobile/shared/redux/cartSlice";
import {
  addToFavouritesWithSync,
  removeFromFavouritesWithSync,
} from "@mobile/shared/redux/favouriteSlice";

const CARD_WIDTH = 150;
const CARD_HEIGHT = 300;
const IMAGE_HEIGHT = 140;

const BADGE_CONFIG = {
  yeni: { bg: "#F83B0A", color: "#fff", label: "YENİ" },
  "gunun-firsati": { image: require("../../assets/badges/deal_of_day.png") },
  "en-cok-satan": { image: require("../../assets/badges/sold.png") },
  indirimli: { image: require("../../assets/badges/sale.png") },
};

function BannerCard({ image }) {
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

function ProductCard({ product, overrideBadge }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();

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
      className="bg-white border border-border-light rounded-md mr-3 pt-1 overflow-hidden"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      onPress={() => navigation.navigate("ProductDetail", { productId })}
      activeOpacity={0.85}
    >
      {/* Image */}
      <View>
        <Image
          source={{ uri: image }}
          style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}
          resizeMode="contain"
          className="bg-bg-faint"
        />
        {/* Fav button */}
        <TouchableOpacity
          className="absolute top-1.5 right-1.5 p-1"
          onPress={handleToggleFav}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={18}
            color={isFav ? "#e84040" : "#adb5bd"}
          />
        </TouchableOpacity>
        {/* Product badge (yeni, en-cok-satan, etc.) */}
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
        {/* Discount badge */}
        {product.discountPercent > 0 && (
          <View className="absolute bottom-2.5 left-3.5 bg-success-light rounded-xs px-1.5 py-0.5">
            <Text className="text-discount-green text-2xs font-bold">
              %{product.discountPercent} indirim
            </Text>
          </View>
        )}
      </View>

      {/* Info — flex: 1 so button is always pushed to the bottom */}
      <View
        className="p-2"
        style={{ flex: 1, justifyContent: "space-between" }}
      >
        <View className="gap-1">
          <Text className="text-2xs text-text-muted">
            Ürün Kodu: {product.code}
          </Text>
          <Text
            className="text-xs text-text-primary font-medium"
            numberOfLines={2}
            style={{ height: 34 }}
          >
            {product.name}
          </Text>
          <View className="flex-row items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= Math.round(product.rating) ? "star" : "star-outline"}
                size={10}
                color="#ff7700"
              />
            ))}
            <Text className="text-2xs text-text-muted ml-0.5">
              ({product.reviews?.length ?? 0})
            </Text>
          </View>
          <View className="flex-row items-center gap-1 flex-wrap">
            <Text className="text-md font-bold text-price-red">
              {Number(displayPrice).toFixed(2)}₺
            </Text>
            {originalPrice && (
              <Text className="text-xs text-text-muted line-through">
                {Number(originalPrice).toFixed(2)}₺
              </Text>
            )}
          </View>
        </View>

        {/* Cart button */}
        {product.hasVariants ? (
          <TouchableOpacity
            className={`rounded-sm items-center py-1.5 mt-1 ${outOfStock ? "bg-bg-light" : "bg-primary"}`}
            onPress={() => navigation.navigate("ProductDetail", { productId })}
            disabled={outOfStock}
            activeOpacity={0.85}
          >
            <Text
              className={`text-xs font-semibold ${outOfStock ? "text-text-muted" : "text-white"}`}
            >
              {outOfStock ? "Stokta Yok" : "Seçenek Seç"}
            </Text>
          </TouchableOpacity>
        ) : cartItem ? (
          <View className="flex-row items-center border border-border-input rounded-lg overflow-hidden mt-1">
            <TouchableOpacity
              className="flex-1 items-center py-1"
              onPress={handleDecrease}
            >
              {cartItem.quantity === 1 ? (
                <Ionicons name="trash-outline" size={14} color="#f83b0a" />
              ) : (
                <Text className="text-price-red font-bold text-md">−</Text>
              )}
            </TouchableOpacity>
            <Text className="text-sm font-semibold text-text-primary px-2">
              {cartItem.quantity}
            </Text>
            {cartItem.quantity >= product.stock ? (
              <View className="flex-1" />
            ) : (
              <TouchableOpacity
                className="flex-1 items-center py-1"
                onPress={handleIncrease}
              >
                <Text className="text-price-red font-bold text-md">+</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            className={`rounded-sm items-center py-1.5 mt-1 ${outOfStock ? "bg-bg-light" : "bg-primary"}`}
            onPress={handleAddToCart}
            disabled={outOfStock}
            activeOpacity={0.85}
          >
            <Text
              className={`text-xs font-semibold ${outOfStock ? "text-text-muted" : "text-white"}`}
            >
              {outOfStock ? "Stokta Yok" : "Sepete Ekle"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export { ProductCard };

async function fetchProducts(settings) {
  try {
    if (settings.recentlyViewed) {
      const res = await axiosInstance.get("/users/me/visited");
      return Array.isArray(res.data) ? res.data : [];
    }
    if (settings.bestSellers) {
      const res = await axiosInstance.get("/products/best-sellers");
      return res.data.products || [];
    }
    if (settings.badge) {
      const res = await axiosInstance.get(`/products/badge/${settings.badge}`);
      return Array.isArray(res.data) ? res.data : res.data.products || [];
    }
    const res = await axiosInstance.get("/products");
    return res.data.products || [];
  } catch {
    return [];
  }
}

function useCountdown(endTime) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    if (!endTime) return;
    const target = new Date(endTime).getTime();

    const calc = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        gun: Math.floor(diff / 86400000),
        saat: Math.floor((diff % 86400000) / 3600000),
        dakika: Math.floor((diff % 3600000) / 60000),
      });
    };

    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [endTime]);

  return time;
}

function TimerDisplay({ endTime }) {
  const time = useCountdown(endTime);
  if (!time) return null;

  const blocks = [
    { value: time.gun, label: "Gün" },
    { value: time.saat, label: "Saat" },
    { value: time.dakika, label: "Dakika" },
  ];

  return (
    <View className="flex-row items-center gap-3">
      {blocks.map(({ value, label }) => (
        <View key={label} className="items-center">
          <Text className="text-price-red font-bold text-lg leading-none">
            {value}
          </Text>
          <Text className="text-price-red text-2xs">{label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeProductList({ title, settings = {} }) {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts(settings)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [settings.badge, settings.bestSellers, settings.recentlyViewed]);

  if (loading) {
    return (
      <View className="h-48 items-center justify-center">
        <ActivityIndicator color="#ff7700" />
      </View>
    );
  }

  if (!products.length) return null;

  const listData = settings.banner
    ? [{ __banner: true, url: settings.banner }, ...products]
    : products;

  return (
    <View className="my-3">
      <View className="flex-row items-center justify-between px-4 mb-2">
        <Text className="text-2xl font-bold text-text-primary">{title}</Text>
        {settings.timerEnd ? (
          <TimerDisplay endTime={settings.timerEnd} />
        ) : (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Category", { filter: settings })
            }
          >
            <Text className="text-sm text-primary underline">Tümünü Gör</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={listData}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        keyExtractor={(item, i) => (item.__banner ? "banner" : item._id)}
        renderItem={({ item }) =>
          item.__banner ? (
            <BannerCard image={item.url} />
          ) : (
            <ProductCard
              product={item}
              overrideBadge={settings.bestSellers ? "en-cok-satan" : undefined}
            />
          )
        }
      />
    </View>
  );
}
