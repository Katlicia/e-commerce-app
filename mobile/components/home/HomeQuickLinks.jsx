import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const crownImg = require("../../assets/Home/crown.png");
const clipboardImg = require("../../assets/Home/clipboard.png");

const LINKS = [
  {
    title: "AYIN ÜRÜNLERİ",
    subtitle: "Süper fiyatlar",
    image: crownImg,
    bg: "#d9f7dd",
    textColor: "#2A9046",
    screen: "ProductList",
    params: { filter: { featuredList: "monthly-featured" } },
  },
  {
    title: "LİSTELİ ÜRÜNLER",
    subtitle: "Sizin için derledik",
    image: clipboardImg,
    bg: "#ffe4de",
    textColor: "#C44820",
    screen: "ListedProducts",
    params: {},
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
          onPress={() => navigation.navigate(link.screen, link.params)}
        >
          <Image source={link.image} style={styles.icon} resizeMode="contain" />
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
  icon: {
    width: 32,
    height: 32,
  },
});
