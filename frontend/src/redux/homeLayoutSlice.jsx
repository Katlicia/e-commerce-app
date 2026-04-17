import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const getHomeLayout = createAsyncThunk("homeLayout/get", async () => {
  const { data } = await axiosInstance.get("/home-layout");
  return data;
});

const homeLayoutSlice = createSlice({
  name: "homeLayout",
  initialState: {
    sections: [],
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHomeLayout.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHomeLayout.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = action.payload.sections;
      })
      .addCase(getHomeLayout.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default homeLayoutSlice.reducer;
