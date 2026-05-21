import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { ProductCard, CARD_HEIGHT } from "../components/ProductCard";

const PADDING = 16;
const GAP = 10;

function getNumColumns(width) {
  if (width >= 900) return 4;
  if (width >= 600) return 3;
  return 2;
}

export default function FavouritesScreen({ navigation }) {
  const favourites = useSelector((state) => state.favourite.favourites ?? []);
  const { width } = useWindowDimensions();

  const numColumns = getNumColumns(width);
  const cardWidth = (width - PADDING * 2 - GAP * (numColumns - 1)) / numColumns;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Favorilerim" />

      {favourites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6 gap-4">
          <Ionicons name="heart-outline" size={56} color="#adb5bd" />
          <Text className="text-lg font-sans-medium text-text-secondary text-center">
            Henüz favori ürününüz yok
          </Text>
          <Text className="text-sm text-text-muted text-center">
            Beğendiğiniz ürünlerin kalbine dokunarak favorilerinize ekleyebilirsiniz.
          </Text>
          <TouchableOpacity
            className="bg-brand-red rounded-md py-3 px-8 mt-2"
            onPress={() => navigation.navigate("MainTabs", { screen: "Home" })}
            activeOpacity={0.85}
          >
            <Text className="text-white font-sans-medium text-md">
              Alışverişe Başla
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => item._id || item.id}
          key={numColumns}
          numColumns={numColumns}
          contentContainerStyle={{
            paddingHorizontal: PADDING,
            paddingTop: 12,
            paddingBottom: 24,
          }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          getItemLayout={(_, index) => ({
            length: CARD_HEIGHT + GAP,
            offset: (CARD_HEIGHT + GAP) * Math.floor(index / numColumns),
            index,
          })}
          renderItem={({ item }) => (
            <ProductCard product={item} cardWidth={cardWidth} noMargin />
          )}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text className="text-sm text-text-muted mb-3">
              {favourites.length} ürün
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
