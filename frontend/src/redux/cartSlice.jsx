import { createSlice } from "@reduxjs/toolkit";

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
      const existing = state.cart.find(
        (item) => (item._id || item.id) === id
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }
      state.totalAmount = state.cart.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.cart = state.cart.filter(
        (item) => (item._id || item.id) !== id
      );
      state.totalAmount = state.cart.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    addToFavourites: (state, action) => {
      const product = action.payload;
      const id = product._id || product.id;
      const already = state.favourites.find(
        (item) => (item._id || item.id) === id
      );
      if (!already) {
        state.favourites.push(product);
        localStorage.setItem("favourites", JSON.stringify(state.favourites));
      }
    },

    removeFromFavourites: (state, action) => {
      const id = action.payload;
      state.favourites = state.favourites.filter((item) => item._id !== id);
      localStorage.setItem("favourites", JSON.stringify(state.favourites));
    },

    calculateCart: (state) => {
      state.totalAmount = state.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  addToFavourites,
  removeFromFavourites,
  calculateCart,
} = cartSlice.actions;

export default cartSlice.reducer;
