import { configureStore } from "@reduxjs/toolkit";
import { productSlice } from "./productSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    product: productSlice.reducer,
    auth: authReducer,
  },
});
