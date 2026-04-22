import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const getHomeSections = createAsyncThunk("homeSection/get", async () => {
  const { data } = await axiosInstance.get("/home-sections");
  return data;
});

const homeSectionSlice = createSlice({
  name: "homeSection",
  initialState: {
    sections: [],
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHomeSections.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHomeSections.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = action.payload;
      })
      .addCase(getHomeSections.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default homeSectionSlice.reducer;