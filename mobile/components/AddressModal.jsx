import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PLACEHOLDER_COLOR = "#818181";

const emptyAddress = {
  addressName: "",
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  district: "",
  address: "",
  apartment: "",
  postalCode: "",
  invoiceType: "bireysel",
  companyName: "",
  taxOffice: "",
  taxNumber: "",
};

const inputStyle = {
  borderWidth: 1,
  borderColor: "#e0e0e0",
  borderRadius: 5,
  paddingHorizontal: 12,
  paddingVertical: 12,
  fontSize: 14,
  color: "#212529",
  backgroundColor: "white",
  marginBottom: 10,
};

function validate(values) {
  const errors = {};
  if (!values.firstName.trim()) errors.firstName = "Ad zorunludur";
  if (!values.lastName.trim()) errors.lastName = "Soyad zorunludur";
  if (!values.phone.trim()) errors.phone = "Telefon zorunludur";
  else if (!/^[0-9]{10,11}$/.test(values.phone.replace(/\s/g, "")))
    errors.phone = "Geçerli bir numara giriniz";
  if (!values.city.trim()) errors.city = "İl zorunludur";
  if (!values.district.trim()) errors.district = "İlçe zorunludur";
  if (!values.address.trim()) errors.address = "Adres zorunludur";
  return errors;
}

export default function AddressModal({ visible, initial, onSave, onClose }) {
  const [form, setForm] = useState(emptyAddress);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      let firstName = initial.firstName || "";
      let lastName = initial.lastName || "";
      if (!firstName && !lastName && initial.fullName) {
        const spaceIdx = initial.fullName.indexOf(" ");
        if (spaceIdx !== -1) {
          firstName = initial.fullName.slice(0, spaceIdx);
          lastName = initial.fullName.slice(spaceIdx + 1);
        } else {
          firstName = initial.fullName;
        }
      }
      setForm({
        ...emptyAddress,
        ...initial,
        firstName,
        lastName,
      });
    } else {
      setForm(emptyAddress);
    }
    setErrors({});
  }, [visible, initial]);

  const set = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSave = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({ ...form, fullName: form.firstName + " " + form.lastName });
  };

  const isKurumsal = form.invoiceType === "kurumsal";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* X close button */}
              <TouchableOpacity
                onPress={onClose}
                style={{ alignSelf: "flex-end", marginBottom: 16 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#6c757d" />
              </TouchableOpacity>

              {/* Title */}
              <Text
                style={{
                  textAlign: "center",
                  color: "#F83B0A",
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 20,
                }}
              >
                {initial ? "Adresi Düzenle" : "Yeni Adres Ekle"}
              </Text>

              {/* 1. Address name — full width */}
              <TextInput
                style={inputStyle}
                placeholder="Adres Başlığı (Ev, İş, Depo vb.)"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={form.addressName}
                onChangeText={set("addressName")}
              />

              {/* 2. First name | Last name row */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={inputStyle}
                    placeholder="Adınız"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={form.firstName}
                    onChangeText={set("firstName")}
                  />
                  {errors.firstName ? (
                    <Text
                      style={{
                        color: "#dc3545",
                        fontSize: 11,
                        marginTop: -6,
                        marginBottom: 6,
                      }}
                    >
                      {errors.firstName}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={inputStyle}
                    placeholder="Soyadınız"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={form.lastName}
                    onChangeText={set("lastName")}
                  />
                  {errors.lastName ? (
                    <Text
                      style={{
                        color: "#dc3545",
                        fontSize: 11,
                        marginTop: -6,
                        marginBottom: 6,
                      }}
                    >
                      {errors.lastName}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* 3. Phone — full width */}
              <TextInput
                style={inputStyle}
                placeholder="0 (---) --- -- --"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={form.phone}
                onChangeText={set("phone")}
                keyboardType="phone-pad"
                maxLength={11}
              />
              {errors.phone ? (
                <Text
                  style={{
                    color: "#dc3545",
                    fontSize: 11,
                    marginTop: -6,
                    marginBottom: 6,
                  }}
                >
                  {errors.phone}
                </Text>
              ) : null}

              {/* 4. City | District row */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={inputStyle}
                    placeholder="İl Seçiniz"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={form.city}
                    onChangeText={set("city")}
                  />
                  {errors.city ? (
                    <Text
                      style={{
                        color: "#dc3545",
                        fontSize: 11,
                        marginTop: -6,
                        marginBottom: 6,
                      }}
                    >
                      {errors.city}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={inputStyle}
                    placeholder="İlçe Seçiniz"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={form.district}
                    onChangeText={set("district")}
                  />
                  {errors.district ? (
                    <Text
                      style={{
                        color: "#dc3545",
                        fontSize: 11,
                        marginTop: -6,
                        marginBottom: 6,
                      }}
                    >
                      {errors.district}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* 5. Address multiline */}
              <TextInput
                style={[
                  inputStyle,
                  { textAlignVertical: "top", minHeight: 90 },
                ]}
                placeholder="Adres"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={form.address}
                onChangeText={set("address")}
                multiline
                numberOfLines={5}
              />
              {errors.address ? (
                <Text
                  style={{
                    color: "#dc3545",
                    fontSize: 11,
                    marginTop: -6,
                    marginBottom: 6,
                  }}
                >
                  {errors.address}
                </Text>
              ) : null}

              {/* 6. Apartment | Postal code row */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="Apartman, daire vb."
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.apartment}
                  onChangeText={set("apartment")}
                />
                <TextInput
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="Posta Kodu"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.postalCode}
                  onChangeText={set("postalCode")}
                  keyboardType="numeric"
                />
              </View>

              {/* 7. Invoice type radio row */}
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                {["bireysel", "kurumsal"].map((type) => {
                  const selected = form.invoiceType === type;
                  const label =
                    type === "bireysel" ? "Bireysel Fatura" : "Kurumsal Fatura";
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => set("invoiceType")(type)}
                      activeOpacity={0.7}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: selected ? "#F83B0A" : "#e0e0e0",
                          backgroundColor: selected ? "#F83B0A" : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                      <Text style={{ fontSize: 13, color: "#212529" }}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 8. Kurumsal fields — always rendered, hidden when bireysel */}
              <View
                style={{ opacity: isKurumsal ? 1 : 0 }}
                pointerEvents={isKurumsal ? "auto" : "none"}
              >
                <TextInput
                  style={inputStyle}
                  placeholder="Firma Adı veya Ünvanı"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.companyName}
                  onChangeText={set("companyName")}
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    style={[inputStyle, { flex: 1 }]}
                    placeholder="Vergi Dairesi"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={form.taxOffice}
                    onChangeText={set("taxOffice")}
                  />
                  <TextInput
                    style={[inputStyle, { flex: 1, fontSize: 10 }]}
                    placeholder="T.C No veya Vergi Numarası"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={form.taxNumber}
                    onChangeText={set("taxNumber")}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* 9. Save button */}
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#F83B0A",
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  Kaydet →
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
