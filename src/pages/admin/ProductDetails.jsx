import { useEffect } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AdminSidebar
  from "../../components/AdminSideBar";

import {
  getProduct,
  clearSelectedProduct,
} from "../../features/admin/productSlice";


function ProductDetails() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { productId } =
    useParams();


  const {
    selectedProduct,
    status,
    error,
  } = useSelector(
    (state) =>
      state.adminProducts
  );


  // ===================================================
  // GET PRODUCT
  // ===================================================

  useEffect(() => {

    dispatch(
      getProduct(productId)
    );


    return () => {

      dispatch(
        clearSelectedProduct()
      );

    };

  }, [
    dispatch,
    productId,
  ]);


  // ===================================================
  // CALCULATE STOCK
  // ===================================================

  const totalStock =
    selectedProduct?.variants?.reduce(
      (total, variant) => {

        const variantStock =
          variant.sizes?.reduce(
            (sum, size) =>
              sum + Number(size.stock || 0),
            0
          ) || 0;

        return total + variantStock;

      },
      0
    ) || 0;


  // ===================================================
  // PRICE RANGE
  // ===================================================

  const prices =
    selectedProduct?.variants
      ?.map(
        (variant) =>
          Number(variant.price)
      )
      .filter(
        (price) =>
          !Number.isNaN(price)
      ) || [];


  const lowestPrice =
    prices.length
      ? Math.min(...prices)
      : null;

  const highestPrice =
    prices.length
      ? Math.max(...prices)
      : null;


  const priceText =
    lowestPrice === null
      ? "—"
      : lowestPrice === highestPrice
        ? `₹${lowestPrice}`
        : `₹${lowestPrice} - ₹${highestPrice}`;


  // ===================================================
  // LOADING
  // ===================================================

  if (
    status === "loading" &&
    !selectedProduct
  ) {

    return (

      <div
        className="
          min-h-screen
          bg-[#f8fafc]
        "
      >

        <AdminSidebar />

        <main
          className="
            ml-[214px]
            min-h-screen
          "
        >

          <div
            className="
              flex
              min-h-screen
              items-center
              justify-center
              text-sm
              text-gray-500
            "
          >
            Loading product...
          </div>

        </main>

      </div>

    );

  }


  // ===================================================
  // ERROR
  // ===================================================

  if (
    error &&
    !selectedProduct
  ) {

    return (

      <div
        className="
          min-h-screen
          bg-[#f8fafc]
        "
      >

        <AdminSidebar />

        <main
          className="
            ml-[214px]
            min-h-screen
            p-12
          "
        >

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            className="
              text-sm
              font-medium
              text-[#ff5722]
              hover:underline
            "
          >
            ← Back to Products
          </button>


          <div
            className="
              mt-8
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-6
              text-red-600
            "
          >
            {error}
          </div>

        </main>

      </div>

    );

  }


  if (!selectedProduct) {
    return null;
  }


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#f8fafc]
      "
    >

      <AdminSidebar />


      <main
        className="
          ml-[214px]
          min-h-screen
        "
      >

        {/* HEADER */}

        <header
          className="
            border-b
            border-gray-200
            bg-white
            px-12
            py-7
          "
        >

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            className="
              text-sm
              font-medium
              text-gray-500
              transition
              hover:text-[#ff5722]
            "
          >
            ← Back to Products
          </button>


          <div className="mt-5">

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.16em]
                text-gray-400
              "
            >
              Catalog
            </p>


            <h1
              className="
                mt-1
                text-4xl
                font-bold
                leading-none
                text-gray-900
              "
            >

              Product{" "}

              <span
                className="
                  text-[#ff5722]
                "
              >
                Details
              </span>

            </h1>

          </div>

        </header>


        {/* CONTENT */}

        <section
          className="
            px-12
            py-10
          "
        >

          {/* PRODUCT INFO */}

          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-8
              shadow-sm
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-8
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[#ff5722]
                  "
                >
                  Product Information
                </p>


                <h2
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  {selectedProduct.productName}
                </h2>

              </div>


              <span
                className={`
                  rounded-full
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  ${
                    selectedProduct.isActive
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {selectedProduct.isActive
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>


            {/* INFO GRID */}

            <div
              className="
                mt-8
                grid
                grid-cols-1
                gap-6
                md:grid-cols-3
              "
            >

              <div>

                <p className="text-xs text-gray-400">
                  Brand
                </p>

                <p
                  className="
                    mt-1
                    font-semibold
                    text-gray-900
                  "
                >
                  {selectedProduct.brand?.name || "—"}
                </p>

              </div>


              <div>

                <p className="text-xs text-gray-400">
                  Category
                </p>

                <p
                  className="
                    mt-1
                    font-semibold
                    text-gray-900
                  "
                >
                  {selectedProduct.category?.name || "—"}
                </p>

              </div>


              <div>

                <p className="text-xs text-gray-400">
                  Total Stock
                </p>

                <p
                  className="
                    mt-1
                    font-semibold
                    text-gray-900
                  "
                >
                  {totalStock}
                </p>

              </div>

            </div>


            {/* PRICE */}

            <div
              className="
                mt-6
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
              "
            >

              <div>

                <p className="text-xs text-gray-400">
                  Price
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-gray-900
                  "
                >
                  {priceText}
                </p>

              </div>


              <div>

                <p className="text-xs text-gray-400">
                  Variants
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-gray-900
                  "
                >
                  {selectedProduct.variants?.length || 0}
                </p>

              </div>

            </div>


            {/* DESCRIPTION */}

            <div
              className="
                mt-8
                border-t
                border-gray-100
                pt-6
              "
            >

              <p className="text-xs text-gray-400">
                Description
              </p>

              <p
                className="
                  mt-2
                  max-w-4xl
                  text-sm
                  leading-6
                  text-gray-600
                "
              >
                {selectedProduct.description}
              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* VARIANTS */}
          {/* ================================================= */}

          <div className="mt-10">

            <div>

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-gray-400
                "
              >
                Inventory
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-gray-900
                "
              >
                Variants
              </h2>

            </div>


            <div
              className="
                mt-6
                grid
                grid-cols-1
                gap-6
                lg:grid-cols-2
              "
            >

              {selectedProduct.variants?.map(
                (variant) => (

                  <div
                    key={variant.id}
                    className="
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      p-6
                      shadow-sm
                    "
                  >

                    {/* VARIANT HEADER */}

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                      "
                    >

                      <div>

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-wide
                            text-gray-400
                          "
                        >
                          Color
                        </p>

                        <h3
                          className="
                            mt-1
                            text-lg
                            font-semibold
                            text-gray-900
                          "
                        >
                          {variant.color}
                        </h3>

                      </div>


                      <span
                        className={`
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${
                            variant.isActive
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                          }
                        `}
                      >
                        {variant.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>


                    {/* PRICE */}

                    <div className="mt-5">

                      <p
                        className="
                          text-xs
                          text-gray-400
                        "
                      >
                        Price
                      </p>

                      <p
                        className="
                          mt-1
                          text-xl
                          font-bold
                          text-gray-900
                        "
                      >
                        ₹{variant.price}
                      </p>

                    </div>


                    {/* IMAGES */}

                    <div className="mt-5">

                      <p
                        className="
                          text-xs
                          text-gray-400
                        "
                      >
                        Images
                      </p>

                      <div
                        className="
                          mt-2
                          flex
                          gap-2
                          overflow-x-auto
                        "
                      >

                        {variant.images?.map(
                          (image, index) => (

                            <img
                              key={index}
                              src={image}
                              alt={`${variant.color} ${index + 1}`}
                              className="
                                h-20
                                w-20
                                shrink-0
                                rounded-lg
                                border
                                border-gray-200
                                object-cover
                              "
                            />

                          )
                        )}

                      </div>

                    </div>


                    {/* SIZES */}

                    <div className="mt-5">

                      <p
                        className="
                          text-xs
                          text-gray-400
                        "
                      >
                        Size & Stock
                      </p>


                      <div
                        className="
                          mt-2
                          divide-y
                          divide-gray-100
                          rounded-lg
                          border
                          border-gray-200
                        "
                      >

                        {variant.sizes?.map(
                          (size) => (

                            <div
                              key={size.size}
                              className="
                                flex
                                items-center
                                justify-between
                                px-4
                                py-3
                                text-sm
                              "
                            >

                              <span
                                className="
                                  font-medium
                                  text-gray-700
                                "
                              >
                                {size.size}
                              </span>

                              <span
                                className="
                                  font-semibold
                                  text-gray-900
                                "
                              >
                                {size.stock}
                              </span>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </section>

      </main>

    </div>

  );
}


export default ProductDetails;