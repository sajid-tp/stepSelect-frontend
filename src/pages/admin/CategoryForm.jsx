import { useEffect } from "react";
import {
  useForm,
} from "react-hook-form";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import AdminSidebar from "../../components/AdminSideBar";

import {
  createCategory,
  updateCategory,
  resetCategoryFormState,
} from "../../features/admin/categorySlice";

// Same numbers as ICON_CLASS_LIMITS in server/src/constants/categoryConstants.js - change both together.
const ICON_CLASS_RULES = { MIN: 3, MAX: 100 };
// Letters, numbers, spaces and hyphens only
const ICON_CLASS_REGEX = /^[A-Za-z0-9 -]+$/;
// server messages about the icon class ("Icon class is required", "Icon class must be ...")
const ICON_CLASS_ERROR_REGEX = /icon class/i;

// Same numbers as NAME_LIMITS in server/src/constants/categoryConstants.js - change both together.
const NAME_RULES = { MIN: 2, MAX: 50 };
// server messages about the name ("Category name is required.", "Category name must be ...")
const NAME_ERROR_REGEX = /^category name/i;

// Same numbers as DESCRIPTION_LIMITS in server/src/constants/categoryConstants.js - change both together.
// The description is optional, so there is no minimum.
const DESCRIPTION_RULES = { MAX: 500 };
// server messages about the description ("Description must be ...", "Description cannot exceed ...")
const DESCRIPTION_ERROR_REGEX = /^description/i;


function CategoryForm() {

  const dispatch = useDispatch();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const { categoryId } =
    useParams();


  // ===================================================
  // MODE
  // ===================================================

  const isEditMode =
    Boolean(categoryId);


  // Category passed from Categories.jsx

  const category =
    location.state?.category;


  // ===================================================
  // REDUX
  // ===================================================

  const {
    createStatus,
    createError,

    updateStatus,
    updateError,

  } = useSelector(
    (state) =>
      state.adminCategories
  );


  // ===================================================
  // FORM
  // ===================================================

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: {
      errors,
    },

  } = useForm({

    // show the red message after leaving a field, then update it live while typing
    mode: "onTouched",

    defaultValues: {

      categoryName: "",

      iconClass: "",

      description: "",

    },

  });


  // clear any old create/update error left in the store from an earlier visit to this form
  useEffect(() => {

    dispatch(resetCategoryFormState());

  }, [dispatch]);


  useEffect(() => {

    if (
      isEditMode &&
      category
    ) {

      reset({

        categoryName:
          category.categoryName || "",

        iconClass:
          category.iconClass || "",

        description:
          category.description || "",

      });

    }

  }, [
    isEditMode,
    category,
    reset,
  ]);


  const iconClass =
    watch("iconClass");

  const nameValue =
    watch("categoryName") || "";

  const descriptionValue =
    watch("description") || "";


  const onSubmit = async (data) => {

    const categoryData = {

      categoryName:
        data.categoryName.trim(),

      iconClass:
        data.iconClass.trim().replace(/\s+/g, " "),

      description:
        data.description.trim(),

    };


    try {

      if (isEditMode) {

        await dispatch(
          updateCategory({

            categoryId,

            categoryData,

          })
        ).unwrap();

      } else {

        await dispatch(
          createCategory(
            categoryData
          )
        ).unwrap();

      }


      navigate(
        "/admin/categories"
      );

    } catch (error) {

      // show the server's icon class error right under the icon class field
      const message =
        typeof error === "string"
          ? error
          : error?.message || "";

      if (NAME_ERROR_REGEX.test(message)) {
        setError("categoryName", {
          type: "server",
          message,
        });
      }

      if (ICON_CLASS_ERROR_REGEX.test(message)) {
        setError("iconClass", {
          type: "server",
          message,
        });
      }

      if (DESCRIPTION_ERROR_REGEX.test(message)) {
        setError("description", {
          type: "server",
          message,
        });
      }

      console.error(
        isEditMode
          ? "Failed to update category:"
          : "Failed to create category:",
        error
      );

    }

  };


  // ===================================================
  // STATUS
  // ===================================================

  const isSubmitting =
    isEditMode
      ? updateStatus === "loading"
      : createStatus === "loading";


  const formError =
    isEditMode
      ? updateError
      : createError;


  // ===================================================
  // EDIT URL WITHOUT CATEGORY STATE
  // ===================================================

  if (
    isEditMode &&
    !category
  ) {

    return (

      <div className="min-h-screen bg-[#f8fafc]">

        <AdminSidebar />

        <main
          className="
            ml-[214px]
            min-h-screen
            px-12
            py-16
          "
        >

          <div
            className="
              mx-auto
              max-w-3xl
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-8
              text-center
            "
          >

            <h2
              className="
                text-lg
                font-bold
                text-red-700
              "
            >
              Category data is unavailable
            </h2>


            <p
              className="
                mt-2
                text-sm
                text-red-600
              "
            >
              Please return to the category list
              and select Edit again.
            </p>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/categories"
                )
              }
              className="
                mt-6
                rounded-lg
                bg-[#ff5722]
                px-5
                py-3
                text-sm
                font-semibold
                text-white
              "
            >
              Back to Categories
            </button>

          </div>

        </main>

      </div>

    );

  }


  return (

    <div
      className="
        min-h-screen
        bg-[#f8fafc]
      "
    >

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <AdminSidebar />


      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

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

          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.16em]
              text-gray-400
            "
          >
            Taxonomy
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

            {isEditMode
              ? "Edit Category"
              : "Add Category"}

          </h1>

        </header>


        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <section
          className="
            px-12
            py-10
          "
        >

          <div
            className="
              mx-auto
              w-full
              max-w-5xl
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-8
              shadow-sm
            "
          >

            {/* ================================================= */}
            {/* TITLE */}
            {/* ================================================= */}

            <div className="mb-8">

              <h2
                className="
                  text-xl
                  font-bold
                  text-gray-900
                "
              >
                Category Information
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >

                {isEditMode
                  ? "Update the details of this category."
                  : "Add the details for your new product category."}

              </p>

            </div>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {formError &&
              !NAME_ERROR_REGEX.test(formError) &&
              !ICON_CLASS_ERROR_REGEX.test(formError) &&
              !DESCRIPTION_ERROR_REGEX.test(formError) && (

              <div
                className="
                  mb-6
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
                {formError}
              </div>

            )}


            {/* ================================================= */}
            {/* FORM */}
            {/* ================================================= */}

            <form
              onSubmit={
                handleSubmit(onSubmit)
              }
              className="space-y-7"
            >

              {/* ================================================= */}
              {/* CATEGORY NAME */}
              {/* ================================================= */}

              <div>

                <label
                  htmlFor="categoryName"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >

                  Category Name

                  <span
                    className="
                      ml-1
                      text-red-500
                    "
                  >
                    *
                  </span>

                </label>


                <input
                  id="categoryName"
                  type="text"
                  maxLength={NAME_RULES.MAX}
                  placeholder="Enter category name"
                  {...register(
                    "categoryName",
                    {
                      required:
                        "Category name is required",

                      validate: (value) => {
                        const name = value.trim().replace(/\s+/g, " ");
                        if (!name) return "Category name is required";
                        if (name.length < NAME_RULES.MIN)
                          return `Category name must be at least ${NAME_RULES.MIN} characters`;
                        if (name.length > NAME_RULES.MAX)
                          return `Category name cannot exceed ${NAME_RULES.MAX} characters`;
                        return true;
                      },
                    }
                  )}
                  className={`
                    w-full
                    rounded-lg
                    border
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition

                    ${
                      errors.categoryName
                        ? "border-red-400"
                        : "border-gray-300 focus:border-[#ff5722]"
                    }
                  `}
                />


                <div className="mt-1.5 flex justify-between">

                  {errors.categoryName ? (

                    <p
                      className="
                        text-xs
                        text-red-500
                      "
                    >
                      {errors.categoryName.message}
                    </p>

                  ) : (

                    <span />

                  )}


                  <p className="text-xs text-gray-400">
                    {nameValue.length}/{NAME_RULES.MAX}
                  </p>

                </div>

              </div>


              {/* ================================================= */}
              {/* ICON */}
              {/* ================================================= */}

              <div>

                <label
                  htmlFor="iconClass"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >

                  FontAwesome Icon Class

                  <span
                    className="
                      ml-1
                      text-red-500
                    "
                  >
                    *
                  </span>

                </label>


                <div className="flex gap-3">

                  <input
                    id="iconClass"
                    type="text"
                    maxLength={ICON_CLASS_RULES.MAX}
                    placeholder="fa-solid fa-mobile-screen"
                    {...register(
                      "iconClass",
                      {
                        required:
                          "Icon class is required",

                        validate: (value) => {
                          const icon = value.trim();
                          if (!icon) return "Icon class is required";
                          if (
                            icon.length < ICON_CLASS_RULES.MIN ||
                            icon.length > ICON_CLASS_RULES.MAX
                          )
                            return `Icon class must be ${ICON_CLASS_RULES.MIN} to ${ICON_CLASS_RULES.MAX} characters`;
                          if (!ICON_CLASS_REGEX.test(icon))
                            return "Only letters, numbers, spaces and hyphens are allowed";
                          return true;
                        },
                      }
                    )}
                    className={`
                      flex-1
                      rounded-lg
                      border
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition

                      ${
                        errors.iconClass
                          ? "border-red-400"
                          : "border-gray-300 focus:border-[#ff5722]"
                      }
                    `}
                  />


                </div>


                <div className="mt-1.5 flex justify-between gap-4">

                  <div>

                    {errors.iconClass && (

                      <p
                        className="
                          text-xs
                          text-red-500
                        "
                      >
                        {errors.iconClass.message}
                      </p>

                    )}


                    <p
                      className="
                        text-xs
                        text-gray-400
                      "
                    >
                      Example: fa-solid fa-mobile-screen
                    </p>

                  </div>


                  <p className="shrink-0 text-xs text-gray-400">
                    {iconClass?.length || 0}/{ICON_CLASS_RULES.MAX}
                  </p>

                </div>

              </div>


              {/* ================================================= */}
              {/* VISIBILITY */}
              {/* ================================================= */}

              {/* <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Visibility Status
                </label>


                <div
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-50
                    px-4
                    py-3
                  "
                >

                  <div>

                    <p
                      className="
                        text-sm
                        font-medium
                        text-gray-800
                      "
                    >
                      Active
                    </p>


                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-gray-500
                      "
                    >
                      New categories are active
                      by default.
                    </p>

                  </div>


                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-green-200
                      bg-green-50
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      text-green-700
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-green-600
                      "
                    />

                    Active

                  </span>

                </div>

              </div> */}


              {/* ================================================= */}
              {/* DESCRIPTION */}
              {/* ================================================= */}

              <div>

                <label
                  htmlFor="description"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Description

                  <span
                    className="
                      ml-1
                      text-xs
                      font-normal
                      text-gray-400
                    "
                  >
                    (optional)
                  </span>
                </label>


                <textarea
                  id="description"
                  rows={5}
                  placeholder="Enter a short description for this category"
                  maxLength={DESCRIPTION_RULES.MAX}
                  {...register(
                    "description",
                    {
                      validate: (value) => {
                        const text = value.trim().replace(/\s+/g, " ");
                        if (text.length > DESCRIPTION_RULES.MAX)
                          return `Description cannot exceed ${DESCRIPTION_RULES.MAX} characters`;
                        return true;
                      },
                    }
                  )}
                  className={`
                    w-full
                    resize-none
                    rounded-lg
                    border
                    ${errors.description ? "border-red-400" : "border-gray-300"}
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-[#ff5722]
                    focus:ring-1
                    focus:ring-[#ff5722]
                  `}
                />

                <div className="mt-1.5 flex justify-between">

                  {errors.description ? (

                    <p
                      className="
                        text-xs
                        text-red-500
                      "
                    >
                      {errors.description.message}
                    </p>

                  ) : (

                    <p
                      className="
                        text-xs
                        text-gray-400
                      "
                    >
                      Optional. Maximum {DESCRIPTION_RULES.MAX} characters.
                    </p>

                  )}


                  <p className="text-xs text-gray-400">
                    {descriptionValue.length}/{DESCRIPTION_RULES.MAX}
                  </p>

                </div>


              </div>

              

              {/* ================================================= */}
              {/* ACTIONS */}
              {/* ================================================= */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-gray-200
                  pt-7
                "
              >

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    navigate(
                      "/admin/categories"
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-gray-600
                    transition
                    hover:bg-gray-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  ← Back to Categories
                </button>


                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    rounded-lg
                    bg-[#ff5722]
                    px-7
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#f4511e]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {isSubmitting

                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."

                    : isEditMode
                      ? "Update Category"
                      : "Create Category"}

                </button>

              </div>

            </form>

          </div>

        </section>

      </main>

    </div>

  );
}


export default CategoryForm;