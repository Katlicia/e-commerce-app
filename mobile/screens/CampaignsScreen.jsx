import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import ScreenHeader from "../components/ScreenHeader";

function CampaignCard({ item }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{ marginHorizontal: 12, marginBottom: 14 }}
      onPress={() =>
        navigation.navigate("CampaignDetail", { campaignId: item._id })
      }
    >
      <View
        style={{
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "#f1f3f5",
        }}
      >
        {item.image?.url ? (
          <Image
            source={{ uri: item.image.url }}
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 160,
              backgroundColor: "#dee2e6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="image-outline" size={40} color="#adb5bd" />
          </View>
        )}

        {item.coupon?.code && (
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "rgba(0,0,0,0.55)",
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
              Kampanya Kodu: {item.coupon.code}
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 4,
          paddingTop: 10,
          paddingBottom: 2,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#212529",
            flex: 1,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#adb5bd"
          style={{ marginLeft: 6 }}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function CampaignsScreen() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/campaigns");
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data.campaigns ?? []);
      setCampaigns(list.filter((c) => c.isActive));
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f8f9fa" }}
      edges={["top"]}
    >
      <ScreenHeader title="Kampanyalar" />

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#ff7700" size="large" />
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <CampaignCard item={item} />}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
              }}
            >
              <Ionicons name="pricetag-outline" size={48} color="#adb5bd" />
              <Text style={{ color: "#adb5bd", marginTop: 12, fontSize: 15 }}>
                Aktif kampanya bulunamadı
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
