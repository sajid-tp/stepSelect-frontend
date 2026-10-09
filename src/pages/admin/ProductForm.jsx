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
import Modal from "../../components/Modals"; // same path as in Products.jsx
import ImageViewer from "../../components/ImageViewer";
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


const GENDER_OPTIONS = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
];

// Must match the backend GENDERS array
const VALID_GENDERS = GENDER_OPTIONS.map((g) => g.value);


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


// ==================================================
// VALIDATION RULES
// ==================================================

const RULES = {
  NAME_MIN: 3,
  NAME_MAX: 100,

  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 1000,

  PRICE_MAX: 1000000,

  STOCK_MAX: 100000,

  MIN_IMAGES: 3, // backend: "A variant must have minimum 3 images."
  MAX_IMAGES: 10,
  MAX_IMAGE_SIZE_MB: 5,
};

// Starts with a letter/number; allows letters, numbers, spaces and  - ' . , & ( ) / +
const NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s\-'.,&()/+]*$/;

// ObjectId-like (24 hex chars) - same idea as mongoose.Types.ObjectId.isValid
const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

// Collapses repeated spaces: "Air   Zoom  41 " -> "Air Zoom 41"
const normalizeSpaces = (value) =>
  String(value || "").trim().replace(/\s+/g, " ");


const validateName = (value) => {

  const name = normalizeSpaces(value);

  if (!name) {
    return "Product name is required.";
  }

  if (name.length < RULES.NAME_MIN) {
    return `Product name must be at least ${RULES.NAME_MIN} characters.`;
  }

  if (name.length > RULES.NAME_MAX) {
    return `Product name cannot exceed ${RULES.NAME_MAX} characters.`;
  }

  if (!NAME_REGEX.test(name)) {
    return "Product name must start with a letter or number and can only contain letters, numbers, spaces and - ' . , & ( ) / +";
  }

  if (!/[A-Za-z]/.test(name)) {
    return "Product name must contain at least one letter.";
  }

  return "";
};


const validateDescription = (value) => {

  const text = String(value || "").trim();

  if (!text) {
    return "Product description is required.";
  }

  if (text.length < RULES.DESCRIPTION_MIN) {
    return `Description must be at least ${RULES.DESCRIPTION_MIN} characters.`;
  }

  if (text.length > RULES.DESCRIPTION_MAX) {
    return `Description cannot exceed ${RULES.DESCRIPTION_MAX} characters.`;
  }

  if (!/[A-Za-z]/.test(text)) {
    return "Description must contain readable text, not only numbers or symbols.";
  }

  return "";
};


const validateBrand = (value) => {

  if (!value) {
    return "Please select a brand.";
  }

  if (!OBJECT_ID_REGEX.test(String(value))) {
    return "Invalid brand selected.";
  }

  return "";
};


const validateCategory = (value) => {

  if (!value) {
    return "Please select a category.";
  }

  if (!OBJECT_ID_REGEX.test(String(value))) {
    return "Invalid category selected.";
  }

  return "";
};


const validateGender = (value) => {

  if (!value) {
    return "Please select a gender.";
  }

  if (!VALID_GENDERS.includes(String(value).trim().toLowerCase())) {
    return "Gender must be men, women or unisex.";
  }

  return "";
};


const validateColor = (value) => {

  const text = normalizeSpaces(value);

  if (!text) {
    return "Please select a color.";
  }

  if (text.length > 40) {
    return "Color cannot exceed 40 characters.";
  }

  return "";
};


const validatePrice = (value) => {

  if (value === "" || value === null || value === undefined) {
    return "Price is required.";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "Price must be a valid number.";
  }

  if (number <= 0) {
    return "Price must be greater than 0.";
  }

  if (number > RULES.PRICE_MAX) {
    return `Price cannot exceed ₹${RULES.PRICE_MAX.toLocaleString()}.`;
  }

  // Maximum 2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(String(value).trim())) {
    return "Price can have at most 2 decimal places.";
  }

  return "";
};


const validateSizeValue = (value) => {

  if (!String(value || "").trim()) {
    return "Select a size.";
  }

  return "";
};


const validateStock = (value) => {

  if (value === "" || value === null || value === undefined) {
    return "Stock is required.";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "Stock must be a number.";
  }

  if (number < 0) {
    return "Stock cannot be negative.";
  }

  if (!Number.isInteger(number)) {
    return "Stock must be a whole number.";
  }

  if (number > RULES.STOCK_MAX) {
    return `Stock cannot exceed ${RULES.STOCK_MAX.toLocaleString()}.`;
  }

  return "";
};


// Blocks characters that make no sense in a whole-number input
const blockInvalidIntegerKeys = (e) => {
  if (["e", "E", "+", "-", "."].includes(e.key)) {
    e.preventDefault();
  }
};

// Price may have decimals but never e / + / -
const blockInvalidPriceKeys = (e) => {
  if (["e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
  }
};


// Small helpers for consistent styling
const inputClass = (hasError) =>
  `w-full h-11 border rounded-lg px-4 text-sm outline-none bg-white focus:ring-1 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
      : "border-slate-300 focus:border-orange-500 focus:ring-orange-500"
  }`;

const FieldError = ({ message }) =>
  message ? (
    <p className="text-xs text-red-500 mt-1">{message}</p>
  ) : null;


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

  const [gender, setGender] = useState(
    existingProduct?.gender || ""
  );

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

  /*
   * Ref on the Add / Edit Variant section so that
   * clicking "Edit" can scroll straight to the form.
   */

  const variantFormRef = useRef(null);


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
  // IMAGE VIEWER
  // ==================================================

  // null = closed, otherwise { images: [...], index: number }
  const [viewer, setViewer] = useState(null);

  const openViewer = (images, index) => {
    setViewer({ images, index });
  };

  const closeViewer = () => setViewer(null);


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

  /*
   * Variant waiting for delete confirmation:
   * { variant, index } or null
   */

  const [variantToDelete, setVariantToDelete] = useState(null);


  // ==================================================
  // ERRORS
  // ==================================================

  // General (banner) error
  const [formError, setFormError] = useState("");

  /*
   * Field-level errors for the Product Details section:
   * { productName, brandId, categoryId, gender, description }
   */
  const [detailErrors, setDetailErrors] = useState({});

  /*
   * Field-level errors for the Variant form:
   * { color, price, images, sizeList, sizes: { [index]: { size, stock } } }
   */
  const [variantErrors, setVariantErrors] = useState({});

  const clearDetailError = (field) => {
    setDetailErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const clearVariantError = (field) => {
    setVariantErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const clearSizeError = (index, field) => {
    setVariantErrors((previous) => {
      const rowErrors = previous.sizes?.[index];
      if (!rowErrors?.[field]) return previous;

      const nextRow = { ...rowErrors };
      delete nextRow[field];

      return {
        ...previous,
        sizes: {
          ...previous.sizes,
          [index]: nextRow,
        },
      };
    });
  };


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

    const errors = {};

    const nameError = validateName(productName);
    if (nameError) errors.productName = nameError;

    const brandError = validateBrand(brandId);
    if (brandError) errors.brandId = brandError;

    const categoryError = validateCategory(categoryId);
    if (categoryError) errors.categoryId = categoryError;

    const genderError = validateGender(gender);
    if (genderError) errors.gender = genderError;

    const descriptionError = validateDescription(description);
    if (descriptionError) errors.description = descriptionError;

    setDetailErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError("Please fix the highlighted fields in Product Details.");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
              productName: normalizeSpaces(productName),
              description: description.trim(),
              brandId,
              categoryId,
              gender,
            },
          })
        ).unwrap();

        setDetailsSaved(true);
        setFormError("");

      } catch (error) {

        setDetailsSaved(false);

        setFormError(
          typeof error === "string"
            ? error
            : "Failed to update product details."
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
    clearVariantError("images");

    const maxBytes = RULES.MAX_IMAGE_SIZE_MB * 1024 * 1024;

    const notImages = selectedFiles.filter(
      (file) => !file.type.startsWith("image/")
    );

    const tooLarge = selectedFiles.filter(
      (file) =>
        file.type.startsWith("image/") && file.size > maxBytes
    );

    const validFiles = selectedFiles.filter(
      (file) =>
        file.type.startsWith("image/") && file.size <= maxBytes
    );

    const messages = [];

    if (notImages.length > 0) {
      messages.push(
        `${notImages.length} file(s) skipped: only image files are allowed.`
      );
    }

    if (tooLarge.length > 0) {
      messages.push(
        `${tooLarge.length} image(s) skipped: each image must be under ${RULES.MAX_IMAGE_SIZE_MB} MB.`
      );
    }

    setImageItems((previous) => {

      const availableSlots =
        RULES.MAX_IMAGES - existingImageUrls.length - previous.length;

      if (availableSlots <= 0) {
        setVariantErrors((prev) => ({
          ...prev,
          images: `You can select a maximum of ${RULES.MAX_IMAGES} images.`,
        }));
        return previous;
      }

      const filesToAdd = validFiles.slice(0, availableSlots);

      if (filesToAdd.length < validFiles.length) {
        messages.push(
          `Only ${RULES.MAX_IMAGES} images are allowed. Extra images were skipped.`
        );
      }

      if (messages.length > 0) {
        setVariantErrors((prev) => ({
          ...prev,
          images: messages.join(" "),
        }));
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
      clearVariantError("images");

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
    clearVariantError("images");
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
    clearVariantError("images");

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

    // Row indexes shift after removal, so drop stale row errors
    setVariantErrors((previous) => {
      const next = { ...previous };
      delete next.sizes;
      delete next.sizeList;
      return next;
    });
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
    clearSizeError(index, field);
    clearVariantError("sizeList");
  };


  // ==================================================
  // VALIDATE VARIANT
  // ==================================================

  const validateVariant = () => {

    const errors = {};

    // ---------- COLOR ----------

    const colorError = validateColor(color);

    if (colorError) {

      errors.color = colorError;

    } else {

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
        errors.color =
          "This color already exists for this product. Edit that variant instead.";
      }
    }


    // ---------- PRICE ----------

    const priceError = validatePrice(price);

    if (priceError) {
      errors.price = priceError;
    }


    // ---------- IMAGES ----------

    /*
     * Existing images + newly selected images
     * must be at least 3 and at most 10.
     */

    const totalImages =
      existingImageUrls.length + imageItems.length;

    const hasUncroppedImages = imageItems.some(
      (item) => !item.cropped
    );

    if (hasUncroppedImages) {
      errors.images =
        "Please crop and resize all selected images before saving the variant.";
    } else if (totalImages < RULES.MIN_IMAGES) {
      errors.images = `A variant must have at least ${RULES.MIN_IMAGES} images (you have ${totalImages}).`;
    } else if (totalImages > RULES.MAX_IMAGES) {
      errors.images = `You can use a maximum of ${RULES.MAX_IMAGES} images.`;
    }


    // ---------- SIZES ----------

    if (sizes.length === 0) {

      errors.sizeList = "At least one size is required.";

    } else {

      const rowErrors = {};

      sizes.forEach((item, index) => {

        const sizeError = validateSizeValue(item.size);
        const stockError = validateStock(item.stock);

        if (sizeError || stockError) {
          rowErrors[index] = {};
          if (sizeError) rowErrors[index].size = sizeError;
          if (stockError) rowErrors[index].stock = stockError;
        }
      });

      // Each size can only be added once
      const seen = new Set();

      sizes.forEach((item, index) => {

        const name = item.size.trim().toLowerCase();

        if (!name) return;

        if (seen.has(name)) {
          rowErrors[index] = {
            ...(rowErrors[index] || {}),
            size: "This size is already added.",
          };
        }

        seen.add(name);
      });

      if (Object.keys(rowErrors).length > 0) {
        errors.sizes = rowErrors;
      }
    }

    setVariantErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError("Please fix the highlighted fields in the variant form.");
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

    setVariantErrors({});
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
      color: normalizeSpaces(color),

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

        if (finalImageUrls.length < RULES.MIN_IMAGES) {
          setVariantErrors((previous) => ({
            ...previous,
            images: "A variant must have at least 3 images.",
          }));
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

    setVariantErrors({});
    setFormError("");

    // Scroll to the Edit Variant form (not the top of the page)
    variantFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
  // DELETE VARIANT (WITH CONFIRMATION MODAL)
  // ==================================================

  // Only opens the modal
  const handleDeleteVariantClick = (variant, index) => {
    setVariantToDelete({ variant, index });
  };

  const handleCloseDeleteModal = () => {

    if (variantDeleteStatus === "loading") {
      return;
    }

    setVariantToDelete(null);
  };

  const confirmDeleteVariant = async () => {

    if (!variantToDelete) {
      return;
    }

    const { variant, index } = variantToDelete;

    // Variant that isn't saved on the backend yet
    if (!variant.id) {

      handleRemoveLocalVariant(index);

      setVariantToDelete(null);

      return;
    }

    try {

      setFormError("");

      await dispatch(deleteVariant(variant.id)).unwrap();

      // Refresh actual backend state
      await dispatch(
        getVariants({
          productId: existingProduct.id,
          page: 1,
          limit: 5,
        })
      ).unwrap();

      // If the deleted variant was open in the form, clear the form
      if (editingVariant?.id === variant.id) {
        resetVariantForm();
      }

      setVariantToDelete(null);

    } catch (error) {

      console.error("DELETE VARIANT ERROR:", error);

      setVariantToDelete(null);

      setFormError(
        typeof error === "string"
          ? error
          : "Failed to delete variant."
      );
    }
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
     * (Backend: "At least one variant is required.")
     */

    if (!isEditMode && variants.length === 0) {
      setFormError(
        "Please add at least one variant before finishing."
      );
      return;
    }

    /*
     * Safety net: every variant must satisfy the backend rules
     * (3+ images, at least one size, valid price...).
     */

    for (const variant of variants) {

      if (
        !Array.isArray(variant.images) ||
        variant.images.length < RULES.MIN_IMAGES
      ) {
        setFormError(
          `The "${variant.color}" variant must have at least ${RULES.MIN_IMAGES} images.`
        );
        return;
      }

      if (
        !Array.isArray(variant.sizes) ||
        variant.sizes.length === 0
      ) {
        setFormError(
          `The "${variant.color}" variant must have at least one size.`
        );
        return;
      }
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
              productName: normalizeSpaces(productName),
              description: description.trim(),
              brandId,
              categoryId,
              gender,
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
          productName: normalizeSpaces(productName),
          description: description.trim(),
          brandId,
          categoryId,
          variants,
          gender,
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

      window.scrollTo({ top: 0, behavior: "smooth" });
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
              <button
                type="button"
                onClick={() => handleEditVariant(variant)}
                className="text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                Edit
              </button>
            )}

            <button
              type="button"
              disabled={isDeletingVariant}
              onClick={() => handleDeleteVariantClick(variant, index)}
              className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              {isBackendVariant ? "Delete" : "Remove"}
            </button>

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

                <button
                  key={`${image}-${imageIndex}`}
                  type="button"
                  onClick={() => openViewer(variant.images, imageIndex)}
                  title="View image"
                  className="cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 transition hover:border-[#ff5722] hover:shadow-md"
                >

                  <img
                    src={image}
                    alt={`${variant.color} ${imageIndex + 1}`}
                    className="w-20 h-20 object-cover"
                  />

                </button>

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
                  maxLength={RULES.NAME_MAX}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    setFormError("");
                    clearDetailError("productName");
                    setDetailsSaved(false);
                  }}
                  onBlur={() => {
                    const message = validateName(productName);
                    if (message) {
                      setDetailErrors((prev) => ({
                        ...prev,
                        productName: message,
                      }));
                    }
                  }}
                  placeholder="Air Zoom Pegasus 41"
                  className={inputClass(detailErrors.productName)}
                />

                <div className="flex justify-between">

                  <FieldError message={detailErrors.productName} />

                  <p className="text-xs text-slate-400 mt-1 ml-auto">
                    {productName.length}/{RULES.NAME_MAX}
                  </p>

                </div>

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
                    clearDetailError("brandId");
                    setDetailsSaved(false);
                  }}
                  className={inputClass(detailErrors.brandId)}
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

                <FieldError message={detailErrors.brandId} />

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
                    clearDetailError("categoryId");
                    setDetailsSaved(false);
                  }}
                  className={inputClass(detailErrors.categoryId)}
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

                <FieldError message={detailErrors.categoryId} />

              </div>


              {/* GENDER */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gender
                </label>

                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setFormError("");
                    clearDetailError("gender");
                    setDetailsSaved(false);
                  }}
                  className={inputClass(detailErrors.gender)}
                >

                  <option value="">
                    Select Gender
                  </option>

                  {GENDER_OPTIONS.map((option) => (

                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>

                  ))}

                </select>

                <FieldError message={detailErrors.gender} />

              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="mt-6">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>

              <textarea
                value={description}
                maxLength={RULES.DESCRIPTION_MAX}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setFormError("");
                  clearDetailError("description");
                  setDetailsSaved(false);
                }}
                onBlur={() => {
                  const message = validateDescription(description);
                  if (message) {
                    setDetailErrors((prev) => ({
                      ...prev,
                      description: message,
                    }));
                  }
                }}
                placeholder="Enter product description..."
                rows={5}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none resize-none focus:ring-1 ${
                  detailErrors.description
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                }`}
              />

              <div className="flex justify-between">

                <FieldError message={detailErrors.description} />

                <p className="text-xs text-slate-400 mt-1 ml-auto">
                  {description.length}/{RULES.DESCRIPTION_MAX}
                </p>

              </div>

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

        <section
          ref={variantFormRef}
          className="bg-white border border-slate-200 rounded-xl shadow-sm mb-8 scroll-mt-6"
        >

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
                    clearVariantError("color");
                  }}
                  className={inputClass(variantErrors.color)}
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

                <FieldError message={variantErrors.color} />

              </div>


              {/* PRICE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onKeyDown={blockInvalidPriceKeys}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setFormError("");
                    clearVariantError("price");
                  }}
                  placeholder="4999"
                  className={inputClass(variantErrors.price)}
                />

                <FieldError message={variantErrors.price} />

              </div>

            </div>


            {/* IMAGES */}

            <div className="mt-7">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variant Images
              </label>

              <div
                className={`border rounded-lg px-4 py-3 ${
                  variantErrors.images
                    ? "border-red-400"
                    : "border-slate-300"
                }`}
              >

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
                Select {RULES.MIN_IMAGES} to {RULES.MAX_IMAGES} images. Each image must be under {RULES.MAX_IMAGE_SIZE_MB} MB.
                {" "}
                ({existingImageUrls.length + imageItems.length}/{RULES.MAX_IMAGES} selected)
              </p>

              <FieldError message={variantErrors.images} />


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

                        <button
                          type="button"
                          onClick={() => openViewer(existingImageUrls, index)}
                          title="View image"
                          className="block cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 transition hover:border-[#ff5722] hover:shadow-md"
                        >

                          <img
                            src={image}
                            alt={`Existing ${index + 1}`}
                            className="w-24 h-24 object-cover"
                          />

                        </button>

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

                        <button
                          type="button"
                          onClick={() =>
                            openViewer(
                              imageItems.map((i) => i.preview),
                              index
                            )
                          }
                          title="View image"
                          className="block cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 transition hover:border-[#ff5722] hover:shadow-md"
                        >

                          <img
                            src={item.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-24 h-24 object-cover"
                          />

                        </button>

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
                  disabled={sizes.length >= SIZE_OPTIONS.length}
                  className="text-sm font-medium text-[#ff5722] hover:text-[#f4511e] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Add Size
                </button>

              </div>

              <FieldError message={variantErrors.sizeList} />


              <div className="space-y-3">

                {sizes.map((item, index) => {

                  const rowErrors = variantErrors.sizes?.[index] || {};

                  return (

                    <div
                      key={index}
                      className="flex gap-3 items-start"
                    >

                      {/* SIZE DROPDOWN */}

                      <div className="flex-1">

                        <select
                          value={item.size}
                          onChange={(e) =>
                            handleSizeChange(index, "size", e.target.value)
                          }
                          className={inputClass(rowErrors.size)}
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

                        <FieldError message={rowErrors.size} />

                      </div>


                      {/* STOCK */}

                      <div className="w-40">

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.stock}
                          onKeyDown={blockInvalidIntegerKeys}
                          onChange={(e) =>
                            handleSizeChange(index, "stock", e.target.value)
                          }
                          placeholder="Stock"
                          className={inputClass(rowErrors.stock)}
                        />

                        <FieldError message={rowErrors.stock} />

                      </div>


                      {sizes.length > 1 && (

                        <button
                          type="button"
                          onClick={() => handleRemoveSize(index)}
                          className="text-red-500 hover:text-red-600 text-lg h-11"
                        >
                          ×
                        </button>

                      )}

                    </div>

                  );
                })}

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


      {/* ================================================= */}
      {/* IMAGE CROPPER */}
      {/* ================================================= */}

      {cropImageIndex !== null &&
        imageItems[cropImageIndex] && (

          <ImageCropper
            image={imageItems[cropImageIndex].preview}
            onApply={handleApplyCrop}
            onCancel={handleCancelCrop}
            loading={isCropping}
          />

        )}


      {/* ================================================= */}
      {/* IMAGE VIEWER */}
      {/* ================================================= */}

      {viewer && (
        <ImageViewer
          images={viewer.images}
          index={viewer.index}
          onClose={closeViewer}
          onChange={(i) =>
            setViewer((prev) => prev && { ...prev, index: i })
          }
        />
      )}

      {/* ================================================= */}
      {/* DELETE VARIANT MODAL */}
      {/* ================================================= */}

      <Modal
        open={!!variantToDelete}
        title={
          variantToDelete?.variant?.id
            ? "Delete Variant"
            : "Remove Variant"
        }
        message={
          variantToDelete
            ? `Are you sure you want to ${
                variantToDelete.variant.id ? "delete" : "remove"
              } the "${variantToDelete.variant.color}" variant? ${
                variantToDelete.variant.id
                  ? "This action cannot be undone."
                  : ""
              }`
            : ""
        }
        confirmText={
          variantToDelete?.variant?.id ? "Delete" : "Remove"
        }
        cancelText="Cancel"
        variant="danger"
        loading={isDeletingVariant}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteVariant}
      />

    </div>
  );
};


export default ProductForm;
