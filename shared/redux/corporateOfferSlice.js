import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const getMyOffers = createAsyncThunk(
  "corporateOffer/getMyOffers",
  async () => {
    const { data } = await axiosInstance.get("/corporate-offers/me");
    return data;
  },
);

const corporateOfferSlice = createSlice({
  name: "corporateOffer",
  initialState: {
    offers: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMyOffers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyOffers.fulfilled, (state, action) => {
        state.offers = action.payload;
        state.loading = false;
      })
      .addCase(getMyOffers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default corporateOfferSlice.reducer;
