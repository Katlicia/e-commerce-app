import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const getUserAddresses = createAsyncThunk(
  "user/getAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/users/me/addresses");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Adresler alınamadı.",
      );
    }
  },
);

export const addUserAddress = createAsyncThunk(
  "user/addAddress",
  async (address, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/users/me/addresses", {
        address,
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Adres eklenemedi.",
      );
    }
  },
);

export const editUserAddress = createAsyncThunk(
  "user/editAddress",
  async ({ index, address }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/users/me/addresses", { index, address });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Adres güncellenemedi.");
    }
  },
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/users/me/password", {
        currentPassword,
        newPassword,
      });
      return data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Şifre güncellenemedi.");
    }
  },
);

export const updateUser = createAsyncThunk(
  "user/update",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/users/${userId}`, formData);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Güncelleme başarısız.",
      );
    }
  },
);

const initialState = {
  addresses: [],
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(getUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(addUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(editUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(editUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
