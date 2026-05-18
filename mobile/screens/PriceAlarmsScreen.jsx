import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  getMyPriceAlarms,
  deletePriceAlarm,
} from "@mobile/shared/redux/priceAlarmSlice";
import ScreenHeader from "../components/ScreenHeader";
import { fmt } from "@mobile/shared/utils/format";

function AlarmCard({ item, onDelete }) {
  const product = item.product;
  const imageUrl = product?.images?.[0]?.url;
  const price = product?.price ?? product?.discountedPrice;

  return (
    <View className="mx-4 mb-3 rounded-xl border border-border-subtle bg-white overflow-hidden">
      <View className="flex-row items-center gap-3 p-3">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#f0f0f0",
            }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
            }}
            className="items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={28} color="#adb5bd" />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            className="text-sm font-sans-semibold text-text-primary mb-1"
            numberOfLines={2}
          >
            {product?.name ?? "Ürün"}
          </Text>
          {price != null && (
            <Text className="text-sm text-brand-red font-sans-bold">
              {fmt(price)} ₺
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => onDelete(product?._id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ padding: 4 }}
        >
          <Ionicons name="trash-outline" size={20} color="#adb5bd" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PriceAlarmsScreen() {
  const dispatch = useDispatch();
  const { alarms, loading } = useSelector((state) => state.priceAlarm);

  useEffect(() => {
    dispatch(getMyPriceAlarms());
  }, []);

  function handleDelete(productId) {
    if (!productId) return;
    dispatch(deletePriceAlarm(productId));
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      <ScreenHeader title="Fiyat Alarmlarım" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F83B0A" />
        </View>
      ) : alarms.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="notifications-off-outline" size={52} color="#dee2e6" />
          <Text className="text-text-muted text-sm text-center">
            Henüz fiyat alarmı kurulmadı.
          </Text>
          <Text className="text-text-muted text-xs text-center">
            Bir ürün sayfasında çan ikonuna dokunarak fiyat alarmı kurabilirsiniz.
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item._id ?? item.product?._id}
          renderItem={({ item }) => (
            <AlarmCard item={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
