import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { createList, deleteList } from "@mobile/shared/redux/listSlice";
import ScreenHeader from "../components/ScreenHeader";

export default function ListsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.list);
  const { user } = useSelector((state) => state.auth);

  const [newListName, setNewListName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const name = newListName.trim();
    if (!name) return;
    setCreating(true);
    await dispatch(createList(name));
    setNewListName("");
    setShowInput(false);
    setCreating(false);
  };

  const handleDelete = (list) => {
    Alert.alert(
      "Listeyi Sil",
      `"${list.name}" listesini silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => dispatch(deleteList(list._id)),
        },
      ],
    );
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <ScreenHeader title="Listelerim" />
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Ionicons name="list-outline" size={48} color="#adb5bd" />
          <Text className="text-md text-text-secondary text-center">
            Listelerinizi görmek için giriş yapmanız gerekiyor.
          </Text>
          <TouchableOpacity
            className="bg-brand-red rounded-md py-3 px-8 mt-2"
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.85}
          >
            <Text className="text-white font-sans-medium text-md">Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader
        title="Listelerim"
        right={
          <TouchableOpacity
            onPress={() => setShowInput((v) => !v)}
            style={{ width: 32, padding: 4 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={showInput ? "close" : "add"} size={22} color="#212529" />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {showInput && (
          <View className="flex-row items-center gap-2 px-4 py-3 border-b border-border-subtle">
            <TextInput
              className="flex-1 border border-border-subtle rounded-xl px-3 py-3 text-md text-text-primary"
              placeholder="Liste adı..."
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <TouchableOpacity
              className="bg-brand-red rounded-xl px-4 py-3"
              onPress={handleCreate}
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
        )}

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#e84040" />
          </View>
        ) : lists.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 gap-3">
            <Ionicons name="list-outline" size={48} color="#adb5bd" />
            <Text className="text-md text-text-secondary text-center">
              Henüz listeniz yok.
            </Text>
            <Text className="text-sm text-text-secondary text-center">
              Ürün sayfasından "Listeye Ekle" ile liste oluşturabilirsiniz.
            </Text>
          </View>
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center px-4 py-4 border-b border-border-subtle"
                onPress={() => navigation.navigate("ListDetail", { listId: item._id })}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 rounded-xl bg-bg-light items-center justify-center mr-3">
                  <Ionicons name="list-outline" size={20} color="#e84040" />
                </View>
                <View className="flex-1">
                  <Text className="text-md font-sans-medium text-text-primary">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    {item.products?.length || 0} ürün
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-2"
                >
                  <Ionicons name="trash-outline" size={18} color="#adb5bd" />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
              </TouchableOpacity>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}