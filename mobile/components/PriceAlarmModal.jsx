import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import axiosInstance from "@mobile/shared/utils/axiosInstance";

const bellIcon = require("../assets/ProductDetails/bell2.png");
const arrowIcon = require("../assets/arrow.png");

function maskEmail(email) {
  if (!email) return "";
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return email;
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  if (local.length <= 2) return email;
  const masked =
    local[0] +
    local.slice(1, local.length - 1).replace(/./g, "*") +
    local[local.length - 1];
  return masked + domain;
}

export default function PriceAlarmModal({
  visible,
  onClose,
  product,
  hasAlarm,
  onAlarmChange,
}) {
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (visible) {
      setSuccess(false);
      setErrorMsg("");
    }
  }, [visible]);

  async function handleSetAlarm() {
    setLoading(true);
    setErrorMsg("");
    try {
      await axiosInstance.post("/price-alarms", { productId: product._id });
      onAlarmChange(true);
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

  async function handleRemoveAlarm() {
    setLoading(true);
    setErrorMsg("");
    try {
      await axiosInstance.delete(`/price-alarms/${product._id}`);
      onAlarmChange(false);
      onClose();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const email = user?.email;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: insets.bottom + 28,
          alignItems: "center",
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            marginBottom: 28,
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
            Fiyat Alarmı
          </Text>
        </View>

        {/* Bell icon */}
        <View
          style={{
            width: 86,
            height: 86,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          <Image
            source={bellIcon}
            style={{ width: 86, height: 86 }}
            resizeMode="contain"
          />
        </View>

        {/* Product name */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 15,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {product?.name}
        </Text>

        {/* Description */}
        {email ? (
          <Text
            style={{
              fontSize: 13,
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 24,
            }}
          >
            Ürünün fiyatı düşünce{" "}
            <Text className={"text-primary"}>{email}</Text> mail adresinize
            bildirim göndereceğiz.
          </Text>
        ) : (
          <Text
            style={{
              fontSize: 13,
              color: "#6c757d",
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 24,
            }}
          >
            Fiyat alarmı kurabilmek için hesabınıza bir e-posta adresi eklemeniz
            gerekmektedir.
          </Text>
        )}

        {/* Error */}
        {errorMsg ? (
          <Text style={{ fontSize: 12, color: "#f83b0a", marginBottom: 12 }}>
            {errorMsg}
          </Text>
        ) : null}

        {/* Button */}
        {success ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="checkmark-circle" size={22} color="#37a446" />
            <Text style={{ fontSize: 14, color: "#37a446", fontWeight: "700" }}>
              Fiyat alarmı kuruldu!
            </Text>
          </View>
        ) : email ? (
          <TouchableOpacity
            onPress={hasAlarm ? handleRemoveAlarm : handleSetAlarm}
            disabled={loading}
            className={`${hasAlarm ? "bg-gray-200" : "bg-brand-red"} rounded-sm py-4 items-center justify-center w-full flex-row gap-2`}
          >
            {loading ? (
              <ActivityIndicator size="small" color={hasAlarm ? "#6c757d" : "white"} />
            ) : (
              <>
                <Text className={`${hasAlarm ? "text-gray-500" : "text-white"} font-bold text-base`}>
                  {hasAlarm ? "Alarmı Kaldır" : "Fiyat Alarmı Kur"}
                </Text>
                {!hasAlarm && (
                  <Image
                    source={arrowIcon}
                    style={{ width: 40, height: 18 }}
                    resizeMode="contain"
                  />
                )}
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </Modal>
  );
}
