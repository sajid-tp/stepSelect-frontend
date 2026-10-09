import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import ProductCard from "./ProductCard";
import { getRelatedProducts } from "../features/user/productSlice";
import { getCart, quickAddToCart } from "../features/user/cartSlice";

// cards stay between 200px and 240px wide, however wide the screen is
const GRID =
  "mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(200px,240px))] sm:gap-x-5 sm:gap-y-10";

function RelatedProducts({ productId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

const { relatedProducts, relatedProductsFor, relatedStatus, relatedError } = useSelector(
  (state) => state.products
);
  const user = useSelector((state) => state.auth?.user);
  const cartItems = useSelector((state) => state.cart.items);
  const cartStatus = useSelector((state) => state.cart.status);

  // load the other products whenever the viewed product changes
  useEffect(() => {
    dispatch(getRelatedProducts({ productId, limit: 5 }));
  }, [dispatch, productId]);

  useEffect(() => {
    if (user && cartStatus === "idle") dispatch(getCart());
  }, [dispatch, user, cartStatus]);

  const productIdsInCart = new Set(cartItems.map((item) => String(item.productId)));

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    await dispatch(quickAddToCart(product.id)).unwrap();
  };

  const isCurrent = relatedProductsFor === String(productId);
const isLoading = relatedStatus === "idle" || relatedStatus === "loading" || !isCurrent;
const products = isCurrent ? relatedProducts : [];

// show the real reason instead of skeletons forever
if (!isLoading && relatedStatus === "failed") {
  return (
    <section className="w-full px-4 pb-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-16">
      <p className="border-t border-gray-100 pt-10 text-sm text-red-600">
        Couldn't load more products: {relatedError}
      </p>
    </section>
  );
}

  // nothing to show: hide the whole section
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="w-full px-4 pb-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-16">
      <h2 className="border-t border-gray-100 pt-10 text-xl font-semibold text-gray-900 sm:text-2xl">
        You may also like
      </h2>

      <div className={GRID}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] w-full rounded-xl bg-gray-100" />
                <div className="mt-4 h-3 w-16 rounded bg-gray-100" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />
                <div className="mt-2 h-4 w-20 rounded bg-gray-100" />
              </div>
            ))
          : products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                inCart={productIdsInCart.has(String(product.id))}
                onViewCart={() => navigate("/cart")}
              />
            ))}
      </div>
    </section>
  );
}

export default RelatedProducts;