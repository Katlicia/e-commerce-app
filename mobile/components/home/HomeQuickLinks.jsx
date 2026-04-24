import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const LINKS = [
  {
    title: "AYIN ÜRÜNLERİ",
    subtitle: "Süper fiyatlar",
    icon: "crown",
    IconComponent: FontAwesome6,
    bg: "#d9f7dd",
    iconColor: "#3DB860",
    textColor: "#2A9046",
    filter: { featuredList: "monthly-featured" },
    size: 28,
  },
  {
    title: "KAMPANYALAR",
    subtitle: "Sizin için derledik",
    icon: "campaign",
    IconComponent: MaterialIcons,
    bg: "#ffe4de",
    iconColor: "#E05C35",
    textColor: "#C44820",
    filter: { badge: "kampanyalar" },
    size: 40,
  },
];

export default function HomeQuickLinks() {
  const navigation = useNavigation();

  return (
    <View style={styles.row}>
      {LINKS.map((link) => (
        <TouchableOpacity
          key={link.title}
          activeOpacity={0.75}
          style={[styles.card, { backgroundColor: link.bg }]}
          onPress={() =>
            navigation.navigate("ProductList", { filter: link.filter })
          }
        >
          <link.IconComponent
            name={link.icon}
            size={link.size}
            color={link.iconColor}
          />
          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: link.textColor }]}>
              {link.title}
            </Text>
            <Text style={[styles.subtitle, { color: link.textColor }]}>
              {link.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  textWrap: {
    flexShrink: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 1,
    opacity: 0.8,
  },
});
