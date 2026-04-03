import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./adminSlice";
import authReducer from "./authSlice";
import productReducer from "./productSlice";
import notificationReducer from "./notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    product: productReducer,
    notification: notificationReducer,
  },
});
