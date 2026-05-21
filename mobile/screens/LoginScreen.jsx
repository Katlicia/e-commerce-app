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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  loginUser,
  checkPhone,
  clearError,
} from "@mobile/shared/redux/authSlice";
import { mergeCartOnLogin } from "@mobile/shared/redux/cartSlice";
import { fetchFavourites } from "@mobile/shared/redux/favouriteSlice";
import { fetchLists } from "@mobile/shared/redux/listSlice";
import { setBearerToken } from "@mobile/shared/utils/axiosInstance";

const PHONE_TEMPLATE = "0(5__) ___ __ __";

// Progressive format, no underscores — used once the user starts typing
function formatPhone(d) {
  if (!d) return "";
  if (d.length <= 3) return `0(${d}`;
  if (d.length <= 6) return `0(${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length <= 8)
    return `0(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}`;
  return `0(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
}

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [phoneDigits, setPhoneDigits] = useState("");
  const [step, setStep] = useState("phone");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fieldWidth, setFieldWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  useFocusEffect(
    useCallback(() => {
      dispatch(clearError());
      setPhoneError("");
      setPasswordError("");
    }, []),
  );

  function handlePhoneChange(text) {
    const digits = text.replace(/\D/g, "");
    const clean = digits.startsWith("0") ? digits.slice(1) : digits;
    setPhoneDigits(clean.slice(0, 10));
    if (phoneError) setPhoneError("");
  }

  async function handlePhoneSubmit() {
    if (phoneDigits.length !== 10) {
      setPhoneError("Lütfen geçerli bir telefon numarası giriniz.");
      return;
    }
    const phone = `0${phoneDigits}`;
    const result = await dispatch(checkPhone(phone));
    if (result.meta.requestStatus === "fulfilled") {
      // If number is in db go to password step
      setPasswordError("");
      dispatch(clearError());
      setStep("password");
    } else if (result.payload?.status === 404) {
      // If number is not in db go to register
      navigation.navigate("PhoneRegister", { phone });
    } else {
      setPhoneError(result.payload?.message || "Bir hata oluştu.");
    }
  }

  async function handleLogin() {
    if (!password) {
      setPasswordError("Lütfen şifrenizi giriniz.");
      return;
    }
    setPasswordError("");
    const result = await dispatch(
      loginUser({ phone: `0${phoneDigits}`, password }),
    );
    if (result.meta.requestStatus === "fulfilled") {
      setBearerToken(result.payload?.token ?? null);
      dispatch(mergeCartOnLogin());
      dispatch(fetchFavourites());
      dispatch(fetchLists());
      navigation.navigate("MainTabs");
    }
  }

  const phoneValue = formatPhone(phoneDigits);
  // Centre the placeholder by left-insetting the input half the slack;
  // textAlign would re-centre the value on every keystroke.
  const phoneSideMargin =
    fieldWidth > 0 && contentWidth > 0
      ? Math.max(0, (fieldWidth - contentWidth) / 2)
      : 0;

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
          {/* X Button */}
          <View className="items-end px-4 pt-3">
            <TouchableOpacity
              onPress={() =>
                navigation.canGoBack()
                  ? navigation.goBack()
                  : navigation.navigate("MainTabs")
              }
              className="p-2"
            >
              <Ionicons name="close" size={32} color="#212529" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-10 pt-4 pb-6 items-center">
            {/* Logo */}
            <Image
              source={require("../assets/listensi_logo.png")}
              style={{ width: 200, height: 120 }}
              resizeMode="contain"
            />

            {step === "phone" ? (
              <>
                <Text className="text-md text-center mb-10 font-sans">
                  Lütfen giriş yapmak veya{"\n"}kayıt olmak için telefon
                  numaranızı giriniz.
                </Text>

                {/* Phone Input */}
                <View
                  className="self-stretch border-b-2 mb-1"
                  style={{ borderColor: phoneError ? "#ef4444" : "#dee2e6" }}
                  onLayout={(e) => setFieldWidth(e.nativeEvent.layout.width)}
                >
                  <TextInput
                    className="text-3xl sans-medium py-3"
                    style={{
                      letterSpacing: 2,
                      paddingHorizontal: 0,
                      marginLeft: phoneSideMargin,
                    }}
                    value={phoneValue}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    placeholder={PHONE_TEMPLATE}
                    placeholderTextColor="#212529"
                    maxLength={PHONE_TEMPLATE.length}
                    selection={{
                      start: phoneValue.length,
                      end: phoneValue.length,
                    }}
                  />
                  {/* Hidden sizer: measures the placeholder width */}
                  <Text
                    className="text-3xl sans-medium"
                    style={{
                      letterSpacing: 2,
                      position: "absolute",
                      opacity: 0,
                    }}
                    onLayout={(e) =>
                      setContentWidth(e.nativeEvent.layout.width)
                    }
                  >
                    {PHONE_TEMPLATE}
                  </Text>
                </View>
                {phoneError ? (
                  <Text className="text-red-500 text-sm mb-6 self-start">
                    {phoneError}
                  </Text>
                ) : (
                  <View className="mb-10" />
                )}

                {/* Submit button */}
                <TouchableOpacity
                  className="bg-brand-red rounded-sm py-4 items-center justify-center w-full mb-6 flex-row gap-2"
                  onPress={handlePhoneSubmit}
                >
                  <Text className="text-white font-bold text-base">
                    Giriş Yap veya Kayıt Ol
                  </Text>
                  <Image
                    source={require("../assets/arrow.png")}
                    style={{ width: 40, height: 18 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Email login link */}
                <TouchableOpacity
                  onPress={() => navigation.navigate("EmailLogin")}
                >
                  <Text className="text-text-secondary text-base font-sans">
                    E-Mail İle Giriş
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Phone shown (read-only) */}
                <Text className="text-text-primary text-lg font-medium mb-8">
                  {phoneValue}
                </Text>

                {/* Error */}
                {error && (
                  <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 w-full">
                    <Text className="text-red-600 text-base">{error}</Text>
                  </View>
                )}

                {/* Password */}
                <View className="w-full mb-1">
                  <TextInput
                    className="rounded-xs px-4 h-12 text-base text-text-primary bg-white"
                    style={{
                      borderWidth: 1,
                      borderColor: passwordError ? "#ef4444" : "#dee2e6",
                    }}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (passwordError) setPasswordError("");
                    }}
                    secureTextEntry
                    autoComplete="password"
                    placeholderTextColor="#adb5bd"
                    placeholder="Şifreniz"
                    autoFocus
                  />
                </View>
                {passwordError ? (
                  <Text className="text-red-500 text-sm mb-3 self-start">
                    {passwordError}
                  </Text>
                ) : (
                  <View className="mb-4" />
                )}

                {/* Login button */}
                <TouchableOpacity
                  className="bg-brand-red rounded-sm py-4 items-center justify-center w-full mb-4 flex-row gap-2"
                  onPress={handleLogin}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text className="text-white font-bold text-base">
                        Giriş Yap
                      </Text>
                      <Image
                        source={require("../assets/arrow.png")}
                        style={{ width: 40, height: 18 }}
                        resizeMode="contain"
                      />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
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
