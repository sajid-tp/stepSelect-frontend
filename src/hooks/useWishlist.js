import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  getWishlistIds,
  quickAddToWishlist,
  removeProductFromWishlist,
} from "../features/user/wishlistSlice";

export default function useWishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);
  const ids = useSelector((state) => state.wishlist.ids);
  const idsStatus = useSelector((state) => state.wishlist.idsStatus);

  useEffect(() => {
    if (user && idsStatus === "idle") dispatch(getWishlistIds());
  }, [dispatch, user, idsStatus]);

  const productIdsInWishlist = useMemo(
    () => new Set(ids.map((line) => String(line.productId))),
    [ids]
  );

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
