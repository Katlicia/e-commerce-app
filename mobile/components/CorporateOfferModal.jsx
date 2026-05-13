import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import axiosInstance from "@mobile/shared/utils/axiosInstance";

const arrowIcon = require("../assets/arrow.png");

export default function CorporateOfferModal({ visible, onClose, product }) {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (visible) {
      setFullName(
        user?.name && user?.surname ? `${user.name} ${user.surname}` : "",
      );
      setEmail(user?.email || "");
      setMessage("");
      setSuccess(false);
      setErrorMsg("");
    }
  }, [visible]);

  async function handleSubmit() {
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg("Ad Soyad ve e-posta alanları zorunludur.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await axiosInstance.post("/corporate-offers", {
        productId: product._id,
        fullName: fullName.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    marginBottom: 10,
    color: "#222",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            overflow: "hidden",
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: insets.bottom + 28,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Kurumsal Teklif
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                ...inputStyle,
                backgroundColor: "#EBEBEB",
              }}
            >
              <Text
                numberOfLines={1}
                style={{ fontSize: 14, color: "#7B7B7B" }}
              >
                {product?.name}
              </Text>
            </View>

            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ad Soyad"
              placeholderTextColor="#7B7B7B"
              style={inputStyle}
            />

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta Adresiniz"
              placeholderTextColor="#7B7B7B"
              keyboardType="email-address"
              autoCapitalize="none"
              style={inputStyle}
            />

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Mesajınız"
              placeholderTextColor="#7B7B7B"
              multiline
              style={{
                ...inputStyle,
                height: 100,
                textAlignVertical: "top",
              }}
            />

            <Text
              style={{
                fontSize: 14,
                textAlign: "center",
                marginBottom: 20,
                marginTop: 4,
              }}
            >
              Talebiniz yanıtlandığında eposta alacaksınız.
            </Text>

            {errorMsg ? (
              <Text
                style={{
                  fontSize: 12,
                  color: "#f83b0a",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                {errorMsg}
              </Text>
            ) : null}

            {success ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 14,
                }}
              >
                <Ionicons name="checkmark-circle" size={22} color="#37a446" />
                <Text
                  style={{ fontSize: 14, color: "#37a446", fontWeight: "700" }}
                >
                  Talebiniz alındı!
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{ width: "90%", alignSelf: "center" }}
                className="bg-brand-red rounded-sm py-4 items-center justify-center flex-row gap-5"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text className="text-white text-base text-xl font-sans">
                      Gönder
                    </Text>
                    <Image
                      source={arrowIcon}
                      style={{ width: 40, height: 28 }}
                      resizeMode="contain"
                    />
                  </>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
