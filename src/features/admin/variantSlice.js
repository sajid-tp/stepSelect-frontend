import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


// ======================================================
// GET ALL VARIANTS OF A PRODUCT
// GET /api/admin/variants/products/:productId/variants
// ======================================================

export const getVariants = createAsyncThunk(
  "adminVariants/getVariants",
  async (
    {
      productId,
      page = 1,
      limit = 5,
    },
    { rejectWithValue }
  ) => {
    try {

      const response = await axiosInstance.get(
        `/admin/variants/products/${productId}/variants`,
        {
          params: {
            page,
            limit,
          },
        }
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch variants."
      );

    }
  }
);


// ======================================================
// GET SINGLE VARIANT
// GET /api/admin/variants/:variantId
// ======================================================

export const getVariant = createAsyncThunk(
  "adminVariants/getVariant",
  async (
    variantId,
    { rejectWithValue }
  ) => {
    try {

      const response = await axiosInstance.get(
        `/admin/variants/${variantId}`
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to fetch variant."
      );

    }
  }
);


// ======================================================
// ADD VARIANT
// POST /api/admin/variants/products/:productId/variants
// ======================================================

export const addVariant = createAsyncThunk(
  "adminVariants/addVariant",
  async (
    {
      productId,
      variantData,
    },
    { rejectWithValue }
  ) => {
    try {

      const response = await axiosInstance.post(
        `/admin/variants/products/${productId}/variants`,
        variantData
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to add variant."
      );

    }
  }
);


// ======================================================
// UPDATE VARIANT
// PATCH /api/admin/variants/:variantId
// ======================================================

export const updateVariant = createAsyncThunk(
  "adminVariants/updateVariant",
  async (
    {
      variantId,
      variantData,
    },
    { rejectWithValue }
  ) => {
    try {

      const response = await axiosInstance.patch(
        `/admin/variants/${variantId}`,
        variantData
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update variant."
      );

    }
  }
);


// ======================================================
// DELETE VARIANT
// DELETE /api/admin/variants/:variantId
// ======================================================

export const deleteVariant = createAsyncThunk(
  "adminVariants/deleteVariant",
  async (
    variantId,
    { rejectWithValue }
  ) => {
    try {

      const response = await axiosInstance.delete(
        `/admin/variants/${variantId}`
      );

      return {
        ...response.data,
        variantId,
      };

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to delete variant."
      );

    }
  }
);


// ======================================================
// TOGGLE VARIANT STATUS
// PATCH /api/admin/variants/:variantId/status
// ======================================================

export const toggleVariantStatus = createAsyncThunk(
  "adminVariants/toggleVariantStatus",
  async (
    variantId,
    { rejectWithValue }
  ) => {
    try {

      const response = await axiosInstance.patch(
        `/admin/variants/${variantId}/status`
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update variant status."
      );

    }
  }
);


// ======================================================
// INITIAL STATE
// ======================================================

const initialState = {

  // Variant list
  variants: [],

  // Pagination
  totalResults: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 5,

  // Selected variant
  selectedVariant: null,


  // -----------------------------
  // GET VARIANTS
  // -----------------------------

  status: "idle",
  error: null,


  // -----------------------------
  // GET SINGLE VARIANT
  // -----------------------------

  getVariantStatus: "idle",
  getVariantError: null,


  // -----------------------------
  // ADD VARIANT
  // -----------------------------

  addStatus: "idle",
  addError: null,


  // -----------------------------
  // UPDATE VARIANT
  // -----------------------------

  updateStatus: "idle",
  updateError: null,


  // -----------------------------
  // DELETE VARIANT
  // -----------------------------

  deleteStatus: "idle",
  deleteError: null,


  // -----------------------------
  // TOGGLE STATUS
  // -----------------------------

  statusUpdateStatus: "idle",
  statusUpdateError: null,
};


// ======================================================
// SLICE
// ======================================================

const variantSlice = createSlice({

  name: "adminVariants",

  initialState,

  reducers: {

    clearSelectedVariant: (state) => {

      state.selectedVariant = null;

    },


    clearVariantErrors: (state) => {

      state.error = null;

      state.getVariantError = null;

      state.addError = null;

      state.updateError = null;

      state.deleteError = null;

      state.statusUpdateError = null;

    },


    resetAddStatus: (state) => {

      state.addStatus = "idle";
      state.addError = null;

    },


    resetUpdateStatus: (state) => {

      state.updateStatus = "idle";
      state.updateError = null;

    },


    resetDeleteStatus: (state) => {

      state.deleteStatus = "idle";
      state.deleteError = null;

    },


    resetStatusUpdateStatus: (state) => {

      state.statusUpdateStatus = "idle";
      state.statusUpdateError = null;

    },

  },


  // ====================================================
  // EXTRA REDUCERS
  // ====================================================

  extraReducers: (builder) => {

    builder


      // ==================================================
      // GET VARIANTS
      // ==================================================

      .addCase(
        getVariants.pending,
        (state) => {

          state.status = "loading";
          state.error = null;

        }
      )

      .addCase(
        getVariants.fulfilled,
        (state, action) => {

          state.status = "succeeded";

          state.variants =
            action.payload.variants || [];

          state.totalResults =
            action.payload.pagination?.totalVariants || 0;

          state.totalPages =
            action.payload.pagination?.totalPages || 1;

          state.currentPage =
            action.payload.pagination?.currentPage || 1;

          state.limit =
            action.payload.pagination?.limit || 5;

        }
      )

      .addCase(
        getVariants.rejected,
        (state, action) => {

          state.status = "failed";

          state.error =
            action.payload ||
            "Failed to fetch variants.";

        }
      )


      // ==================================================
      // GET SINGLE VARIANT
      // ==================================================

      .addCase(
        getVariant.pending,
        (state) => {

          state.getVariantStatus = "loading";

          state.getVariantError = null;

        }
      )

      .addCase(
        getVariant.fulfilled,
        (state, action) => {

          state.getVariantStatus = "succeeded";

          state.selectedVariant =
            action.payload;

        }
      )

      .addCase(
        getVariant.rejected,
        (state, action) => {

          state.getVariantStatus = "failed";

          state.getVariantError =
            action.payload ||
            "Failed to fetch variant.";

        }
      )


      // ==================================================
      // ADD VARIANT
      // ==================================================

      .addCase(
        addVariant.pending,
        (state) => {

          state.addStatus = "loading";

          state.addError = null;

        }
      )

      .addCase(
        addVariant.fulfilled,
        (state) => {

          state.addStatus = "succeeded";

        }
      )

      .addCase(
        addVariant.rejected,
        (state, action) => {

          state.addStatus = "failed";

          state.addError =
            action.payload ||
            "Failed to add variant.";

        }
      )


      // ==================================================
      // UPDATE VARIANT
      // ==================================================

      .addCase(
        updateVariant.pending,
        (state) => {

          state.updateStatus = "loading";

          state.updateError = null;

        }
      )

      .addCase(
        updateVariant.fulfilled,
        (state, action) => {

          state.updateStatus = "succeeded";

          /*
           * If the API returns the updated variant,
           * update it inside the current list as well.
           */

          const updatedVariant =
            action.payload?.variant ||
            action.payload;

          if (updatedVariant?.id) {

            const index =
              state.variants.findIndex(
                (variant) =>
                  variant.id === updatedVariant.id
              );

            if (index !== -1) {

              state.variants[index] =
                updatedVariant;

            }

            if (
              state.selectedVariant?.id ===
              updatedVariant.id
            ) {

              state.selectedVariant =
                updatedVariant;

            }

          }

        }
      )

      .addCase(
        updateVariant.rejected,
        (state, action) => {

          state.updateStatus = "failed";

          state.updateError =
            action.payload ||
            "Failed to update variant.";

        }
      )


      // ==================================================
      // DELETE VARIANT
      // ==================================================

      .addCase(
        deleteVariant.pending,
        (state) => {

          state.deleteStatus = "loading";

          state.deleteError = null;

        }
      )

      .addCase(
        deleteVariant.fulfilled,
        (state, action) => {

          state.deleteStatus = "succeeded";

          const deletedVariantId =
            action.payload.variantId;

          state.variants =
            state.variants.filter(
              (variant) =>
                variant.id !== deletedVariantId
            );

          state.totalResults =
            Math.max(
              state.totalResults - 1,
              0
            );

        }
      )

      .addCase(
        deleteVariant.rejected,
        (state, action) => {

          state.deleteStatus = "failed";

          state.deleteError =
            action.payload ||
            "Failed to delete variant.";

        }
      )


      // ==================================================
      // TOGGLE VARIANT STATUS
      // ==================================================

      .addCase(
        toggleVariantStatus.pending,
        (state) => {

          state.statusUpdateStatus = "loading";

          state.statusUpdateError = null;

        }
      )

      .addCase(
        toggleVariantStatus.fulfilled,
        (state, action) => {

          state.statusUpdateStatus = "succeeded";

          const updatedVariant =
            action.payload?.variant ||
            action.payload;

          if (updatedVariant?.id) {

            const index =
              state.variants.findIndex(
                (variant) =>
                  variant.id === updatedVariant.id
              );

            if (index !== -1) {

              state.variants[index] =
                updatedVariant;

            }

            if (
              state.selectedVariant?.id ===
              updatedVariant.id
            ) {

              state.selectedVariant =
                updatedVariant;

            }

          }

        }
      )

      .addCase(
        toggleVariantStatus.rejected,
        (state, action) => {

          state.statusUpdateStatus = "failed";

          state.statusUpdateError =
            action.payload ||
            "Failed to update variant status.";

        }
      );

  },

});


// ======================================================
// ACTIONS
// ======================================================

export const {
  clearSelectedVariant,
  clearVariantErrors,
  resetAddStatus,
  resetUpdateStatus,
  resetDeleteStatus,
  resetStatusUpdateStatus,
} = variantSlice.actions;


// ======================================================
// REDUCER
// ======================================================

export default variantSlice.reducer;