import { useEffect, useState } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import AdminSidebar
  from "../../components/AdminSideBar";

import {
  createProduct,
  updateProduct,
  getProduct,
  resetCreateStatus,
  resetUpdateStatus,
} from "../../features/admin/productSlice";

import {
  getCategories,
} from "../../features/admin/categorySlice";

import {
  getBrands,
} from "../../features/admin/brandSlice";


function ProductForm() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const { productId } =
    useParams();


  const isEditMode =
    Boolean(productId);


  // ===================================================
  // REDUX
  // ===================================================

  const {
    selectedProduct,
    createStatus,
    createError,
    updateStatus,
    updateError,
  } = useSelector(
    (state) => state.adminProducts
  );


  const {
    categories = [],
  } = useSelector(
    (state) => state.adminCategories
  );


  const {
    brands = [],
  } = useSelector(
    (state) => state.adminBrands
  );


  // ===================================================
  // PRODUCT FORM
  // ===================================================

  const [productName, setProductName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [brandId, setBrandId] =
    useState("");


  // ===================================================
  // VARIANT FORM
  // ===================================================

  const [color, setColor] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [images, setImages] =
    useState("");

  const [sizes, setSizes] =
    useState([
      {
        size: "",
        stock: "",
      },
    ]);


  // ===================================================
  // LOCAL VARIANTS
  // ===================================================

  const [variants, setVariants] =
    useState([]);


  const [formError, setFormError] =
    useState("");


  // ===================================================
  // LOAD CATEGORIES + BRANDS
  // ===================================================

  useEffect(() => {

    dispatch(
      getCategories({
        search: "",
        page: 1,
        limit: 100,
      })
    );


    dispatch(
      getBrands({
        search: "",
        page: 1,
        limit: 100,
      })
    );

  }, [dispatch]);


  // ===================================================
  // EDIT PRODUCT
  // ===================================================

  useEffect(() => {

    if (!isEditMode) {
      return;
    }


    dispatch(
      getProduct(productId)
    );

  }, [
    dispatch,
    productId,
    isEditMode,
  ]);


  // ===================================================
  // FILL EDIT DATA
  // ===================================================

  useEffect(() => {

    if (!isEditMode) {
      return;
    }


    const product =
      selectedProduct ||
      location.state?.product;


    if (!product) {
      return;
    }


    setProductName(
      product.productName || ""
    );

    setDescription(
      product.description || ""
    );

    setCategoryId(
      product.category?.id ||
      product.categoryId ||
      ""
    );

    setBrandId(
      product.brand?.id ||
      product.brandId ||
      ""
    );


    if (product.variants) {

      setVariants(
        product.variants.map(
          (variant) => ({
            color:
              variant.color || "",

            price:
              variant.price ?? "",

            images:
              variant.images || [],

            sizes:
              variant.sizes?.map(
                (size) => ({
                  size:
                    size.size || "",

                  stock:
                    size.stock ?? "",
                })
              ) || [],
          })
        )
      );

    }

  }, [
    selectedProduct,
    location.state,
    isEditMode,
  ]);


  // ===================================================
  // SIZE
  // ===================================================

  const handleAddSize = () => {

    setSizes(
      (previous) => [
        ...previous,
        {
          size: "",
          stock: "",
        },
      ]
    );

  };


  const handleRemoveSize = (
    index
  ) => {

    setSizes(
      (previous) =>
        previous.filter(
          (_, i) =>
            i !== index
        )
    );

  };


  const handleSizeChange = (
    index,
    field,
    value
  ) => {

    setSizes(
      (previous) =>
        previous.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        )
    );

  };


  // ===================================================
  // ADD VARIANT
  // ===================================================

  const handleAddVariant =
    (e) => {

      e.preventDefault();

      setFormError("");


      if (!color.trim()) {

        setFormError(
          "Variant color is required."
        );

        return;
      }


      if (
        price === "" ||
        Number(price) < 0
      ) {

        setFormError(
          "Enter a valid variant price."
        );

        return;
      }


      const imageList =
        images
          .split(",")
          .map(
            (image) =>
              image.trim()
          )
          .filter(Boolean);


      if (imageList.length < 3) {

        setFormError(
          "A variant must have at least 3 images."
        );

        return;
      }


      const validSizes =
        sizes.filter(
          (item) =>
            item.size.trim() !== ""
        );


      if (
        validSizes.length === 0
      ) {

        setFormError(
          "Add at least one size."
        );

        return;
      }


      for (
        const size of validSizes
      ) {

        if (
          size.stock === "" ||
          Number(size.stock) < 0
        ) {

          setFormError(
            `Enter valid stock for ${size.size}.`
          );

          return;
        }

      }


      const newVariant = {

        color:
          color.trim(),

        price:
          Number(price),

        images:
          imageList,

        sizes:
          validSizes.map(
            (item) => ({
              size:
                item.size.trim(),

              stock:
                Number(item.stock),
            })
          ),

      };


      setVariants(
        (previous) => [
          ...previous,
          newVariant,
        ]
      );


      // Reset variant form

      setColor("");

      setPrice("");

      setImages("");

      setSizes([
        {
          size: "",
          stock: "",
        },
      ]);

  };


  // ===================================================
  // REMOVE VARIANT
  // ===================================================

  const handleRemoveVariant = (
    index
  ) => {

    setVariants(
      (previous) =>
        previous.filter(
          (_, i) =>
            i !== index
        )
    );

  };


  // ===================================================
  // FINISH / SAVE
  // ===================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setFormError("");


      if (!productName.trim()) {

        setFormError(
          "Product name is required."
        );

        return;
      }


      if (!description.trim()) {

        setFormError(
          "Product description is required."
        );

        return;
      }


      if (!categoryId) {

        setFormError(
          "Please select a category."
        );

        return;
      }


      if (!brandId) {

        setFormError(
          "Please select a brand."
        );

        return;
      }


      if (
        variants.length === 0
      ) {

        setFormError(
          "Add at least one variant before finishing."
        );

        return;
      }


      const productData = {

        productName:
          productName.trim(),

        description:
          description.trim(),

        categoryId,

        brandId,

        variants,

      };


      try {

        if (isEditMode) {

          await dispatch(
            updateProduct({
              productId,
              productData: {
                productName:
                  productData.productName,

                description:
                  productData.description,

                categoryId:
                  productData.categoryId,

                brandId:
                  productData.brandId,
              },
            })
          ).unwrap();

        } else {

          await dispatch(
            createProduct(
              productData
            )
          ).unwrap();

        }


        navigate(
          "/admin/products"
        );

      } catch (error) {

        console.error(
          "Product save failed:",
          error
        );

      }

    };


  // ===================================================
  // LOADING EDIT
  // ===================================================

  const saving =
    createStatus === "loading" ||
    updateStatus === "loading";


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

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

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
                text-gray-900
              "
            >

              {isEditMode
                ? "Edit "
                : "Add "}

              <span
                className="
                  text-[#ff5722]
                "
              >
                Product
              </span>

            </h1>

          </div>

        </header>


        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="
            px-12
            py-10
          "
        >

          {/* ERROR */}

          {(formError ||
            createError ||
            updateError) && (

            <div
              className="
                mb-8
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {formError ||
                createError ||
                updateError}
            </div>

          )}


          {/* ================================================= */}
          {/* PRODUCT DETAILS */}
          {/* ================================================= */}

          <section
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-8
              shadow-sm
            "
          >

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
                Product
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-gray-900
                "
              >
                Product Details
              </h2>

            </div>


            <div
              className="
                mt-8
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
              "
            >

              {/* PRODUCT NAME */}

              <div>

                <label
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Product Name
                </label>

                <input
                  type="text"
                  value={productName}
                  onChange={(e) =>
                    setProductName(
                      e.target.value
                    )
                  }
                  placeholder="Enter product name"
                  className="
                    mt-2
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#ff5722]
                    focus:ring-1
                    focus:ring-[#ff5722]
                  "
                />

              </div>


              {/* BRAND */}

              <div>

                <label
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Brand
                </label>

                <select
                  value={brandId}
                  onChange={(e) =>
                    setBrandId(
                      e.target.value
                    )
                  }
                  className="
                    mt-2
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#ff5722]
                    focus:ring-1
                    focus:ring-[#ff5722]
                  "
                >

                  <option value="">
                    Select brand
                  </option>

                  {brands.map(
                    (brand) => (

                      <option
                        key={brand.id}
                        value={brand.id}
                      >
                        {brand.brandName ||
                          brand.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* CATEGORY */}

              <div>

                <label
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Category
                </label>

                <select
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(
                      e.target.value
                    )
                  }
                  className="
                    mt-2
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#ff5722]
                    focus:ring-1
                    focus:ring-[#ff5722]
                  "
                >

                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.categoryName ||
                          category.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* DESCRIPTION */}

              <div
                className="
                  md:col-span-2
                "
              >

                <label
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Enter product description"
                  className="
                    mt-2
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#ff5722]
                    focus:ring-1
                    focus:ring-[#ff5722]
                  "
                />

              </div>

            </div>

          </section>


          {/* ================================================= */}
          {/* VARIANT FORM */}
          {/* ================================================= */}

          <section
            className="
              mt-8
              rounded-xl
              border
              border-gray-200
              bg-white
              p-8
              shadow-sm
            "
          >

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
                Add Variant
              </h2>

            </div>


            <div
              className="
                mt-8
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
              "
            >

              {/* COLOR */}

              <div>

                <label
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Color
                </label>

                <input
                  type="text"
                  value={color}
                  onChange={(e) =>
                    setColor(
                      e.target.value
                    )
                  }
                  placeholder="Black / Volt"
                  className="
                    mt-2
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#ff5722]
                  "
                />

              </div>


              {/* PRICE */}

              <div>

                <label
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  placeholder="4999"
                  className="
                    mt-2
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#ff5722]
                  "
                />

              </div>


              {/* IMAGES */}

              <div
                className="
                  md:col-span-2
                "
              >

                <label
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Images
                </label>

                <input
                  type="text"
                  value={images}
                  onChange={(e) =>
                    setImages(
                      e.target.value
                    )
                  }
                  placeholder="image1.jpg, image2.jpg, image3.jpg"
                  className="
                    mt-2
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#ff5722]
                  "
                />

                <p
                  className="
                    mt-2
                    text-xs
                    text-gray-400
                  "
                >
                  Enter at least 3 image URLs separated by commas.
                </p>

              </div>

            </div>


            {/* SIZES */}

            <div className="mt-8">

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <label
                    className="
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    Sizes & Stock
                  </label>

                </div>


                <button
                  type="button"
                  onClick={handleAddSize}
                  className="
                    text-sm
                    font-semibold
                    text-[#ff5722]
                    hover:text-[#f4511e]
                  "
                >
                  + Add Size
                </button>

              </div>


              <div className="mt-3 space-y-3">

                {sizes.map(
                  (size, index) => (

                    <div
                      key={index}
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <input
                        type="text"
                        value={size.size}
                        onChange={(e) =>
                          handleSizeChange(
                            index,
                            "size",
                            e.target.value
                          )
                        }
                        placeholder="UK 8"
                        className="
                          flex-1
                          rounded-lg
                          border
                          border-gray-300
                          px-4
                          py-3
                          text-sm
                          outline-none
                          focus:border-[#ff5722]
                        "
                      />


                      <input
                        type="number"
                        min="0"
                        value={size.stock}
                        onChange={(e) =>
                          handleSizeChange(
                            index,
                            "stock",
                            e.target.value
                          )
                        }
                        placeholder="Stock"
                        className="
                          w-40
                          rounded-lg
                          border
                          border-gray-300
                          px-4
                          py-3
                          text-sm
                          outline-none
                          focus:border-[#ff5722]
                        "
                      />


                      {sizes.length > 1 && (

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveSize(
                              index
                            )
                          }
                          className="
                            rounded-lg
                            px-3
                            py-2
                            text-sm
                            text-red-500
                            hover:bg-red-50
                          "
                        >
                          Remove
                        </button>

                      )}

                    </div>

                  )
                )}

              </div>

            </div>


            {/* ADD VARIANT */}

            <div
              className="
                mt-8
                flex
                justify-end
              "
            >

              <button
                type="button"
                onClick={
                  handleAddVariant
                }
                className="
                  rounded-full
                  bg-[#ff5722]
                  px-6
                  py-3
                  text-sm
                  font-bold
                  uppercase
                  tracking-wide
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#f4511e]
                "
              >
                Add Variant
              </button>

            </div>

          </section>


          {/* ================================================= */}
          {/* ADDED VARIANTS */}
          {/* ================================================= */}

          {variants.length > 0 && (

            <section
              className="
                mt-8
                rounded-xl
                border
                border-gray-200
                bg-white
                p-8
                shadow-sm
              "
            >

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
                  Product Inventory
                </p>

                <h2
                  className="
                    mt-1
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  Added Variants
                </h2>

              </div>


              <div
                className="
                  mt-6
                  grid
                  grid-cols-1
                  gap-4
                  lg:grid-cols-2
                "
              >

                {variants.map(
                  (variant, index) => (

                    <div
                      key={index}
                      className="
                        rounded-xl
                        border
                        border-gray-200
                        p-5
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                        "
                      >

                        <div>

                          <h3
                            className="
                              font-semibold
                              text-gray-900
                            "
                          >
                            {variant.color}
                          </h3>

                          <p
                            className="
                              mt-1
                              text-sm
                              font-medium
                              text-[#ff5722]
                            "
                          >
                            ₹{variant.price}
                          </p>

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveVariant(
                              index
                            )
                          }
                          className="
                            text-sm
                            font-medium
                            text-red-500
                            hover:text-red-600
                          "
                        >
                          Remove
                        </button>

                      </div>


                      <div
                        className="
                          mt-4
                          flex
                          flex-wrap
                          gap-2
                        "
                      >

                        {variant.sizes.map(
                          (size) => (

                            <span
                              key={size.size}
                              className="
                                rounded-lg
                                bg-gray-100
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-gray-700
                              "
                            >
                              {size.size}:{" "}
                              {size.stock}
                            </span>

                          )
                        )}

                      </div>


                      <p
                        className="
                          mt-4
                          text-xs
                          text-gray-400
                        "
                      >
                        {variant.images.length} images
                      </p>

                    </div>

                  )
                )}

              </div>

            </section>

          )}


          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div
            className="
              mt-8
              flex
              items-center
              justify-end
              gap-3
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
                rounded-full
                bg-gray-100
                px-7
                py-3
                text-sm
                font-semibold
                text-gray-700
                transition
                hover:bg-gray-200
              "
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={saving}
              className="
                rounded-full
                bg-[#ff5722]
                px-7
                py-3
                text-sm
                font-bold
                uppercase
                tracking-wide
                text-white
                shadow-md
                transition
                hover:bg-[#f4511e]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {saving
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Finish"}
            </button>

          </div>

        </form>

      </main>

    </div>

  );
}


export default ProductForm;