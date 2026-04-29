import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  getUserAddresses,
  addUserAddress,
  editUserAddress,
  deleteUserAddress,
} from "@mobile/shared/redux/userSlice";
import AddressModal from "../components/AddressModal";
import ScreenHeader from "../components/ScreenHeader";

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
    dispatch(deleteUserAddress(idx));
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      <ScreenHeader
        title="Adreslerim"
        right={
          <TouchableOpacity onPress={openAdd} className="flex-row items-center gap-1">
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F83B0A" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {addresses.length === 0 ? (
            <View className="items-center justify-center py-16 gap-3">
              <Ionicons name="location-outline" size={48} color="#dee2e6" />
              <Text className="text-text-muted text-sm">
                Kayıtlı adresiniz bulunmuyor.
              </Text>
              <TouchableOpacity
                className="bg-brand-red rounded-xl px-6 py-3"
                onPress={openAdd}
                activeOpacity={0.85}
              >
                <Text className="text-white font-sans-semibold text-sm">
                  Adres Ekle
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map((addr, idx) => (
              <TouchableOpacity
                key={idx}
                className="bg-white rounded-xl px-4 py-4 border border-border-subtle"
                onPress={() => openEdit(idx)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center gap-2 flex-1">
                    <Ionicons name="location" size={20} color="#F83B0A" />
                    <Text className="text-md font-sans-bold text-text-primary flex-1">
                      {addr.addressName || "Adres"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(idx)}
                    className="p-1"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#adb5bd" />
                  </TouchableOpacity>
                </View>

                <View className="ml-7 gap-0.5">
                  <Text className="text-sm font-sans-semibold text-text-primary">
                    {addr.fullName}
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    {addr.address}
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    {addr.district}/{addr.city}
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    +90 {addr.phone}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
