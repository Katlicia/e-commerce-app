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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { registerUser } from "@mobile/shared/redux/authSlice";
import { mergeCartOnLogin } from "@mobile/shared/redux/cartSlice";
import { fetchFavourites } from "@mobile/shared/redux/favouriteSlice";
import { fetchLists } from "@mobile/shared/redux/listSlice";
import { setBearerToken } from "@mobile/shared/utils/axiosInstance";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export default function PhoneRegisterScreen({ navigation, route }) {
  const { phone } = route.params ?? {};
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function update(field) {
    return (text) => {
      setFormData((prev) => ({ ...prev, [field]: text }));
      if (fieldErrors[field])
        setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    };
  }

  function validate() {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Ad zorunludur.";
    if (!formData.surname.trim()) errors.surname = "Soyad zorunludur.";
    if (!formData.email.trim()) {
      errors.email = "E-posta zorunludur.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Geçerli bir e-posta giriniz.";
    }
    if (!formData.password) {
      errors.password = "Şifre zorunludur.";
    } else if (formData.password.length < 6) {
      errors.password = "Şifre en az 6 karakter olmalıdır.";
    }
    if (!termsAccepted) errors.terms = "Üyelik sözleşmesini kabul etmelisiniz.";
    return errors;
  }

  async function handleRegister() {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    const result = await dispatch(
      registerUser({
        name: capitalize(formData.name),
        surname: capitalize(formData.surname),
        email: formData.email.trim(),
        phone,
        password: formData.password,
        marketingConsent: marketingAccepted,
      }),
    );
    if (result.meta.requestStatus === "fulfilled") {
      setBearerToken(result.payload?.token ?? null);
      dispatch(mergeCartOnLogin());
      dispatch(fetchFavourites());
      dispatch(fetchLists());
      navigation.navigate("MainTabs");
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
          <View className="flex-row items-center justify-between ps-6 pt-3 mb-5">
            <Image
              source={require("../assets/listensi_logo.png")}
              style={{ width: 100, height: 25 }}
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => navigation.navigate("MainTabs")}
              className="p-2"
            >
              <Ionicons name="close" size={32} color="#212529" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-6 pt-2 pb-6">
            {/* Header */}
            <Text className="text-xl font-sans">
              Ayrıcalıklardan Yararlanmaya
            </Text>
            <Text className="font-sans-bold text-2xl mb-6">
              Son Bir Adım Kaldı
            </Text>

            {/* API Error */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <Text className="text-red-600 text-base">{error}</Text>
              </View>
            )}

            {/* Name */}
            <View className="mb-3">
              <TextInput
                className="border border-border-input rounded-xs px-4 h-16 text-base text-text-primary bg-white"
                style={fieldErrors.name ? { borderColor: "#ef4444" } : null}
                value={formData.name}
                onChangeText={update("name")}
                autoCapitalize="words"
                placeholderTextColor="#818181"
                placeholder="Adınız"
              />
              {fieldErrors.name ? (
                <Text className="text-price-red text-xs mt-0.5">
                  {fieldErrors.name}
                </Text>
              ) : null}
            </View>

            {/* Surname */}
            <View className="mb-3">
              <TextInput
                className="border border-border-input rounded-xs px-4 h-16 text-base text-text-primary bg-white"
                style={fieldErrors.surname ? { borderColor: "#ef4444" } : null}
                value={formData.surname}
                onChangeText={update("surname")}
                autoCapitalize="words"
                placeholderTextColor="#818181"
                placeholder="Soyadınız"
              />
              {fieldErrors.surname ? (
                <Text className="text-price-red text-xs mt-0.5">
                  {fieldErrors.surname}
                </Text>
              ) : null}
            </View>

            {/* Email */}
            <View className="mb-3">
              <TextInput
                className="border border-border-input rounded-xs px-4 h-16 text-base text-text-primary bg-white"
                style={fieldErrors.email ? { borderColor: "#ef4444" } : null}
                value={formData.email}
                onChangeText={update("email")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#818181"
                placeholder="E-Mail Adresiniz"
              />
              {fieldErrors.email ? (
                <Text className="text-price-red text-xs mt-0.5">
                  {fieldErrors.email}
                </Text>
              ) : null}
            </View>

            {/* Password */}
            <View className="mb-6">
              <TextInput
                className="border border-border-input rounded-xs px-4 h-16 text-base text-text-primary bg-white"
                style={fieldErrors.password ? { borderColor: "#ef4444" } : null}
                value={formData.password}
                onChangeText={update("password")}
                secureTextEntry
                autoComplete="new-password"
                placeholderTextColor="#818181"
                placeholder="Şifreniz"
              />
              {fieldErrors.password ? (
                <Text className="text-price-red text-xs mt-0.5">
                  {fieldErrors.password}
                </Text>
              ) : null}
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              className="flex-row items-start gap-2 mb-3"
              onPress={() => {
                setTermsAccepted((v) => !v);
                if (fieldErrors.terms)
                  setFieldErrors((prev) => ({ ...prev, terms: "" }));
              }}
              activeOpacity={0.7}
            >
              <View
                className={`w-4 h-4 ${termsAccepted ? "bg-brand-red" : "bg-border-input"}`}
                style={{ borderRadius: 3, marginTop: 3 }}
              />
              <Text className="flex-1 text-md">
                <Text className="text-text-primary font-sans-semibold">
                  Üyelik Sözleşmesini
                </Text>
                {" ve "}
                <Text className="text-text-primary font-sans-semibold">
                  Aydınlatma Metnini
                </Text>
                {"\n"}okudum, onaylıyorum.
              </Text>
            </TouchableOpacity>
            {fieldErrors.terms ? (
              <Text className="text-price-red text-xs mb-3">
                {fieldErrors.terms}
              </Text>
            ) : null}

            {/* Marketing checkbox */}
            <TouchableOpacity
              className="flex-row items-start gap-2 mb-8"
              onPress={() => setMarketingAccepted((v) => !v)}
              activeOpacity={0.7}
            >
              <View
                className={`w-4 h-4 ${marketingAccepted ? "bg-brand-red" : "bg-border-input"}`}
                style={{ borderRadius: 3, marginTop: 3 }}
              />
              <Text className="flex-1 text-md text-text-primary">
                Listensi tarafından gönderilecek elektronik iletileri almak
                istiyorum.
              </Text>
            </TouchableOpacity>

            {/* Register button */}
            <TouchableOpacity
              className="bg-brand-red rounded-md h-16 flex-row items-center justify-center gap-5 mb-5"
              onPress={handleRegister}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-sans text-xl">Kayıt Ol</Text>
                  <Image
                    source={require("../assets/arrow.png")}
                    style={{ width: 40, height: 18 }}
                    resizeMode="contain"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Support number */}
          <View className="items-center pb-10">
            <Text className="text-text-secondary text-sm mb-1">
              Yardıma mı ihtiyacınız var?
            </Text>
            <Text className="text-brand-red font-bold text-base">
              444 56 50
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
