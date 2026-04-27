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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { updateUser } from "@mobile/shared/redux/userSlice";

export default function AccountEditScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { loading } = useSelector((state) => state.user);

  const [name, setName] = useState(user?.name ?? "");
  const [surname, setSurname] = useState(user?.surname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const result = await dispatch(
      updateUser({ userId: user._id, formData: { name, surname, email } }),
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

          <TouchableOpacity className="items-center mt-2" activeOpacity={0.7}>
            <Text className="text-sm">Hesabımı Sil</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
