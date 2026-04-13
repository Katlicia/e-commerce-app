import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const initialState = {
  products: [],
  categories: [],
  brands: [],
  cargos: [],
  orders: [],
  users: [],
  coupons: [],
  taxSettings: null,
  banners: {},
  homeSections: [],
  featuredLists: {},
  campaigns: [],
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

export const adminGetUsers = createAsyncThunk("admin/getUsers", async () => {
  const { data } = await axiosInstance.get("/users");
  return data;
});

export const adminUpdateUser = createAsyncThunk("admin/updateUser", async ({ id, userData }) => {
  const { data } = await axiosInstance.put(`/users/${id}`, userData);
  return data;
});

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

export const adminGetBrands = createAsyncThunk("admin/getBrands", async () => {
  const { data } = await axiosInstance.get("/products/brands");
  return data;
});

export const adminGetBanner = createAsyncThunk("admin/getBanner", async (type) => {
  const { data } = await axiosInstance.get(`/banners/${type}`);
  return { type, data };
});

export const adminUpdateBanner = createAsyncThunk(
  "admin/updateBanner",
  async ({ type, bannerData }) => {
    const { data } = await axiosInstance.put(`/banners/${type}`, bannerData);
    return { type, data };
  },
);

export const adminGetHomeSections = createAsyncThunk(
  "admin/getHomeSections",
  async () => {
    const { data } = await axiosInstance.get("/home-sections");
    return data;
  },
);

export const adminUpdateHomeSection = createAsyncThunk(
  "admin/updateHomeSection",
  async ({ key, sectionData }) => {
    const { data } = await axiosInstance.put(`/home-sections/${key}`, sectionData);
    return data;
  },
);

export const adminGetCoupons = createAsyncThunk("admin/getCoupons", async () => {
  const { data } = await axiosInstance.get("/coupons");
  return data;
});

export const adminCreateCoupon = createAsyncThunk(
  "admin/createCoupon",
  async (couponData) => {
    const { data } = await axiosInstance.post("/coupons/new", couponData);
    return data;
  },
);

export const adminUpdateCoupon = createAsyncThunk(
  "admin/updateCoupon",
  async ({ id, couponData }) => {
    const { data } = await axiosInstance.put(`/coupons/${id}`, couponData);
    return data;
  },
);

export const adminDeleteCoupon = createAsyncThunk(
  "admin/deleteCoupon",
  async (id) => {
    await axiosInstance.delete(`/coupons/${id}`);
    return id;
  },
);

export const adminGetCampaigns = createAsyncThunk(
  "admin/getCampaigns",
  async () => {
    const { data } = await axiosInstance.get("/campaigns");
    return data;
  },
);

export const adminCreateCampaign = createAsyncThunk(
  "admin/createCampaign",
  async (campaignData) => {
    const { data } = await axiosInstance.post("/campaigns/new", campaignData);
    return data;
  },
);

export const adminUpdateCampaign = createAsyncThunk(
  "admin/updateCampaign",
  async ({ id, campaignData }) => {
    const { data } = await axiosInstance.put(`/campaigns/${id}`, campaignData);
    return data;
  },
);

export const adminDeleteCampaign = createAsyncThunk(
  "admin/deleteCampaign",
  async (id) => {
    await axiosInstance.delete(`/campaigns/${id}`);
    return id;
  },
);

export const adminGetFeaturedList = createAsyncThunk(
  "admin/getFeaturedList",
  async (key) => {
    const { data } = await axiosInstance.get(`/featured-lists/${key}`);
    return data;
  },
);

export const adminUpdateFeaturedList = createAsyncThunk(
  "admin/updateFeaturedList",
  async ({ key, products }) => {
    const { data } = await axiosInstance.put(`/featured-lists/${key}`, {
      products,
    });
    return data;
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
      .addCase(adminGetUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(adminUpdateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
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
      .addCase(adminGetCoupons.fulfilled, (state, action) => {
        state.coupons = action.payload;
      })
      .addCase(adminCreateCoupon.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload);
      })
      .addCase(adminUpdateCoupon.fulfilled, (state, action) => {
        const idx = state.coupons.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.coupons[idx] = action.payload;
      })
      .addCase(adminDeleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })
      .addCase(adminGetTaxSettings.fulfilled, (state, action) => {
        state.taxSettings = action.payload;
      })
      .addCase(adminUpdateTaxSettings.fulfilled, (state, action) => {
        state.taxSettings = action.payload;
      })
      .addCase(adminGetBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      })
      .addCase(adminGetBanner.fulfilled, (state, action) => {
        state.banners[action.payload.type] = action.payload.data.images || [];
      })
      .addCase(adminUpdateBanner.fulfilled, (state, action) => {
        state.banners[action.payload.type] = action.payload.data.images || [];
      })
      .addCase(adminGetHomeSections.fulfilled, (state, action) => {
        state.homeSections = action.payload;
      })
      .addCase(adminUpdateHomeSection.fulfilled, (state, action) => {
        const idx = state.homeSections.findIndex((s) => s.key === action.payload.key);
        if (idx !== -1) state.homeSections[idx] = action.payload;
      })
      .addCase(adminGetCampaigns.fulfilled, (state, action) => {
        state.campaigns = action.payload;
      })
      .addCase(adminCreateCampaign.fulfilled, (state, action) => {
        state.campaigns.unshift(action.payload);
      })
      .addCase(adminUpdateCampaign.fulfilled, (state, action) => {
        const idx = state.campaigns.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.campaigns[idx] = action.payload;
      })
      .addCase(adminDeleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((c) => c._id !== action.payload);
      })
      .addCase(adminGetFeaturedList.fulfilled, (state, action) => {
        state.featuredLists[action.payload.key] = action.payload;
      })
      .addCase(adminUpdateFeaturedList.fulfilled, (state, action) => {
        state.featuredLists[action.payload.key] = action.payload;
      });
  },
});

export default adminSlice.reducer;
