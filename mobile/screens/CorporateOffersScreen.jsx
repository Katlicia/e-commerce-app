import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { getMyOffers } from "@mobile/shared/redux/corporateOfferSlice";
import ScreenHeader from "../components/ScreenHeader";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function OfferCard({ item }) {
  const productImg = item.product?.images?.[0]?.url;

  return (
    <View className="mx-4 mb-3 rounded-xl border border-border-subtle bg-white overflow-hidden">
      <View className="flex-row items-start gap-3 p-3">
        {productImg ? (
          <Image
            source={{ uri: productImg }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#f0f0f0",
            }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
            }}
            className="items-center justify-center"
          >
            <Ionicons name="business-outline" size={24} color="#adb5bd" />
          </View>
        )}

        <View style={{ flex: 1 }}>
          {item.product?.name && (
            <Text
              className="text-sm font-sans-semibold text-text-primary mb-1"
              numberOfLines={2}
            >
              {item.product.name}
            </Text>
          )}
          {item.message ? (
            <Text className="text-sm text-text-secondary" numberOfLines={3}>
              <Text className="font-sans-semibold text-text-primary">Not: </Text>
              {item.message}
            </Text>
          ) : null}
        </View>
      </View>

      {item.reply ? (
        <View
          style={{
            marginHorizontal: 12,
            marginBottom: 10,
            borderLeftWidth: 3,
            borderLeftColor: "#F83B0A",
            paddingLeft: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#F83B0A", marginBottom: 2 }}>
            Yanıt
          </Text>
          <Text style={{ fontSize: 13, color: "#212529" }}>{item.reply}</Text>
        </View>
      ) : null}

      <View className="flex-row items-center gap-2 px-3 pb-3">
        <Text className="text-xs text-text-muted">{formatDate(item.createdAt)}</Text>

        <View
          style={{
            backgroundColor: item.status === "answered" ? "#d1e7dd" : "#fff3cd",
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: item.status === "answered" ? "#0f5132" : "#856404",
            }}
          >
            {item.status === "answered" ? "Yanıtlandı" : "Beklemede"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function CorporateOffersScreen() {
  const dispatch = useDispatch();
  const { offers = [], loading = false } = useSelector(
    (state) => state.corporateOffer ?? {},
  );

  useEffect(() => {
    dispatch(getMyOffers());
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      <ScreenHeader title="Kurumsal Teklif" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F83B0A" />
        </View>
      ) : offers.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="business-outline" size={52} color="#dee2e6" />
          <Text className="text-text-muted text-sm text-center">
            Henüz kurumsal teklif talebinde bulunmadınız.
          </Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <OfferCard item={item} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
