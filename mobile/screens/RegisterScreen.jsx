import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { registerUser } from "@mobile/shared/redux/authSlice";
import { setBearerToken } from "@mobile/shared/utils/axiosInstance";

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    credential: "",
    password: "",
  });
  const [credentialError, setCredentialError] = useState("");

  function update(field) {
    return (text) => {
      setFormData((prev) => ({ ...prev, [field]: text }));
      if (field === "credential") setCredentialError("");
    };
  }

  function parseCredential(value) {
    const trimmed = value.trim();
    if (trimmed.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return { error: "Geçersiz e-posta adresi." };
      return { email: trimmed };
    }
    const digits = trimmed.replace(/[\s\-().+]/g, "");
    if (!/^\d+$/.test(digits) || digits.length < 10 || digits.length > 13) {
      return { error: "Geçerli bir e-posta veya telefon numarası girin." };
    }
    return { phone: trimmed };
  }

  async function handleRegister() {
    const parsed = parseCredential(formData.credential);
    if (parsed.error) {
      setCredentialError(parsed.error);
      return;
    }
    const result = await dispatch(
      registerUser({
        name: capitalize(formData.name),
        surname: capitalize(formData.surname),
        password: formData.password,
        ...parsed,
      }),
    );
    if (result.meta.requestStatus === "fulfilled") {
      setBearerToken(result.payload?.token ?? null);
      navigation.goBack();
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 border-b border-border-light">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 w-8">
              <Ionicons name="arrow-back" size={22} color="#212529" />
            </TouchableOpacity>
            <Text className="flex-1 text-lg font-bold text-text-primary text-center">
              Kayıt Ol
            </Text>
            <View className="w-8" />
          </View>

          <View className="px-5 pt-8 pb-6" style={{ width: "100%" }}>
            {/* Error */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <Text className="text-red-600 text-base">{error}</Text>
              </View>
            )}

            {/* Name */}
            <View className="mb-4">
              <TextInput
                className="border border-border-input rounded-xs px-4 h-12 text-base text-text-primary bg-white"
                value={formData.name}
                onChangeText={update("name")}
                autoCapitalize="words"
                placeholderTextColor="#adb5bd"
                placeholder="Adınız"
              />
            </View>

            {/* Surname */}
            <View className="mb-4">
              <TextInput
                className="border border-border-input rounded-xs px-4 h-12 text-base text-text-primary bg-white"
                value={formData.surname}
                onChangeText={update("surname")}
                autoCapitalize="words"
                placeholderTextColor="#adb5bd"
                placeholder="Soyadınız"
              />
            </View>

            {/* Email or Phone */}
            <View className="mb-4">
              <TextInput
                className={`border rounded-xs px-4 h-12 text-base text-text-primary bg-white ${credentialError ? "border-red-400" : "border-border-input"}`}
                value={formData.credential}
                onChangeText={update("credential")}
                keyboardType="default"
                autoCapitalize="none"
                autoComplete="off"
                placeholderTextColor="#adb5bd"
                placeholder="E-posta veya telefon numarası"
              />
              {credentialError ? (
                <Text className="text-red-500 text-sm mt-1">{credentialError}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View className="mb-6">
              <TextInput
                className="border border-border-input rounded-xs px-4 h-12 text-base text-text-primary bg-white"
                value={formData.password}
                onChangeText={update("password")}
                secureTextEntry
                autoComplete="new-password"
                placeholderTextColor="#adb5bd"
                placeholder="Şifreniz"
              />
            </View>

            {/* Register button */}
            <TouchableOpacity
              className="bg-brand-red rounded-sm h-12 items-center justify-center mb-5"
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-md">Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <View className="flex-row justify-center gap-1">
              <Text className="text-base text-text-secondary">
                Zaten hesabın var mı?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-base text-brand-blue font-medium">
                  Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
