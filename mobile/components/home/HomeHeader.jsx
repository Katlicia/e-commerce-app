import React, { useState } from "react";
import { View, Image, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HomeHeader({ scrollRef }) {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState("");

  function handleSearch() {
    navigation.navigate("ProductList", {
      initialKeyword: keyword.trim(),
      filter: null,
    });
  }

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

      <View
        className="flex-row items-center rounded-full px-3 py-2 gap-1.5"
        style={{ width: 260, backgroundColor: "#e7e7e7" }}
      >
        <TextInput
          placeholder="Binlerce ürün içinde ara"
          placeholderTextColor="#aaa"
          className="flex-1 text-md text-text-primary p-0"
          value={keyword}
          onChangeText={setKeyword}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons name="search-outline" size={18} color="#aaa" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("Notifications")}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="notifications-outline" size={24} color="#444" />
      </TouchableOpacity>
    </View>
  );
}
