import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const getMyPriceAlarms = createAsyncThunk(
  "priceAlarm/getMyAlarms",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/price-alarms/me");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Alarmlar alınamadı.");
    }
  },
);

export const deletePriceAlarm = createAsyncThunk(
  "priceAlarm/deleteAlarm",
  async (productId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/price-alarms/${productId}`);
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Alarm silinemedi.");
    }
  },
);

const priceAlarmSlice = createSlice({
  name: "priceAlarm",
  initialState: {
    alarms: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMyPriceAlarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPriceAlarms.fulfilled, (state, action) => {
        state.loading = false;
        state.alarms = action.payload;
      })
      .addCase(getMyPriceAlarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deletePriceAlarm.pending, (state) => {
        state.error = null;
      })
      .addCase(deletePriceAlarm.fulfilled, (state, action) => {
        state.alarms = state.alarms.filter(
          (alarm) => alarm.product?._id !== action.payload,
        );
      })
      .addCase(deletePriceAlarm.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default priceAlarmSlice.reducer;
