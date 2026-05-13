import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabs from "./MainTabs";
import SearchScreen from "../screens/SearchScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrdersScreen from "../screens/OrdersScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import FavouritesScreen from "../screens/FavouritesScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import EmailLoginScreen from "../screens/EmailLoginScreen";
import PhoneRegisterScreen from "../screens/PhoneRegisterScreen";
import CampaignDetailScreen from "../screens/CampaignDetailScreen";
import OrderSuccessScreen from "../screens/OrderSuccessScreen";
import AccountEditScreen from "../screens/AccountEditScreen";
import AddressEditScreen from "../screens/AddressEditScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import ListsScreen from "../screens/ListsScreen";
import ListDetailScreen from "../screens/ListDetailScreen";
import ListedProductsScreen from "../screens/ListedProductsScreen";
import QuestionsScreen from "../screens/QuestionsScreen";

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
      <Stack.Screen name="ProductList" component={SearchScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="AccountEdit" component={AccountEditScreen} />
      <Stack.Screen name="AddressEdit" component={AddressEditScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Favourites" component={FavouritesScreen} />
      <Stack.Screen name="Lists" component={ListsScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen name="ListedProducts" component={ListedProductsScreen} />
      <Stack.Screen name="Questions" component={QuestionsScreen} />
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
        name="EmailLogin"
        component={EmailLoginScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="PhoneRegister"
        component={PhoneRegisterScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
