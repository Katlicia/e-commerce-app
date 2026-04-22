import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const getBanner = createAsyncThunk("banner/get", async (type) => {
  const { data } = await axiosInstance.get(`/banners/${type}`);
  return { type, data };
});

const bannerSlice = createSlice({
  name: "banner",
  initialState: {
    banners: {},
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners[action.payload.type] = action.payload.data.images || [];
      })
      .addCase(getBanner.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default bannerSlice.reducer;
