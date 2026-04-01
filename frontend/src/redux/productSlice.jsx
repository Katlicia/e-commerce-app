import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:5000";

const initialState = {
  products: [],
  product: {},
  loading: false,
};

export const getProducts = createAsyncThunk("products", async (params = {}) => {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.brand) query.set("brand", params.brand);
  if (params.category) query.set("category", params.category);
  if (params.limit) query.set("limit", params.limit);
  const response = await fetch(`${BASE_URL}/products?${query.toString()}`);
  return await response.json();
});

export const getProductDetail = createAsyncThunk("product", async (id) => {
  const response = await fetch(`${BASE_URL}/products/${id}`);
  return await response.json();
});

export const createReview = createAsyncThunk(
  "product/createReview",
  async ({ productId, comment, rating }, { rejectWithValue }) => {
    const response = await fetch(`${BASE_URL}/products/newReview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, comment, rating }),
    });
    const data = await response.json();
    if (!response.ok) return rejectWithValue(data.message);
    return data;
  }
);

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    });
    builder.addCase(getProductDetail.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getProductDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.product = action.payload;
    });
  },
});

export const {} = productSlice.actions;
export default productSlice.reducer;
