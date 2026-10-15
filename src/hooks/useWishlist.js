import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  getWishlistIds,
  quickAddToWishlist,
  removeProductFromWishlist,
} from "../features/user/wishlistSlice";

/*
  Shared by every screen that shows product cards (Shop, Related products).
  - loads the light wishlist list once for a logged-in user
  - tells which products are saved
  - toggles a product (heart on a card)
*/
export default function useWishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);
  const ids = useSelector((state) => state.wishlist.ids);
  const idsStatus = useSelector((state) => state.wishlist.idsStatus);

  // Public pages: only call the API for a logged-in user,
  // otherwise the 401 would redirect visitors to /login.
  useEffect(() => {
    if (user && idsStatus === "idle") dispatch(getWishlistIds());
  }, [dispatch, user, idsStatus]);

  const productIdsInWishlist = useMemo(
    () => new Set(ids.map((line) => String(line.productId))),
    [ids]
  );

  // Rejects with the error text so the card can show it.
  const toggleProduct = useCallback(
    async (product) => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (productIdsInWishlist.has(String(product.id))) {
        await dispatch(removeProductFromWishlist(product.id)).unwrap();
      } else {
        await dispatch(quickAddToWishlist(product.id)).unwrap();
      }
    },
    [dispatch, navigate, user, productIdsInWishlist]
  );

  return { productIdsInWishlist, toggleProduct };
}
