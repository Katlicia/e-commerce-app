import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  createList,
  addProductToList,
} from "@mobile/shared/redux/listSlice";

const DEFAULT_LIST_NAME = "Alışveriş Listesi";

export default function AddToListModal({ visible, onClose, product }) {
  const dispatch = useDispatch();
  const { lists } = useSelector((state) => state.list);
  const { user } = useSelector((state) => state.auth);

  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const insets = useSafeAreaInsets();

  const productId = product?._id || product?.id;

  const handleAddToList = async (listId) => {
    setLoadingId(listId);
    await dispatch(addProductToList({ listId, productId }));
    setLoadingId(null);
    onClose();
  };

  const handleAddToDefault = async () => {
    setCreating(true);
    let targetList = lists.find((l) => l.name === DEFAULT_LIST_NAME);
    if (!targetList) {
      const result = await dispatch(createList(DEFAULT_LIST_NAME));
      targetList = result.payload;
    }
    await dispatch(addProductToList({ listId: targetList._id, productId }));
    setCreating(false);
    onClose();
  };

  const handleCreateAndAdd = async () => {
    const name = newListName.trim();
    if (!name) return;
    setCreating(true);
    const result = await dispatch(createList(name));
    const newList = result.payload;
    await dispatch(addProductToList({ listId: newList._id, productId }));
    setNewListName("");
    setShowInput(false);
    setCreating(false);
    onClose();
  };

  if (!user) return null;

  const isInList = (list) =>
    list.products?.some((p) => (p._id || p) === productId);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/40"
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl"
        style={{ maxHeight: "70%" }}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-3 border-b border-border-subtle">
          <Text className="flex-1 text-lg font-sans-bold text-text-primary">
            Listeye Ekle
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color="#6c757d" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={lists}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: insets.bottom + 16 }}
          ListHeaderComponent={
            <TouchableOpacity
              className="flex-row items-center gap-3 py-3 px-4 rounded-xl border border-brand-red bg-red-50"
              onPress={handleAddToDefault}
              disabled={creating}
              activeOpacity={0.7}
            >
              <Ionicons name="cart-outline" size={20} color="#e84040" />
              <View className="flex-1">
                <Text className="text-md font-sans-medium text-brand-red">
                  {DEFAULT_LIST_NAME}
                </Text>
                <Text className="text-xs text-text-secondary">Varsayılan liste</Text>
              </View>
              {creating ? (
                <ActivityIndicator size="small" color="#e84040" />
              ) : (
                <Ionicons name="add-circle" size={20} color="#e84040" />
              )}
            </TouchableOpacity>
          }
          ListFooterComponent={
            <View className="mt-2">
              {showInput ? (
                <View className="flex-row items-center gap-2 mt-2">
                  <TextInput
                    className="flex-1 border border-border-subtle rounded-xl px-3 py-3 text-md text-text-primary"
                    placeholder="Liste adı..."
                    value={newListName}
                    onChangeText={setNewListName}
                    autoFocus
                  />
                  <TouchableOpacity
                    className="bg-brand-red rounded-xl px-4 py-3"
                    onPress={handleCreateAndAdd}
                    disabled={creating || !newListName.trim()}
                    activeOpacity={0.8}
                  >
                    {creating ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-sans-medium">Oluştur</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className="flex-row items-center gap-2 py-3"
                  onPress={() => setShowInput(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#6c757d" />
                  <Text className="text-md text-text-secondary">Yeni liste oluştur</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const inList = isInList(item);
            return (
              <TouchableOpacity
                className="flex-row items-center gap-3 py-3 px-4 rounded-xl border border-border-subtle"
                onPress={() => !inList && handleAddToList(item._id)}
                disabled={inList || loadingId === item._id}
                activeOpacity={0.7}
              >
                <Ionicons name="list-outline" size={20} color={inList ? "#adb5bd" : "#212529"} />
                <View className="flex-1">
                  <Text
                    className="text-md font-sans-medium"
                    style={{ color: inList ? "#adb5bd" : "#212529" }}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-xs text-text-secondary">
                    {item.products?.length || 0} ürün
                  </Text>
                </View>
                {loadingId === item._id ? (
                  <ActivityIndicator size="small" color="#6c757d" />
                ) : inList ? (
                  <Ionicons name="checkmark-circle" size={20} color="#adb5bd" />
                ) : (
                  <Ionicons name="add-circle-outline" size={20} color="#6c757d" />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}