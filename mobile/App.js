import "./global.css";

import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { Provider, useDispatch, useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  configureAxios,
  setBearerToken,
  configureRefreshCallback,
} from "@mobile/shared/utils/axiosInstance";
import { configureStorage } from "@mobile/shared/utils/storage";
import { fetchMe, logoutUser } from "@mobile/shared/redux/authSlice";
import {
  fetchFavourites,
  hydrateFavouritesFromStorage,
} from "@mobile/shared/redux/favouriteSlice";
import {
  fetchCart,
  hydrateCartFromStorage,
} from "@mobile/shared/redux/cartSlice";
import { fetchLists } from "@mobile/shared/redux/listSlice";
import { store } from "./redux/store";
import AppNavigator from "./navigation/AppNavigator";
import { navigationRef } from "./navigation/navigationRef";

function getActiveRouteName(state) {
  if (!state) return null;
  const route = state.routes[state.index];
  if (route.state) return getActiveRouteName(route.state);
  return route.name;
}

configureAxios(process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.121:5000");
configureRefreshCallback(() => store.dispatch(logoutUser()));
configureStorage({
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
});

function AppContent() {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);
  const [currentRoute, setCurrentRoute] = useState(null);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setBearerToken(token);
      // refreshToken is read lazily by the axios interceptor via storage adapter

      const action = await dispatch(fetchMe());
      if (action.payload) {
        await dispatch(hydrateCartFromStorage());
        dispatch(fetchFavourites());
        dispatch(fetchCart());
        dispatch(fetchLists());
      } else {
        dispatch(hydrateFavouritesFromStorage());
        dispatch(hydrateCartFromStorage());
      }
    })();
  }, [dispatch]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer
        ref={navigationRef}
        onStateChange={(state) => setCurrentRoute(getActiveRouteName(state))}
        onReady={() =>
          setCurrentRoute(getActiveRouteName(navigationRef.getRootState()))
        }
      >
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
