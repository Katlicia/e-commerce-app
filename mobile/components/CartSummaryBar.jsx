import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { removeBundleDiscount } from "@mobile/shared/redux/cartSlice";
import { fmt } from "@mobile/shared/utils/format";

const smileIcon = require("../assets/Cart/smile.png");

function SummaryRow({ label, value, valueClass = "", icon, valueStyle }) {
  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center gap-1">
        <Text className="text-sm text-text-secondary">{label}</Text>
        {icon && (
          <Image
            source={icon}
            style={{ width: 14, height: 14 }}
            resizeMode="contain"
          />
        )}
      </View>
      <Text
        className={`font-medium text-text-primary ${valueClass}`}
        style={{ textAlign: "right", fontSize: 14, ...valueStyle }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function CartSummaryBar({ expanded = false, onToggle }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { cart, totalAmount, appliedCoupon, bundleDiscounts } = useSelector(
    (state) => state.cart,
  );
  const {
    freeShippingThreshold = 500,
    kdv1Rate = 0.01,
    kdv20Rate = 0.2,
  } = useSelector((state) => state.taxSettings);

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

  const totalDiscount = +cart
    .filter((item) => item.discountedPrice)
    .reduce(
      (sum, item) =>
        sum +
        (parseFloat(item.price) - parseFloat(item.discountedPrice)) *
          item.quantity,
      0,
    )
    .toFixed(2);

  const rawTotal = +(totalAmount + totalDiscount).toFixed(2);
  const kdv1 = +(totalAmount * kdv1Rate).toFixed(2);
  const kdv20 = +(totalAmount * kdv20Rate).toFixed(2);
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const finalTotal = Math.max(
    0,
    totalAmount - couponDiscount - bundleDiscountAmount,
  );
  const remaining = Math.max(freeShippingThreshold - totalAmount, 0);
  const freeShipping = remaining === 0;

  const ShippingBadge = () =>
    freeShipping ? (
      <View className="flex-row items-center gap-1.5 bg-success-light rounded-full px-3 py-1">
        <Text className="text-xs font-semibold text-discount-green">
          {`${Math.floor(freeShippingThreshold)}₺ geçtiniz kargo bedava`}
        </Text>
      </View>
    ) : (
      <View className="flex-row items-center gap-1 bg-success-light rounded-full px-3 py-1">
        <Text className="text-xs text-discount-green">
          <Text className="font-bold">{fmt(remaining)}</Text>
          <Text> TL daha eklerseniz</Text>
          <Text className="font-bold"> kargo ücretsiz!</Text>
        </Text>
      </View>
    );

  return (
    <View className="bg-white border-t border-border-subtle">
      {!expanded && (
        <View
          style={{
            position: "absolute",
            top: -35,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <ShippingBadge />
        </View>
      )}

      {expanded && (
        <>
          <View className="items-center pt-2.5 pb-1">
            <ShippingBadge />
          </View>

          <View className="px-11 pt-2 pb-2 gap-2">
            <SummaryRow label="Sipariş Tutarı" value={`${fmt(rawTotal)}₺`} />
            <SummaryRow label="KDV (%1)" value={`${fmt(kdv1)}₺`} />
            <SummaryRow label="KDV (%20)" value={`${fmt(kdv20)}₺`} />
            <SummaryRow
              label="Kargo Bedeli"
              value={
                freeShipping ? "Ücretsiz" : "Adrese göre\nhesaplanacaktır."
              }
              valueClass={
                freeShipping ? "text-discount-green" : "text-text-muted"
              }
              valueStyle={freeShipping ? undefined : { fontSize: 10 }}
            />
            {totalDiscount > 0 && (
              <SummaryRow
                label="İndirimler"
                icon={smileIcon}
                value={`-${fmt(totalDiscount)}₺`}
                valueClass="text-discount-green"
              />
            )}
            {couponDiscount > 0 && (
              <SummaryRow
                label={`Kupon (${appliedCoupon.code})`}
                value={`-${fmt(couponDiscount)}₺`}
                valueClass="text-discount-green"
              />
            )}
            {bundleDiscounts.map((bundle) => {
              const amount =
                +bundle.requiredProducts
                  .reduce((sum, req) => {
                    const item = cart.find(
                      (c) => (c._id || c.id) === req.productId,
                    );
                    if (!item) return sum;
                    return (
                      sum +
                      parseFloat(item.discountedPrice || item.price) *
                        req.quantity
                    );
                  }, 0)
                  .toFixed(2) *
                (bundle.percent / 100);
              return (
                <View
                  key={bundle.listId}
                  className="flex-row justify-between items-center"
                >
                  <View className="flex-row items-center gap-1 flex-1 mr-2">
                    <Ionicons name="list-outline" size={13} color="#2a9d4e" />
                    <Text
                      className="text-sm text-discount-green flex-1"
                      numberOfLines={1}
                    >
                      {bundle.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-sm font-medium text-discount-green">
                      -%{bundle.percent} (-{fmt(amount)}₺)
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        dispatch(removeBundleDiscount(bundle.listId))
                      }
                      hitSlop={8}
                    >
                      <Ionicons name="close-circle" size={16} color="#2a9d4e" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          <View className="h-px bg-border-subtle mx-4 mb-1" />
        </>
      )}

      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity
          className="flex-row items-center gap-2 flex-1"
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={expanded ? "chevron-down" : "chevron-up"}
            size={20}
            color="#212529"
          />
          <View>
            <View className="flex-column items-start">
              <Text className="text-sm font-semibold text-text-primary">
                Toplam Tutar
              </Text>
              <Text className="text-xl font-bold text-text-primary">
                {fmt(finalTotal)}₺
              </Text>
            </View>
            {freeShipping && (
              <Text className="text-sm font-medium text-discount-green">
                Kargo Bedava
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary rounded-md px-10 py-3.5"
          onPress={() => navigation.navigate("Checkout")}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-base">Ödeme Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
