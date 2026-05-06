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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, deleteAccount } from "@mobile/shared/redux/userSlice";
import { logoutUser } from "@mobile/shared/redux/authSlice";
import { clearFavouritesLocal } from "@mobile/shared/redux/favouriteSlice";
import { clearCartLocal } from "@mobile/shared/redux/cartSlice";
import { setBearerToken } from "@mobile/shared/utils/axiosInstance";
import ScreenHeader from "../components/ScreenHeader";

export default function AccountEditScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { loading } = useSelector((state) => state.user);

  const [name, setName] = useState(user?.name ?? "");
  const [surname, setSurname] = useState(user?.surname ?? "");
  const [companyName, setCompanyName] = useState(user?.companyName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [phoneEditable, setPhoneEditable] = useState(false);
  const [phoneError, setPhoneError] = useState("");
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
    if (phoneEditable) {
      const digits = phone.replace(/\s/g, "");
      if (!digits) {
        setPhoneError("Telefon numarası boş bırakılamaz.");
        return;
      }
      if (!/^0[0-9]{10}$/.test(digits)) {
        setPhoneError("Geçerli bir telefon numarası giriniz (05XX XXX XX XX).");
        return;
      }
      setPhoneError("");
    }
    const result = await dispatch(
      updateUser({
        userId: user._id,
        formData: {
          name,
          surname,
          companyName,
          email,
          ...(phoneEditable && { phone }),
        },
      }),
    );
    if (result.meta.requestStatus === "fulfilled") {
      setSaved(true);
      setPhoneEditable(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScreenHeader title="Hesap İşlemleri" />

        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            className="border border-border-input rounded-sm px-4 h-12 text-base text-text-primary bg-white"
            placeholder="Adınız"
            placeholderTextColor="#818181"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            className="border border-border-input rounded-sm px-4 h-12 text-base text-text-primary bg-white"
            placeholder="Soyadınız"
            placeholderTextColor="#818181"
            value={surname}
            onChangeText={setSurname}
            autoCapitalize="words"
          />
          <TextInput
            className="border border-border-input rounded-sm px-4 h-12 text-base text-text-primary bg-white"
            placeholder="Firma Ünvanı (Opsiyonel)"
            placeholderTextColor="#818181"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <TextInput
            className="border border-border-input rounded-sm px-4 h-12 text-base text-text-primary bg-white"
            placeholder="E-posta"
            placeholderTextColor="#818181"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: phoneEditable ? "white" : "#EDEDED",
                  borderWidth: 1,
                  borderColor: phoneError ? "#dc3545" : "#e0e0e0",
                  borderRadius: 4,
                  paddingHorizontal: 16,
                  height: 48,
                  fontSize: 16,
                }}
                value={
                  phoneEditable
                    ? phone
                    : phone
                      ? `${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`
                      : ""
                }
                onChangeText={(v) => {
                  setPhone(v);
                  setPhoneError("");
                }}
                editable={phoneEditable}
                keyboardType="phone-pad"
                maxLength={phoneEditable ? 11 : undefined}
                placeholderTextColor="#818181"
                placeholder="Telefon"
              />
              <TouchableOpacity
                onPress={() => {
                  setPhoneEditable((v) => !v);
                  setPhoneError("");
                  if (phoneEditable) setPhone(user?.phone ?? "");
                }}
                style={{ flex: 1, alignItems: "center" }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text
                  className="text-brand-red font-sans-semibold text-sm"
                  style={{ textDecorationLine: "underline" }}
                >
                  {phoneEditable ? "İptal" : "Telefonu Güncelle"}
                </Text>
              </TouchableOpacity>
            </View>
            {phoneError ? (
              <Text style={{ color: "#dc3545", fontSize: 12, marginTop: 4 }}>
                {phoneError}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            className="bg-brand-red rounded-md py-4 flex-row items-center justify-center gap-3 mt-2"
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
              >
                <Text className="text-white text-md" style={{ fontSize: 18 }}>
                  {saved ? "Kaydedildi" : "Kaydet"}
                </Text>
                {!saved && (
                  <Image
                    source={require("../assets/arrow.png")}
                    style={{ width: 40, height: 24 }}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center mt-2"
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
          >
            <Text style={{ fontSize: 14 }}>Hesabımı Sil</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
