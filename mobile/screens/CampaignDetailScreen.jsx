import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import ScreenHeader from "../components/ScreenHeader";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CampaignDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { campaignId } = route.params;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/campaigns/${campaignId}`)
      .then((res) => setCampaign(res.data))
      .catch(() => navigation.goBack())
      .finally(() => setLoading(false));
  }, [campaignId]);

  const handleCopy = () => {
    if (!campaign?.coupon?.code) return;
    Clipboard.setString(campaign.coupon.code);
    setCopied(true);
  };

  const descriptionLines = campaign?.description
    ? campaign.description
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f8f9fa" }}
      edges={["top"]}
    >
      <ScreenHeader title="Kampanya Detayı" />

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#ff7700" size="large" />
        </View>
      ) : !campaign ? null : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Banner image */}
          <View style={{ position: "relative" }}>
            {campaign.image?.url ? (
              <Image
                source={{ uri: campaign.image.url }}
                style={{ width: "100%", height: 220 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: 220,
                  backgroundColor: "#dee2e6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="image-outline" size={48} color="#adb5bd" />
              </View>
            )}
            {campaign.coupon?.code && (
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                >
                  Kampanya Kodu: {campaign.coupon.code}
                </Text>
              </View>
            )}
          </View>

          <View
            style={{ paddingHorizontal: 16, paddingTop: 16, paddingRight: 24 }}
          >
            {/* Title + CTA */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
                lineHeight: 24,
                marginBottom: 14,
              }}
            >
              {campaign.title}
            </Text>

            {campaign.products?.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductList", {
                    filter: { campaignId: campaign._id },
                  })
                }
                style={{
                  backgroundColor: "#ff6a00",
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignSelf: "flex-start",
                  marginBottom: 20,
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: 14,
                    letterSpacing: 0.5,
                  }}
                >
                  HEMEN AL →
                </Text>
              </TouchableOpacity>
            )}

            {/* Description + coupon steps */}
            {(descriptionLines.length > 0 || campaign.coupon?.code) && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    marginBottom: 10,
                  }}
                >
                  Kampanya Koşulları:
                </Text>
                {[
                  ...descriptionLines,
                  ...(campaign.coupon?.code
                    ? [
                        "Üye girişi yapın.",
                        `Sepetinize ${campaign.coupon.minOrderAmount ? campaign.coupon.minOrderAmount + " TL ve üzeri" : ""} ürün ekleyin.`,
                        "Sepetinizin üst kısmındaki alandan indirimi uygula butonuna basın.",
                        "İndirimin toplam tutardan düştüğünü göreceksiniz.",
                      ]
                    : []),
                ].map((line, i) => (
                  <View
                    key={i}
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        marginRight: 6,
                        marginTop: 1,
                      }}
                    >
                      •
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        lineHeight: 20,
                        flex: 1,
                      }}
                    >
                      {line}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Coupon code */}
            {campaign.coupon?.code && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#212529",
                    marginBottom: 10,
                  }}
                >
                  Kampanya Kodu
                </Text>
                <TouchableOpacity
                  onPress={handleCopy}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    alignSelf: "flex-start",
                    borderWidth: 1.5,
                    borderColor: copied ? "#2e7d32" : "#212529",
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      color: copied ? "#2e7d32" : "#F83B0A",
                      fontSize: 18,
                      fontWeight: "800",
                      letterSpacing: 1.5,
                    }}
                  >
                    {campaign.coupon.code}
                  </Text>
                  <MaterialCommunityIcons
                    name={copied ? "check" : "content-copy"}
                    size={18}
                    color={copied ? "#2e7d32" : "#555"}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Date range */}
            {campaign.startDate && campaign.endDate && (
              <Text style={{ fontSize: 14, marginTop: 4 }}>
                {formatDate(campaign.startDate)} —{" "}
                {formatDate(campaign.endDate)} tarihlerinde geçerlidir.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
