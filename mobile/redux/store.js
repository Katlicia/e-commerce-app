import { configureStore } from "@reduxjs/toolkit";
import productReducer from "@mobile/shared/redux/productSlice";
import authReducer from "@mobile/shared/redux/authSlice";
import cartReducer from "@mobile/shared/redux/cartSlice";
import generalReducer from "@mobile/shared/redux/generalSlice";
import userReducer from "@mobile/shared/redux/userSlice";
import favouriteReducer from "@mobile/shared/redux/favouriteSlice";
import orderReducer from "@mobile/shared/redux/orderSlice";
import cargoReducer from "@mobile/shared/redux/cargoSlice";
import taxSettingsReducer from "@mobile/shared/redux/taxSettingsSlice";
import bannerReducer from "@mobile/shared/redux/bannerSlice";
import homeSectionReducer from "@mobile/shared/redux/homeSectionSlice";
import homeLayoutReducer from "@mobile/shared/redux/homeLayoutSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
    auth: authReducer,
    cart: cartReducer,
    general: generalReducer,
    user: userReducer,
    favourite: favouriteReducer,
    order: orderReducer,
    cargo: cargoReducer,
    taxSettings: taxSettingsReducer,
    banner: bannerReducer,
    homeSection: homeSectionReducer,
    homeLayout: homeLayoutReducer,
  },
});
