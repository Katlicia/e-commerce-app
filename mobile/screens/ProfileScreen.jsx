import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
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
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1 w-8">
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-text-brand-red">Hesabım</Text>
        <Text className="text-base text-text-secondary mt-2">{user.name}</Text>
      </View>
      <View className="px-6 pb-6">
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 border border-red-400 rounded-md py-3"
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text className="text-red-400 font-semibold text-base">
            Çıkış Yap
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
