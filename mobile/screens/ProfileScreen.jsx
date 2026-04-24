import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6 gap-4">
          <Text className="text-2xl font-bold text-text-primary">Hesabım</Text>
          <Text className="text-base text-text-secondary text-center">
            Hesabınıza erişmek için giriş yapın.
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-md px-8 py-3 w-full items-center"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="text-white font-semibold text-md">Giriş Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text className="text-brand-blue text-base">Hesap Oluştur</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-text-primary">Hesabım</Text>
        <Text className="text-base text-text-secondary mt-2">{user.name}</Text>
      </View>
      <View className="px-6 pb-6">
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 border border-red-400 rounded-md py-3"
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text className="text-red-400 font-semibold text-base">Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
