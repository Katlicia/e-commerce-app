import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const PAYMENT_LABELS = {
  kredi: "KREDİ/BANKA KARTI",
  havale: "HAVALE / EFT",
};

export default function OrderSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderNo, paymentMethod, success = true } = route.params ?? {};

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border-subtle">
        <TouchableOpacity
          onPress={() => navigation.navigate("MainTabs")}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={22} color="#212529" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-sans-bold text-text-primary mr-6">
          {success ? "Teşekkürler" : "Sipariş Hatası"}
        </Text>
        <Ionicons name="notifications-outline" size={22} color="#212529" />
      </View>

      <View className="flex-1 px-6 pt-10 gap-6">
        {/* Status box */}
        <View
          className={`rounded-2xl p-6 flex-row items-center gap-4 ${
            success ? "bg-success-light" : "bg-fav-red-light"
          }`}
          style={{
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: success ? "#37a446" : "#e84040",
          }}
        >
          <Ionicons
            name={success ? "checkmark-circle" : "close-circle"}
            size={56}
            color={success ? "#37a446" : "#e84040"}
          />
          <Text
            className={`flex-1 text-md font-sans-bold leading-6 ${
              success ? "text-discount-green" : "text-fav-red"
            }`}
          >
            {success
              ? "Teşekkürler.\nSiparişiniz başarılı şekilde oluşturuldu."
              : "Üzgünüz.\nSiparişiniz oluşturulurken bir hata meydana geldi."}
          </Text>
        </View>

        {/* Order info */}
        {success && (
          <View className="flex-row border border-border-subtle rounded-xl overflow-hidden">
            <View className="flex-1 px-4 py-3 border-r border-border-subtle">
              <Text className="text-xs text-text-muted font-sans-semibold mb-1">
                SİPARİŞ NUMARASI
              </Text>
              <Text className="text-md font-sans-bold text-primary">
                {orderNo ?? "—"}
              </Text>
            </View>
            <View className="flex-1 px-4 py-3">
              <Text className="text-xs text-text-muted font-sans-semibold mb-1">
                ÖDEME YÖNTEMİ
              </Text>
              <Text className="text-sm font-sans-bold text-text-primary">
                {PAYMENT_LABELS[paymentMethod] ?? "—"}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View className="px-6 pb-8 gap-3">
        <TouchableOpacity
          className="bg-primary rounded-md py-4 flex-row items-center justify-center gap-2"
          onPress={() => navigation.navigate("MainTabs")}
          activeOpacity={0.85}
        >
          <Text className="text-white font-sans-bold text-md">
            Alışverişe Devam Et
          </Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>

        {success && (
          <TouchableOpacity
            className="border border-primary rounded-md py-4 items-center"
            onPress={() => navigation.navigate("Orders")}
            activeOpacity={0.85}
          >
            <Text className="text-primary font-sans-bold text-md">
              Siparişlerim
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
