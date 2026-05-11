import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons";
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
import ScreenHeader from "../components/ScreenHeader";

const BANKS = [
  {
    logo: require("../assets/Checkout/isbank.png"),
    logoStyle: { width: 100, height: 32 },
    name: "LİSTENSİ OFİS MALZEMELERİ TİC.LTD.ŞTİ",
    iban: "TR21 0006 4000 0012 4003 9106 80",
  },
  {
    logo: require("../assets/Checkout/vakifbank.png"),
    logoStyle: { width: 130, height: 32 },
    name: "LİSTENSİ OFİS MALZEMELERİ TİC.LTD.ŞTİ",
    iban: "TR11 0001 5001 5800 7314 7080 52",
  },
];

function copyToClipboard(text) {
  Clipboard.setStringAsync(text);
  if (Platform.OS === "android") {
    ToastAndroid.show("Kopyalandı", ToastAndroid.SHORT);
  } else {
    Alert.alert("Kopyalandı", text);
  }
}

const ITEM_WIDTH = 80;
const ITEM_GAP = 10;
const ITEM_SLOT = ITEM_WIDTH + ITEM_GAP;

function ProductsSection({
  cart,
  totalQuantity,
  fmt,
  productsExpanded,
  setProductsExpanded,
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get("window").width,
  );

  const itemsPerPage = Math.floor((containerWidth - 32) / ITEM_SLOT);
  const totalPages =
    itemsPerPage > 0 ? Math.ceil(cart.length / itemsPerPage) : 1;
  const showDots = totalPages > 1;

  return (
    <View
      className="mt-4 mx-4"
      style={{ borderWidth: 1, borderColor: "#BDBDBD", borderRadius: 8 }}
    >
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

      {productsExpanded && (
        <View
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          className="py-3"
          style={{ overflow: "visible" }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 4,
              gap: ITEM_GAP,
            }}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const page = Math.round(x / (itemsPerPage * ITEM_SLOT || 1));
              setCurrentPage(page);
            }}
            scrollEventThrottle={16}
          >
            {cart.map((item) => (
              <View
                key={`${item._id || item.id}-${item.skuId ?? "no-sku"}`}
                className="items-center"
                style={{ overflow: "visible" }}
              >
                <View style={{ overflow: "visible" }}>
                  <Image
                    source={{ uri: item.images?.[0]?.url }}
                    style={{ width: ITEM_WIDTH, height: ITEM_WIDTH }}
                    className="rounded-lg bg-bg-faint border border-border-subtle"
                    resizeMode="contain"
                  />
                  {item.quantity > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        backgroundColor: "#F5C518",
                        borderRadius: 999,
                        width: 20,
                        height: 20,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#212529",
                        }}
                      >
                        {item.quantity}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-text-secondary mt-1">
                  {fmt(item.discountedPrice || item.price)}₺
                </Text>
              </View>
            ))}
          </ScrollView>

          {showDots && (
            <View className="flex-row justify-center gap-1.5 mt-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: i === currentPage ? "#212529" : "#D1D1D1",
                  }}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function RadioDot({ active }) {
  return (
    <View
      className={`w-4 h-4 rounded-full border-2 ${
        active ? "border-brand-red bg-brand-red" : "border-brand-red bg-white"
      }`}
    />
  );
}

export default function CheckoutScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const { addresses: apiAddresses } = useSelector((state) => state.user);
  const { cart, totalAmount, appliedCoupon, bundleDiscounts } = useSelector(
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
  const bundleDiscountAmount = +bundleDiscounts
    .reduce((total, bundle) => {
      const bundleSubtotal = bundle.requiredProducts.reduce((sum, req) => {
        const item = cart.find((c) => (c._id || c.id) === req.productId);
        if (!item) return sum;
        return (
          sum + parseFloat(item.discountedPrice || item.price) * req.quantity
        );
      }, 0);
      return total + bundleSubtotal * (bundle.percent / 100);
    }, 0)
    .toFixed(2);
  const finalAmount = Math.max(
    0,
    totalAmount - couponDiscount - bundleDiscountAmount,
  );
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
  const [summaryExpanded, setSummaryExpanded] = useState(false);

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
      paymentMethod: selectedPayment,
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

  const insets = useSafeAreaInsets();

  const installments = [
    { label: "Tek Çekim", multiplier: 1 },
    { label: "2 Taksit", multiplier: 1.077 },
    { label: "3 Taksit", multiplier: 1.1 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Kasa" />

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
        contentContainerStyle={{ paddingBottom: insets.bottom / 2 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Products Collapsible */}
        <ProductsSection
          cart={cart}
          totalQuantity={totalQuantity}
          fmt={fmt}
          productsExpanded={productsExpanded}
          setProductsExpanded={setProductsExpanded}
        />

        {/* Delivery */}
        <View className="mt-3 px-4 py-3">
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
                  className="px-3 py-3 flex-row items-start"
                  style={{
                    borderWidth: 1,
                    borderColor:
                      selectedAddressIdx === idx ? "#E5E5E5" : "#BDBDBD",
                    borderRadius: 8,
                    ...(selectedAddressIdx === idx && {
                      backgroundColor: "#F2F2F2",
                    }),
                  }}
                  onPress={() => setSelectedAddressIdx(idx)}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-4 h-4 rounded-full border-2 items-center justify-center mr-3 mt-1 ${
                      selectedAddressIdx === idx
                        ? "border-brand-red bg-brand-red"
                        : "border-brand-red bg-white"
                    }`}
                  />
                  <View className="flex-1">
                    <Text className="text-md font-sans-semibold text-text-primary">
                      {addr.addressName || addr.fullName}
                      {idx === 0 ? " (Varsayılan)" : ""}
                    </Text>
                    <Text className="text-sm font-sans-medium">
                      {addr.address} {addr.district}/
                      {String(addr.city).toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="ml-2 p-1"
                    onPress={(e) => {
                      e.stopPropagation();
                      openEditAddress(idx);
                    }}
                  >
                    <Feather name="edit-2" size={18} color="#6c757d" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="flex-row items-center justify-end gap-2 mt-1"
                onPress={() => setSameAsBilling((v) => !v)}
                activeOpacity={0.7}
              >
                <View
                  className={`w-4 h-4 ${
                    sameAsBilling ? "bg-brand-red" : "bg-border-input"
                  }`}
                  style={{ borderRadius: 3 }}
                />
                <Text className="text-sm text-text-secondary">
                  Fatura adresim teslimat adresi ile aynı
                </Text>
              </TouchableOpacity>

              {!sameAsBilling && (
                <View className="gap-2 mt-1">
                  {apiAddresses.map((addr, idx) => (
                    <TouchableOpacity
                      key={idx}
                      className="px-3 py-3 flex-row items-start"
                      style={{
                        borderWidth: 1,
                        borderColor:
                          selectedBillingIdx === idx ? "#E5E5E5" : "#BDBDBD",
                        borderRadius: 8,
                        ...(selectedBillingIdx === idx && {
                          backgroundColor: "#F2F2F2",
                        }),
                      }}
                      onPress={() => setSelectedBillingIdx(idx)}
                      activeOpacity={0.7}
                    >
                      <View
                        className={`w-4 h-4 rounded-full border-2 items-center justify-center mr-3 mt-1 ${
                          selectedBillingIdx === idx
                            ? "border-brand-red bg-brand-red"
                            : "border-brand-red bg-white"
                        }`}
                      />
                      <View className="flex-1">
                        <Text className="text-md font-sans-semibold text-text-primary">
                          {addr.addressName || addr.fullName}
                          {idx === 0 ? " (Varsayılan)" : ""}
                        </Text>
                        <Text className="text-sm font-sans-medium">
                          {addr.address} {addr.district}/
                          {String(addr.city).toUpperCase()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Cargo */}
        <View className="mt-3 px-4 py-3">
          <Text className="text-md font-sans-bold text-text-primary mb-3">
            KARGO
          </Text>
          {cargos.length === 0 ? (
            <ActivityIndicator size="small" color="#ff7700" />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {cargos.map((k) => (
                <TouchableOpacity
                  key={k._id}
                  className="px-3 py-2.5 flex-row items-start gap-2"
                  style={{
                    borderWidth: 1,
                    borderColor:
                      selectedKargo === k._id ? "#E5E5E5" : "#BDBDBD",
                    borderRadius: 8,
                    ...(selectedKargo === k._id && {
                      backgroundColor: "#F2F2F2",
                    }),
                  }}
                  onPress={() => setSelectedKargo(k._id)}
                  activeOpacity={0.7}
                >
                  <View className="mt-0.5">
                    <RadioDot active={selectedKargo === k._id} />
                  </View>
                  <View>
                    <Text className="text-sm text-text-primary">
                      {k.companyName}
                    </Text>
                    {totalAmount >= freeShippingThreshold ? (
                      <Text className="text-xs text-discount-green font-sans-semibold">
                        Ücretsiz
                      </Text>
                    ) : (
                      <Text className="text-xs">{fmt(k.cargoPrice)}₺</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Payment */}
        <View className="mt-3 px-4 py-3">
          <Text className="text-md font-sans-bold text-text-primary mb-3">
            ÖDEME
          </Text>
          <View className="gap-3">
            {/* Credit Card */}
            <TouchableOpacity
              className={`border rounded-sm overflow-hidden border-border-input`}
              onPress={() => setSelectedPayment("kredi")}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between px-3 py-3">
                <View className="flex-row items-center gap-2.5">
                  <RadioDot active={selectedPayment === "kredi"} />
                  <Text className="text-md font-sans-semibold text-text-primary py-3">
                    Kredi Kartı
                  </Text>
                </View>
              </View>

              {selectedPayment === "kredi" && (
                <View className="px-10 pb-3 gap-2 pt-3">
                  <TextInput
                    className="border border-border-input rounded-sm px-3 py-3 text-base text-text-primary"
                    placeholder="Kart Numarası"
                    placeholderTextColor="#818181"
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
                    className="border border-border-input rounded-sm px-3 py-3 text-base text-text-primary"
                    placeholder="Kart Üzerindeki İsim"
                    placeholderTextColor="#818181"
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
                        className="border border-border-input rounded-sm px-3 py-3 text-base text-text-primary"
                        placeholder="Ay/Yıl"
                        placeholderTextColor="#818181"
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
                        className="border border-border-input rounded-sm px-3 py-3 text-base text-text-primary"
                        placeholder="CVV"
                        placeholderTextColor="#818181"
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
                        className={`border rounded-sm px-3 py-2.5 flex-row items-center gap-2.5 ${
                          selectedInstallment === idx
                            ? "border-primary bg-primary-light"
                            : "border-border-input"
                        }`}
                        onPress={() => setSelectedInstallment(idx)}
                        activeOpacity={0.7}
                      >
                        <RadioDot active={selectedInstallment === idx} />
                        <Text className="text-md font-sans-semibold text-text-primary flex-1 py-2">
                          {opt.label}
                        </Text>
                        <Text className="text-md font-sans-bold text-text-primary">
                          {fmt((finalAmount + (effectiveCargoPrice ?? 0)) * opt.multiplier)}₺
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Havale/EFT */}
            <View className={`border rounded-sm border-border-input`}>
              <TouchableOpacity
                className="px-3 py-2.5 flex-row items-center justify-between"
                onPress={() => setSelectedPayment("havale")}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2.5">
                  <RadioDot active={selectedPayment === "havale"} />
                  <Text className="text-md font-sans-medium text-text-primary py-3">
                    Havale / EFT
                  </Text>
                </View>
              </TouchableOpacity>

              {selectedPayment === "havale" && (
                <View className="px-3 pb-4 gap-3">
                  {BANKS.map((bank, index) => (
                    <View key={index} className="px-2 py-4 gap-3">
                      <Image
                        source={bank.logo}
                        style={bank.logoStyle}
                        resizeMode="contain"
                      />
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-sans flex-1 mr-2">
                          {bank.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(bank.name)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Image
                            source={require("../assets/Checkout/copy.png")}
                            style={{ width: 18, height: 18 }}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-sans flex-1 mr-2">
                          {bank.iban}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            copyToClipboard(bank.iban.replace(/\s/g, ""))
                          }
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Image
                            source={require("../assets/Checkout/copy.png")}
                            style={{ width: 18, height: 18 }}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Terms */}
        <View className="mt-3">
          <TouchableOpacity
            className="flex-row items-start px-4 gap-2"
            onPress={() => setAgreeToTerms((v) => !v)}
            activeOpacity={0.7}
          >
            <View
              className={`w-4 h-4 ${
                agreeToTerms ? "bg-brand-red" : "bg-border-input"
              }`}
              style={{ borderRadius: 3, marginTop: 3 }}
            />
            <Text className="text-md">
              <Text className="text-text-primary font-sans-semibold">
                Gizlilik Sözleşmesini
              </Text>{" "}
              ve{" "}
              <Text className="text-text-primary font-sans-semibold">
                Satış Sözleşmesini
              </Text>{" "}
              {"\n"}okudum, onaylıyorum.
            </Text>
          </TouchableOpacity>
          {formErrors.agreeToTerms ? (
            <Text className="text-price-red text-xs mt-1 px-4">
              {formErrors.agreeToTerms}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom summary bar */}
      <View
        style={{
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E1E1E1",
        }}
      >
        {summaryExpanded && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
              gap: 6,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 13 }}>Ürünler ({totalQuantity})</Text>
              <Text style={{ fontSize: 13, fontWeight: "500" }}>
                {fmt(totalAmount)}₺
              </Text>
            </View>
            {couponDiscount > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 13 }}>Kupon İndirimi</Text>
                <Text
                  style={{ fontSize: 13, fontWeight: "500", color: "#2a9d4e" }}
                >
                  -{fmt(couponDiscount)}₺
                </Text>
              </View>
            )}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 13 }}>Kargo</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: effectiveCargoPrice === 0 ? "#2a9d4e" : "#212529",
                }}
              >
                {effectiveCargoPrice === 0
                  ? "Ücretsiz"
                  : effectiveCargoPrice != null
                    ? `${fmt(effectiveCargoPrice)}₺`
                    : "Seçilmedi"}
              </Text>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                marginVertical: 2,
              }}
            />
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 12 + insets.bottom,
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              flex: 1,
            }}
            onPress={() => setSummaryExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={summaryExpanded ? "chevron-down" : "chevron-up"}
              size={20}
            />
            <View>
              <Text style={{ fontSize: 13, fontWeight: "600" }}>
                Toplam Tutar
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "700" }}>
                {fmt(finalAmount + (effectiveCargoPrice ?? 0))}₺
              </Text>
              {effectiveCargoPrice === 0 && (
                <Text
                  style={{ fontSize: 12, fontWeight: "500", color: "#2a9d4e" }}
                >
                  Kargo Bedava
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#ff7700",
              borderRadius: 8,
              paddingHorizontal: 20,
              paddingVertical: 14,
            }}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={orderLoading}
          >
            {orderLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
                Onayla ve Bitir
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
