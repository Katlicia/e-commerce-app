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
import { registerUser } from "@mobile/shared/redux/authSlice";
import { setBearerToken } from "@mobile/shared/utils/axiosInstance";

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  function update(field) {
    return (text) => setFormData((prev) => ({ ...prev, [field]: text }));
  }

  async function handleRegister() {
    const result = await dispatch(
      registerUser({
        ...formData,
        name: capitalize(formData.name),
        surname: capitalize(formData.surname),
      })
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
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
              <Text className="text-2xl text-text-primary">←</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-text-primary">Kayıt Ol</Text>
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
              <Text className="text-base font-medium text-text-primary mb-1">Ad</Text>
              <TextInput
                className="border border-border-input rounded-lg px-4 h-12 text-base text-text-primary bg-white"
                value={formData.name}
                onChangeText={update("name")}
                autoCapitalize="words"
                placeholderTextColor="#adb5bd"
                placeholder="Adınız"
              />
            </View>

            {/* Surname */}
            <View className="mb-4">
              <Text className="text-base font-medium text-text-primary mb-1">Soyad</Text>
              <TextInput
                className="border border-border-input rounded-lg px-4 h-12 text-base text-text-primary bg-white"
                value={formData.surname}
                onChangeText={update("surname")}
                autoCapitalize="words"
                placeholderTextColor="#adb5bd"
                placeholder="Soyadınız"
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-base font-medium text-text-primary mb-1">E-posta</Text>
              <TextInput
                className="border border-border-input rounded-lg px-4 h-12 text-base text-text-primary bg-white"
                value={formData.email}
                onChangeText={update("email")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#adb5bd"
                placeholder="ornek@mail.com"
              />
            </View>

            {/* Password */}
            <View className="mb-6">
              <Text className="text-base font-medium text-text-primary mb-1">Şifre</Text>
              <TextInput
                className="border border-border-input rounded-lg px-4 h-12 text-base text-text-primary bg-white"
                value={formData.password}
                onChangeText={update("password")}
                secureTextEntry
                autoComplete="new-password"
                placeholderTextColor="#adb5bd"
                placeholder="••••••••"
              />
            </View>

            {/* Register button */}
            <TouchableOpacity
              className="bg-primary rounded-md h-12 items-center justify-center mb-5"
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
              <Text className="text-base text-text-secondary">Zaten hesabın var mı?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-base text-brand-blue font-medium">Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
