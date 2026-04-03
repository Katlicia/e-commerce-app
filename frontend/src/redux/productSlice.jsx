import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance.js";

const initialState = {
  products: [],
  product: {},
  total: 0,
  loading: false,
};

export const getProducts = createAsyncThunk("products", async (params = {}) => {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.brand) query.set("brand", Array.isArray(params.brand) ? params.brand.join(",") : params.brand);
  if (params.category) query.set("category", Array.isArray(params.category) ? params.category.join(",") : params.category);
  if (params.limit) query.set("limit", params.limit);
  if (params.page) query.set("page", params.page);
  if (params.minPrice !== undefined && params.minPrice !== "") query.set("minPrice", params.minPrice);
  if (params.maxPrice !== undefined && params.maxPrice !== "") query.set("maxPrice", params.maxPrice);
  if (params.sort) query.set("sort", params.sort);
  const response = await axiosInstance.get(`/products?${query.toString()}`);
  return response.data;
});

export const getProductDetail = createAsyncThunk("product", async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
});

export const createReview = createAsyncThunk(
  "product/createReview",
  async ({ productId, comment, rating }) => {
    const response = await axiosInstance.post(`/products/newReview`, { productId, comment, rating });
    return response.data;
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
      const { products, total } = action.payload;
      state.total = total;
      if (action.meta.arg?.page > 1) {
        state.products = [...state.products, ...products];
      } else {
        state.products = products;
      }
    });
    builder.addCase(getProducts.rejected, (state) => {
      state.loading = false;
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
