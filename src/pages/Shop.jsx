import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";

import {
  getProducts,
  getCategories,
  getBrands,
} from "../features/user/productSlice";
import { getCart, quickAddToCart } from "../features/user/cartSlice";

function Shop() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ---------- redux ----------
  const {
    products,
    categories,
    brands,
    totalResults,
    totalPages,
    currentPage,
    limit,
    productStatus,
    productError,
    categoryStatus,
    brandStatus,
  } = useSelector((state) => state.products);

  const user = useSelector((state) => state.auth?.user);
  const cartItems = useSelector((state) => state.cart.items);
  const cartStatus = useSelector((state) => state.cart.status);

  // ---------- local state ----------
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedGender, setSelectedGender] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ---------- categories + brands ----------
  useEffect(() => {
    if (categoryStatus === "idle") dispatch(getCategories());
    if (brandStatus === "idle") dispatch(getBrands());
  }, [dispatch, categoryStatus, brandStatus]);

  // ---------- cart (to know which cards say "Added to Cart") ----------
  // Shop is public: only load the cart for a logged-in user,
  // otherwise the 401 would redirect visitors to /login.
  useEffect(() => {
    if (user && cartStatus === "idle") dispatch(getCart());
  }, [dispatch, user, cartStatus]);

  const productIdsInCart = new Set(cartItems.map((item) => String(item.productId)));

  // ---------- products ----------
  const loadProducts = useCallback(() => {
    dispatch(
      getProducts({
        search,
        category: selectedCategories.join(","),
        brand: selectedBrands.join(","),
        gender: selectedGender,
        minPrice,
        maxPrice,
        sort: "",
        page,
        limit: 12,
      })
    );
  }, [
    dispatch,
    search,
    selectedCategories,
    selectedBrands,
    selectedGender,
    minPrice,
    maxPrice,
    page,
  ]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ---------- handlers ----------
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId]
    );
    setPage(1);
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrands((previous) =>
      previous.includes(brandId)
        ? previous.filter((id) => id !== brandId)
        : [...previous, brandId]
    );
    setPage(1);
  };

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    setPage(1);
  };

  const handleMinPriceChange = (value) => {
    setMinPrice(value);
    setPage(1);
  };

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedGender("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  // Rejects with the error text, the card shows it under the button.
  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    await dispatch(quickAddToCart(product.id)).unwrap();
  };

  const isLoading = productStatus === "loading";

  // ---------- render ----------
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <Navbar />

      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 2xl:px-16">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center gap-2 text-xs sm:mb-8 sm:text-sm">
          <span className="text-gray-400">Home</span>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-900">Shop</span>
        </div>

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Shop</h1>
            <p className="mt-2 text-xs text-gray-500 sm:text-sm">
              Find the perfect pair for every step.
            </p>
          </div>

          {/* SEARCH */}
          <div className="w-full md:w-[340px] md:shrink-0">
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-16 text-sm text-gray-900 outline-none transition focus:border-[#f4511e]"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#f4511e] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE FILTER BUTTON */}
        <div className="mb-5 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((previous) => !previous)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900"
          >
            <span>Filters</span>
            <span className="text-lg leading-none text-gray-500">
              {filtersOpen ? "−" : "+"}
            </span>
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* FILTER SIDEBAR */}
          <div
            className={`w-full lg:block lg:w-[230px] lg:shrink-0 ${
              filtersOpen ? "block" : "hidden"
            }`}
          >
            <ProductFilters
              categories={categories}
              brands={brands}
              selectedCategories={selectedCategories}
              selectedGender={selectedGender}
              selectedBrands={selectedBrands}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onGenderChange={handleGenderChange}
              onMinPriceChange={handleMinPriceChange}
              onMaxPriceChange={handleMaxPriceChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* PRODUCT SECTION */}
          <section className="min-w-0 w-full flex-1">
            {/* RESULT COUNT */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs text-gray-500 sm:text-sm">
                {isLoading ? "Loading products..." : `${totalResults} products`}
              </p>
            </div>

            {/* LOADING */}
            {isLoading && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="min-w-0 animate-pulse">
                    <div className="aspect-[4/5] w-full rounded-lg bg-gray-100 sm:rounded-xl" />
                    <div className="mt-4 h-3 w-16 rounded bg-gray-100" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />
                    <div className="mt-2 h-4 w-20 rounded bg-gray-100" />
                    <div className="mt-3 h-9 w-full rounded-lg bg-gray-100" />
                  </div>
                ))}
              </div>
            )}

            {/* ERROR */}
            {!isLoading && productStatus === "failed" && (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 text-center">
                <h3 className="text-base font-semibold text-red-700">
                  Unable to load products
                </h3>

                <p className="mt-2 max-w-md text-sm text-red-600">
                  {productError || "Something went wrong while loading the products."}
                </p>

                <button
                  type="button"
                  onClick={loadProducts}
                  className="mt-5 rounded-lg bg-[#f4511e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#e64a19]"
                >
                  Try again
                </button>
              </div>
            )}

            {/* EMPTY */}
            {!isLoading && productStatus !== "failed" && products.length === 0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  No products found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 text-sm font-medium text-[#f4511e] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* PRODUCTS */}
            {!isLoading && productStatus !== "failed" && products.length > 0 && (
              <>
                <div className="grid w-full grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-x-5 sm:gap-y-10">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      inCart={productIdsInCart.has(String(product.id))}
                      onViewCart={() => navigate("/cart")}
                    />
                  ))}
                </div>

                {/* PAGINATION */}
                <div className="w-full overflow-x-auto">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalResults={totalResults}
                    limit={limit}
                    onPageChange={setPage}
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Shop;
