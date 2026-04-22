import "./global.css";

import React from "react";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { configureAxios } from "@mobile/shared/utils/axiosInstance";
import { configureStorage } from "@mobile/shared/utils/storage";
import { store } from "./redux/store";
import { View, Text } from "react-native";

// Bootstrap platform-specific implementations
configureAxios(process.env.EXPO_PUBLIC_API_URL);
configureStorage({
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
});

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-2xl font-bold text-blue-600">
              Setup Complete!
            </Text>
            <Text className="text-gray-500 mt-2">
              NativeWind + Redux + Navigation ready.
            </Text>
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
      <Toast />
    </Provider>
  );
}
