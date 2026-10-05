import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/AdminSideBar";

import {
  createCategory,
} from "../../features/admin/categorySlice";


function CategoryForm() {

  const dispatch = useDispatch();
  const navigate = useNavigate();


  // ================= REDUX =================

  const {
    createStatus,
    createError,
  } = useSelector(
    (state) => state.adminCategories
  );


  // ================= FORM =================

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
    },
    reset,
  } = useForm({

    defaultValues: {

      categoryName: "",

      iconClass: "",

      description: "",

    },

  });


  // ================= ICON PREVIEW =================

  const iconClass =
    watch("iconClass");


  // ================= SUBMIT =================

  const onSubmit = async (data) => {

    try {

      await dispatch(
        createCategory({
          categoryName:
            data.categoryName.trim(),

          iconClass:
            data.iconClass.trim(),

          description:
            data.description.trim(),
        })
      ).unwrap();


      // Clear form after successful creation

      reset();


      // Go back to category list

      navigate("/admin/categories");

    } catch (error) {

      console.error(
        "Failed to create category:",
        error
      );

    }

  };


  // ================= CLEANUP =================

  useEffect(() => {

    return () => {

      // Nothing needed here currently.

    };

  }, []);


  const isCreating =
    createStatus === "loading";


  return (

    <div className="min-h-screen bg-[#f8fafc]">

      {/* ================= SIDEBAR ================= */}

      <AdminSidebar />


      {/* ================= MAIN ================= */}

      <main className="ml-[214px] min-h-screen">

        {/* ================= HEADER ================= */}

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

            Add Category

          </h1>

        </header>


        {/* ================= FORM AREA ================= */}

        <section className="px-12 py-10">

          <div
           className="
      mx-auto
      w-full
      max-w-4xl
      rounded-2xl
      border
      border-gray-200
      bg-white
      p-8
      shadow-sm
    "
          >

            {/* ================= TITLE ================= */}

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
                Add the details for your new
                product category.
              </p>

            </div>


            {/* ================= BACKEND ERROR ================= */}

            {createStatus === "failed" &&
              createError && (

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
                  {createError}
                </div>

              )}


            {/* ================= FORM ================= */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-7"
            >

              {/* ================= CATEGORY NAME ================= */}

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
                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>


                <input
                  id="categoryName"
                  type="text"
                  placeholder="Enter category name"
                  {...register(
                    "categoryName",
                    {
                      required:
                        "Category name is required",

                      validate: (value) =>
                        value.trim().length > 0 ||
                        "Category name is required",
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
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-[#ff5722]"
                    }
                  `}
                />


                {errors.categoryName && (

                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-500
                    "
                  >
                    {errors.categoryName.message}
                  </p>

                )}

              </div>


              {/* ================= ICON CLASS ================= */}

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
                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>


                <div className="flex gap-3">

                  <input
                    id="iconClass"
                    type="text"
                    placeholder="fa-solid fa-mobile-screen"
                    {...register(
                      "iconClass",
                      {
                        required:
                          "Icon class is required",

                        validate: (value) =>
                          value.trim().length > 0 ||
                          "Icon class is required",
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


                  {/* Icon Preview */}

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-gray-200
                      bg-gray-50
                      text-xl
                      text-[#ff5722]
                    "
                  >

                    {iconClass?.trim() ? (

                      <i
                        className={iconClass}
                      />

                    ) : (

                      <span className="text-gray-300">
                        ?
                      </span>

                    )}

                  </div>

                </div>


                {errors.iconClass && (

                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-500
                    "
                  >
                    {errors.iconClass.message}
                  </p>

                )}


                <p
                  className="
                    mt-1.5
                    text-xs
                    text-gray-400
                  "
                >
                  Example: fa-solid fa-mobile-screen
                </p>

              </div>


              {/* ================= VISIBILITY ================= */}

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
                      New categories are active by
                      default.
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


              {/* ================= DESCRIPTION ================= */}

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
                </label>


                <textarea
                  id="description"
                  rows={5}
                  placeholder="Enter a short description for this category"
                  {...register("description")}
                  className="
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-[#ff5722]
                    focus:ring-1
                    focus:ring-[#ff5722]
                  "
                />

              </div>


              {/* ================= ACTIONS ================= */}

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

                {/* Back */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/categories")
                  }
                  disabled={isCreating}
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


                {/* Create */}

                <button
                  type="submit"
                  disabled={isCreating}
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

                  {isCreating
                    ? "Creating..."
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