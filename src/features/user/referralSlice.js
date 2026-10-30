import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/*
|--------------------------------------------------------------------------
| Referral (customer side)
|--------------------------------------------------------------------------
| GET /referrals/me           -> { referralCode, shareLink, program, stats, referredBy }   (account page)
| GET /referrals/eligibility  -> { program, eligible, discount, minOrderAmount }          (logged in)
| GET /referrals/program      -> { isActive, referredDiscount, minOrderAmount, referrerReward } (guests)
| GET /referrals/validate?ref -> { valid, referrerName }                                   (signup page)
*/
export const fetchMyReferral = createAsyncThunk(
  "referral/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/referrals/me");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Could not load your referral details.");
    }
  }
);

// What the product cards / product page need: the programme, and (if logged in) whether
// this customer can use the friend's first-order offer.
export const fetchReferralOffer = createAsyncThunk(
  "referral/fetchOffer",
  async ({ loggedIn }, { rejectWithValue }) => {
    try {
      if (loggedIn) {
        const res = await axiosInstance.get("/referrals/eligibility");
        return res.data.data; // { program, eligible, discount, minOrderAmount }
      }
      const res = await axiosInstance.get("/referrals/program");
      return { program: res.data.data, eligible: false, discount: 0, minOrderAmount: res.data.data.minOrderAmount };
    } catch (err) {
      return rejectWithValue(err.message || "Could not load the referral offer.");
    }
  }
);

export const validateReferral = async (ref) => {
  const res = await axiosInstance.get("/referrals/validate", { params: { ref } });
  return res.data.data; // { valid, referrerName }
};

const referralSlice = createSlice({
  name: "referral",
  initialState: {
    mine: null,
    mineStatus: "idle",
    mineError: null,

    offer: null, // { program, eligible, discount, minOrderAmount }
    offerStatus: "idle",
    offerFor: null, // "user" | "guest": which kind of visitor `offer` was loaded for
  },
  reducers: {
    resetReferral: (state) => {
      state.mine = null;
      state.mineStatus = "idle";
      state.offer = null;
      state.offerStatus = "idle";
      state.offerFor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReferral.pending, (state) => {
        state.mineStatus = "loading";
        state.mineError = null;
      })
      .addCase(fetchMyReferral.fulfilled, (state, action) => {
        state.mineStatus = "succeeded";
        state.mine = action.payload;
      })
      .addCase(fetchMyReferral.rejected, (state, action) => {
        state.mineStatus = "failed";
        state.mineError = action.payload;
      })

      .addCase(fetchReferralOffer.pending, (state) => {
        state.offerStatus = "loading";
      })
      .addCase(fetchReferralOffer.fulfilled, (state, action) => {
        state.offerStatus = "succeeded";
        state.offer = action.payload;
        state.offerFor = action.meta.arg.loggedIn ? "user" : "guest";
      })
      .addCase(fetchReferralOffer.rejected, (state) => {
        state.offerStatus = "failed"; // the offer is a bonus: pages simply do not show it
      })

      // An order was just placed / paid: the "first order" offer may be used up, so load it again
      .addMatcher(
        (action) =>
          ["checkout/placeOrder/fulfilled", "payment/initiate/fulfilled", "payment/verifyRazorpay/fulfilled"].includes(
            action.type
          ),
        (state) => {
          state.offerStatus = "idle";
        }
      );
  },
});

export const { resetReferral } = referralSlice.actions;
export default referralSlice.reducer;
