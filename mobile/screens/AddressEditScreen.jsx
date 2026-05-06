import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  getUserAddresses,
  addUserAddress,
  editUserAddress,
  deleteUserAddress,
  setDefaultAddress,
} from "@mobile/shared/redux/userSlice";
import AddressModal from "../components/AddressModal";
import ScreenHeader from "../components/ScreenHeader";

const markerIcon = require("../assets/Address/marker.png");
const deleteIcon = require("../assets/Address/delete.png");

export default function AddressEditScreen({ navigation }) {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.user);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    dispatch(getUserAddresses());
  }, []);

  const openAdd = () => {
    setEditingAddress(null);
    setEditingIndex(null);
    setModalVisible(true);
  };

  const openEdit = (idx) => {
    setEditingAddress(addresses[idx]);
    setEditingIndex(idx);
    setModalVisible(true);
  };

  const handleSave = (values) => {
    if (editingIndex !== null) {
      dispatch(editUserAddress({ index: editingIndex, ...values }));
    } else {
      dispatch(addUserAddress(values)).then(() => dispatch(getUserAddresses()));
    }
    setModalVisible(false);
    setEditingAddress(null);
    setEditingIndex(null);
  };

  const handleDelete = (idx) => {
    Alert.alert(
      "Adresi Sil",
      `"${addresses[idx]?.addressName || "Bu adresi"}" silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        { text: "Sil", style: "destructive", onPress: () => dispatch(deleteUserAddress(idx)) },
      ],
    );
  };

  const handleSetDefault = (idx) => {
    dispatch(setDefaultAddress(idx));
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      <ScreenHeader
        title="Adreslerim"
        right={
          <TouchableOpacity
            onPress={openAdd}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Ionicons name="add" size={18} color="#F83B0A" />
            <Text className="text-sm font-sans-semibold text-brand-red">
              Adres Ekle
            </Text>
          </TouchableOpacity>
        }
      />

      <AddressModal
        visible={modalVisible}
        initial={editingAddress}
        onSave={handleSave}
        onClose={() => {
          setModalVisible(false);
          setEditingAddress(null);
          setEditingIndex(null);
        }}
      />

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#F83B0A" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {addresses.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 64,
                gap: 12,
              }}
            >
              <Ionicons name="location-outline" size={48} color="#dee2e6" />
              <Text style={{ color: "#adb5bd", fontSize: 14 }}>
                Kayıtlı adresiniz bulunmuyor.
              </Text>
              <TouchableOpacity
                onPress={openAdd}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#F83B0A",
                  borderRadius: 12,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "600", fontSize: 14 }}
                >
                  Adres Ekle
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map((addr, idx) => {
              const isKurumsal = addr.invoiceType === "kurumsal";
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => openEdit(idx)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                  }}
                >
                  {/* Top row: marker + title + badge */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Image
                      source={markerIcon}
                      style={{ width: 22, height: 22 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#F83B0A",
                        flex: 1,
                        marginLeft: 8,
                      }}
                      numberOfLines={1}
                    >
                      {addr.addressName || "Adres"}
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#FFEA4A",
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "400",
                        }}
                      >
                        {isKurumsal ? "Kurumsal" : "Bireysel"}
                      </Text>
                    </View>
                  </View>

                  {/* Address detail lines */}
                  <View style={{ marginLeft: 28, gap: 2 }}>
                    {addr.address ? (
                      <Text style={{ fontSize: 14 }}>{addr.address}</Text>
                    ) : null}
                    {addr.city || addr.district ? (
                      <Text style={{ fontSize: 13 }}>
                        {[addr.city, addr.district]
                          .filter(Boolean)
                          .join(", ")
                          .toUpperCase()}
                      </Text>
                    ) : null}
                    {addr.phone ? (
                      <Text style={{ fontSize: 13 }}>
                        +90{" "}
                        {String(addr.phone).slice(0, 3) +
                          " " +
                          String(addr.phone).slice(3, 6) +
                          " " +
                          String(addr.phone).slice(6, 8) +
                          " " +
                          String(addr.phone).slice(8, 10)}
                      </Text>
                    ) : null}
                    {isKurumsal && addr.companyName ? (
                      <Text style={{ fontSize: 13 }}>
                        {addr.companyName.toUpperCase()}
                      </Text>
                    ) : null}
                    {isKurumsal && addr.taxNumber ? (
                      <Text style={{ fontSize: 13 }}>{addr.taxNumber}</Text>
                    ) : null}
                  </View>

                  {/* Bottom row: default + delete */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 10,
                      marginLeft: 28,
                    }}
                  >
                    {idx === 0 ? (
                      <Text
                        style={{
                          color: "#F83B0A",
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        Varsayılan Adresiniz
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(idx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            textDecorationLine: "underline",
                          }}
                        >
                          Varsayılan Yap
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => handleDelete(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Image
                        source={deleteIcon}
                        style={{ width: 22, height: 22 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
