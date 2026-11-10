import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";
import { addToCart, quickAddToCart } from "./cartSlice";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  fallback;

const sameLine = (a, variantId, size) =>
  String(a.variantId) === String(variantId) &&
  String(a.size) === String(size);

export const getWishlist = createAsyncThunk(
  "wishlist/getWishlist",
  async ({ page = 1, limit = 12 } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/wishlist", {
        params: { page, limit },
      });

      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load your wishlist")
      );
    }
  }
);

export const getWishlistIds = createAsyncThunk(
  "wishlist/getWishlistIds",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/wishlist/ids");
      return res.data.data.items || [];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load wishlist")
      );
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ productId, variantId, size }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/wishlist", {
        variantId,
        size,
      });

      return {
        message: res.data.message,
        productId,
        ...res.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to add to wishlist")
      );
    }
  }
);

export const quickAddToWishlist = createAsyncThunk(
  "wishlist/quickAddToWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const details = await axiosInstance.get(`/products/${productId}`);
      const variants = details.data.data?.variants || [];

      let pick = null;

      for (const variant of variants) {
        const size = (variant.sizes || []).find(
          (s) => s.quantity > 0
        );

        if (size) {
          pick = {
            variantId: variant.id,
            size: size.size,
          };
          break;
        }
      }

      if (!pick) {
        const variant = variants.find(
          (v) => (v.sizes || []).length > 0
        );

        if (variant) {
          pick = {
            variantId: variant.id,
            size: variant.sizes[0].size,
          };
        }
      }

      if (!pick) {
        return rejectWithValue(
          "This product can't be added to the wishlist."
        );
      }

      const res = await axiosInstance.post("/wishlist", pick);

      return {
        message: res.data.message,
        productId: String(productId),
        ...res.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to add to wishlist")
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ variantId, size }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/wishlist/items/${variantId}`,
        {
          params: { size },
        }
      );

      return {
        message: res.data.message,
        ...res.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to remove from wishlist")
      );
    }
  }
);

export const removeProductFromWishlist = createAsyncThunk(
  "wishlist/removeProductFromWishlist",
  async (productId, { getState, rejectWithValue }) => {
    const lines = getState().wishlist.ids.filter(
      (line) => String(line.productId) === String(productId)
    );

    try {
      let message = "Removed from wishlist.";

      for (const line of lines) {
        const res = await axiosInstance.delete(
          `/wishlist/items/${line.variantId}`,
          {
            params: { size: line.size },
          }
        );

        message = res.data.message || message;
      }

      return {
        message,
        productId: String(productId),
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to remove from wishlist")
      );
    }
  }
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete("/wishlist");

      return {
        message: res.data.message,
        ...res.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to clear wishlist")
      );
    }
  }
);

const emptyPagination = {
  page: 1,
  limit: 12,
  totalItems: 0,
  totalPages: 0,
};

const initialState = {
  ids: [],
  idsStatus: "idle",

  items: [],
  pagination: emptyPagination,
  status: "idle",
  error: null,

  wishlistCount: 0,
};

const addLine = (
  state,
  { productId, variantId, size, totalItems }
) => {
  if (
    !state.ids.some((line) =>
      sameLine(line, variantId, size)
    )
  ) {
    state.ids.push({
      productId: productId ? String(productId) : null,
      variantId,
      size,
    });
  }

  state.wishlistCount = totalItems ?? state.ids.length;
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    resetWishlist: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(getWishlist.pending, (state) => {
        if (state.status !== "succeeded") {
          state.status = "loading";
        }
        state.error = null;
      })

      .addCase(getWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.pagination =
          action.payload.pagination || emptyPagination;
        state.wishlistCount = state.pagination.totalItems;
      })

      .addCase(getWishlist.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || "Failed to load your wishlist";
      })

      .addCase(getWishlistIds.pending, (state) => {
        state.idsStatus = "loading";
      })

      .addCase(getWishlistIds.fulfilled, (state, action) => {
        state.idsStatus = "succeeded";
        state.ids = action.payload;
        state.wishlistCount = action.payload.length;
      })

      .addCase(getWishlistIds.rejected, (state) => {
        state.idsStatus = "failed";
      })

      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        const { variantId, size, totalItems } = action.payload;

        state.ids = state.ids.filter(
          (line) => !sameLine(line, variantId, size)
        );

        state.items = state.items.filter(
          (line) => !sameLine(line, variantId, size)
        );

        state.wishlistCount = totalItems ?? state.ids.length;
        state.pagination.totalItems = state.wishlistCount;
      })

      .addCase(
        removeProductFromWishlist.fulfilled,
        (state, action) => {
          const { productId } = action.payload;

          state.ids = state.ids.filter(
            (line) =>
              String(line.productId) !== String(productId)
          );

          state.items = state.items.filter(
            (line) =>
              String(line.productId) !== String(productId)
          );

          state.wishlistCount = state.ids.length;
          state.pagination.totalItems = state.wishlistCount;
        }
      )

      .addCase(clearWishlist.fulfilled, (state) => {
        state.ids = [];
        state.items = [];

        state.pagination = {
          ...state.pagination,
          page: 1,
          totalItems: 0,
          totalPages: 0,
        };

        state.wishlistCount = 0;
      })

      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, () => initialState)

      .addMatcher(
        isAnyOf(
          addToWishlist.fulfilled,
          quickAddToWishlist.fulfilled
        ),
        (state, action) => {
          addLine(state, action.payload);
        }
      )

      .addMatcher(
        isAnyOf(addToCart.fulfilled, quickAddToCart.fulfilled),
        (state, action) => {
          const line = action.payload?.added || action.meta?.arg;
          if (!line || !line.variantId) return;

          state.ids = state.ids.filter(
            (saved) => !sameLine(saved, line.variantId, line.size)
          );

          state.items = state.items.filter(
            (saved) => !sameLine(saved, line.variantId, line.size)
          );

          state.wishlistCount = state.ids.length;
          state.pagination.totalItems = state.wishlistCount;
        }
      );
  },
});

export const { resetWishlist } = wishlistSlice.actions;

export const selectWishlistCount = (state) =>
  state.wishlist.wishlistCount;

export default wishlistSlice.reducer;