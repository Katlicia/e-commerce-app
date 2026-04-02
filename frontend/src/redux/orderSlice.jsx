import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/orders", orderData);
      return data.order;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Sipariş oluşturulamadı."
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/orders/${orderId}/cancel`);
      return data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Sipariş iptal edilemedi.");
    }
  }
);

export const getUserOrders = createAsyncThunk(
  "order/getUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/orders/me");
      return data.orders;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Siparişler alınamadı."
      );
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
