import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const getFavouritesFromStorage = () => {
  if (localStorage.getItem("favourites")) {
    return JSON.parse(localStorage.getItem("favourites"));
  }
  return [];
};

const getCartFromStorage = () => {
  if (localStorage.getItem("cart")) {
    return JSON.parse(localStorage.getItem("cart"));
  }
  return [];
};

const calcTotal = (cart) =>
  cart.reduce(
    (sum, item) =>
      sum + parseFloat(item.discountedPrice || item.price) * item.quantity,
    0,
  );

// Backend'den gelen populate edilmiş cart item'ını Redux formatına çevirir
const mapBackendItem = (item) => ({
  ...item.product,
  quantity: item.quantity,
});

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const { data } = await axiosInstance.get("/users/me/cart");
  return data.map(mapBackendItem);
});

export const syncAddToCart = createAsyncThunk(
  "cart/syncAdd",
  async ({ productId, quantity }) => {
    const { data } = await axiosInstance.post("/users/me/cart", {
      productId,
      quantity,
    });
    return data.map(mapBackendItem);
  },
);

export const syncUpdateCart = createAsyncThunk(
  "cart/syncUpdate",
  async ({ productId, quantity }) => {
    const { data } = await axiosInstance.put(`/users/me/cart/${productId}`, {
      quantity,
    });
    return data.map(mapBackendItem);
  },
);

export const syncRemoveFromCart = createAsyncThunk(
  "cart/syncRemove",
  async (productId) => {
    const { data } = await axiosInstance.delete(`/users/me/cart/${productId}`);
    return data.map(mapBackendItem);
  },
);

export const syncClearCart = createAsyncThunk("cart/syncClear", async () => {
  await axiosInstance.delete("/users/me/cart");
  return [];
});

const initialState = {
  favourites: getFavouritesFromStorage(),
  cart: getCartFromStorage(),
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const id = product._id || product.id;
      const existing = state.cart.find((item) => (item._id || item.id) === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }
      state.totalAmount = calcTotal(state.cart);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.cart = state.cart.filter((item) => (item._id || item.id) !== id);
      state.totalAmount = calcTotal(state.cart);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    decreaseCart: (state, action) => {
      const id = action.payload;
      const existing = state.cart.find((item) => (item._id || item.id) === id);
      if (existing && existing.quantity > 1) {
        existing.quantity -= 1;
      } else {
        state.cart = state.cart.filter((item) => (item._id || item.id) !== id);
      }
      state.totalAmount = calcTotal(state.cart);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    addToFavourites: (state, action) => {
      const product = action.payload;
      const id = product._id || product.id;
      const already = state.favourites.find(
        (item) => (item._id || item.id) === id,
      );
      if (!already) {
        state.favourites.push(product);
        localStorage.setItem("favourites", JSON.stringify(state.favourites));
      }
    },

    removeFromFavourites: (state, action) => {
      const id = action.payload;
      state.favourites = state.favourites.filter(
        (item) => (item._id || item.id) !== id,
      );
      localStorage.setItem("favourites", JSON.stringify(state.favourites));
    },

    calculateCart: (state) => {
      state.totalAmount = calcTotal(state.cart);
    },

    clearCartLocal: (state) => {
      state.cart = [];
      state.totalAmount = 0;
      localStorage.removeItem("cart");
    },
  },
  extraReducers: (builder) => {
    const applyCart = (state, action) => {
      state.cart = action.payload;
      state.totalAmount = calcTotal(state.cart);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    };

    builder
      .addCase(fetchCart.fulfilled, applyCart)
      .addCase(syncAddToCart.fulfilled, applyCart)
      .addCase(syncUpdateCart.fulfilled, applyCart)
      .addCase(syncRemoveFromCart.fulfilled, applyCart)
      .addCase(syncClearCart.fulfilled, (state) => {
        state.cart = [];
        state.totalAmount = 0;
        localStorage.removeItem("cart");
      });
  },
});

export const {
  addToCart,
  decreaseCart,
  removeFromCart,
  addToFavourites,
  removeFromFavourites,
  calculateCart,
  clearCartLocal,
} = cartSlice.actions;

// Wrapper thunk'lar: local state'i anında günceller + user login ise backend'e sync eder
export const addToCartWithSync = (product) => (dispatch, getState) => {
  const id = product._id || product.id;
  dispatch(addToCart(product));
  if (getState().auth.user) {
    dispatch(syncAddToCart({ productId: id, quantity: 1 }));
  }
};

export const removeFromCartWithSync = (id) => (dispatch, getState) => {
  dispatch(removeFromCart(id));
  if (getState().auth.user) {
    dispatch(syncRemoveFromCart(id));
  }
};

export const decreaseCartWithSync = (id) => (dispatch, getState) => {
  const currentQty =
    getState().cart.cart.find((item) => (item._id || item.id) === id)?.quantity ?? 0;
  dispatch(decreaseCart(id));
  if (getState().auth.user) {
    if (currentQty <= 1) {
      dispatch(syncRemoveFromCart(id));
    } else {
      dispatch(syncUpdateCart({ productId: id, quantity: currentQty - 1 }));
    }
  }
};

export default cartSlice.reducer;
