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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  removeProductFromList,
  deleteList,
  renameList,
} from "@mobile/shared/redux/listSlice";
import { addToCartWithSync } from "@mobile/shared/redux/cartSlice";
import Toast from "react-native-toast-message";

const plusIcon = require("../assets/Liste/plus.png");
const editIcon = require("../assets/Liste/edit.png");
const deleteIcon = require("../assets/Liste/delete.png");
const cartIcon = require("../assets/Liste/cart.png");

function ListProductItem({ item, qty, onQtyChange, onRemove }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const img = item.images?.[0]?.url;
  const hasDiscount = item.discountPercent > 0;
  const displayPrice = hasDiscount ? item.discountedPrice : item.price;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch(addToCartWithSync(item));
    }
    Toast.show({
      type: "success",
      text1: "Sepete Eklendi",
      text2: `${item.name}`,
      visibilityTime: 2000,
    });
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
                onPress={() => qty === 1 ? onRemove(item) : onQtyChange(qty - 1)}
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
                onPress={() => onQtyChange(qty + 1)}
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

  const { bottom: bottomInset } = useSafeAreaInsets();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [quantities, setQuantities] = useState({});
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const { freeShippingThreshold = 500 } = useSelector((state) => state.taxSettings);

  const getQty = (id) => quantities[id] ?? 1;
  const setQty = (id, val) => setQuantities((prev) => ({ ...prev, [id]: val }));

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

  const totalAmount = (list?.products ?? []).reduce((sum, p) => {
    const price = p.discountPercent > 0 ? p.discountedPrice : p.price;
    return sum + Number(price) * getQty(p._id);
  }, 0);
  const remaining = Math.max(freeShippingThreshold - totalAmount, 0);
  const freeShipping = remaining === 0;

  const handleAddAllToCart = () => {
    list.products.forEach((p) => {
      const qty = getQty(p._id);
      for (let i = 0; i < qty; i++) dispatch(addToCartWithSync(p));
    });
    navigation.navigate("MainTabs", { screen: "Cart" });
  };

  const renderProduct = ({ item }) => (
    <ListProductItem
      item={item}
      qty={getQty(item._id)}
      onQtyChange={(val) => setQty(item._id, val)}
      onRemove={handleRemove}
    />
  );

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
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => navigation.navigate("ProductList")}>
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
        <FlatList
          data={list.products}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        />
      )}

      {list.products.length > 0 && (
        <View style={{ backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f0f0f0" }}>
          {!summaryExpanded && (
            <View style={{ position: "absolute", top: -30, left: 0, right: 0, alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f0fff4", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
                {freeShipping ? (
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#2a9d4e" }}>
                    {`${Math.floor(freeShippingThreshold)}₺ geçtiniz kargo bedava`}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 12, color: "#2a9d4e" }}>
                    <Text style={{ fontWeight: "700" }}>{remaining.toFixed(2).replace(".", ",")} TL</Text>
                    <Text> daha eklerseniz</Text>
                    <Text style={{ fontWeight: "700" }}> kargo ücretsiz!</Text>
                  </Text>
                )}
              </View>
            </View>
          )}

          {summaryExpanded && (
            <>
              <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f0fff4", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
                  {freeShipping ? (
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#2a9d4e" }}>
                      {`${Math.floor(freeShippingThreshold)}₺ geçtiniz kargo bedava`}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: "#2a9d4e" }}>
                      <Text style={{ fontWeight: "700" }}>{remaining.toFixed(2).replace(".", ",")} TL</Text>
                      <Text> daha eklerseniz</Text>
                      <Text style={{ fontWeight: "700" }}> kargo ücretsiz!</Text>
                    </Text>
                  )}
                </View>
              </View>
              <View style={{ paddingHorizontal: 44, paddingVertical: 6, gap: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, color: "#6c757d" }}>Kargo Bedeli</Text>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: freeShipping ? "#2a9d4e" : "#6c757d" }}>
                    {freeShipping ? "Ücretsiz" : "Adrese göre hesaplanacaktır."}
                  </Text>
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: "#f0f0f0", marginHorizontal: 16, marginBottom: 4 }} />
            </>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 + bottomInset, gap: 12 }}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}
              onPress={() => setSummaryExpanded((v) => !v)}
              activeOpacity={0.7}
            >
              <Ionicons name={summaryExpanded ? "chevron-down" : "chevron-up"} size={20} color="#212529" />
              <View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#212529" }}>Toplam Tutar</Text>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#212529" }}>
                  {totalAmount.toFixed(2).replace(".", ",")}₺
                </Text>
                {freeShipping && (
                  <Text style={{ fontSize: 13, fontWeight: "500", color: "#2a9d4e" }}>Kargo Bedava</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: "#ff7700", borderRadius: 8, paddingHorizontal: 20, paddingVertical: 14 }}
              onPress={handleAddAllToCart}
              activeOpacity={0.85}
            >
              <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>Listeyi Sepete Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
