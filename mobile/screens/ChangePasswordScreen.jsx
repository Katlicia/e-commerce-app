import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { changePassword } from "@mobile/shared/redux/userSlice";
import ScreenHeader from "../components/ScreenHeader";

function Field({ label, value, onChangeText, secureEntry, show, onToggle, error }) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-sans-semibold text-text-primary mb-1.5">
        {label}
      </Text>
      <View
        className={`flex-row items-center border rounded-lg px-3 bg-white ${
          error ? "border-red-400" : "border-border-subtle"
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          className="flex-1 py-3 text-sm text-text-primary font-sans"
          placeholderTextColor="#adb5bd"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggle} className="p-1">
          <Ionicons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#adb5bd"
          />
        </TouchableOpacity>
      </View>
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}
    </View>
  );
}

export default function ChangePasswordScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  const validate = () => {
    const e = {};
    if (!current) e.current = "Mevcut şifrenizi girin.";
    if (!next) e.next = "Yeni şifrenizi girin.";
    else if (next.length < 6) e.next = "En az 6 karakter olmalıdır.";
    if (!confirm) e.confirm = "Şifrenizi tekrar girin.";
    else if (next && confirm !== next) e.confirm = "Şifreler eşleşmiyor.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    try {
      await dispatch(changePassword({ currentPassword: current, newPassword: next })).unwrap();
      setSuccess(true);
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setErrors({ current: err });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      <ScreenHeader title="Şifre Değiştir" />

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {success && (
          <View className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 flex-row items-center gap-2">
            <Ionicons name="checkmark-circle-outline" size={18} color="#0f5132" />
            <Text className="text-sm text-green-700 font-sans-semibold">
              Şifreniz başarıyla güncellendi.
            </Text>
          </View>
        )}

        <View className="bg-white rounded-xl border border-border-subtle p-4">
          <Field
            label="Mevcut Şifre"
            value={current}
            onChangeText={(v) => { setCurrent(v); setErrors((e) => ({ ...e, current: null })); setSuccess(false); }}
            show={show.current}
            onToggle={() => toggle("current")}
            error={errors.current}
          />
          <Field
            label="Yeni Şifre"
            value={next}
            onChangeText={(v) => { setNext(v); setErrors((e) => ({ ...e, next: null })); }}
            show={show.next}
            onToggle={() => toggle("next")}
            error={errors.next}
          />
          <Field
            label="Yeni Şifre Tekrar"
            value={confirm}
            onChangeText={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: null })); }}
            show={show.confirm}
            onToggle={() => toggle("confirm")}
            error={errors.confirm}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-brand-red rounded-lg py-4 items-center mt-2"
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-sans-semibold text-sm">
                Şifreyi Güncelle
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
