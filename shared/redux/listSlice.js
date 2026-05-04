import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchLists = createAsyncThunk("list/fetchLists", async () => {
  const { data } = await axiosInstance.get("/users/me/lists");
  return data;
});

export const createList = createAsyncThunk("list/createList", async (name) => {
  const { data } = await axiosInstance.post("/users/me/lists", { name });
  return data;
});

export const deleteList = createAsyncThunk("list/deleteList", async (listId) => {
  await axiosInstance.delete(`/users/me/lists/${listId}`);
  return listId;
});

export const addProductToList = createAsyncThunk(
  "list/addProduct",
  async ({ listId, productId }) => {
    const { data } = await axiosInstance.post(
      `/users/me/lists/${listId}/products`,
      { productId },
    );
    return data;
  },
);

export const renameList = createAsyncThunk(
  "list/renameList",
  async ({ listId, name }) => {
    const { data } = await axiosInstance.patch(`/users/me/lists/${listId}`, { name });
    return data;
  },
);

export const removeProductFromList = createAsyncThunk(
  "list/removeProduct",
  async ({ listId, productId }) => {
    const { data } = await axiosInstance.delete(
      `/users/me/lists/${listId}/products/${productId}`,
    );
    return data;
  },
);

const listSlice = createSlice({
  name: "list",
  initialState: {
    lists: [],
    loading: false,
  },
  reducers: {
    clearListsLocal: (state) => {
      state.lists = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.lists = action.payload;
        state.loading = false;
      })
      .addCase(fetchLists.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.lists.push(action.payload);
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((l) => l._id !== action.payload);
      })
      .addCase(renameList.fulfilled, (state, action) => {
        const idx = state.lists.findIndex((l) => l._id === action.payload._id);
        if (idx !== -1) state.lists[idx] = action.payload;
      })
      .addCase(addProductToList.fulfilled, (state, action) => {
        const idx = state.lists.findIndex((l) => l._id === action.payload._id);
        if (idx !== -1) state.lists[idx] = action.payload;
      })
      .addCase(removeProductFromList.fulfilled, (state, action) => {
        const idx = state.lists.findIndex((l) => l._id === action.payload._id);
        if (idx !== -1) state.lists[idx] = action.payload;
      });
  },
});

export const { clearListsLocal } = listSlice.actions;
export default listSlice.reducer;