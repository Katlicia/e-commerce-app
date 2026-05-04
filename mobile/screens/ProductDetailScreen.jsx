import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const icons = {
  heart: require("../assets/ProductDetails/heart.png"),
  list: require("../assets/ProductDetails/list.png"),
  briefcase: require("../assets/ProductDetails/briefcase.png"),
  bell: require("../assets/ProductDetails/bell.png"),
  cargo: require("../assets/ProductDetails/cargo.png"),
};
import {
  getProductDetail,
  createReview,
  updateReview,
  deleteReview,
} from "@mobile/shared/redux/productSlice";
import {
  addToCartWithSync,
  decreaseCartWithSync,
  removeFromCartWithSync,
} from "@mobile/shared/redux/cartSlice";
import {
  addToFavouritesWithSync,
  removeFromFavouritesWithSync,
} from "@mobile/shared/redux/favouriteSlice";
import { ProductCard } from "../components/ProductCard";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import AddToListModal from "../components/AddToListModal";

function maskName(name, surname) {
  const parts = [name, surname].filter(Boolean);
  if (parts.length === 0) return "Kullanıcı";
  return parts.map((part) => (part[0] || "") + "**").join(" ");
}

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params || {};

  const { product, loading } = useSelector((state) => state.product);
  const { favourites } = useSelector((state) => state.favourite);
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { freeShippingThreshold } = useSelector((state) => state.taxSettings);

  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [showDesc, setShowDesc] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [related, setRelated] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);

  useEffect(() => {
    if (productId) {
      dispatch(getProductDetail(productId));
      setActiveImg(0);
      setSelectedVariants({});
      setQuantity(1);
      setRelated([]);
    }
  }, [productId]);

  useEffect(() => {
    if (!product?._id || product._id !== productId) return;

    if (user) {
      axiosInstance.post(`/users/me/visited/${productId}`).catch(() => {});
    }

    const categoryId = product.category?._id || product.category;
    if (categoryId) {
      axiosInstance
        .get(`/products?category=${categoryId}&limit=10`)
        .then((res) => {
          const list = res.data.products || res.data || [];
          const filtered = list.filter((p) => p._id !== productId);
          setRelated(filtered);
          if (filtered.length === 0) {
            axiosInstance
              .get(`/products?sort=-soldCount&limit=10`)
              .then((r) => {
                const best = r.data.products || r.data || [];
                setBestSellers(best.filter((p) => p._id !== productId));
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    } else {
      axiosInstance
        .get(`/products?sort=-soldCount&limit=10`)
        .then((res) => {
          const list = res.data.products || res.data || [];
          setBestSellers(list.filter((p) => p._id !== productId));
        })
        .catch(() => {});
    }
  }, [product?._id]);

  const isReady =
    !loading && product && product._id && product._id === productId;

  if (!isReady) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center px-4 py-3 border-b border-border-subtle">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#212529" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff7700" />
        </View>
      </SafeAreaView>
    );
  }

  const pid = product._id;
  const images = product.images || [];
  const currentImg = images[activeImg]?.url || "";
  const isFavourite = favourites.some((f) => (f._id || f.id) === pid);
  const features = product.features
    ? product.features.map((s) => s.trim()).filter(Boolean)
    : [];
  const skus = product.skus || [];
  const variantOptionEntries =
    product.hasVariants && product.variantOptions
      ? Object.entries(product.variantOptions)
      : [];

  const matchedSku =
    variantOptionEntries.length > 0
      ? (skus.find((sku) => {
          const attrs = sku.attributes || {};
          return variantOptionEntries.every(
            ([k]) => attrs[k] === selectedVariants[k],
          );
        }) ?? null)
      : null;

  function isOptionAvailable(label, optValue) {
    return skus.some((sku) => {
      const attrs = sku.attributes || {};
      if (attrs[label] !== optValue) return false;
      for (const [k, v] of Object.entries(selectedVariants)) {
        if (k === label) continue;
        if (v && attrs[k] !== v) return false;
      }
      return sku.stock > 0;
    });
  }

  const allGroupsSelected = variantOptionEntries.every(
    ([k]) => selectedVariants[k],
  );
  const price = product.hasVariants
    ? matchedSku
      ? matchedSku.price
      : product.price || 0
    : product.price || 0;
  const discountPercent = product.discountPercent || null;
  const discountedPrice =
    discountPercent && price
      ? +(price * (1 - discountPercent / 100)).toFixed(2)
      : null;
  const activeStock = product.hasVariants
    ? matchedSku
      ? matchedSku.stock
      : 0
    : product.stock;
  const addToCartDisabled = product.hasVariants
    ? !allGroupsSelected || !matchedSku || matchedSku.stock <= 0
    : product.stock <= 0;
  const skuId = matchedSku?._id?.toString() ?? null;
  const cartItem = cart.find((item) => {
    if ((item._id || item.id) !== pid) return false;
    if (skuId) return item.skuId === skuId;
    return !item.skuId;
  });

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum + (item.discountedPrice || item.price) * (item.quantity || 1),
    0,
  );
  const remaining = freeShippingThreshold
    ? Math.max(0, freeShippingThreshold - cartTotal)
    : 0;

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
      : 0;

  const myReview = user
    ? reviews.find(
        (r) =>
          (r.user?.toString?.() ?? r.user) ===
          (user._id?.toString?.() ?? user._id),
      )
    : null;

  async function handleReviewSubmit() {
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      await dispatch(
        createReview({
          productId: pid,
          comment: reviewComment,
          rating: reviewRating,
        }),
      ).unwrap();
      setReviewComment("");
      setReviewRating(5);
      setReviewSuccess(true);
      dispatch(getProductDetail(productId));
      setTimeout(() => setReviewSuccess(false), 3000);
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleReviewUpdate() {
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      await dispatch(
        updateReview({
          productId: pid,
          comment: reviewComment,
          rating: reviewRating,
        }),
      ).unwrap();
      setEditMode(false);
      setReviewSuccess(true);
      dispatch(getProductDetail(productId));
      setTimeout(() => setReviewSuccess(false), 3000);
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleReviewDelete() {
    await dispatch(deleteReview({ productId: pid })).unwrap();
    dispatch(getProductDetail(productId));
  }

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      dispatch(
        addToCartWithSync(
          { ...product, price, discountedPrice, image: currentImg },
          selectedVariants,
          skuId,
        ),
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border-subtle">
        <TouchableOpacity className="p-4" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#212529" />
        </TouchableOpacity>

        <View className="flex-1 flex-row justify-end py-2">
          {[
            {
              image: icons.heart,
              label: "FAVORİYE\nEKLE",
              onPress: () =>
                isFavourite
                  ? dispatch(removeFromFavouritesWithSync(pid))
                  : dispatch(addToFavouritesWithSync(product)),
            },
            {
              image: icons.list,
              label: "LİSTEYE\nEKLE",
              onPress: () => setListModalVisible(true),
            },
            {
              image: icons.briefcase,
              label: "KURUMSAL\nTEKLİF",
              onPress: () => {},
            },
            {
              image: icons.bell,
              label: "FİYAT\nALARMI",
              onPress: () => {},
            },
          ].map(({ image, label, onPress }) => (
            <TouchableOpacity
              key={label}
              className="items-center gap-1"
              style={{ width: 68 }}
              onPress={onPress}
            >
              <Image
                source={image}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
              <Text
                style={{
                  fontSize: 11,
                  color: "#6c757d",
                  textAlign: "center",
                  lineHeight: 11,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image area */}
        <View className="relative bg-white px-4 pt-3 pb-5">
          {product.badge && (
            <View
              className="absolute top-3 left-4 z-10 px-2 py-1 rounded-sm"
              style={{ backgroundColor: "#ff7700" }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 9,
                  fontWeight: "800",
                  letterSpacing: 0.3,
                }}
              >
                {product.badge.toUpperCase()}
              </Text>
            </View>
          )}
          <Image
            source={{ uri: currentImg }}
            style={{ width: "100%", height: 260 }}
            resizeMode="contain"
          />
        </View>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 mb-2"
            contentContainerStyle={{ gap: 8 }}
          >
            {images.map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveImg(i)}
                style={{
                  borderWidth: i === activeImg ? 2 : 1,
                  borderColor: i === activeImg ? "#ff7700" : "#dee2e6",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{ uri: img.url }}
                  style={{ width: 56, height: 56 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View className="px-4 gap-2 pb-4">
          {/* Code + stock status */}
          <View className="flex-row items-center justify-between">
            {product.code ? (
              <Text style={{ fontSize: 12, color: "#7B7B7B" }}>
                Ürün Kodu: <Text>{product.code}</Text>
              </Text>
            ) : (
              <View />
            )}
            <View className="flex-row items-center gap-1">
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: activeStock > 0 ? "#37a446" : "#adb5bd",
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: activeStock > 0 ? "#37a446" : "#adb5bd",
                  fontWeight: "600",
                }}
              >
                {activeStock > 0 ? "Stokta Var" : "Stokta Yok"}
              </Text>
            </View>
          </View>

          {/* Brand */}
          {product.brand && (
            <Text style={{ fontSize: 12, color: "#7B7B7B" }}>
              Marka:{" "}
              <Text
                style={{ fontSize: 12, color: "#7B7B7B" }}
                onPress={() =>
                  navigation.navigate("ProductList", {
                    filter: { brand: product.brand },
                  })
                }
              >
                {product.brand}
              </Text>
            </Text>
          )}

          {/* Name */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "400",
              color: "#212529",
            }}
          >
            {product.name}
          </Text>

          {/* Price */}
          <View className="flex-col">
            {discountedPrice ? (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#adb5bd",
                    textDecorationLine: "line-through",
                  }}
                >
                  {Number(price).toFixed(2).replace(".", ",")}₺
                </Text>
                <Text
                  style={{ fontSize: 24, fontWeight: "600", color: "#212529" }}
                >
                  {Number(discountedPrice).toFixed(2).replace(".", ",")}₺
                </Text>
              </>
            ) : (
              <Text
                style={{ fontSize: 24, fontWeight: "800", color: "#212529" }}
              >
                {Number(price).toFixed(2).replace(".", ",")}₺
              </Text>
            )}
          </View>

          {/* Low stock warning */}
          {activeStock > 0 && activeStock <= 20 && (
            <Text style={{ fontSize: 12, color: "#f83b0a" }}>
              Acele Edin! Sadece{" "}
              <Text style={{ fontWeight: "700" }}>{activeStock} adet</Text> stok
              kaldı.
            </Text>
          )}

          {/* Variants */}
          {product.hasVariants &&
            variantOptionEntries.map(([label, options]) => (
              <View key={label} className="mt-1">
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    marginBottom: 6,
                    color: "#212529",
                  }}
                >
                  {label}:{" "}
                  {selectedVariants[label] && (
                    <Text style={{ fontWeight: "400", color: "#555" }}>
                      {selectedVariants[label]}
                    </Text>
                  )}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {options.map((optValue) => {
                    const available = isOptionAvailable(label, optValue);
                    const isSelected = selectedVariants[label] === optValue;
                    return (
                      <TouchableOpacity
                        key={optValue}
                        disabled={!available}
                        onPress={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [label]:
                              prev[label] === optValue ? undefined : optValue,
                          }))
                        }
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                          borderRadius: 6,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? "#ff7700" : "#dee2e6",
                          backgroundColor: isSelected
                            ? "#fff3e0"
                            : available
                              ? "#fff"
                              : "#f5f5f5",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: isSelected
                              ? "#ff7700"
                              : available
                                ? "#333"
                                : "#bbb",
                            fontWeight: isSelected ? "600" : "400",
                            textDecorationLine: !available
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {optValue}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

          {/* Features — max 3 */}
          {features.length > 0 && (
            <View className="mt-1 gap-1.5">
              {features.slice(0, 3).map((f, i) => (
                <View key={i} className="flex-row gap-2">
                  <Text style={{ color: "#6c757d", fontSize: 13 }}>•</Text>
                  <Text style={{ flex: 1, fontSize: 13, color: "#424040" }}>
                    {f}
                  </Text>
                </View>
              ))}
              {(features.length > 0 || product.description) && (
                <TouchableOpacity
                  onPress={() => setShowDesc((v) => !v)}
                  className="mt-1"
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#ff7700",
                      fontWeight: "600",
                    }}
                  >
                    Tüm Ürün Açıklaması
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Accordion rows */}
        <View style={{ borderTopWidth: 1, borderColor: "#f0f0f0" }}>
          {/* Product Description */}
          {(product.description || product.descriptionImages?.length > 0) && (
            <>
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-4"
                style={{ borderBottomWidth: 1, borderColor: "#f0f0f0" }}
                onPress={() => setShowDesc((v) => !v)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#212529",
                  }}
                >
                  Ürün Açıklaması
                </Text>
                <Ionicons
                  name={showDesc ? "chevron-down" : "chevron-forward"}
                  size={18}
                  color="#adb5bd"
                />
              </TouchableOpacity>
              {showDesc && (
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderColor: "#f0f0f0",
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 16,
                    gap: 12,
                  }}
                >
                  {product.description && (
                    <Text
                      style={{ fontSize: 13, color: "#424040", lineHeight: 20 }}
                    >
                      {product.description}
                    </Text>
                  )}
                  {product.descriptionImages?.map((img, i) => (
                    <Image
                      key={i}
                      source={{ uri: img.url }}
                      style={{ width: "100%", height: 200, borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              )}
            </>
          )}

          {/* Product Features */}
          {features.length > 0 && (
            <>
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-4"
                style={{ borderBottomWidth: 1, borderColor: "#f0f0f0" }}
                onPress={() => setShowSpecs((v) => !v)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#212529",
                  }}
                >
                  Ürün Özellikleri
                </Text>
                <Ionicons
                  name={showSpecs ? "chevron-down" : "chevron-forward"}
                  size={18}
                  color="#adb5bd"
                />
              </TouchableOpacity>
              {showSpecs && (
                <View
                  className="px-4 pb-4"
                  style={{
                    borderBottomWidth: 1,
                    borderColor: "#f0f0f0",
                    paddingTop: 12,
                    gap: 6,
                  }}
                >
                  {features.map((f, i) => (
                    <View key={i} className="flex-row gap-2">
                      <Text style={{ color: "#6c757d", fontSize: 13 }}>•</Text>
                      <Text style={{ flex: 1, fontSize: 13, color: "#424040" }}>
                        {f}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Suggested Products */}
        {(related.length > 0 || bestSellers.length > 0) && (
          <View className="pt-5">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#212529" }}
              >
                {related.length > 0 ? "Lazım Olabilir" : "Çok Satanlar"}
              </Text>
              {related.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ProductList", {
                      filter: {
                        category: product.category?.slug || product.category,
                      },
                    })
                  }
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#ff7700",
                      fontWeight: "600",
                      textDecorationLine: "underline",
                    }}
                  >
                    Tümü
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              {(related.length > 0 ? related : bestSellers).map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Ratings */}
        <View className="pt-5 pb-6">
          {/* Section header */}
          <View className="flex-row items-center gap-2 px-4 mb-4">
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#212529",
              }}
            >
              Değerlendirmeler
            </Text>
            {reviews.length > 0 && (
              <>
                <View className="flex-row gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= avgRating ? "star" : "star-outline"}
                      size={14}
                      color={star <= avgRating ? "#ff7700" : "#dee2e6"}
                    />
                  ))}
                </View>
                <Text style={{ fontSize: 13, color: "#6c757d" }}>
                  ({reviews.length})
                </Text>
              </>
            )}
          </View>

          {/* Horizontal review cards */}
          {reviews.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5"
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {reviews.map((review, i) => (
                <View
                  key={review._id || i}
                  style={{
                    width: 220,
                    borderWidth: 1,
                    borderColor: "#f0f0f0",
                    borderRadius: 12,
                    padding: 14,
                    backgroundColor: "#FFFAED",
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#adb5bd",
                      }}
                    >
                      {maskName(review.name, review.surname)}
                    </Text>
                    {review.createdAt && (
                      <Text style={{ fontSize: 10, color: "#adb5bd" }}>
                        {new Date(review.createdAt).toLocaleDateString(
                          "tr-TR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </Text>
                    )}
                  </View>
                  <View className="flex-row gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? "star" : "star-outline"}
                        size={12}
                        color={star <= review.rating ? "#ff7700" : "#dee2e6"}
                      />
                    ))}
                  </View>
                  <Text
                    style={{ fontSize: 12, color: "#424040", lineHeight: 18 }}
                    numberOfLines={4}
                  >
                    {review.comment}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Review form */}
          <View className="px-4">
            {user ? (
              myReview && !editMode ? (
                <View
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "#fafafa",
                    borderWidth: 1,
                    borderColor: "#f0f0f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      marginBottom: 6,
                      color: "#212529",
                    }}
                  >
                    Yorumunuz
                  </Text>
                  <View className="flex-row gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= myReview.rating ? "star" : "star-outline"}
                        size={16}
                        color={star <= myReview.rating ? "#ff7700" : "#dee2e6"}
                      />
                    ))}
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#424040",
                      marginBottom: 12,
                    }}
                  >
                    {myReview.comment}
                  </Text>
                  {reviewSuccess && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#37a446",
                        marginBottom: 8,
                      }}
                    >
                      Yorumunuz güncellendi!
                    </Text>
                  )}
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 rounded-full py-2.5 items-center"
                      style={{ backgroundColor: "#ff7700" }}
                      onPress={() => {
                        setReviewComment(myReview.comment);
                        setReviewRating(myReview.rating);
                        setEditMode(true);
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 13,
                          fontWeight: "600",
                        }}
                      >
                        Düzenle
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-5 rounded-full py-2.5 items-center justify-center"
                      style={{ borderWidth: 1, borderColor: "#f83b0a" }}
                      onPress={handleReviewDelete}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#f83b0a"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      marginBottom: 8,
                      color: "#212529",
                    }}
                  >
                    Puanınız
                  </Text>
                  <View className="flex-row gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setReviewRating(star)}
                      >
                        <Ionicons
                          name={star <= reviewRating ? "star" : "star-outline"}
                          size={28}
                          color={star <= reviewRating ? "#ff7700" : "#dee2e6"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      marginBottom: 6,
                      color: "#212529",
                    }}
                  >
                    Yorumunuz
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: "#dee2e6",
                      borderRadius: 10,
                      padding: 12,
                      fontSize: 13,
                      color: "#212529",
                      textAlignVertical: "top",
                      minHeight: 90,
                      backgroundColor: "#fafafa",
                    }}
                    multiline
                    placeholder="Ürün hakkında görüşlerinizi yazın..."
                    placeholderTextColor="#adb5bd"
                    value={reviewComment}
                    onChangeText={setReviewComment}
                  />
                  {reviewSuccess && (
                    <Text
                      style={{ fontSize: 12, color: "#37a446", marginTop: 6 }}
                    >
                      {editMode
                        ? "Yorumunuz güncellendi!"
                        : "Yorumunuz eklendi!"}
                    </Text>
                  )}
                  <View className="flex-row gap-2 mt-3">
                    <TouchableOpacity
                      className="flex-1 rounded-full py-3 items-center"
                      style={{
                        backgroundColor: reviewSubmitting ? "#ccc" : "#ff7700",
                      }}
                      disabled={reviewSubmitting}
                      onPress={
                        editMode ? handleReviewUpdate : handleReviewSubmit
                      }
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 13,
                          fontWeight: "700",
                        }}
                      >
                        {reviewSubmitting
                          ? "Gönderiliyor..."
                          : editMode
                            ? "Kaydet"
                            : "Yorum Yap"}
                      </Text>
                    </TouchableOpacity>
                    {editMode && (
                      <TouchableOpacity
                        className="flex-1 rounded-full py-3 items-center"
                        style={{ borderWidth: 1, borderColor: "#dee2e6" }}
                        onPress={() => {
                          setEditMode(false);
                          setReviewComment("");
                          setReviewRating(5);
                        }}
                      >
                        <Text style={{ fontSize: 13, color: "#6c757d" }}>
                          İptal
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )
            ) : (
              <Text style={{ fontSize: 13, color: "#6c757d" }}>
                Yorum yapabilmek için{" "}
                <Text
                  style={{ color: "#ff4d2d", fontWeight: "600" }}
                  onPress={() => navigation.navigate("Login")}
                >
                  giriş yapın
                </Text>
                .
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom cart bar */}
      <View
        className="px-4 pt-3 border-t border-border-subtle bg-white"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {cartItem ? (
          <>
            {freeShippingThreshold > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#37a446",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                {remaining > 0 ? (
                  <>
                    {"Sepete "}
                    <Text style={{ fontWeight: "700" }}>
                      {remaining.toFixed(2).replace(".", ",")} TL
                    </Text>
                    {" daha eklerseniz "}
                    <Text style={{ fontWeight: "700" }}>kargo ücretsiz.</Text>
                  </>
                ) : (
                  <Text style={{ fontWeight: "700" }}>Kargo ücretsiz!</Text>
                )}
              </Text>
            )}
            <View
              style={{
                flexDirection: "row",
                alignSelf: "center",
                width: "50%",
                borderWidth: 1.5,
                borderColor: "#ff7700",
                borderRadius: 10,
                overflow: "hidden",
                height: 52,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#ff7700",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() =>
                  cartItem.quantity === 1
                    ? dispatch(removeFromCartWithSync(pid, skuId))
                    : dispatch(decreaseCartWithSync(pid, skuId))
                }
              >
                {cartItem.quantity === 1 ? (
                  <Ionicons name="trash-outline" size={18} color="white" />
                ) : (
                  <Text
                    style={{
                      fontSize: 22,
                      color: "white",
                      fontWeight: "600",
                      lineHeight: 26,
                    }}
                  >
                    −
                  </Text>
                )}
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#212529",
                  textAlign: "center",
                  textAlignVertical: "center",
                  lineHeight: 52,
                }}
              >
                {cartItem.quantity}
              </Text>
              {cartItem.quantity >= activeStock ? (
                <View style={{ flex: 1 }} />
              ) : (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: "#ff7700",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() =>
                    dispatch(
                      addToCartWithSync(
                        { ...product, price, discountedPrice },
                        selectedVariants,
                        skuId,
                      ),
                    )
                  }
                >
                  <Text
                    style={{
                      fontSize: 22,
                      color: "white",
                      fontWeight: "600",
                      lineHeight: 26,
                    }}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            {freeShippingThreshold > 0 && (
              <View
                className="flex-row items-center justify-center gap-1.5"
                style={{ marginBottom: 10 }}
              >
                <Image
                  source={icons.cargo}
                  style={{ width: 16, height: 16 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 13, color: "#212529" }}>
                  {freeShippingThreshold.toLocaleString("tr-TR")} TL ve üzeri{" "}
                  <Text style={{ fontWeight: "700" }}>ücretsiz kargo.</Text>
                </Text>
              </View>
            )}
            <TouchableOpacity
              className="rounded-md py-4 items-center justify-center"
              style={{
                backgroundColor: addToCartDisabled ? "#dee2e6" : "#ff7700",
                width: "50%",
                alignSelf: "center",
              }}
              disabled={addToCartDisabled}
              onPress={handleAddToCart}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: 15,
                  letterSpacing: 0.3,
                }}
              >
                {addToCartDisabled ? "STOKTA YOK" : "Sepete Ekle"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <AddToListModal
        visible={listModalVisible}
        onClose={() => setListModalVisible(false)}
        product={product}
      />
    </SafeAreaView>
  );
}
