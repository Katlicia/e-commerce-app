import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  products: [],
  categories: [],
  cargos: [],
  orders: [],
  taxSettings: null,
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
  async ({ id, categoryData }) => {
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

export const adminGetCargo = createAsyncThunk("admin/getCargo", async () => {
  const { data } = await axiosInstance.get("/cargo");
  return data;
});

export const adminCreateCargo = createAsyncThunk(
  "admin/createCargo",
  async (cargoData) => {
    const { data } = await axiosInstance.post("/cargo", cargoData);
    return data;
  },
);

export const adminUpdateCargo = createAsyncThunk(
  "admin/updateCargo",
  async ({ id, cargoData }) => {
    const { data } = await axiosInstance.put(`/cargo/${id}`, cargoData);
    return data;
  },
);

export const adminDeleteCargo = createAsyncThunk(
  "admin/deleteCargo",
  async (id) => {
    await axiosInstance.delete(`/cargo/${id}`);
    return id;
  },
);

export const adminGetOrders = createAsyncThunk("admin/getOrders", async () => {
  const { data } = await axiosInstance.get("/admin/orders");
  return data.orders;
});

export const adminUpdateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async ({ id, status }) => {
    const { data } = await axiosInstance.put(`/admin/orders/${id}/status`, { status });
    return data.order;
  },
);

export const adminGetTaxSettings = createAsyncThunk(
  "admin/getTaxSettings",
  async () => {
    const { data } = await axiosInstance.get("/tax-settings");
    return data;
  },
);

export const adminUpdateTaxSettings = createAsyncThunk(
  "admin/updateTaxSettings",
  async (settingsData) => {
    const { data } = await axiosInstance.put("/tax-settings", settingsData);
    return data;
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
      })
      .addCase(adminGetCargo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetCargo.fulfilled, (state, action) => {
        state.loading = false;
        state.cargos = action.payload;
      })
      .addCase(adminGetCargo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(adminCreateCargo.fulfilled, (state, action) => {
        state.cargos.push(action.payload);
      })
      .addCase(adminUpdateCargo.fulfilled, (state, action) => {
        const idx = state.cargos.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.cargos[idx] = action.payload;
      })
      .addCase(adminDeleteCargo.fulfilled, (state, action) => {
        state.cargos = state.cargos.filter((c) => c._id !== action.payload);
      })
      .addCase(adminGetOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(adminGetOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(adminGetTaxSettings.fulfilled, (state, action) => {
        state.taxSettings = action.payload;
      })
      .addCase(adminUpdateTaxSettings.fulfilled, (state, action) => {
        state.taxSettings = action.payload;
      });
  },
});

export default adminSlice.reducer;
