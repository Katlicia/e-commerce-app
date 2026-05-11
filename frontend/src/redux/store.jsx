import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import generalReducer from "./generalSlice";
import userReducer from "./userSlice";
import favouriteReducer from "./favouriteSlice";
import listReducer from "./listSlice";
import orderReducer from "./orderSlice";
import cargoReducer from "./cargoSlice";
import taxSettingsReducer from "./taxSettingsSlice";
import bannerReducer from "./bannerSlice";
import homeSectionReducer from "./homeSectionSlice";
import homeLayoutReducer from "./homeLayoutSlice";
import questionReducer from "./questionSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
    auth: authReducer,
    cart: cartReducer,
    general: generalReducer,
    user: userReducer,
    favourite: favouriteReducer,
    list: listReducer,
    order: orderReducer,
    cargo: cargoReducer,
    taxSettings: taxSettingsReducer,
    banner: bannerReducer,
    homeSection: homeSectionReducer,
    homeLayout: homeLayoutReducer,
    question: questionReducer,
  },
});