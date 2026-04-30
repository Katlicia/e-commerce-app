import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { removeProductFromList } from "@mobile/shared/redux/listSlice";
import { addToCartWithSync } from "@mobile/shared/redux/cartSlice";
import ScreenHeader from "../components/ScreenHeader";
import { fmt } from "@mobile/shared/utils/format";

export default function ListDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { listId } = route.params || {};

  const { lists } = useSelector((state) => state.list);
  const list = lists.find((l) => l._id === listId);

  if (!list) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <ScreenHeader title="Liste" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-md text-text-secondary">Liste bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRemove = (product) => {
    Alert.alert(
      "Listeden Çıkar",
      `"${product.name}" ürününü listeden çıkarmak istiyor musunuz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkar",
          style: "destructive",
          onPress: () =>
            dispatch(
              removeProductFromList({ listId: list._id, productId: product._id }),
            ),
        },
      ],
    );
  };

  const handleAddToCart = (product) => {
    dispatch(addToCartWithSync(product));
  };

  const renderProduct = ({ item }) => {
    const img = item.images?.[0]?.url;
    const price =
      item.discountPercent > 0 ? item.discountedPrice : item.price;

    return (
      <TouchableOpacity
        className="flex-row items-center px-4 py-3 border-b border-border-subtle"
        onPress={() => navigation.navigate("ProductDetail", { productId: item._id })}
        activeOpacity={0.7}
      >
        {img ? (
          <Image
            source={{ uri: img }}
            style={{ width: 64, height: 64, borderRadius: 8 }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{ width: 64, height: 64, borderRadius: 8 }}
            className="bg-bg-light items-center justify-center"
          >
            <Ionicons name="image-outline" size={24} color="#adb5bd" />
          </View>
        )}

        <View className="flex-1 ml-3">
          <Text
            className="text-sm text-text-primary font-sans-medium"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-md font-sans-bold text-brand-red">
              {fmt(price)} ₺
            </Text>
            {item.discountPercent > 0 && (
              <Text className="text-xs text-text-secondary line-through">
                {fmt(item.price)} ₺
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-2 ml-2">
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-brand-red items-center justify-center"
            onPress={() => handleAddToCart(item)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-bg-light items-center justify-center"
            onPress={() => handleRemove(item)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color="#adb5bd" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title={list.name} />

      {list.products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Ionicons name="bag-outline" size={48} color="#adb5bd" />
          <Text className="text-md text-text-secondary text-center">
            Bu listede henüz ürün yok.
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            Ürün sayfasından "Listeye Ekle" ile ekleyebilirsiniz.
          </Text>
        </View>
      ) : (
        <>
          <View className="px-4 py-2 border-b border-border-subtle">
            <Text className="text-sm text-text-secondary">
              {list.products.length} ürün
            </Text>
          </View>
          <FlatList
            data={list.products}
            keyExtractor={(item) => item._id}
            renderItem={renderProduct}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}