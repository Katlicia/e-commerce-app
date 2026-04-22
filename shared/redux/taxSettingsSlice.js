import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const getTaxSettings = createAsyncThunk("taxSettings/get", async () => {
  const { data } = await axiosInstance.get("/tax-settings");
  return data;
});

const taxSettingsSlice = createSlice({
  name: "taxSettings",
  initialState: {
    freeShippingThreshold: 500,
    kdv1Rate: 0.01,
    kdv20Rate: 0.2,
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTaxSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTaxSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.freeShippingThreshold = action.payload.freeShippingThreshold;
        state.kdv1Rate = action.payload.kdv1Rate;
        state.kdv20Rate = action.payload.kdv20Rate;
      })
      .addCase(getTaxSettings.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default taxSettingsSlice.reducer;
