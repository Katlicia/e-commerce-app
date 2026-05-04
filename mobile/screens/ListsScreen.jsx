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
  Image,
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
            <Text className="text-white font-sans-medium text-md">
              Giriş Yap
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Listelerim" />

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

        <View className="px-4 pt-4 pb-2">
          <View
            style={{
              backgroundColor: "#FAE8E4",
              borderRadius: 16,
              overflow: "hidden",
              padding: 20,
              minHeight: 120,
            }}
          >
            <Image
              source={require("../assets/Liste/mask.png")}
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#F83B0A",
                marginBottom: 15,
              }}
            >
              Listeni oluştur {"\n"}
              Hızlı alışveriş keyfini yaşa
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#F83B0A",
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 20,
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
              onPress={() => setShowInput(true)}
              activeOpacity={0.85}
            >
              <Image
                source={require("../assets/Liste/doc.png")}
                style={{ width: 16, height: 16 }}
                resizeMode="contain"
              />
              <Text style={{ color: "white", fontSize: 14 }}>
                Liste Oluştur
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#e84040" />
          </View>
        ) : lists.length > 0 ? (
          <FlatList
            data={lists}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ListDetail", { listId: item._id })
                }
                activeOpacity={0.7}
                style={{
                  marginHorizontal: 16,
                  marginVertical: 6,
                  padding: 0,
                  backgroundColor: "white",
                }}
              >
                <Text
                  style={{
                    fontWeight: "500",
                    fontSize: 16,
                    color: "#212529",
                    marginBottom: 8,
                  }}
                >
                  {item.name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderWidth: 1,
                    backgroundColor: "#F5F5F5",
                    borderColor: "#f0f0f0",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {item.products?.slice(0, 4).map((product, index) => (
                      <View
                        key={index}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#eee",
                          overflow: "hidden",
                          backgroundColor: "#fafafa",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={{ uri: product.images?.[0]?.url }}
                          style={{ width: 40, height: 40 }}
                          resizeMode="contain"
                        />
                      </View>
                    ))}
                    {(item.products?.length || 0) > 4 && (
                      <Text
                        style={{
                          fontWeight: "600",
                          fontSize: 14,
                          color: "#212529",
                        }}
                      >
                        +{item.products.length - 4}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#212529",
                      textDecorationLine: "underline",
                    }}
                  >
                    Detay
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
