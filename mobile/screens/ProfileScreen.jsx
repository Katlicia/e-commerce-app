import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function ProfileScreen({ navigation }) {
  const user = useSelector((state) => state.auth.user);

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
    </SafeAreaView>
  );
}
