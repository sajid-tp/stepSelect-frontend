import { useEffect, useState } from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import AdminSidebar from "../../components/AdminSideBar";

import {
  createBrand,
  updateBrand,
  resetCreateBrandState,
  resetUpdateBrandState,
} from "../../features/admin/brandSlice";


/*
|--------------------------------------------------------------------------
| VALIDATION RULES
|--------------------------------------------------------------------------
*/

const RULES = {
  NAME_MIN: 2,
  NAME_MAX: 50,

  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 500,

  LOGO_MAX: 500,
};

// Starts with a letter/number; allows letters, numbers, spaces and  - ' . , & ( ) !
const NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s\-'.,&()!]*$/;

// Collapses repeated spaces: "New   Balance " -> "New Balance"
const normalizeSpaces = (value) =>
  String(value || "").trim().replace(/\s+/g, " ");


const validateBrandName = (value) => {
  const name = normalizeSpaces(value);

  if (!name) {
    return "Brand name is required.";
  }

  if (name.length < RULES.NAME_MIN) {
    return `Brand name must be at least ${RULES.NAME_MIN} characters.`;
  }

  if (name.length > RULES.NAME_MAX) {
    return `Brand name cannot exceed ${RULES.NAME_MAX} characters.`;
  }

  if (!NAME_REGEX.test(name)) {
    return "Brand name must start with a letter or number and can only contain letters, numbers, spaces and - ' . , & ( ) !";
  }

  return "";
};


// Description is optional, but if it is entered it must be meaningful
const validateDescription = (value) => {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  if (text.length < RULES.DESCRIPTION_MIN) {
    return `Description must be at least ${RULES.DESCRIPTION_MIN} characters (or leave it empty).`;
  }

  if (text.length > RULES.DESCRIPTION_MAX) {
    return `Description cannot exceed ${RULES.DESCRIPTION_MAX} characters.`;
  }

  if (!/[A-Za-z]/.test(text)) {
    return "Description must contain readable text, not only numbers or symbols.";
  }

  return "";
};


// Logo is optional, but if it is entered it must be a valid http(s) URL
const validateLogo = (value) => {
  const url = String(value || "").trim();

  if (!url) {
    return "";
  }

  if (url.length > RULES.LOGO_MAX) {
    return `Logo URL cannot exceed ${RULES.LOGO_MAX} characters.`;
  }

  if (/\s/.test(url)) {
    return "Logo URL cannot contain spaces.";
  }

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return "Enter a valid URL, e.g. https://example.com/logo.png";
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return "Logo URL must start with http:// or https://";
  }

  if (!parsed.hostname.includes(".")) {
    return "Enter a valid URL, e.g. https://example.com/logo.png";
  }

  return "";
};


const VALIDATORS = {
  brandName: validateBrandName,
  description: validateDescription,
  logo: validateLogo,
};


function BrandForm() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const { brandId } = useParams();


  const isEditMode = Boolean(brandId);


  const brandFromState = location.state?.brand;


  const {
    createStatus,
    createError,
    updateStatus,
    updateError,
  } = useSelector(
    (state) => state.adminBrands
  );


  const [formData, setFormData] = useState({
    brandName: "",
    description: "",
    logo: "",
  });


  const [errors, setErrors] = useState({});

  // true when the logo URL is valid but the image could not be loaded
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | LOAD BRAND INTO FORM
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (isEditMode && brandFromState) {
      setFormData({
        brandName:
          brandFromState.brandName || "",

        description:
          brandFromState.description || "",

        logo:
          brandFromState.logo || "",
      });
    }
  }, [isEditMode, brandFromState]);


  /*
  |--------------------------------------------------------------------------
  | CLEAN REDUX STATE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(resetCreateBrandState());

    dispatch(resetUpdateBrandState());
  }, [dispatch]);


  /*
  |--------------------------------------------------------------------------
  | HANDLE INPUT
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    if (name === "logo") {
      setLogoLoadFailed(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | VALIDATE ONE FIELD (ON BLUR)
  |--------------------------------------------------------------------------
  */

  const handleBlur = (e) => {
    const { name, value } = e.target;

    const validate = VALIDATORS[name];

    if (!validate) return;

    setErrors((previous) => ({
      ...previous,
      [name]: validate(value),
    }));
  };


  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const newErrors = {};

    Object.keys(VALIDATORS).forEach((field) => {
      const message = VALIDATORS[field](formData[field]);

      if (message) {
        newErrors[field] = message;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      brandName: normalizeSpaces(formData.brandName),

      description:
        formData.description.trim(),

      logo: formData.logo.trim(),
    };

    try {
      if (isEditMode) {
        await dispatch(
          updateBrand({
            brandId,
            brandData: payload,
          })
        ).unwrap();
      } else {
        await dispatch(
          createBrand(payload)
        ).unwrap();
      }

      navigate("/admin/brands");
    } catch (error) {
      console.error(error);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  const isSubmitting =
    createStatus === "loading" ||
    updateStatus === "loading";


  const serverError = isEditMode
    ? updateError
    : createError;


  // Shared style helper for inputs
  const fieldClass = (hasError) => `
    w-full rounded-lg
    border bg-white
    px-4 py-3 text-sm
    text-gray-900
    outline-none transition
    placeholder:text-gray-400
    focus:ring-2

    ${
      hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-[#ff5722] focus:ring-[#ff5722]/10"
    }

    disabled:cursor-not-allowed
    disabled:bg-gray-50
  `;


  // Show the preview only when the URL itself is valid
  const showLogoPreview =
    formData.logo.trim() &&
    !validateLogo(formData.logo);


  /*
  |--------------------------------------------------------------------------
  | EDIT ROUTE WITHOUT STATE
  |--------------------------------------------------------------------------
  */

  if (isEditMode && !brandFromState) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />

        <main className="ml-[214px] flex min-h-screen items-center justify-center px-8">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Brand information unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This edit page was opened directly. Since the
              backend does not provide a GET brand-by-ID
              endpoint, please return to the brand list and
              select Edit from there.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/brands")
              }
              className="
                mt-6 rounded-lg
                bg-[#ff5722]
                px-5 py-2.5
                text-sm font-semibold
                text-white
                hover:bg-[#e64a19]
              "
            >
              Back to Brands
            </button>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen px-8 py-10">

        {/* CENTERED CONTENT CONTAINER */}
        <div className="mx-auto w-full max-w-5xl">

          {/* HEADER */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/brands")
              }
              className="
                mb-4 text-sm font-medium
                text-gray-500 transition
                hover:text-gray-900
              "
            >
              ← Back to Brands
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Brand"
                : "Add Brand"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {isEditMode
                ? "Update the brand information below."
                : "Create a new product brand."}
            </p>
          </div>


          {/* FORM CARD */}
          <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">

            {/* SERVER ERROR */}
            {serverError && (
              <div
                className="
                  mb-6 rounded-lg
                  border border-red-200
                  bg-red-50 px-4 py-3
                  text-sm text-red-600
                "
              >
                {serverError}
              </div>
            )}


            <form onSubmit={handleSubmit} noValidate>

              {/* BRAND NAME */}
              <div className="mb-6">
                <label
                  htmlFor="brandName"
                  className="
                    mb-2 block text-sm
                    font-semibold text-gray-700
                  "
                >
                  Brand Name

                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>


                <input
                  id="brandName"
                  name="brandName"
                  type="text"
                  value={formData.brandName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={RULES.NAME_MAX}
                  placeholder="Enter brand name"
                  disabled={isSubmitting}
                  className={fieldClass(errors.brandName)}
                />


                <div className="mt-2 flex justify-between">
                  {errors.brandName ? (
                    <p className="text-xs text-red-500">
                      {errors.brandName}
                    </p>
                  ) : (
                    <span />
                  )}

                  <p className="text-xs text-gray-400">
                    {formData.brandName.length}/{RULES.NAME_MAX}
                  </p>
                </div>
              </div>


              {/* DESCRIPTION */}
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="
                    mb-2 block text-sm
                    font-semibold text-gray-700
                  "
                >
                  Description
                </label>


                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={RULES.DESCRIPTION_MAX}
                  placeholder="Enter brand description"
                  disabled={isSubmitting}
                  className={`${fieldClass(errors.description)} resize-none`}
                />


                <div className="mt-2 flex justify-between">
                  {errors.description ? (
                    <p className="text-xs text-red-500">
                      {errors.description}
                    </p>
                  ) : (
                    <span />
                  )}

                  <p className="text-xs text-gray-400">
                    {formData.description.length}/{RULES.DESCRIPTION_MAX}
                  </p>
                </div>
              </div>


              {/* LOGO */}
              <div className="mb-8">
                <label
                  htmlFor="logo"
                  className="
                    mb-2 block text-sm
                    font-semibold text-gray-700
                  "
                >
                  Logo URL
                </label>


                <input
                  id="logo"
                  name="logo"
                  type="text"
                  value={formData.logo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://example.com/logo.png"
                  disabled={isSubmitting}
                  className={fieldClass(errors.logo)}
                />


                {errors.logo ? (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.logo}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-gray-400">
                    Optional. Enter the URL of the brand logo.
                  </p>
                )}


                {/* LOGO PREVIEW */}
                {showLogoPreview && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Preview
                    </p>

                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {!logoLoadFailed && (
                        <img
                          src={formData.logo.trim()}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                          onError={() => setLogoLoadFailed(true)}
                        />
                      )}
                    </div>

                    {logoLoadFailed && (
                      <p className="mt-2 text-xs text-amber-600">
                        This image could not be loaded. Check that the URL points directly to an image.
                      </p>
                    )}
                  </div>
                )}
              </div>


              {/* ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    navigate("/admin/brands")
                  }
                  className="
                    rounded-lg
                    border border-gray-200
                    bg-white px-5 py-2.5
                    text-sm font-semibold
                    text-gray-700
                    transition hover:bg-gray-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    rounded-lg
                    bg-[#ff5722]
                    px-6 py-2.5
                    text-sm font-semibold
                    text-white
                    transition
                    hover:bg-[#e64a19]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Brand"
                      : "Create Brand"}
                </button>

              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

export default BrandForm;
