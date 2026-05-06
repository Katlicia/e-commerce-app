import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ScreenHeader({ title, right, onBack }) {
  const navigation = useNavigation();

  return (
    <View className="bg-white flex-row items-center px-4 py-3 border-b border-border-subtle">
      <TouchableOpacity
        onPress={onBack ?? (() => navigation.goBack())}
        style={{ width: 32, padding: 4 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={22} color="#212529" />
      </TouchableOpacity>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          alignItems: "center",
        }}
        pointerEvents="none"
      >
        <Text className="text-lg text-text-primary font-sans-semibold">
          {title}
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      {right ?? <View style={{ width: 32 }} />}
    </View>
  );
}
