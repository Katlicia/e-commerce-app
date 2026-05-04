import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  removeProductFromList,
  deleteList,
  renameList,
} from "@mobile/shared/redux/listSlice";
import { addToCartWithSync } from "@mobile/shared/redux/cartSlice";

const plusIcon = require("../assets/Liste/plus.png");
const editIcon = require("../assets/Liste/edit.png");
const deleteIcon = require("../assets/Liste/delete.png");
const cartIcon = require("../assets/Liste/cart.png");

function ListProductItem({ item }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [qty, setQty] = useState(1);

  const img = item.images?.[0]?.url;
  const hasDiscount = item.discountPercent > 0;
  const displayPrice = hasDiscount ? item.discountedPrice : item.price;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch(addToCartWithSync(item));
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
      }}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item._id })
        }
      >
        {img ? (
          <Image
            source={{ uri: img }}
            style={{ width: 80, height: 80, borderRadius: 8 }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="image-outline" size={24} color="#adb5bd" />
          </View>
        )}
      </TouchableOpacity>

      <View style={{ flex: 1, minHeight: 80, justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ProductDetail", { productId: item._id })
          }
        >
          <Text
            style={{ fontSize: 13, color: "#212529", fontWeight: "500" }}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </TouchableOpacity>

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <View>
              {hasDiscount && (
                <Text
                  style={{
                    fontSize: 13,
                    color: "#adb5bd",
                    textDecorationLine: "line-through",
                  }}
                >
                  {Number(item.price).toFixed(2).replace(".", ",")}₺
                </Text>
              )}
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#212529" }}
              >
                {Number(displayPrice).toFixed(2).replace(".", ",")}₺
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                borderWidth: 1.5,
                borderColor: "#ff7700",
                borderRadius: 8,
                overflow: "hidden",
                height: 36,
              }}
            >
              <TouchableOpacity
                style={{
                  width: 36,
                  backgroundColor: "#ff7700",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setQty((q) => Math.max(1, q - 1))}
              >
                {qty === 1 ? (
                  <Ionicons name="trash-outline" size={14} color="white" />
                ) : (
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: 16,
                      lineHeight: 20,
                    }}
                  >
                    −
                  </Text>
                )}
              </TouchableOpacity>
              <Text
                style={{
                  width: 36,
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 13,
                  color: "#212529",
                  lineHeight: 36,
                }}
              >
                {qty}
              </Text>
              <TouchableOpacity
                style={{
                  width: 36,
                  backgroundColor: "#ff7700",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setQty((q) => q + 1)}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 16,
                    lineHeight: 20,
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 4,
              marginTop: 6,
            }}
          >
            <Image
              source={cartIcon}
              style={{ width: 16, height: 16 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 11, color: "#212529", fontWeight: "500" }}>
              Sepete Ekle
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function ListDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { listId } = route.params || {};

  const { lists } = useSelector((state) => state.list);
  const list = lists.find((l) => l._id === listId);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  if (!list) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#f0f0f0",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginRight: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#212529" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "600", color: "#212529" }}>
            Liste
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-md text-text-secondary">Liste bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDeleteList = () => {
    Alert.alert(
      "Listeyi Sil",
      `"${list.name}" listesini silmek istiyor musunuz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await dispatch(deleteList(list._id));
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleRenameSubmit = async () => {
    const name = renameValue.trim();
    if (name && name !== list.name) {
      await dispatch(renameList({ listId: list._id, name }));
    }
    setIsRenaming(false);
  };

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
              removeProductFromList({
                listId: list._id,
                productId: product._id,
              }),
            ),
        },
      ],
    );
  };

  const renderProduct = ({ item }) => <ListProductItem item={item} />;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
          backgroundColor: "white",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ marginRight: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#212529" />
        </TouchableOpacity>

        {isRenaming ? (
          <TextInput
            style={{
              flex: 1,
              fontSize: 17,
              fontWeight: "600",
              color: "#212529",
              padding: 0,
            }}
            value={renameValue}
            onChangeText={setRenameValue}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleRenameSubmit}
            onBlur={handleRenameSubmit}
          />
        ) : (
          <Text
            style={{
              flex: 1,
              fontSize: 17,
              fontWeight: "600",
              color: "#212529",
            }}
          >
            {list.name}
          </Text>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image
              source={plusIcon}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              setRenameValue(list.name);
              setIsRenaming(true);
            }}
          >
            <Image
              source={editIcon}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleDeleteList}
          >
            <Image
              source={deleteIcon}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

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
