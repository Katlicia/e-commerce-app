import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/me");
    return data;
  } catch {
    return rejectWithValue(null);
  }
});

export const loginUser = createAsyncThunk(
  "auth/adminLogin",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/adminLogin", formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Giriş başarısız.");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await axiosInstance.get("/logout");
});

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/reset/${token}`, { password });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Şifre sıfırlanamadı.");
    }
  },
);

export const forgetPassword = createAsyncThunk(
  "auth/forgetPassword",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/forgetPassword", { email });
      return data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "İstek gönderilemedi.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    initialized: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.initialized = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forgetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
