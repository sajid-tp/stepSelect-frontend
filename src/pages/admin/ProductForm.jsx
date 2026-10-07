import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AdminSidebar from "../../components/AdminSideBar";
import ImageCropper from "../../components/ImageCropper";

import {
  createProduct,
  updateProduct,
  uploadProductImages,
  clearProductErrors,
} from "../../features/admin/productSlice";

import {
  addVariant,
  updateVariant,
  deleteVariant,
  getVariants,
} from "../../features/admin/variantSlice";

import {
  getCategories,
} from "../../features/admin/categorySlice";

import {
  getBrands,
} from "../../features/admin/brandSlice";


// ==================================================
// COLOR OPTIONS
// ==================================================

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Grey",
  "Navy Blue",
  "Blue",
  "Red",
  "Green",
  "Olive",
  "Brown",
  "Tan",
  "Beige",
  "Cream",
  "Yellow",
  "Orange",
  "Pink",
  "Purple",
  "Maroon",
  "Burgundy",
];


// ==================================================
// SIZE OPTIONS
// ==================================================

const SIZE_OPTIONS = [
  "UK 6",
  "UK 7",
  "UK 8",
  "UK 9",
  "UK 10",
  "UK 11",
  "UK 12",
];


const ProductForm = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();


  // ==================================================
  // EXISTING PRODUCT
  // ==================================================

  const existingProduct = location.state?.product || null;

  const isEditMode = Boolean(existingProduct);


  // ==================================================
  // REDUX STATE
  // ==================================================

  const {
    createStatus,
    createError,

    updateStatus,
    updateError,

    uploadStatus,
    uploadError,
  } = useSelector((state) => state.adminProducts);


  const {
    variants: backendVariants,

    addStatus: variantAddStatus,
    addError: variantAddError,

    updateStatus: variantUpdateStatus,
    updateError: variantUpdateError,

    deleteStatus: variantDeleteStatus,
    deleteError: variantDeleteError,

    status: variantsStatus,
    error: variantsError,
  } = useSelector((state) => state.adminVariants);


  const { categories } = useSelector(
    (state) => state.adminCategories
  );


  const { brands } = useSelector(
    (state) => state.adminBrands
  );


  // ==================================================
  // PRODUCT DETAILS
  // ==================================================

  const [productName, setProductName] = useState(
    existingProduct?.productName || ""
  );

  const [description, setDescription] = useState(
    existingProduct?.description || ""
  );

  const [brandId, setBrandId] = useState(
    existingProduct?.brand?.id ||
    existingProduct?.brandId ||
    ""
  );

  const [categoryId, setCategoryId] = useState(
    existingProduct?.category?.id ||
    existingProduct?.categoryId ||
    ""
  );


  // ==================================================
  // VARIANT FORM
  // ==================================================

  const [color, setColor] = useState("");

  const [price, setPrice] = useState("");

  const [sizes, setSizes] = useState([
    {
      size: "",
      stock: "",
    },
  ]);


  // ==================================================
  // IMAGE STATE
  // ==================================================

  /*
   * Each selected image is stored as:
   * { file, preview, cropped }
   *
   * Existing Cloudinary URLs are stored separately
   * in existingImageUrls.
   */

  const [imageItems, setImageItems] = useState([]);

  const [existingImageUrls, setExistingImageUrls] = useState([]);

  const fileInputRef = useRef(null);


  // ==================================================
  // IMAGE CROPPING
  // ==================================================

  const [cropImageIndex, setCropImageIndex] = useState(null);

  const [isCropping, setIsCropping] = useState(false);


  // ==================================================
  // VARIANTS
  // ==================================================

  const [variants, setVariants] = useState(
    existingProduct?.variants || []
  );

  /*
   * When editing an existing variant this will contain
   * the variant currently being edited.
   */

  const [editingVariant, setEditingVariant] = useState(null);


  // ==================================================
  // ERRORS
  // ==================================================

  const [formError, setFormError] = useState("");


  // ==================================================
  // DETAILS SAVED
  // ==================================================

  const [detailsSaved, setDetailsSaved] = useState(false);


  // ==================================================
  // FETCH CATEGORIES
  // ==================================================

  useEffect(() => {

    dispatch(
      getCategories({
        search: "",
        page: 1,
        limit: 100,
      })
    );

  }, [dispatch]);


  // ==================================================
  // FETCH BRANDS
  // ==================================================

  useEffect(() => {

    dispatch(
      getBrands({
        search: "",
        page: 1,
        limit: 100,
      })
    );

  }, [dispatch]);


  // ==================================================
  // FETCH EXISTING VARIANTS
  // ==================================================

  useEffect(() => {

    if (!isEditMode) {
      return;
    }

    if (!existingProduct?.id) {
      return;
    }

    dispatch(
      getVariants({
        productId: existingProduct.id,
        page: 1,
        limit: 5,
      })
    );

  }, [
    dispatch,
    isEditMode,
    existingProduct?.id,
  ]);


  // ==================================================
  // SYNC BACKEND VARIANTS
  // ==================================================

  useEffect(() => {

    if (!isEditMode) {
      return;
    }

    setVariants(backendVariants || []);

  }, [
    backendVariants,
    isEditMode,
  ]);


  // ==================================================
  // CLEAR OLD REDUX ERRORS WHEN PAGE OPENS
  // ==================================================

  useEffect(() => {

    dispatch(clearProductErrors());

    setFormError("");

  }, [dispatch]);


  // ==================================================
  // VALIDATE PRODUCT
  // ==================================================

  const validateProductDetails = () => {

    if (!productName.trim()) {
      setFormError("Product name is required.");
      return false;
    }

    if (!description.trim()) {
      setFormError("Product description is required.");
      return false;
    }

    if (!brandId) {
      setFormError("Please select a brand.");
      return false;
    }

    if (!categoryId) {
      setFormError("Please select a category.");
      return false;
    }

    return true;
  };


  // ==================================================
  // SAVE PRODUCT DETAILS
  // ==================================================

  const handleSaveDetails = async () => {

    setFormError("");

    if (!validateProductDetails()) {
      return;
    }


    // -----------------------------------------------
    // EDIT MODE
    // -----------------------------------------------

    if (isEditMode) {

      try {

        await dispatch(
          updateProduct({
            productId: existingProduct.id,

            productData: {
              productName: productName.trim(),
              description: description.trim(),
              brandId,
              categoryId,
            },
          })
        ).unwrap();

        setDetailsSaved(true);
        setFormError("");

      } catch (error) {

        setDetailsSaved(false);

        setFormError(
          error || "Failed to update product details."
        );
      }

      return;
    }


    // -----------------------------------------------
    // ADD MODE
    // -----------------------------------------------

    /*
     * Product doesn't exist yet.
     * Therefore we only keep the details in React state.
     * FINISH will create the actual product.
     */

    setDetailsSaved(true);
    setFormError("");
  };


  // ==================================================
  // IMAGE SELECTION
  // ==================================================

  const handleImageChange = (e) => {

    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    setFormError("");

    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isWithinSize = file.size <= 5 * 1024 * 1024;
      return isImage && isWithinSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      setFormError("Only image files under 5 MB are allowed.");
    }

    setImageItems((previous) => {

      const availableSlots =
        10 - existingImageUrls.length - previous.length;

      if (availableSlots <= 0) {
        setFormError("You can select a maximum of 10 images.");
        return previous;
      }

      const filesToAdd = validFiles.slice(0, availableSlots);

      if (filesToAdd.length < validFiles.length) {
        setFormError("You can select a maximum of 10 images.");
      }

      const newItems = filesToAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        cropped: false,
      }));

      return [...previous, ...newItems];
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // ==================================================
  // OPEN IMAGE CROPPER
  // ==================================================

  const handleOpenCropper = (index) => {
    setFormError("");
    setCropImageIndex(index);
  };


  // ==================================================
  // APPLY CROP + RESIZE
  // ==================================================

  const handleApplyCrop = async (croppedFile) => {

    if (cropImageIndex === null || !croppedFile) {
      return;
    }

    const item = imageItems[cropImageIndex];

    if (!item) {
      return;
    }

    try {

      setIsCropping(true);
      setFormError("");

      const oldPreview = item.preview;
      const newPreview = URL.createObjectURL(croppedFile);

      setImageItems((previous) =>
        previous.map((current, index) =>
          index === cropImageIndex
            ? {
                ...current,
                file: croppedFile,
                preview: newPreview,
                cropped: true,
              }
            : current
        )
      );

      if (oldPreview) {
        URL.revokeObjectURL(oldPreview);
      }

      setCropImageIndex(null);

    } catch (error) {

      console.error("IMAGE CROP ERROR:", error);
      setFormError("Failed to apply the crop. Please try again.");

    } finally {

      setIsCropping(false);
    }
  };


  const handleCancelCrop = () => {
    setCropImageIndex(null);
    setFormError("");
  };


  // ==================================================
  // REMOVE IMAGE
  // ==================================================

  const handleRemoveExistingImage = (index) => {

    setExistingImageUrls((previous) =>
      previous.filter((_, i) => i !== index)
    );

    setFormError("");
  };


  const handleRemoveSelectedImage = (index) => {

    setImageItems((previous) => {

      const item = previous[index];

      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }

      return previous.filter((_, i) => i !== index);
    });

    setFormError("");

    if (cropImageIndex === index) {
      setCropImageIndex(null);
    }
  };


  // ==================================================
  // ADD SIZE
  // ==================================================

  const handleAddSize = () => {

    setSizes((previous) => [
      ...previous,
      {
        size: "",
        stock: "",
      },
    ]);
  };


  // ==================================================
  // REMOVE SIZE
  // ==================================================

  const handleRemoveSize = (index) => {

    if (sizes.length === 1) {
      return;
    }

    setSizes((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };


  // ==================================================
  // CHANGE SIZE
  // ==================================================

  const handleSizeChange = (index, field, value) => {

    setSizes((previous) =>
      previous.map((item, i) => {

        if (i !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );

    setFormError("");
  };


  // ==================================================
  // VALIDATE VARIANT
  // ==================================================

  const validateVariant = () => {

    if (!color.trim()) {
      setFormError("Please select a color.");
      return false;
    }

    // Each color can only be added once per product
    const colorAlreadyUsed = variants.some(
      (variant) =>
        variant.color?.trim().toLowerCase() ===
          color.trim().toLowerCase() &&
        (editingVariant
          ? variant.id !== editingVariant.id
          : true)
    );

    if (colorAlreadyUsed) {
      setFormError(
        "This color already exists for this product. Edit that variant instead."
      );
      return false;
    }

    if (
      price === "" ||
      Number.isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      setFormError("Please enter a valid price.");
      return false;
    }

    /*
     * Existing images + newly selected images
     * must be at least 3.
     */

    const totalImages =
      existingImageUrls.length + imageItems.length;

    const hasUncroppedImages = imageItems.some(
      (item) => !item.cropped
    );

    if (hasUncroppedImages) {
      setFormError(
        "Please crop and resize all selected images before saving the variant."
      );
      return false;
    }

    if (totalImages < 3) {
      setFormError("Please provide at least 3 images.");
      return false;
    }

    if (totalImages > 10) {
      setFormError("You can use a maximum of 10 images.");
      return false;
    }

    if (sizes.length === 0) {
      setFormError("At least one size is required.");
      return false;
    }

    for (const item of sizes) {

      if (!item.size.trim()) {
        setFormError("Please select a size for every row.");
        return false;
      }

      if (
        item.stock === "" ||
        Number.isNaN(Number(item.stock)) ||
        Number(item.stock) < 0
      ) {
        setFormError(
          "Please enter a valid stock value for every size."
        );
        return false;
      }
    }

    // Each size can only be added once
    const sizeNames = sizes.map((item) =>
      item.size.trim().toLowerCase()
    );

    if (new Set(sizeNames).size !== sizeNames.length) {
      setFormError("Each size can only be added once.");
      return false;
    }

    return true;
  };


  // ==================================================
  // RESET VARIANT FORM
  // ==================================================

  const resetVariantForm = () => {

    imageItems.forEach((item) => {

      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    setColor("");

    setPrice("");

    setSizes([
      {
        size: "",
        stock: "",
      },
    ]);

    setImageItems([]);

    setExistingImageUrls([]);

    setEditingVariant(null);
    setCropImageIndex(null);
    setIsCropping(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFormError("");
  };


  // ==================================================
  // UPLOAD IMAGES
  // ==================================================

  const uploadNewImages = async () => {

    if (imageItems.length === 0) {
      return [];
    }

    const files = imageItems.map((item) => item.file);

    const uploadedUrls = await dispatch(
      uploadProductImages(files)
    ).unwrap();

    return uploadedUrls;
  };


  // ==================================================
  // BUILD VARIANT DATA
  // ==================================================

  const buildVariantData = (imageUrls) => {

    return {
      color: color.trim(),

      price: Number(price),

      images: imageUrls,

      sizes: sizes.map((item) => ({
        size: item.size.trim(),
        stock: Number(item.stock),
      })),
    };
  };


  // ==================================================
  // ADD / UPDATE VARIANT
  // ==================================================

  const handleSaveVariant = async () => {

    setFormError("");

    if (!validateVariant()) {
      return;
    }

    try {

      /*
       * =================================================
       * EXISTING VARIANT EDIT
       * =================================================
       */

      if (editingVariant) {

        /*
         * If the user selected new images, upload them first.
         * Existing Cloudinary images remain unless
         * the user removed them.
         */

        const uploadedUrls = await uploadNewImages();

        const finalImageUrls = [
          ...existingImageUrls,
          ...uploadedUrls,
        ];

        if (finalImageUrls.length < 3) {
          setFormError("A variant must have at least 3 images.");
          return;
        }

        const variantData = buildVariantData(finalImageUrls);

        await dispatch(
          updateVariant({
            variantId: editingVariant.id,
            variantData,
          })
        ).unwrap();

        // Refresh from backend
        await dispatch(
          getVariants({
            productId: existingProduct.id,
            page: 1,
            limit: 5,
          })
        ).unwrap();

        resetVariantForm();

        return;
      }


      /*
       * =================================================
       * EDIT PRODUCT -> ADD NEW VARIANT
       * =================================================
       */

      if (isEditMode) {

        /*
         * Product already exists, so the variant
         * can immediately be sent to the backend.
         */

        const uploadedUrls = await uploadNewImages();

        const variantData = buildVariantData(uploadedUrls);

        await dispatch(
          addVariant({
            productId: existingProduct.id,
            variantData,
          })
        ).unwrap();

        /*
         * IMPORTANT: do NOT manually add a fake/local variant.
         * Fetch the actual backend data again.
         */

        await dispatch(
          getVariants({
            productId: existingProduct.id,
            page: 1,
            limit: 5,
          })
        ).unwrap();

        resetVariantForm();

        return;
      }


      /*
       * =================================================
       * NEW PRODUCT -> LOCAL VARIANT
       * =================================================
       */

      /*
       * The product does not exist yet, so we cannot call
       * POST /admin/variants/products/:productId/variants
       * because there is no productId yet.
       *
       * Upload the images now and keep the resulting
       * Cloudinary URLs in local React state.
       */

      const uploadedUrls = await uploadNewImages();

      const newVariant = buildVariantData(uploadedUrls);

      setVariants((previous) => [
        ...previous,
        newVariant,
      ]);

      resetVariantForm();

    } catch (error) {

      console.error("VARIANT SAVE ERROR:", error);

      setFormError(
        typeof error === "string"
          ? error
          : "Failed to save variant."
      );
    }
  };


  // ==================================================
  // EDIT EXISTING VARIANT
  // ==================================================

  const handleEditVariant = (variant) => {

    setEditingVariant(variant);

    setColor(variant.color || "");

    setPrice(
      variant.price !== undefined && variant.price !== null
        ? String(variant.price)
        : ""
    );

    setSizes(
      (variant.sizes || []).map((item) => ({
        size: item.size || "",

        stock:
          item.stock !== undefined && item.stock !== null
            ? String(item.stock)
            : "",
      }))
    );

    // Existing Cloudinary URLs
    setExistingImageUrls(variant.images || []);

    // New files are cleared
    imageItems.forEach((item) => {

      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    setImageItems([]);

    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ==================================================
  // DELETE VARIANT
  // ==================================================

  const handleDeleteVariant = async (variantId) => {

    try {

      setFormError("");

      await dispatch(deleteVariant(variantId)).unwrap();

      // Refresh actual backend state
      await dispatch(
        getVariants({
          productId: existingProduct.id,
          page: 1,
          limit: 5,
        })
      ).unwrap();

    } catch (error) {

      console.error("DELETE VARIANT ERROR:", error);

      setFormError(
        typeof error === "string"
          ? error
          : "Failed to delete variant."
      );
    }
  };


  // ==================================================
  // REMOVE LOCAL VARIANT
  // ==================================================

  const handleRemoveLocalVariant = (index) => {

    setVariants((previous) =>
      previous.filter((_, i) => i !== index)
    );

    setFormError("");
  };


  // ==================================================
  // FINISH
  // ==================================================

  const handleFinish = async () => {

    setFormError("");

    if (!validateProductDetails()) {
      return;
    }

    /*
     * New product must have at least one variant.
     */

    if (!isEditMode && variants.length === 0) {
      setFormError(
        "Please add at least one variant before finishing."
      );
      return;
    }

    try {

      /*
       * =================================================
       * EDIT PRODUCT
       * =================================================
       */

      if (isEditMode) {

        /*
         * Product details are already handled by Save Details,
         * but we update once more here so that Finish
         * is always safe.
         */

        await dispatch(
          updateProduct({
            productId: existingProduct.id,

            productData: {
              productName: productName.trim(),
              description: description.trim(),
              brandId,
              categoryId,
            },
          })
        ).unwrap();

        navigate("/admin/products");

        return;
      }


      /*
       * =================================================
       * CREATE PRODUCT
       * =================================================
       */

      /*
       * At this point every variant already contains
       * permanent Cloudinary URLs.
       */

      await dispatch(
        createProduct({
          productName: productName.trim(),
          description: description.trim(),
          brandId,
          categoryId,
          variants,
        })
      ).unwrap();

      navigate("/admin/products");

    } catch (error) {

      console.error("FINISH PRODUCT ERROR:", error);

      setFormError(
        typeof error === "string"
          ? error
          : "Failed to save product."
      );
    }
  };


  // ==================================================
  // CANCEL
  // ==================================================

  const handleCancel = () => {
    navigate("/admin/products");
  };


  // ==================================================
  // LOADING
  // ==================================================

  const isSaving =
    createStatus === "loading" ||
    updateStatus === "loading";

  const isUploading = uploadStatus === "loading";

  const isAddingVariant = variantAddStatus === "loading";

  const isUpdatingVariant = variantUpdateStatus === "loading";

  const isDeletingVariant = variantDeleteStatus === "loading";

  const isVariantOperationLoading =
    isUploading ||
    isAddingVariant ||
    isUpdatingVariant ||
    isCropping;


  // ==================================================
  // ALL ERRORS
  // ==================================================

  const reduxError =
    createError ||
    updateError ||
    uploadError ||
    variantAddError ||
    variantUpdateError ||
    variantDeleteError ||
    variantsError;


  // ==================================================
  // RENDER VARIANT CARD
  // ==================================================

  const renderVariantCard = (variant, index) => {

    const isBackendVariant = Boolean(variant.id);

    return (

      <div
        key={variant.id || `new-${index}`}
        className="border border-slate-200 rounded-lg p-5"
      >

        {/* HEADER */}

        <div className="flex justify-between items-start">

          <div>

            <p className="text-sm font-semibold text-slate-900">
              Variant {index + 1}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              {variant.color}
            </p>

          </div>


          <div className="flex items-center gap-4">

            {isBackendVariant && (
              <>
                <button
                  type="button"
                  onClick={() => handleEditVariant(variant)}
                  className="text-sm font-medium text-orange-500 hover:text-orange-600"
                >
                  Edit
                </button>

                <button
                  type="button"
                  disabled={isDeletingVariant}
                  onClick={() => handleDeleteVariant(variant.id)}
                  className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </>
            )}

            {!isBackendVariant && (
              <button
                type="button"
                onClick={() => handleRemoveLocalVariant(index)}
                className="text-sm font-medium text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            )}

          </div>

        </div>


        {/* COLOR / PRICE */}

        <div className="grid grid-cols-2 gap-6 mt-5">

          <div>

            <p className="text-xs text-slate-400 mb-1">
              Color
            </p>

            <p className="text-sm font-medium text-slate-800">
              {variant.color}
            </p>

          </div>


          <div>

            <p className="text-xs text-slate-400 mb-1">
              Price
            </p>

            <p className="text-sm font-medium text-slate-800">
              ₹{Number(variant.price).toLocaleString()}
            </p>

          </div>

        </div>


        {/* IMAGES */}

        {variant.images?.length > 0 && (

          <div className="mt-5">

            <p className="text-xs text-slate-400 mb-2">
              Images
            </p>

            <div className="flex gap-3 flex-wrap">

              {variant.images.map((image, imageIndex) => (

                <img
                  key={`${image}-${imageIndex}`}
                  src={image}
                  alt={`${variant.color} ${imageIndex + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />

              ))}

            </div>

          </div>

        )}


        {/* SIZES */}

        <div className="mt-5">

          <p className="text-xs text-slate-400 mb-2">
            Sizes & Stock
          </p>

          <div className="flex flex-wrap gap-2">

            {variant.sizes?.map((size, sizeIndex) => (

              <div
                key={sizeIndex}
                className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm"
              >

                <span className="font-medium">
                  {size.size}
                </span>

                <span className="text-slate-400 mx-2">
                  |
                </span>

                <span className="text-slate-600">
                  Stock: {size.stock}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>
    );
  };


  // ==================================================
  // JSX
  // ==================================================

  return (

    <div className="min-h-screen bg-[#f8fafc]">

      <AdminSidebar />


      <main className="ml-[214px] px-12 py-10">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">

          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Catalog
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            {isEditMode
              ? "Update the product information and manage its variants."
              : "Create a product and add its variants."}
          </p>

        </div>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {(formError || reduxError) && (

          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError || reduxError}
          </div>

        )}


        {/* ================================================= */}
        {/* PRODUCT DETAILS */}
        {/* ================================================= */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm mb-8">

          <div className="px-8 py-8">

            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              PRODUCT
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Product Details
            </h2>


            <div className="grid grid-cols-2 gap-6 mt-8">

              {/* PRODUCT NAME */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Name
                </label>

                <input
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    setFormError("");
                    setDetailsSaved(false);
                  }}
                  placeholder="Air Zoom Pegasus 41"
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />

              </div>


              {/* BRAND */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Brand
                </label>

                <select
                  value={brandId}
                  onChange={(e) => {
                    setBrandId(e.target.value);
                    setFormError("");
                    setDetailsSaved(false);
                  }}
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm outline-none bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >

                  <option value="">
                    Select Brand
                  </option>

                  {brands?.map((brand) => (

                    <option key={brand.id} value={brand.id}>
                      {brand.brandName || brand.name}
                    </option>

                  ))}

                </select>

              </div>


              {/* CATEGORY */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>

                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setFormError("");
                    setDetailsSaved(false);
                  }}
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm outline-none bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >

                  <option value="">
                    Select Category
                  </option>

                  {categories?.map((category) => (

                    <option key={category.id} value={category.id}>
                      {category.categoryName || category.name}
                    </option>

                  ))}

                </select>

              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="mt-6">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setFormError("");
                  setDetailsSaved(false);
                }}
                placeholder="Enter product description..."
                rows={5}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none resize-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />

            </div>


            {/* SAVE DETAILS */}

            <div className="flex items-center justify-end gap-4 mt-8">

              {detailsSaved && (

                <span className="text-sm text-green-600">
                  Details saved
                </span>

              )}

              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={isSaving}
                className="px-6 py-3 rounded-lg bg-[#ff5722] text-white text-sm font-semibold hover:bg-[#f4511e] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateStatus === "loading"
                  ? "Saving..."
                  : "Save Details"}
              </button>

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* ADD / UPDATE VARIANT */}
        {/* IMPORTANT: THIS IS ABOVE EXISTING VARIANTS */}
        {/* ================================================= */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm mb-8">

          <div className="px-8 py-8">

            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              INVENTORY
            </p>


            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  {editingVariant ? "Edit Variant" : "Add Variant"}
                </h2>

                {editingVariant && (

                  <p className="text-sm text-slate-500 mt-1">
                    Update the selected variant.
                  </p>

                )}

              </div>

              {editingVariant && (

                <button
                  type="button"
                  onClick={resetVariantForm}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel Edit
                </button>

              )}

            </div>


            {/* COLOR + PRICE */}

            <div className="grid grid-cols-2 gap-6 mt-8">

              {/* COLOR DROPDOWN */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Color
                </label>

                <select
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setFormError("");
                  }}
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm outline-none bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >

                  <option value="">
                    Select Color
                  </option>

                  {/* keeps an old custom color (like "Black / Volt") visible when editing */}
                  {color && !COLOR_OPTIONS.includes(color) && (

                    <option value={color}>
                      {color}
                    </option>

                  )}

                  {COLOR_OPTIONS.map((option) => (

                    <option key={option} value={option}>
                      {option}
                    </option>

                  ))}

                </select>

              </div>


              {/* PRICE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setFormError("");
                  }}
                  placeholder="4999"
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />

              </div>

            </div>


            {/* IMAGES */}

            <div className="mt-7">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variant Images
              </label>

              <div className="border border-slate-300 rounded-lg px-4 py-3">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-500
                    file:mr-4
                    file:py-2
                    file:px-4
                    file:rounded-lg
                    file:border-0
                    file:text-sm
                    file:font-medium
                    file:bg-orange-50
                    file:text-orange-500
                    hover:file:bg-orange-100"
                />

              </div>

              <p className="text-xs text-slate-400 mt-2">
                Select 3 to 10 images. Each image must be under 5 MB.
              </p>


              {/* EXISTING IMAGES */}

              {existingImageUrls.length > 0 && (

                <div className="mt-4">

                  <p className="text-xs text-slate-400 mb-2">
                    Existing Images
                  </p>

                  <div className="flex flex-wrap gap-4">

                    {existingImageUrls.map((image, index) => (

                      <div
                        key={`${image}-${index}`}
                        className="relative"
                      >

                        <img
                          src={image}
                          alt={`Existing ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>

                      </div>

                    ))}

                  </div>

                </div>

              )}


              {/* NEW IMAGE PREVIEWS */}

              {imageItems.length > 0 && (

                <div className="mt-4">

                  <p className="text-xs text-slate-400 mb-2">
                    New Images
                  </p>

                  <div className="flex flex-wrap gap-4">

                    {imageItems.map((item, index) => (

                      <div
                        key={item.preview}
                        className="relative"
                      >

                        <img
                          src={item.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 z-10"
                        >
                          ×
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCropper(index)}
                          disabled={isCropping}
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white/95 text-slate-700 text-xs font-semibold shadow hover:bg-white disabled:opacity-50"
                        >
                          {item.cropped ? "Crop Again" : "Crop & Resize"}
                        </button>

                        {item.cropped && (

                          <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-green-500 text-white text-[10px] font-semibold">
                            Ready
                          </span>

                        )}

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </div>


            {/* SIZES & STOCK */}

            <div className="mt-8">

              <div className="flex items-center justify-between mb-3">

                <label className="block text-sm font-medium text-slate-700">
                  Sizes & Stock
                </label>

                <button
                  type="button"
                  onClick={handleAddSize}
                  className="text-sm font-medium text-[#ff5722] hover:text-[#f4511e]"
                >
                  + Add Size
                </button>

              </div>


              <div className="space-y-3">

                {sizes.map((item, index) => (

                  <div
                    key={index}
                    className="flex gap-3 items-center"
                  >

                    {/* SIZE DROPDOWN */}

                    <select
                      value={item.size}
                      onChange={(e) =>
                        handleSizeChange(index, "size", e.target.value)
                      }
                      className="flex-1 h-11 border border-slate-300 rounded-lg px-4 text-sm outline-none bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    >

                      <option value="">
                        Select Size
                      </option>

                      {/* keeps an old custom size (like "uk89") visible when editing */}
                      {item.size && !SIZE_OPTIONS.includes(item.size) && (

                        <option value={item.size}>
                          {item.size}
                        </option>

                      )}

                      {SIZE_OPTIONS.map((option) => (

                        <option
                          key={option}
                          value={option}
                          disabled={sizes.some(
                            (s, i) => i !== index && s.size === option
                          )}
                        >
                          {option}
                        </option>

                      ))}

                    </select>


                    {/* STOCK */}

                    <input
                      type="number"
                      min="0"
                      value={item.stock}
                      onChange={(e) =>
                        handleSizeChange(index, "stock", e.target.value)
                      }
                      placeholder="Stock"
                      className="w-40 h-11 border border-slate-300 rounded-lg px-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />


                    {sizes.length > 1 && (

                      <button
                        type="button"
                        onClick={() => handleRemoveSize(index)}
                        className="text-red-500 hover:text-red-600 text-lg"
                      >
                        ×
                      </button>

                    )}

                  </div>

                ))}

              </div>

            </div>


            {/* ADD / UPDATE BUTTON */}

            <div className="flex justify-end mt-8">

              <button
                type="button"
                onClick={handleSaveVariant}
                disabled={isVariantOperationLoading}
                className="px-7 py-3 rounded-full bg-[#ff5722] text-white text-sm font-bold hover:bg-[#f4511e] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading
                  ? "UPLOADING..."
                  : isAddingVariant
                  ? "ADDING..."
                  : isUpdatingVariant
                  ? "UPDATING..."
                  : editingVariant
                  ? "UPDATE VARIANT"
                  : "ADD VARIANT"}
              </button>

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* EXISTING / ADDED VARIANTS */}
        {/* ================================================= */}

        {variants.length > 0 && (

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm mb-8">

            <div className="px-8 py-8">

              <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                VARIANTS
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                {isEditMode ? "Existing Variants" : "Added Variants"}
              </h2>

              <div className="space-y-4 mt-6">

                {variants.map((variant, index) =>
                  renderVariantCard(variant, index)
                )}

              </div>

            </div>

          </section>

        )}


        {/* ================================================= */}
        {/* BOTTOM ACTIONS */}
        {/* ================================================= */}

        <div className="flex justify-end gap-3 mt-8 pb-10">

          {/* CANCEL */}

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving || isVariantOperationLoading}
            className="px-7 py-3 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>


          {/* FINISH */}

          <button
            type="button"
            onClick={handleFinish}
            disabled={isSaving || isVariantOperationLoading}
            className="px-8 py-3 rounded-full bg-[#ff5722] text-white text-sm font-bold hover:bg-[#f4511e] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSaving ? "SAVING..." : "FINISH"}
          </button>

        </div>

      </main>


      {cropImageIndex !== null &&
        imageItems[cropImageIndex] && (

          <ImageCropper
            image={imageItems[cropImageIndex].preview}
            onApply={handleApplyCrop}
            onCancel={handleCancelCrop}
            loading={isCropping}
          />

        )}

    </div>
  );
};


export default ProductForm;