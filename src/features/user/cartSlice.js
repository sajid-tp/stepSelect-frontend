import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";

/*
  Every cart endpoint returns the full cart as `data`:
  { id, items[], totalPrice, totalItems, maxQuantityPerItem }
  so the server is the single source of truth: after any action the
  slice simply stores what the server sent back.
*/

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error?.message || fallback;

// =====================================================
// GET CART        GET /cart
// =====================================================

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

// =====================================================
// ADD TO CART     POST /cart   { variantId, size, quantity }
// =====================================================

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

// =====================================================
// QUICK ADD (shop card, no size picker)
// Uses the first colour that has an in-stock size.
// =====================================================

export const quickAddToCart = createAsyncThunk(
  "cart/quickAddToCart",
  async (productId, { rejectWithValue }) => {
    try {
      const details = await axiosInstance.get(`/products/${productId}`);
      const variants = details.data.data?.variants || [];

      let pick = null;
      for (const variant of variants) {
        const size = (variant.sizes || []).find((s) => s.quantity > 0);
        if (size) {
          pick = { variantId: variant.id, size: size.size };
          break;
        }
      }

      if (!pick) return rejectWithValue("This product is out of stock.");

      const res = await axiosInstance.post("/cart", { ...pick, quantity: 1 });
      return { message: res.data.message, cart: res.data.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to add item to cart"));
    }
  }
);

// =====================================================
// UPDATE QUANTITY PATCH /cart/items/:variantId?size=   { quantity }
// =====================================================

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

// =====================================================
// REMOVE ITEM     DELETE /cart/items/:variantId?size=
// =====================================================

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

// =====================================================
// CLEAR CART      DELETE /cart
// =====================================================

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

// =====================================================
// STATE
// =====================================================

const initialState = {
  cartId: null,
  items: [],
  totalPrice: 0, // only items that are currently available
  cartCount: 0, // total units in the cart (navbar badge)
  maxQuantityPerItem: 5,

  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const applyCart = (state, cart) => {
  state.status = "succeeded";
  state.error = null;
  state.cartId = cart.id;
  state.items = cart.items || [];
  state.totalPrice = cart.totalPrice || 0;
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
        // Skeleton only on the first load, not on silent refreshes.
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

      // never leak one user's cart to the next
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, () => initialState)

      // every change returns the new full cart
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
