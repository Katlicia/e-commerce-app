import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getUserAddresses,
  addUserAddress,
  editUserAddress,
} from "@mobile/shared/redux/userSlice";
import { getCargos } from "@mobile/shared/redux/cargoSlice";
import {
  createOrder,
  createPayment,
  resetOrderState,
} from "@mobile/shared/redux/orderSlice";
import { clearCartLocal } from "@mobile/shared/redux/cartSlice";
import { fmt } from "@mobile/shared/utils/format";
import AddressModal from "../components/AddressModal";

function RadioDot({ active }) {
  return (
    <View
      className={`w-4 h-4 rounded-full border-2 items-center justify-center ${
        active ? "border-primary" : "border-border-input"
      }`}
    >
      {active && <View className="w-2 h-2 rounded-full bg-primary" />}
    </View>
  );
}

export default function CheckoutScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const { addresses: apiAddresses } = useSelector((state) => state.user);
  const { cart, totalAmount, appliedCoupon } = useSelector(
    (state) => state.cart,
  );
  const { cargos } = useSelector((state) => state.cargo);
  const { freeShippingThreshold = 500 } = useSelector(
    (state) => state.taxSettings,
  );
  const {
    loading: orderLoading,
    success: orderSuccess,
    error: orderError,
    currentOrder,
  } = useSelector((state) => state.order);

  const couponDiscount = appliedCoupon?.discount ?? 0;
  const finalAmount = Math.max(0, totalAmount - couponDiscount);
  const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);

  const [productsExpanded, setProductsExpanded] = useState(false);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [selectedKargo, setSelectedKargo] = useState(null);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [selectedBillingIdx, setSelectedBillingIdx] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("kredi");
  const [selectedInstallment, setSelectedInstallment] = useState(0);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [addressError, setAddressError] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user) dispatch(getUserAddresses());
  }, [user]);

  useEffect(() => {
    dispatch(getCargos());
  }, []);

  useEffect(() => {
    if (cargos.length > 0 && selectedKargo === null) {
      setSelectedKargo(cargos[0]._id);
    }
  }, [cargos]);

  useEffect(() => {
    if (orderSuccess) {
      dispatch(clearCartLocal());
      dispatch(resetOrderState());
      navigation.replace("OrderSuccess", {
        orderNo: currentOrder?.orderNo,
        paymentMethod: selectedPayment,
        success: true,
      });
    }
    if (orderError) {
      dispatch(resetOrderState());
      navigation.replace("OrderSuccess", { success: false });
    }
  }, [orderSuccess, orderError]);

  const handleSaveAddress = (values) => {
    if (editingIndex !== null) {
      dispatch(editUserAddress({ index: editingIndex, ...values }));
    } else {
      dispatch(addUserAddress(values)).then(() => dispatch(getUserAddresses()));
    }
    setAddressModalVisible(false);
    setEditingAddress(null);
    setEditingIndex(null);
  };

  const openEditAddress = (idx) => {
    setEditingAddress(apiAddresses[idx]);
    setEditingIndex(idx);
    setAddressModalVisible(true);
  };

  const handleExpireInput = (val) => {
    let v = val.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
    setExpirationDate(v);
  };

  const handleSubmit = () => {
    if (apiAddresses.length === 0) {
      setAddressError("Lütfen en az bir adres ekleyiniz");
      return;
    }
    setAddressError("");

    const errors = {};
    if (selectedPayment === "kredi") {
      if (!cardNumber || !/^\d{16}$/.test(cardNumber))
        errors.cardNumber = "16 haneli kart numarası giriniz";
      if (!cardHolder) errors.cardHolder = "Kart sahibi adı zorunludur";
      if (
        !expirationDate ||
        !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expirationDate)
      )
        errors.expirationDate = "AA/YY formatında giriniz";
      if (!cvv || !/^\d{3}$/.test(cvv)) errors.cvv = "CVV 3 haneli olmalıdır";
    }
    if (!agreeToTerms)
      errors.agreeToTerms = "Sözleşmeleri kabul etmeniz gerekmektedir";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const items = cart.map((item) => ({
      product: item._id || item.id,
      price: item.discountedPrice || item.price,
      quantity: item.quantity,
      selectedVariants: item.selectedVariants ?? {},
      ...(item.skuId ? { skuId: item.skuId } : {}),
    }));

    const selectedCargoData = cargos.find((c) => c._id === selectedKargo);
    const effectiveCargoPrice =
      totalAmount >= freeShippingThreshold ? 0 : selectedCargoData?.cargoPrice;

    const orderPayload = {
      items,
      totalAmount: finalAmount,
      address: apiAddresses[selectedAddressIdx],
      cargoCompany: selectedCargoData?.companyName,
      cargoPrice: effectiveCargoPrice,
      ...(!sameAsBilling && {
        billingAddress: apiAddresses[selectedBillingIdx],
      }),
      ...(appliedCoupon && { coupon: appliedCoupon }),
    };

    if (selectedPayment === "kredi") {
      dispatch(
        createPayment({
          ...orderPayload,
          cardNumber,
          cardHolder,
          expirationDate,
          cvv,
          installment: selectedInstallment + 1,
        }),
      );
    } else {
      dispatch(createOrder(orderPayload));
    }
  };

  const selectedCargoData = cargos.find((c) => c._id === selectedKargo);
  const effectiveCargoPrice =
    totalAmount >= freeShippingThreshold ? 0 : selectedCargoData?.cargoPrice;

  const installments = [
    { label: "Tek Çekim", multiplier: 1 },
    { label: "2 Taksit", multiplier: 1.077 },
    { label: "3 Taksit", multiplier: 1.1 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      {/* Header */}
      <View className="bg-white flex-row items-center px-4 py-3 border-b border-border-subtle">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#212529" />
        </TouchableOpacity>
        <Text className="text-lg text-center font-sans-bold text-text-primary flex-1">
          Kasa
        </Text>
      </View>

      <AddressModal
        visible={addressModalVisible}
        initial={editingAddress}
        onSave={handleSaveAddress}
        onClose={() => {
          setAddressModalVisible(false);
          setEditingAddress(null);
          setEditingIndex(null);
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Products Collapsible */}
        <View className="bg-white mx-4 mt-4 rounded-xl border border-border-subtle overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-3"
            onPress={() => setProductsExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Text className="text-md font-sans-semibold text-text-primary">
              Sepetimdeki Ürünler ({totalQuantity})
            </Text>
            <Ionicons
              name={productsExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color="#6c757d"
            />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 12,
              gap: 10,
            }}
          >
            {cart.flatMap((item) =>
              Array.from({ length: item.quantity }, (_, i) => (
                <View
                  key={`${item._id || item.id}-${item.skuId ?? "no-sku"}-${i}`}
                  className="items-center"
                >
                  <View className="relative">
                    <Image
                      source={{ uri: item.images?.[0]?.url }}
                      style={{ width: 64, height: 64 }}
                      className="rounded-lg bg-bg-faint border border-border-subtle"
                      resizeMode="contain"
                    />
                  </View>
                  <Text className="text-xs text-text-secondary mt-1">
                    {fmt(item.discountedPrice || item.price)}₺
                  </Text>
                </View>
              )),
            )}
          </ScrollView>

          {productsExpanded && (
            <View className="border-t border-border-subtle px-4 pt-3 pb-2 gap-3">
              {cart.map((item) => (
                <View
                  key={`${item._id || item.id}-${item.skuId ?? ""}`}
                  className="flex-row gap-3 items-center"
                >
                  <Image
                    source={{ uri: item.images?.[0]?.url }}
                    style={{ width: 52, height: 52 }}
                    className="rounded-lg bg-bg-faint border border-border-subtle"
                    resizeMode="contain"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-sm text-text-primary font-sans-medium"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    {item.selectedVariants &&
                      Object.keys(item.selectedVariants).length > 0 && (
                        <View className="flex-row flex-wrap gap-1 mt-0.5">
                          {Object.entries(item.selectedVariants).map(
                            ([label, value]) => (
                              <View
                                key={label}
                                className="bg-bg-light rounded px-1.5 py-0.5"
                              >
                                <Text className="text-2xs text-text-secondary">
                                  {label}: {value}
                                </Text>
                              </View>
                            ),
                          )}
                        </View>
                      )}
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-sans-bold text-text-primary">
                      {fmt(item.discountedPrice || item.price)}₺
                    </Text>
                    <Text className="text-xs text-text-secondary">
                      x{item.quantity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Delivery */}
        <View className="bg-white mx-4 mt-3 rounded-xl border border-border-subtle px-4 py-3">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-md font-sans-bold text-text-primary">
              TESLİMAT
            </Text>
            {user && (
              <TouchableOpacity
                onPress={() => {
                  setEditingAddress(null);
                  setEditingIndex(null);
                  setAddressModalVisible(true);
                }}
              >
                <Text className="text-primary text-sm font-sans-semibold">
                  Adres Ekle
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {addressError ? (
            <Text className="text-price-red text-xs mb-2">{addressError}</Text>
          ) : null}

          {!user ? (
            <TouchableOpacity
              className="border border-border-input rounded-xl py-3 items-center"
              onPress={() => navigation.navigate("Login")}
            >
              <Text className="text-primary font-sans-semibold text-sm">
                Adres eklemek için giriş yapın
              </Text>
            </TouchableOpacity>
          ) : apiAddresses.length === 0 ? (
            <Text className="text-text-muted text-sm">
              Kayıtlı adresiniz yok.
            </Text>
          ) : (
            <View className="gap-2">
              {apiAddresses.map((addr, idx) => (
                <TouchableOpacity
                  key={idx}
                  className={`border rounded-xl px-3 py-2.5 flex-row items-start justify-between ${
                    selectedAddressIdx === idx
                      ? "border-primary bg-primary-light"
                      : "border-border-input"
                  }`}
                  onPress={() => setSelectedAddressIdx(idx)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start gap-2.5 flex-1">
                    <View className="mt-0.5">
                      <RadioDot active={selectedAddressIdx === idx} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-sans-semibold text-text-primary">
                        {addr.fullName}
                      </Text>
                      <Text className="text-xs text-text-secondary mt-0.5">
                        {addr.city} / {addr.district}
                      </Text>
                      <Text className="text-xs text-text-primary mt-0.5">
                        {addr.address}
                      </Text>
                      <Text className="text-xs text-text-muted mt-0.5">
                        {addr.phone}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    className="ml-2 p-1"
                    onPress={(e) => {
                      e.stopPropagation();
                      openEditAddress(idx);
                    }}
                  >
                    <Ionicons name="create-outline" size={16} color="#6c757d" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Billing Address */}
        {user && apiAddresses.length > 0 && (
          <View className="bg-white mx-4 mt-3 rounded-xl border border-border-subtle px-4 py-3">
            <Text className="text-md font-sans-bold text-text-primary mb-3">
              FATURA ADRESİ
            </Text>
            <TouchableOpacity
              className={`border rounded-xl px-3 py-2.5 flex-row items-center gap-2.5 mb-2 ${
                sameAsBilling
                  ? "border-primary bg-primary-light"
                  : "border-border-input"
              }`}
              onPress={() => setSameAsBilling(true)}
              activeOpacity={0.7}
            >
              <RadioDot active={sameAsBilling} />
              <Text className="text-sm text-text-primary">
                Teslimat adresiyle aynı
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`border rounded-xl px-3 py-2.5 flex-row items-center gap-2.5 ${
                !sameAsBilling
                  ? "border-primary bg-primary-light"
                  : "border-border-input"
              }`}
              onPress={() => setSameAsBilling(false)}
              activeOpacity={0.7}
            >
              <RadioDot active={!sameAsBilling} />
              <Text className="text-sm text-text-primary">
                Farklı fatura adresi kullan
              </Text>
            </TouchableOpacity>
            {!sameAsBilling && (
              <View className="gap-2 mt-2">
                {apiAddresses.map((addr, idx) => (
                  <TouchableOpacity
                    key={idx}
                    className={`border rounded-xl px-3 py-2.5 flex-row items-start gap-2.5 ${
                      selectedBillingIdx === idx
                        ? "border-primary bg-primary-light"
                        : "border-border-input"
                    }`}
                    onPress={() => setSelectedBillingIdx(idx)}
                    activeOpacity={0.7}
                  >
                    <View className="mt-0.5">
                      <RadioDot active={selectedBillingIdx === idx} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-sans-semibold text-text-primary">
                        {addr.fullName}
                      </Text>
                      <Text className="text-xs text-text-secondary mt-0.5">
                        {addr.city} / {addr.district}
                      </Text>
                      <Text className="text-xs text-text-primary mt-0.5">
                        {addr.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Cargo */}
        <View className="bg-white mx-4 mt-3 rounded-xl border border-border-subtle px-4 py-3">
          <Text className="text-md font-sans-bold text-text-primary mb-3">
            KARGO
          </Text>
          {cargos.length === 0 ? (
            <ActivityIndicator size="small" color="#ff7700" />
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {cargos.map((k) => (
                <TouchableOpacity
                  key={k._id}
                  className={`border rounded-md px-3 py-2.5 flex-row items-center gap-2 ${
                    selectedKargo === k._id
                      ? "border-primary bg-primary-light"
                      : "border-border-input"
                  }`}
                  style={{ flexBasis: "30%", flexGrow: 1 }}
                  onPress={() => setSelectedKargo(k._id)}
                  activeOpacity={0.7}
                >
                  <RadioDot active={selectedKargo === k._id} />
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-sm font-sans-semibold text-text-primary"
                      numberOfLines={1}
                    >
                      {k.companyName}
                    </Text>
                    {totalAmount >= freeShippingThreshold ? (
                      <Text className="text-xs text-discount-green font-sans-semibold">
                        Ücretsiz
                      </Text>
                    ) : (
                      <Text className="text-xs text-text-secondary">
                        {fmt(k.cargoPrice)}₺
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Payment */}
        <View className="bg-white mx-4 mt-3 rounded-xl border border-border-subtle px-4 py-3">
          <Text className="text-md font-sans-bold text-text-primary mb-3">
            ÖDEME
          </Text>
          <View className="gap-2">
            {/* Credit Card */}
            <TouchableOpacity
              className={`border rounded-xl overflow-hidden ${
                selectedPayment === "kredi"
                  ? "border-primary"
                  : "border-border-input"
              }`}
              onPress={() => setSelectedPayment("kredi")}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between px-3 py-2.5">
                <View className="flex-row items-center gap-2.5">
                  <RadioDot active={selectedPayment === "kredi"} />
                  <Text className="text-sm font-sans-semibold text-text-primary">
                    Kredi Kartı
                  </Text>
                </View>
                <Ionicons name="card-outline" size={20} color="#6c757d" />
              </View>

              {selectedPayment === "kredi" && (
                <View className="px-3 pb-3 gap-2 border-t border-border-subtle pt-3">
                  <TextInput
                    className="border border-border-input rounded-lg px-3 py-2.5 text-base text-text-primary"
                    placeholder="Kart Numarası"
                    keyboardType="number-pad"
                    maxLength={16}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                  />
                  {formErrors.cardNumber ? (
                    <Text className="text-price-red text-xs -mt-1">
                      {formErrors.cardNumber}
                    </Text>
                  ) : null}

                  <TextInput
                    className="border border-border-input rounded-lg px-3 py-2.5 text-base text-text-primary"
                    placeholder="Kart Üzerindeki İsim"
                    value={cardHolder}
                    onChangeText={setCardHolder}
                  />
                  {formErrors.cardHolder ? (
                    <Text className="text-price-red text-xs -mt-1">
                      {formErrors.cardHolder}
                    </Text>
                  ) : null}

                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <TextInput
                        className="border border-border-input rounded-lg px-3 py-2.5 text-base text-text-primary"
                        placeholder="AA/YY"
                        maxLength={5}
                        keyboardType="number-pad"
                        value={expirationDate}
                        onChangeText={handleExpireInput}
                      />
                      {formErrors.expirationDate ? (
                        <Text className="text-price-red text-xs mt-0.5">
                          {formErrors.expirationDate}
                        </Text>
                      ) : null}
                    </View>
                    <View className="flex-1">
                      <TextInput
                        className="border border-border-input rounded-lg px-3 py-2.5 text-base text-text-primary"
                        placeholder="CVV"
                        maxLength={3}
                        keyboardType="number-pad"
                        secureTextEntry
                        value={cvv}
                        onChangeText={setCvv}
                      />
                      {formErrors.cvv ? (
                        <Text className="text-price-red text-xs mt-0.5">
                          {formErrors.cvv}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <Text className="text-sm font-sans-semibold text-text-primary mt-1">
                    Taksit Seçenekleri
                  </Text>
                  <View className="gap-2">
                    {installments.map((opt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className={`border rounded-xl px-3 py-2.5 flex-row items-center gap-2.5 ${
                          selectedInstallment === idx
                            ? "border-primary bg-primary-light"
                            : "border-border-input"
                        }`}
                        onPress={() => setSelectedInstallment(idx)}
                        activeOpacity={0.7}
                      >
                        <RadioDot active={selectedInstallment === idx} />
                        <Text className="text-sm text-text-primary flex-1">
                          {opt.label}
                        </Text>
                        <Text className="text-sm font-sans-bold text-text-primary">
                          {fmt(finalAmount * opt.multiplier)}₺
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Havale/EFT */}
            <TouchableOpacity
              className={`border rounded-xl px-3 py-2.5 flex-row items-center justify-between ${
                selectedPayment === "havale"
                  ? "border-primary bg-primary-light"
                  : "border-border-input"
              }`}
              onPress={() => setSelectedPayment("havale")}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-2.5">
                <RadioDot active={selectedPayment === "havale"} />
                <Text className="text-sm font-sans-semibold text-text-primary">
                  Havale / EFT
                </Text>
              </View>
              <View className="bg-discount-blue-light rounded-full px-2.5 py-1">
                <Text className="text-discount-blue text-xs font-sans-bold">
                  %5 İndirim
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View className="bg-white mx-4 mt-3 rounded-xl border border-border-subtle px-4 py-3 gap-2">
          <Text className="text-md font-sans-bold text-text-primary mb-1">
            SİPARİŞ ÖZETİ
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-sm text-text-secondary">
              Ürünler ({totalQuantity})
            </Text>
            <Text className="text-sm text-text-primary font-sans-medium">
              {fmt(totalAmount)}₺
            </Text>
          </View>
          {couponDiscount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-text-secondary">
                Kupon İndirimi
              </Text>
              <Text className="text-sm text-discount-green font-sans-medium">
                -{fmt(couponDiscount)}₺
              </Text>
            </View>
          )}
          <View className="flex-row justify-between">
            <Text className="text-sm text-text-secondary">Kargo</Text>
            {effectiveCargoPrice === 0 ? (
              <Text className="text-sm text-discount-green font-sans-semibold">
                Ücretsiz
              </Text>
            ) : effectiveCargoPrice != null ? (
              <Text className="text-sm text-text-primary font-sans-medium">
                {fmt(effectiveCargoPrice)}₺
              </Text>
            ) : (
              <Text className="text-sm text-text-muted">Seçilmedi</Text>
            )}
          </View>
          <View className="h-px bg-border-subtle my-1" />
          <View className="flex-row justify-between">
            <Text className="text-md font-sans-bold text-text-primary">
              Toplam
            </Text>
            <Text className="text-md font-sans-bold text-primary">
              {fmt(finalAmount + (effectiveCargoPrice ?? 0))}₺
            </Text>
          </View>
        </View>

        {/* Terms */}
        <View className="mx-4 mt-3">
          <TouchableOpacity
            className="flex-row items-center gap-2.5"
            onPress={() => setAgreeToTerms((v) => !v)}
            activeOpacity={0.7}
          >
            <View
              className={`w-5 h-5 rounded border-2 items-center justify-center ${
                agreeToTerms
                  ? "bg-primary border-primary"
                  : "border-border-input bg-white"
              }`}
            >
              {agreeToTerms && (
                <Ionicons name="checkmark" size={12} color="white" />
              )}
            </View>
            <Text className="text-sm text-text-secondary flex-1">
              <Text className="text-text-primary font-sans-semibold">
                Gizlilik Sözleşmesini
              </Text>{" "}
              ve{" "}
              <Text className="text-text-primary font-sans-semibold">
                Satış Sözleşmesini
              </Text>{" "}
              okudum, onaylıyorum.
            </Text>
          </TouchableOpacity>
          {formErrors.agreeToTerms ? (
            <Text className="text-price-red text-xs mt-1">
              {formErrors.agreeToTerms}
            </Text>
          ) : null}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className="bg-primary mx-4 mt-4 rounded-xl py-4 items-center"
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={orderLoading}
        >
          {orderLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-sans-bold text-md">
              Siparişi Tamamla
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
