import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { getUserOrders } from "@mobile/shared/redux/orderSlice";
import ScreenHeader from "../components/ScreenHeader";
import { fmt } from "@mobile/shared/utils/format";

const TABS = ["Siparişler", "İptaller", "İadeler"];

const TAB_STATUSES = {
  Siparişler: ["Hazırlanıyor", "Kargoya Verildi", "Teslim Edildi"],
  İptaller: ["İptal Edildi"],
  İadeler: ["İade Edildi"],
};

const STATUS_STYLE = {
  Hazırlanıyor: { bg: "#FFDED6", text: "#F83B0A" },
  "Kargoya Verildi": { bg: "#cfe2ff", text: "#084298" },
  "Teslim Edildi": { bg: "#d1e7dd", text: "#0f5132" },
  "İptal Edildi": { bg: "#f8d7da", text: "#842029" },
  "İade Edildi": { bg: "#e2d9f3", text: "#432874" },
};

const PAYMENT_LABELS = {
  kredi: "Kredi Kartı",
  havale: "Havale / EFT",
};

function formatOrderDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MAX_VISIBLE = 3;
const WIDTH = 44;

function ProductImages({ items }) {
  const visible = items.slice(0, MAX_VISIBLE);
  const extra = items.length - MAX_VISIBLE;

  return (
    <View className="flex-row gap-2" style={{ flex: 1 }}>
      {visible.map((item, idx) => {
        const img = item.product?.images?.[0]?.url;
        return (
          <View
            key={idx}
            style={{ width: WIDTH, height: WIDTH }}
            className="rounded-md bg-bg-light border border-border-subtle overflow-hidden items-center justify-center"
          >
            {img ? (
              <Image
                source={{ uri: img }}
                style={{ width: WIDTH, height: WIDTH }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="cube-outline" size={24} color="#adb5bd" />
            )}
          </View>
        );
      })}
      {extra > 0 && (
        <View className="items-center justify-center">
          <Text
            className="text-sm font-sans-bold"
            style={{ fontSize: 14, fontWeight: "700" }}
          >
            +{extra}
          </Text>
        </View>
      )}
    </View>
  );
}

function OrderCard({ order, onPress }) {
  const statusStyle = STATUS_STYLE[order.status] ?? {
    bg: "#f8f9fa",
    text: "#495057",
  };
  const paymentLabel =
    PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod ?? "";

  return (
    <>
      <View className="mx-4 mb-1">
        <Text className="font-sans-medium" style={{ fontSize: 14 }}>
          {formatOrderDate(order.createdAt)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        className="bg-bg-light rounded-xl mx-4 mb-3 px-4 p3-4 pb-3 border border-border-subtle"
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginVertical: 10,
          }}
        >
          <ProductImages items={order.items ?? []} />
          <View
            style={{ backgroundColor: statusStyle.bg }}
            className="rounded-full px-3 py-1 ml-2"
          >
            <Text style={{ color: statusStyle.text }} className="text-xs">
              {order.status}
            </Text>
          </View>
        </View>

        <Text className="text-sm">
          <Text>Toplam Tutar: {fmt(order.totalAmount + (order.cargoPrice ?? 0))} TL</Text>
          {paymentLabel ? ` / ${paymentLabel}` : ""}
        </Text>
      </TouchableOpacity>
    </>
  );
}

function TabPage({ orders, loading, tabKey, navigation }) {
  const filtered = orders.filter((o) => TAB_STATUSES[tabKey].includes(o.status));

  const emptyText = {
    Siparişler: "Henüz bir siparişiniz bulunmuyor.",
    İptaller: "İptal edilmiş siparişiniz bulunmuyor.",
    İadeler: "İade edilmiş siparişiniz bulunmuyor.",
  }[tabKey];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#F83B0A" />
      </View>
    );
  }

  if (filtered.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <Ionicons name="bag-outline" size={52} color="#dee2e6" />
        <Text className="text-text-muted text-sm text-center">{emptyText}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <OrderCard
          order={item}
          onPress={() => navigation.navigate("OrderDetail", { orderId: item._id })}
        />
      )}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default function OrdersScreen({ navigation }) {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef(null);

  useEffect(() => {
    dispatch(getUserOrders());
  }, []);

  function handleTabPress(idx) {
    setActiveIndex(idx);
    pagerRef.current?.setPage(idx);
  }

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <ScreenHeader title="Siparişlerim" />

      <View className="bg-white flex-row border-b border-border-subtle">
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(idx)}
            className="flex-1 items-center py-3"
            activeOpacity={0.7}
          >
            <Text
              className={
                activeIndex === idx
                  ? "text-sm font-sans-semibold text-brand-red"
                  : "text-sm font-sans text-text-secondary"
              }
            >
              {tab}
            </Text>
            {activeIndex === idx && (
              <View className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-red rounded-full" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        {TABS.map((tab) => (
          <View key={tab} style={{ flex: 1 }}>
            <TabPage
              orders={orders}
              loading={loading}
              tabKey={tab}
              navigation={navigation}
            />
          </View>
        ))}
      </PagerView>
    </SafeAreaView>
  );
}
