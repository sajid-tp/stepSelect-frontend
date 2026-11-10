import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error?.message || fallback;

export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/cart");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load your cart"));
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ variantId, size, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/cart", { variantId, size, quantity });
      return { message: res.data.message, cart: res.data.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to add item to cart"));
    }
  }
);

export const quickAddToCart = createAsyncThunk(
  "cart/quickAddToCart",
  async (productId, { rejectWithValue }) => {
    try {
      const details = await axiosInstance.get(`/products/${productId}`);
      const variants = details.data.data?.variants || [];

      const byPrice = [...variants].sort(
        (a, b) => Number(a.price) - Number(b.price)
      );

      let pick = null;
      for (const variant of byPrice) {
        const size = (variant.sizes || []).find((s) => s.quantity > 0);
        if (size) {
          pick = { variantId: variant.id, size: size.size };
          break;
        }
      }

      if (!pick) return rejectWithValue("This product is out of stock.");

      const res = await axiosInstance.post("/cart", { ...pick, quantity: 1 });
      return { message: res.data.message, cart: res.data.data, added: pick };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to add item to cart"));
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ variantId, size, quantity }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(
        `/cart/items/${variantId}`,
        { quantity },
        { params: { size } }
      );
      return { message: res.data.message, cart: res.data.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update quantity"));
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async ({ variantId, size }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/cart/items/${variantId}`, {
        params: { size },
      });
      return { message: res.data.message, cart: res.data.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to remove item"));
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete("/cart");
      return { message: res.data.message, cart: res.data.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to clear cart"));
    }
  }
);

const initialState = {
  cartId: null,
  items: [],
  totalPrice: 0,
  totalMrp: 0,
  totalSavings: 0,
  cartCount: 0,
  maxQuantityPerItem: 5,

  status: "idle",
  error: null,
};

const applyCart = (state, cart) => {
  state.status = "succeeded";
  state.error = null;
  state.cartId = cart.id;
  state.items = cart.items || [];
  state.totalPrice = cart.totalPrice || 0;
  state.totalMrp = cart.totalMrp || cart.totalPrice || 0;
  state.totalSavings = cart.totalSavings || 0;
  state.cartCount = cart.totalItems || 0;
  state.maxQuantityPerItem = cart.maxQuantityPerItem || 5;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        if (state.status !== "succeeded") state.status = "loading";
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        applyCart(state, action.payload);
      })
      .addCase(getCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, () => initialState)

      .addMatcher(
        isAnyOf(
          addToCart.fulfilled,
          quickAddToCart.fulfilled,
          updateCartItem.fulfilled,
          removeCartItem.fulfilled,
          clearCart.fulfilled
        ),
        (state, action) => {
          applyCart(state, action.payload.cart);
        }
      );
  },
});

export const { resetCart } = cartSlice.actions;

export const selectCartCount = (state) => state.cart.cartCount;

export default cartSlice.reducer;
