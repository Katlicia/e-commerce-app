import React from "react";
import { View, Image, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HomeHeader({ scrollRef }) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center justify-between px-3 py-2 bg-white border-b border-border-light">
      <TouchableOpacity
        onPress={() => scrollRef?.current?.scrollTo({ y: 0, animated: true })}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../assets/logo.png")}
          className="w-10 h-10"
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center bg-bg-faint border border-border-light rounded-full px-3 py-2 gap-1.5"
        style={{ width: 260, backgroundColor: "#e7e7e7" }}
        activeOpacity={0.7}
      >
        <TextInput
          placeholder="Binlerce ürün içinde ara"
          placeholderTextColor="#aaa"
          pointerEvents="none"
          className="flex-1 text-md text-text-primary p-0"
        />
        <Ionicons name="search-outline" size={18} color="#aaa" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Notifications")}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="notifications-outline" size={24} color="#444" />
      </TouchableOpacity>
    </View>
  );
}
