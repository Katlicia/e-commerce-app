import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { logoutUser } from "@mobile/shared/redux/authSlice";
import { clearFavouritesLocal } from "@mobile/shared/redux/favouriteSlice";
import { clearCartLocal } from "@mobile/shared/redux/cartSlice";
import { setBearerToken } from "@mobile/shared/utils/axiosInstance";

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    setBearerToken(null);
    dispatch(logoutUser());
    dispatch(clearFavouritesLocal());
    dispatch(clearCartLocal());
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-border-subtle">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-1 w-8"
          >
            <Ionicons name="arrow-back" size={22} color="#212529" />
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-sans-bold text-text-primary text-center">
            Hesap
          </Text>
          <View className="w-8" />
        </View>

        {/* Body */}
        <View className="flex-1 items-center justify-center px-6 gap-4">
          <Image
            source={require("../assets/listensi_logo.png")}
            style={{ width: 200, height: 60 }}
            resizeMode="contain"
          />

          <View className="w-full gap-3 mt-4">
            <TouchableOpacity
              className="bg-brand-red rounded-md py-4 flex-row items-center justify-center gap-3"
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.85}
            >
              <Text className="text-md text-white font-sans text-md">
                Giriş Yap
              </Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-brand-red rounded-md py-4 items-center"
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.85}
            >
              <Text className="text-brand-red font-sans text-md">Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View className="items-center pb-8 gap-1">
          <Text className="text-sm text-text-secondary">
            Yardıma mı ihtiyacınız var?
          </Text>
          <Text className="text-md font-sans-bold text-brand-red">
            444 56 50
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-subtle">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 32, padding: 4 }}
        >
          <Ionicons name="arrow-back" size={22} color="#212529" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-sans-bold text-text-primary text-center">
          Hesap
        </Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User card */}
        <TouchableOpacity
          className="flex-row items-center gap-3 px-4 py-4 mx-5 my-2 rounded-md bg-bg-light"
          onPress={() => navigation.navigate("AccountEdit")}
          activeOpacity={0.7}
        >
          <Image
            source={require("../assets/icon.png")}
            style={{ width: 44, height: 44 }}
            resizeMode="contain"
          />
          <View className="flex-1">
            <Text className="text-md font-sans-bold text-text-primary">
              {user.name} {user.surname.toUpperCase()}
            </Text>
            <Text className="text-sm text-brand-red font-sans-medium">
              Hesap İşlemleri
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#212529" />
        </TouchableOpacity>

        {/* Menu items */}
        {[
          { label: "Listelerim", icon: "list-outline", screen: null },
          { label: "Adreslerim", icon: "location-outline", screen: "AddressEdit" },
          { label: "Siparişler", icon: "bag-outline", screen: "Orders" },
          { label: "Mesajlar", icon: "chatbubble-outline" },
          { label: "Soru Cevap", icon: "help-circle-outline" },
          { label: "Kurumsal Teklif", icon: "business-outline" },
          { label: "Fiyat Alarmlarım", icon: "notifications-outline" },
          { label: "Şifre Değiştir", icon: "lock-closed-outline", screen: "ChangePassword" },
          { label: "Sözleşmeler", icon: "document-text-outline" },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            className="flex-row items-center px-4 py-4 border-b border-border-subtle"
            onPress={() => item.screen && navigation.navigate(item.screen)}
            activeOpacity={0.6}
          >
            <Text className="flex-1 text-md text-text-primary">
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center gap-2 px-4 py-4 mt-2"
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text className="text-red-400 font-sans-medium text-md">
            Çıkış Yap
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
