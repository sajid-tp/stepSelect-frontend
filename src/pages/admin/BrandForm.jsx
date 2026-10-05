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
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brandName.trim()) {
      newErrors.brandName =
        "Brand name is required.";
    }

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
      brandName: formData.brandName.trim(),
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

      <main className="ml-[214px] min-h-screen px-8 py-8">
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
        <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
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

          <form onSubmit={handleSubmit}>
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
                placeholder="Enter brand name"
                disabled={isSubmitting}
                className={`
                  w-full rounded-lg
                  border bg-white
                  px-4 py-3 text-sm
                  text-gray-900
                  outline-none transition
                  placeholder:text-gray-400
                  focus:ring-2
                  ${
                    errors.brandName
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#ff5722] focus:ring-[#ff5722]/10"
                  }
                  disabled:cursor-not-allowed
                  disabled:bg-gray-50
                `}
              />

              {errors.brandName && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.brandName}
                </p>
              )}
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
                placeholder="Enter brand description"
                disabled={isSubmitting}
                className="
                  w-full resize-none
                  rounded-lg border
                  border-gray-200
                  bg-white px-4 py-3
                  text-sm text-gray-900
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-[#ff5722]
                  focus:ring-2
                  focus:ring-[#ff5722]/10
                  disabled:cursor-not-allowed
                  disabled:bg-gray-50
                "
              />
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
                placeholder="https://example.com/logo.png"
                disabled={isSubmitting}
                className="
                  w-full rounded-lg
                  border border-gray-200
                  bg-white px-4 py-3
                  text-sm text-gray-900
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-[#ff5722]
                  focus:ring-2
                  focus:ring-[#ff5722]/10
                  disabled:cursor-not-allowed
                  disabled:bg-gray-50
                "
              />

              <p className="mt-2 text-xs text-gray-400">
                Enter the URL of the brand logo.
              </p>

              {/* LOGO PREVIEW */}
              {formData.logo.trim() && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    Preview
                  </p>

                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
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
      </main>
    </div>
  );
}

export default BrandForm;