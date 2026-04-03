import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import generalReducer from "./generalSlice";
import userReducer from "./userSlice";
import favouriteReducer from "./favouriteSlice";
import orderReducer from "./orderSlice";
import cargoReducer from "./cargoSlice";
import taxSettingsReducer from "./taxSettingsSlice";

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
  },
});
