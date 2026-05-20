import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";
import { storage } from "../utils/storage";
import { updateUser } from "./userSlice";

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/me");
    return data;
  } catch {
    return rejectWithValue(null);
  }
});

export const checkPhone = createAsyncThunk(
  "auth/checkPhone",
  async (phone, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/check-phone", { phone });
      return data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || "Kontrol edilemedi.",
        status: err.response?.status ?? 0,
      });
    }
  },
);

const isWeb = typeof localStorage !== "undefined";

const persistTokens = (token, refreshToken) => {
  if (!isWeb) {
    if (token) storage.setItem("token", token);
    if (refreshToken) storage.setItem("refreshToken", refreshToken);
  }
};

const clearToken = () => {
  storage.removeItem("token");
  storage.removeItem("refreshToken");
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/login", formData);
      persistTokens(data.token, data.refreshToken);
      return data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || "Giriş başarısız.",
        status: err.response?.status ?? 0,
      });
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/register", formData);
      persistTokens(data.token, data.refreshToken);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Kayıt başarısız.");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await axiosInstance.get("/logout");
  clearToken();
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
  }
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
  reducers: {
    clearError: (state) => { state.error = null; },
  },
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
      .addCase(checkPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkPhone.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkPhone.rejected, (state) => {
        state.loading = false;
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
        state.error = action.payload?.message ?? action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
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
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
