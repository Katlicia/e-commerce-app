import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  loginUser,
  forgetPassword,
  clearError,
} from "@mobile/shared/redux/authSlice";
import { mergeCartOnLogin } from "@mobile/shared/redux/cartSlice";
import { fetchFavourites } from "@mobile/shared/redux/favouriteSlice";
import { fetchLists } from "@mobile/shared/redux/listSlice";
import { setBearerToken } from "@mobile/shared/utils/axiosInstance";

const arrowIcon = require("../assets/arrow.png");

function ForgotPasswordModal({ visible, onClose, dispatch }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  function handleClose() {
    setEmail("");
    setSent(false);
    setError(null);
    onClose();
  }

  async function handleReset() {
    if (!email.trim()) {
      setError("Lütfen e-posta adresinizi girin.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await dispatch(forgetPassword(email.trim()));
    setLoading(false);
    if (forgetPassword.fulfilled.match(result)) {
      setSent(true);
    } else {
      setError(result.payload || "Bir hata oluştu.");
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 28 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Close */}
              <TouchableOpacity
                onPress={handleClose}
                style={{ alignSelf: "flex-end", marginBottom: 16 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#6c757d" />
              </TouchableOpacity>

              {/* Title */}
              <Text style={{ fontSize: 16, color: "#212529", marginBottom: 2 }}>
                Şifrenizi mi
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#212529",
                  marginBottom: 20,
                }}
              >
                Unuttunuz?
              </Text>

              {/* Email input */}
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#e0e0e0",
                  borderRadius: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                  fontSize: 14,
                  color: "#212529",
                  backgroundColor: "white",
                  marginBottom: 10,
                }}
                value={email}
                onChangeText={setEmail}
                placeholder="E-Mail Adresiniz"
                placeholderTextColor="#818181"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              {/* Error */}
              {error ? (
                <Text
                  style={{ color: "#dc3545", fontSize: 11, marginBottom: 10 }}
                >
                  {error}
                </Text>
              ) : null}

              {/* Success message */}
              {sent ? (
                <Text
                  style={{
                    fontSize: 14,
                    color: "#17A720",
                    textAlign: "center",
                    marginBottom: 16,
                    marginTop: 16,
                    lineHeight: 18,
                  }}
                >
                  Kayıtlı e-posta adresinize talimatları gönderdik.{"\n"}Lütfen
                  e-postanızı kontrol ediniz.
                </Text>
              ) : null}

              {/* Button */}
              <TouchableOpacity
                onPress={sent ? handleClose : handleReset}
                disabled={loading}
                style={{
                  backgroundColor: sent ? "#17A720" : "#F83B0A",
                  borderRadius: 7,
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 8,
                }}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      {sent ? "Başarılı!" : "Şifremi Sıfırla"}
                    </Text>
                    <Image
                      source={arrowIcon}
                      style={{ width: 40, height: 18 }}
                      resizeMode="contain"
                    />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function EmailLoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotVisible, setForgotVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(clearError());
    }, []),
  );

  async function handleLogin() {
    const result = await dispatch(
      loginUser({ email: formData.email.trim(), password: formData.password }),
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
      <ForgotPasswordModal
        visible={forgotVisible}
        onClose={() => setForgotVisible(false)}
        dispatch={dispatch}
      />
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
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ width: 32, padding: 4 }}
            >
              <Ionicons name="arrow-back" size={22} color="#212529" />
            </TouchableOpacity>
            <Text className="flex-1 text-lg font-bold text-text-primary text-center">
              E-Mail İle Giriş
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("MainTabs")}
              style={{ width: 32, padding: 4, alignItems: "flex-end" }}
            >
              <Ionicons name="close" size={22} color="#212529" />
            </TouchableOpacity>
          </View>

          <View
            className="px-5 pt-8 pb-6 max-w-md w-full self-center"
            style={{ width: "100%" }}
          >
            {/* Error */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <Text className="text-red-600 text-base">{error}</Text>
              </View>
            )}

            {/* Email */}
            <View className="mb-4">
              <TextInput
                className="border border-border-input rounded-xs px-4 h-16 text-base text-text-primary bg-white"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#adb5bd"
                placeholder="E-Mail Adresiniz"
              />
            </View>

            {/* Password */}
            <View className="mb-2">
              <TextInput
                className="border border-border-input rounded-xs px-4 h-16 text-base text-text-primary bg-white"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry
                autoComplete="password"
                placeholderTextColor="#adb5bd"
                placeholder="Şifreniz"
              />
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              className="self-end mb-4"
              onPress={() => setForgotVisible(true)}
            >
              <Text className="text-md font-sans text-brand-red mb-5">
                Şifremi Unuttum
              </Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              className="bg-brand-red rounded-md h-16 flex-row items-center justify-center gap-5 mb-5"
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-sans text-xl">
                    Giriş Yap
                  </Text>
                  <Image
                    source={arrowIcon}
                    style={{ width: 40, height: 18 }}
                    resizeMode="contain"
                  />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row justify-center items-center gap-1"
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text className="text-md font-sans text-text-secondary">
                Telefon Numarası İle Giriş
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
