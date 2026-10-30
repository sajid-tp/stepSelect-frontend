import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReferralOffer } from "../features/user/referralSlice";

// Loads the referral offer once for the current visitor and returns it.
// `eligible` = this customer signed up with a referral and has not ordered yet.
export default function useReferralOffer() {
  const dispatch = useDispatch();
  const loggedIn = Boolean(useSelector((state) => state.auth?.user));
  const { offer, offerStatus, offerFor } = useSelector((state) => state.referral);

  const wanted = loggedIn ? "user" : "guest";

  useEffect(() => {
    // (re)load when nothing is loaded yet, or the visitor logged in / out since
    if (offerStatus === "loading") return;
    if (offerStatus === "idle" || offerFor !== wanted) {
      dispatch(fetchReferralOffer({ loggedIn }));
    }
  }, [dispatch, loggedIn, offerStatus, offerFor, wanted]);

  const ready = offerFor === wanted ? offer : null;
  const program = ready?.program || null;

  return {
    program: program?.isActive ? program : null,
    eligible: Boolean(ready?.eligible && ready.discount > 0),
    discount: ready?.discount || 0,
    minOrderAmount: ready?.minOrderAmount || 0,
  };
}
