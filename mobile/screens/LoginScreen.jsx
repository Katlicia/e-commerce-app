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
import { loginUser, forgetPassword } from "@mobile/shared/redux/authSlice";
import { mergeCartOnLogin } from "@mobile/shared/redux/cartSlice";
import { fetchFavourites } from "@mobile/shared/redux/favouriteSlice";

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState(null);

  async function handleLogin() {
    const result = await dispatch(loginUser(formData));
    if (result.meta.requestStatus === "fulfilled") {
      dispatch(mergeCartOnLogin());
      dispatch(fetchFavourites());
      navigation.goBack();
    }
  }

  async function handleForgetPassword() {
    if (!formData.email) {
      setResetError("Lütfen önce e-posta adresinizi girin.");
      return;
    }
    setResetError(null);
    const result = await dispatch(forgetPassword(formData.email));
    if (forgetPassword.fulfilled.match(result)) {
      setResetSent(true);
    } else {
      setResetError(result.payload);
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
            <Text className="text-lg font-bold text-text-primary">Giriş Yap</Text>
          </View>

          <View className="px-5 pt-8 pb-6 max-w-md w-full self-center" style={{ width: "100%" }}>
            {/* Error */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <Text className="text-red-600 text-base">{error}</Text>
              </View>
            )}

            {/* Email */}
            <View className="mb-4">
              <Text className="text-base font-medium text-text-primary mb-1">E-posta</Text>
              <TextInput
                className="border border-border-input rounded-lg px-4 h-12 text-base text-text-primary bg-white"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#adb5bd"
                placeholder="ornek@mail.com"
              />
            </View>

            {/* Password */}
            <View className="mb-2">
              <Text className="text-base font-medium text-text-primary mb-1">Şifre</Text>
              <TextInput
                className="border border-border-input rounded-lg px-4 h-12 text-base text-text-primary bg-white"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                autoComplete="password"
                placeholderTextColor="#adb5bd"
                placeholder="••••••••"
              />
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              className="self-end mb-4"
              onPress={handleForgetPassword}
              disabled={loading}
            >
              <Text className="text-base text-price-red">Şifremi unuttum</Text>
            </TouchableOpacity>

            {/* Reset error */}
            {resetError && (
              <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <Text className="text-red-600 text-base">{resetError}</Text>
              </View>
            )}

            {/* Reset success */}
            {resetSent && (
              <View className="bg-success-light border border-green-200 rounded-lg px-4 py-3 mb-4">
                <Text className="text-discount-green text-base">
                  Şifre sıfırlama bağlantısı{" "}
                  <Text className="font-semibold">{formData.email}</Text> adresine gönderildi.
                </Text>
              </View>
            )}

            {/* Login button */}
            <TouchableOpacity
              className="bg-primary rounded-md h-12 items-center justify-center mb-5"
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-md">Giriş Yap</Text>
              )}
            </TouchableOpacity>

            {/* Register link */}
            <View className="flex-row justify-center gap-1">
              <Text className="text-base text-text-secondary">Hesabın yok mu?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-base text-brand-blue font-medium">Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
