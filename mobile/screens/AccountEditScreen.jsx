import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { updateUser, deleteAccount } from "@mobile/shared/redux/userSlice";
import { logoutUser } from "@mobile/shared/redux/authSlice";
import { clearFavouritesLocal } from "@mobile/shared/redux/favouriteSlice";
import { clearCartLocal } from "@mobile/shared/redux/cartSlice";
import { setBearerToken } from "@mobile/shared/utils/axiosInstance";

export default function AccountEditScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { loading } = useSelector((state) => state.user);

  const [name, setName] = useState(user?.name ?? "");
  const [surname, setSurname] = useState(user?.surname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesabımı Sil",
      "Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: async () => {
            const result = await dispatch(deleteAccount(user._id));
            if (result.meta.requestStatus === "fulfilled") {
              setBearerToken(null);
              dispatch(logoutUser());
              dispatch(clearFavouritesLocal());
              dispatch(clearCartLocal());
              navigation.navigate("MainTabs", { screen: "Profile" });
            }
          },
        },
      ],
    );
  };

  const handleSave = async () => {
    const result = await dispatch(
      updateUser({ userId: user._id, formData: { name, surname, email, phone } }),
    );
    if (result.meta.requestStatus === "fulfilled") {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-border-subtle">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 32, padding: 4 }}
          >
            <Ionicons name="arrow-back" size={22} color="#212529" />
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-sans-bold text-text-primary text-center">
            Hesap İşlemleri
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            className="border border-border-input rounded-sm px-4 h-12 text-base text-text-primary bg-white"
            placeholder="Adınız"
            placeholderTextColor="#adb5bd"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            className="border border-border-input rounded-sm px-4 h-12 text-base text-text-primary bg-white"
            placeholder="Soyadınız"
            placeholderTextColor="#adb5bd"
            value={surname}
            onChangeText={setSurname}
            autoCapitalize="words"
          />
          <TextInput
            className="border border-border-input rounded-sm px-4 h-12 text-base text-text-primary bg-white"
            placeholder="E-posta"
            placeholderTextColor="#adb5bd"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="border border-border-input rounded-sm px-4 h-12 text-base text-text-primary bg-white"
            placeholder="Telefon numarası"
            placeholderTextColor="#adb5bd"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            className="bg-brand-red rounded-md py-4 flex-row items-center justify-center gap-3 mt-2"
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-sans-bold text-md">
                  {saved ? "Kaydedildi" : "Kaydet"}
                </Text>
                {!saved && (
                  <Ionicons name="arrow-forward" size={18} color="white" />
                )}
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center mt-2"
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
          >
            <Text className="text-sm text-red-400">Hesabımı Sil</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
