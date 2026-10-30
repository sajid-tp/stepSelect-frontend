import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/*
|--------------------------------------------------------------------------
| Admin offers  (product offers, category offers, referral programme)
|--------------------------------------------------------------------------
| GET    /admin/offers?type&search&status&page&limit&sort -> { data: { offers[], pagination } }
| GET    /admin/offers/options?search                     -> { data: { categories[], products[] } }
| POST   /admin/offers                                    -> { data: offer }
| PATCH  /admin/offers/:offerId                           -> { data: offer }
| PATCH  /admin/offers/:offerId/status                    -> { data: { id, isActive, status } }
| DELETE /admin/offers/:offerId                           -> { data: { id } }
| GET    /admin/offers/referral                           -> { data: { program, stats } }
| PUT    /admin/offers/referral                           -> { data: { program, stats } }
*/
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export const getOffers = createAsyncThunk(
  "adminOffers/getOffers",
  async (
    { type = "category", search = "", status = "all", page = 1, limit = 10, sort = "newest" } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.get("/admin/offers", {
        params: { type, search, status, page, limit, sort },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch offers."));
    }
  }
);

export const getOfferOptions = createAsyncThunk(
  "adminOffers/getOfferOptions",
  async ({ search = "" } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/offers/options", { params: { search } });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load options."));
    }
  }
);

export const createOffer = createAsyncThunk(
  "adminOffers/createOffer",
  async (offerData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/admin/offers", offerData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create offer."));
    }
  }
);

export const updateOffer = createAsyncThunk(
  "adminOffers/updateOffer",
  async ({ offerId, offerData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/admin/offers/${offerId}`, offerData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update offer."));
    }
  }
);

export const toggleOfferStatus = createAsyncThunk(
  "adminOffers/toggleOfferStatus",
  async (offerId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/admin/offers/${offerId}/status`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update offer status."));
    }
  }
);

export const deleteOffer = createAsyncThunk(
  "adminOffers/deleteOffer",
  async (offerId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/admin/offers/${offerId}`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete offer."));
    }
  }
);

export const getReferralProgram = createAsyncThunk(
  "adminOffers/getReferralProgram",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/offers/referral");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load the referral programme."));
    }
  }
);

export const saveReferralProgram = createAsyncThunk(
  "adminOffers/saveReferralProgram",
  async (settings, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/admin/offers/referral", settings);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to save the referral programme."));
    }
  }
);

const initialState = {
  offers: [],
  totalResults: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
  status: "idle",
  error: null,

  options: { categories: [], products: [] },
  optionsStatus: "idle",

  referral: null, // { program, stats }
  referralStatus: "idle",
  referralError: null,
};

const offerSlice = createSlice({
  name: "adminOffers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOffers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getOffers.fulfilled, (state, action) => {
        const { offers, pagination } = action.payload;
        state.status = "succeeded";
        state.offers = offers;
        state.totalResults = pagination.totalResults;
        state.totalPages = pagination.totalPages;
        state.currentPage = pagination.page;
        state.limit = pagination.limit;
      })
      .addCase(getOffers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(getOfferOptions.pending, (state) => {
        state.optionsStatus = "loading";
      })
      .addCase(getOfferOptions.fulfilled, (state, action) => {
        state.optionsStatus = "succeeded";
        state.options = action.payload;
      })
      .addCase(getOfferOptions.rejected, (state) => {
        state.optionsStatus = "failed";
      })

      .addCase(toggleOfferStatus.fulfilled, (state, action) => {
        const row = state.offers.find((o) => o.id === action.payload.id);
        if (row) {
          row.isActive = action.payload.isActive;
          row.status = action.payload.status;
        }
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.offers = state.offers.filter((o) => o.id !== action.payload.id);
        state.totalResults = Math.max(state.totalResults - 1, 0);
      })

      .addCase(getReferralProgram.pending, (state) => {
        state.referralStatus = "loading";
        state.referralError = null;
      })
      .addCase(getReferralProgram.fulfilled, (state, action) => {
        state.referralStatus = "succeeded";
        state.referral = action.payload;
      })
      .addCase(getReferralProgram.rejected, (state, action) => {
        state.referralStatus = "failed";
        state.referralError = action.payload;
      })
      .addCase(saveReferralProgram.fulfilled, (state, action) => {
        state.referral = action.payload;
      });
  },
});

export default offerSlice.reducer;
