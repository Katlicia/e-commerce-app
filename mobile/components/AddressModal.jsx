import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const emptyAddress = {
  addressName: "",
  fullName: "",
  phone: "",
  city: "",
  district: "",
  address: "",
};

function validate(values) {
  const errors = {};
  if (!values.fullName.trim()) errors.fullName = "Ad soyad zorunludur";
  if (!values.phone.trim()) errors.phone = "Telefon zorunludur";
  else if (!/^[0-9]{10,11}$/.test(values.phone))
    errors.phone = "Geçerli bir numara giriniz";
  if (!values.city.trim()) errors.city = "Şehir zorunludur";
  if (!values.district.trim()) errors.district = "İlçe zorunludur";
  if (!values.address.trim()) errors.address = "Adres zorunludur";
  return errors;
}

function Field({ value, onChangeText, placeholder, error, ...rest }) {
  return (
    <View className="flex-1">
      <TextInput
        className="border border-border-input rounded-lg px-3 py-2.5 text-base text-text-primary"
        placeholder={placeholder}
        placeholderTextColor="#adb5bd"
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
      {error ? (
        <Text className="text-price-red text-xs mt-0.5">{error}</Text>
      ) : null}
    </View>
  );
}

export default function AddressModal({ visible, initial, onSave, onClose }) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState(
    initial ? { addressName: "Adres", ...initial } : emptyAddress,
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial ? { addressName: "Adres", ...initial } : emptyAddress);
    setErrors({});
  }, [visible, initial]);

  const set = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSave = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="bg-white rounded-t-2xl px-4 pt-4" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-md font-sans-bold text-text-primary">
                  {initial ? "Adresi Düzenle" : "Adres Ekle"}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={22} color="#6c757d" />
                </TouchableOpacity>
              </View>

              {/* Address name */}
              <TextInput
                className="border border-border-input rounded-lg px-3 py-2.5 text-base text-text-primary mb-2"
                placeholder="Adres İsmi (örn: Ev, İş)"
                placeholderTextColor="#adb5bd"
                value={form.addressName}
                onChangeText={set("addressName")}
              />

              {/* Full name + Phone */}
              <View className="flex-row gap-3 mb-2">
                <Field
                  placeholder="Ad Soyad"
                  value={form.fullName}
                  onChangeText={set("fullName")}
                  error={errors.fullName}
                />
                <Field
                  placeholder="Telefon"
                  value={form.phone}
                  onChangeText={set("phone")}
                  keyboardType="phone-pad"
                  maxLength={11}
                  error={errors.phone}
                />
              </View>

              {/* City + District */}
              <View className="flex-row gap-3 mb-2">
                <Field
                  placeholder="Şehir"
                  value={form.city}
                  onChangeText={set("city")}
                  error={errors.city}
                />
                <Field
                  placeholder="İlçe"
                  value={form.district}
                  onChangeText={set("district")}
                  error={errors.district}
                />
              </View>

              {/* Address */}
              <TextInput
                className="border border-border-input rounded-lg px-3 py-2.5 text-base text-text-primary mb-1"
                placeholder="Açık Adres"
                placeholderTextColor="#adb5bd"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={form.address}
                onChangeText={set("address")}
              />
              {errors.address ? (
                <Text className="text-price-red text-xs mb-2">
                  {errors.address}
                </Text>
              ) : null}

              <TouchableOpacity
                className="bg-primary rounded-xl py-3 items-center mt-2"
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text className="text-white font-sans-bold text-md">
                  Kaydet
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
