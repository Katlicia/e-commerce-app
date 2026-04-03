import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const getCargos = createAsyncThunk("cargo/getCargos", async () => {
  const { data } = await axiosInstance.get("/cargo");
  return data;
});

const cargoSlice = createSlice({
  name: "cargo",
  initialState: {
    cargos: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCargos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCargos.fulfilled, (state, action) => {
        state.loading = false;
        state.cargos = action.payload;
      })
      .addCase(getCargos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default cargoSlice.reducer;
