import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { logoutUser } from "@mobile/shared/redux/authSlice";
import { clearFavouritesLocal } from "@mobile/shared/redux/favouriteSlice";
import { clearListsLocal } from "@mobile/shared/redux/listSlice";
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
    dispatch(clearListsLocal());
    navigation.navigate("Login");
  };

  if (!user) return null;

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
          <Ionicons name="arrow-forward" size={20} />
        </TouchableOpacity>

        {/* Menu items */}
        {[
          { label: "Favorilerim", icon: "heart-outline", screen: "Favourites" },
          { label: "Listelerim", icon: "list-outline", screen: "Lists" },
          {
            label: "Adreslerim",
            icon: "location-outline",
            screen: "AddressEdit",
          },
          { label: "Siparişler", icon: "bag-outline", screen: "Orders" },
          { label: "Mesajlar", icon: "chatbubble-outline" },
          {
            label: "Soru Cevap",
            icon: "help-circle-outline",
            screen: "Questions",
          },
          {
            label: "Kurumsal Teklif",
            icon: "business-outline",
            screen: "CorporateOffers",
          },
          {
            label: "Fiyat Alarmlarım",
            icon: "notifications-outline",
            screen: "PriceAlarms",
          },
          {
            label: "Şifre Değiştir",
            icon: "lock-closed-outline",
            screen: "ChangePassword",
          },
          { label: "Sözleşmeler", icon: "document-text-outline" },
        ].map((item, idx, arr) => (
          <View key={item.label}>
            <TouchableOpacity
              className="flex-row items-center px-4 py-6"
              onPress={() => item.screen && navigation.navigate(item.screen)}
              activeOpacity={0.6}
            >
              <Text className="flex-1 text-md text-text-primary">
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} />
            </TouchableOpacity>
            {idx < arr.length && (
              <View
                style={{
                  height: 1,
                  backgroundColor: "#ececec",
                  marginHorizontal: 8,
                }}
              />
            )}
          </View>
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
