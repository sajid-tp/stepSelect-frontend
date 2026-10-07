import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import { getProductById } from "../features/user/productSlice";


const PAGE_PADDING = "w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16";

// "red", "#ff0000" -> true.  "White / Orange" -> false (shown as a text pill)
const isCssColor = (value) =>
  typeof CSS !== "undefined" &&
  CSS.supports("color", String(value).trim().toLowerCase());

const formatPrice = (value) =>
  `₹${Number(value).toLocaleString("en-IN")}`;


function ProductDetailsPage() {

  const { productId } = useParams();

  const dispatch = useDispatch();


  const {
    productDetails,
    productDetailsStatus,
    productDetailsError,
  } = useSelector(
    (state) => state.products
  );


  const [colorIndex, setColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);


  useEffect(() => {

    dispatch(getProductById(productId));

    setColorIndex(0);
    setSelectedSize(null);
    setSelectedImage(0);

  }, [dispatch, productId]);


  const handleColorChange = (index) => {

    setColorIndex(index);
    setSelectedSize(null);
    setSelectedImage(0);

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (productDetailsStatus === "loading") {

    return (
      <>
        <Navbar />

        <div className={`${PAGE_PADDING} py-10`}>

          <div className="grid animate-pulse gap-8 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)] lg:gap-12 xl:gap-16">

            <div className="aspect-[4/3] w-full rounded-xl bg-gray-200" />

            <div className="space-y-5 lg:max-w-xl">

              <div className="h-5 w-24 rounded bg-gray-200" />

              <div className="h-10 w-3/4 rounded bg-gray-200" />

              <div className="h-8 w-40 rounded bg-gray-200" />

              <div className="h-20 w-full rounded bg-gray-200" />

              <div className="h-12 w-full rounded bg-gray-200" />

            </div>

          </div>

        </div>
      </>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (productDetailsStatus === "failed") {

    return (
      <>
        <Navbar />

        <div className="flex min-h-[60vh] items-center justify-center px-4">

          <div className="text-center">

            <h2 className="text-lg font-semibold text-gray-900">
              Failed to load product
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {productDetailsError}
            </p>

          </div>

        </div>
      </>
    );
  }


  if (!productDetails) {
    return null;
  }


  // =====================================================
  // DATA
  // =====================================================

  const variants = productDetails.variants || [];

  const activeVariant = variants[colorIndex] || variants[0];

  const sizes = activeVariant?.sizes || [];

  // user's choice, or the first size that is in stock
  const activeSize =
    sizes.find(
      (s) => s.size === selectedSize && s.quantity > 0
    ) ||
    sizes.find((s) => s.quantity > 0) ||
    null;

  const stock = activeSize?.quantity || 0;

  // images of the selected color (fallback: every image of the product)
  const images =
    activeVariant?.images?.length
      ? activeVariant.images
      : variants.flatMap((variant) => variant.images || []);

  const price = Number(activeVariant?.price) || 0;

  const discount = Number(activeVariant?.discountPercent) || 0;

  const finalPrice =
    discount > 0
      ? Number((price - (price * discount) / 100).toFixed(2))
      : price;


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">

      <Navbar />


      {/* Breadcrumb */}

      <div className={`${PAGE_PADDING} pt-6`}>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:text-sm">

          <Link to="/" className="hover:text-[#f4511e]">
            Home
          </Link>

          <span>/</span>

          <Link to="/shop" className="hover:text-[#f4511e]">
            Shop
          </Link>

          <span>/</span>

          <span className="text-gray-900">
            {productDetails.name}
          </span>

        </div>

      </div>


      {/* Product */}

      <main className={`${PAGE_PADDING} py-8 sm:py-10`}>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)] lg:gap-12 xl:gap-16">


          {/* ========================= */}
          {/* IMAGES */}
          {/* ========================= */}

          <div className="min-w-0">

            {/* Main image */}

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#f3f3f3]">

              {images[selectedImage] ? (

                <img
                  src={images[selectedImage]}
                  alt={productDetails.name}
                  className="h-full w-full object-cover"
                />

              ) : (

                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No image available
                </div>

              )}


              {/* Wishlist */}

              <button
                type="button"
                aria-label="Add to wishlist"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition hover:scale-105"
              >

                <svg
                  className="h-5 w-5 text-gray-900"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>

              </button>

            </div>


            {/* Thumbnails */}

            {images.length > 1 && (

              <div className="mt-3 flex flex-wrap gap-2">

                {images.map((image, index) => (

                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 sm:h-20 sm:w-24 ${
                      selectedImage === index
                        ? "border-[#f4511e]"
                        : "border-transparent"
                    }`}
                  >

                    <img
                      src={image}
                      alt={`${productDetails.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                  </button>

                ))}

              </div>

            )}

          </div>


          {/* ========================= */}
          {/* PRODUCT INFORMATION */}
          {/* ========================= */}

          <div className="min-w-0 lg:max-w-xl">

            {/* Category + brand */}

            <div className="flex flex-wrap items-center gap-3">

              {productDetails.category?.categoryName && (

                <span className="rounded bg-[#fdece7] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#f4511e]">
                  {productDetails.category.categoryName}
                </span>

              )}

              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {productDetails.brand?.name}
              </span>

            </div>


            {/* Name */}

            <h1 className="mt-4 text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-gray-900 sm:text-4xl">
              {productDetails.name}
            </h1>


            {/* Price */}

            <div className="mt-5 flex flex-wrap items-center gap-3">

              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(finalPrice)}
              </span>

              {discount > 0 && (

                <>

                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(price)}
                  </span>

                  <span className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                    {discount}% OFF
                  </span>

                </>

              )}

            </div>


            {/* Description */}

            {productDetails.description && (

              <p className="mt-6 text-sm leading-7 text-gray-600 sm:text-base">
                {productDetails.description}
              </p>

            )}


            {/* Color */}

            {variants.length > 0 && (

              <div className="mt-8 border-t border-gray-100 pt-6">

                <div className="flex items-center justify-between">

                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                    Color
                  </h2>

                  <span className="text-sm text-gray-500">
                    {activeVariant.color}
                  </span>

                </div>


                <div className="mt-3 flex flex-wrap gap-3">

                  {variants.map((variant, index) => {

                    const isActive = index === colorIndex;

                    // real swatch when the color name is a valid CSS color
                    if (isCssColor(variant.color)) {

                      return (

                        <button
                          key={variant.id}
                          type="button"
                          title={variant.color}
                          aria-label={variant.color}
                          onClick={() => handleColorChange(index)}
                          className={`h-11 w-11 rounded-lg border-2 p-[3px] transition ${
                            isActive
                              ? "border-gray-900"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >

                          <span
                            className="block h-full w-full rounded-md border border-black/10"
                            style={{
                              backgroundColor: variant.color,
                            }}
                          />

                        </button>

                      );

                    }

                    // otherwise show the name
                    return (

                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleColorChange(index)}
                        className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-900"
                        }`}
                      >
                        {variant.color}
                      </button>

                    );

                  })}

                </div>

              </div>

            )}


            {/* Size */}

            {sizes.length > 0 && (

              <div className="mt-7">

                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                  Select Size
                </h2>


                <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">

                  {sizes.map(({ size, quantity }) => {

                    const outOfStock = quantity <= 0;

                    const isActive = activeSize?.size === size;

                    return (

                      <button
                        key={size}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 rounded-lg border px-2 text-sm font-medium transition ${
                          isActive
                            ? "border-gray-900 bg-gray-900 text-white"
                            : outOfStock
                              ? "cursor-not-allowed border-gray-200 text-gray-300 line-through"
                              : "border-gray-300 text-gray-700 hover:border-gray-900"
                        }`}
                      >
                        {size}
                      </button>

                    );

                  })}

                </div>

              </div>

            )}


            {/* Stock */}

            <div className="mt-5">

              {stock > 5 && (
                <p className="text-sm font-medium text-green-600">
                  In stock
                </p>
              )}

              {stock > 0 && stock <= 5 && (
                <p className="text-sm font-medium text-amber-600">
                  Only {stock} left
                </p>
              )}

              {stock <= 0 && (
                <p className="text-sm font-medium text-red-500">
                  Out of stock
                </p>
              )}

            </div>


            {/* Add to cart */}

            <button
              type="button"
              disabled={stock <= 0}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#f4511e] px-6 text-sm font-semibold text-white transition hover:bg-[#e64a19] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Add to Cart
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}


export default ProductDetailsPage;