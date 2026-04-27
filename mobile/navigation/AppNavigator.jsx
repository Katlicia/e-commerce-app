import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabs from "./MainTabs";
import CategoryScreen from "../screens/CategoryScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import FavouritesScreen from "../screens/FavouritesScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import CampaignDetailScreen from "../screens/CampaignDetailScreen";
import OrderSuccessScreen from "../screens/OrderSuccessScreen";
import AccountEditScreen from "../screens/AccountEditScreen";
import AddressEditScreen from "../screens/AddressEditScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#ffffff" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ProductList" component={CategoryScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="AccountEdit" component={AccountEditScreen} />
      <Stack.Screen name="AddressEdit" component={AddressEditScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Favourites" component={FavouritesScreen} />
      <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
