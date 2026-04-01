import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
};

const flattenTree = (nodes, result = []) => {
  nodes.forEach((node) => {
    result.push(node);
    if (node.children?.length) flattenTree(node.children, result);
  });
  return result;
};

export const adminGetProducts = createAsyncThunk(
  "admin/getProducts",
  async () => {
    const { data } = await axiosInstance.get("/admin/products");
    return data;
  },
);

export const adminCreateProduct = createAsyncThunk(
  "admin/createProduct",
  async (productData) => {
    const { data } = await axiosInstance.post("/products/new", productData);
    return data;
  },
);

export const adminUpdateProduct = createAsyncThunk(
  "admin/updateProduct",
  async ({ id, productData }) => {
    const { data } = await axiosInstance.put(`/products/${id}`, productData);
    return data;
  },
);

export const adminDeleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (id) => {
    await axiosInstance.delete(`/products/${id}`);
    return id;
  },
);

export const adminGetCategories = createAsyncThunk(
  "admin/getCategories",
  async () => {
    const { data } = await axiosInstance.get("/categories");
    return flattenTree(data);
  },
);

export const adminCreateCategory = createAsyncThunk(
  "admin/createCategory",
  async (categoryData) => {
    const { data } = await axiosInstance.post("/categories/new", categoryData);
    return data;
  },
);

export const adminUpdateCategory = createAsyncThunk(
  "admin/updateCategory",
  async ({ id, categoryData }, { dispatch }) => {
    await axiosInstance.put(`/categories/${id}`, categoryData);
    const { data } = await axiosInstance.get("/categories");
    return flattenTree(data);
  },
);

export const adminDeleteCategory = createAsyncThunk(
  "admin/deleteCategory",
  async (id) => {
    await axiosInstance.delete(`/categories/${id}`);
    return id;
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(adminGetProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(adminGetProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(adminDeleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(adminGetCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(adminGetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(adminCreateCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(adminUpdateCategory.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(adminDeleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload && c.parent !== action.payload,
        );
      });
  },
});

export default adminSlice.reducer;
