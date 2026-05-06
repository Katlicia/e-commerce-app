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
  async (addressData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/users/me/addresses", addressData);
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
  async ({ index, ...addressData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put("/users/me/addresses", { index, ...addressData });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Adres güncellenemedi.");
    }
  },
);

export const deleteUserAddress = createAsyncThunk(
  "user/deleteAddress",
  async (index, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/users/me/addresses/${index}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Adres silinemedi.");
    }
  },
);

export const deleteAccount = createAsyncThunk(
  "user/deleteAccount",
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Hesap silinemedi.");
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
  reducers: {
    setDefaultAddress(state, action) {
      const idx = action.payload;
      if (idx > 0 && idx < state.addresses.length) {
        const [addr] = state.addresses.splice(idx, 1);
        state.addresses.unshift(addr);
      }
    },
  },
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

      .addCase(deleteUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
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

export const { setDefaultAddress } = userSlice.actions;

export default userSlice.reducer;
