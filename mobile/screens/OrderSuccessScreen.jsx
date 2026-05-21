import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import HomeProductList from "../components/home/HomeProductList";

const BANKS = [
  {
    logo: require("../assets/Checkout/isbank.png"),
    logoStyle: { width: 100, height: 32 },
    name: "LİSTENSİ OFİS MALZEMELERİ TİC.LTD.ŞTİ",
    iban: "TR21 0006 4000 0012 4003 9106 80",
  },
  {
    logo: require("../assets/Checkout/vakifbank.png"),
    logoStyle: { width: 130, height: 32 },
    name: "LİSTENSİ OFİS MALZEMELERİ TİC.LTD.ŞTİ",
    iban: "TR11 0001 5001 5800 7314 7080 52",
  },
];

function copyToClipboard(text) {
  Clipboard.setStringAsync(text);
  if (Platform.OS === "android") {
    ToastAndroid.show("Kopyalandı", ToastAndroid.SHORT);
  } else {
    Alert.alert("Kopyalandı", text);
  }
}

const PAYMENT_LABELS = {
  kredi: "KREDİ/BANKA KARTI",
  havale: "HAVALE / EFT",
};

export default function OrderSuccessScreen() {
  const insets = useSafeAreaInsets();
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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 40, gap: 24 }}>
          {/* Status box */}
          <View
            className="rounded-2xl py-3 px-6 flex-row items-center gap-4"
            style={{
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: success ? "#37a446" : "#e84040",
            }}
          >
            {success ? (
              <Image
                source={require("../assets/Checkout/check.png")}
                style={{ width: 88, height: 88 }}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="close-circle" size={88} color="#e84040" />
            )}
            <Text
              className={`flex-1 text-lg font-sans-semibold leading-6 text-center ${
                success ? "text-discount-green" : "text-fav-red"
              }`}
            >
              {success
                ? "Teşekkürler.\nSiparişiniz başarılı \nşekilde oluşturuldu."
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
                <Text className="text-md font-sans-semibold underline">
                  {orderNo ?? "—"}
                </Text>
              </View>
              <View className="flex-1 px-4 py-3">
                <Text className="text-xs text-text-muted font-sans-semibold mb-1">
                  ÖDEME YÖNTEMİ
                </Text>
                <Text className="text-sm font-sans-semibold text-text-primary">
                  {PAYMENT_LABELS[paymentMethod] ?? "—"}
                </Text>
              </View>
            </View>
          )}

          {/* Bank transfer details (havale only) */}
          {success && paymentMethod === "havale" && (
            <View className="gap-4">
              <Text className="text-sm font-sans text-center">
                Siparişinizin onaylanması için 24 saat içerisinde aşağıda
                bulunan hesaplarımıza Havale / EFT yapılması gerekmektedir.
              </Text>
              {BANKS.map((bank, index) => (
                <View
                  key={index}
                  className="border border-border-subtle rounded-xl px-4 py-4 gap-3"
                >
                  <Image
                    source={bank.logo}
                    style={bank.logoStyle}
                    resizeMode="contain"
                  />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-sans-semibold text-text-primary flex-1 mr-2">
                      {bank.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(bank.name)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Image
                        source={require("../assets/Checkout/copy.png")}
                        style={{ width: 18, height: 18 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-sans-semibold text-text-primary flex-1 mr-2">
                      {bank.iban}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        copyToClipboard(bank.iban.replace(/\s/g, ""))
                      }
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Image
                        source={require("../assets/Checkout/copy.png")}
                        style={{ width: 18, height: 18 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action buttons */}
          <View className="gap-3">
            {success && paymentMethod === "havale" ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 border border-brand-red rounded-md py-4 items-center"
                  onPress={() => navigation.navigate("Orders")}
                  activeOpacity={0.85}
                >
                  <Text className="text-brand-red font-sans-bold text-md">
                    Siparişlerim
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-brand-red rounded-md py-4 flex-row items-center justify-center gap-2"
                  onPress={() => {}}
                  activeOpacity={0.85}
                >
                  <Text className="text-white font-sans-bold text-md">
                    Dekont Yükle
                  </Text>
                  <Image
                    source={require("../assets/arrow.png")}
                    style={{ width: 30, height: 14 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  className="bg-brand-red rounded-md py-4 flex-row items-center justify-center gap-2"
                  onPress={() => navigation.navigate("MainTabs")}
                  activeOpacity={0.85}
                >
                  <Text className="text-white font-sans-bold text-md">
                    Alışverişe Devam Et
                  </Text>
                  <Image
                    source={require("../assets/arrow.png")}
                    style={{ width: 40, height: 18 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                {success && (
                  <TouchableOpacity
                    className="border border-brand-red rounded-md py-4 items-center"
                    onPress={() => navigation.navigate("Orders")}
                    activeOpacity={0.85}
                  >
                    <Text className="text-brand-red font-sans-bold text-md">
                      Siparişlerim
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {/* Recently viewed (card payment only) */}
        {paymentMethod === "kredi" && (
          <HomeProductList
            title="Son Gezdikleriniz"
            settings={{ recentlyViewed: true }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
