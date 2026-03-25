import { configureStore, createReducer } from "@reduxjs/toolkit";
import { productSlice } from "./productSlice";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    product: productSlice.reducer,
    auth: authReducer,
    cart: cartReducer,
  },
});
