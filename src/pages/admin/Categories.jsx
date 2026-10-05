import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/AdminSideBar";
import AdminCategoryCard from "../../components/AdminCategoryCard";
import AdminPagination from "../../components/AdminPagination";

import {
  getCategories,
  toggleCategoryStatus,
} from "../../features/admin/categorySlice";


function Categories() {

  const dispatch = useDispatch();
  const navigate = useNavigate();


  // ================= LOCAL STATE =================

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [togglingCategoryId, setTogglingCategoryId] =
    useState(null);


  // ================= REDUX STATE =================

  const {
    categories = [],
    totalResults = 0,
    totalPages = 1,
    currentPage = 1,
    limit = 8,
    status,
    error,
  } = useSelector(
    (state) => state.adminCategories
  );


  // ================= FETCH CATEGORIES =================

  useEffect(() => {

    dispatch(
      getCategories({
        search,
        page,
      })
    );

  }, [dispatch, search, page]);


  // ================= SEARCH =================

  const handleSearchChange = (e) => {

    setSearch(e.target.value);

    // Whenever search changes,
    // start from page 1.

    setPage(1);

  };


  const handleClearSearch = () => {

    setSearch("");

    setPage(1);

  };


  // ================= EDIT =================

  const handleEditCategory = (category) => {

    /*
     * The Add/Edit page will be created later.
     */

    navigate(
      `/admin/categories/edit/${category.id}`
    );

  };


  // ================= TOGGLE STATUS =================

  const handleToggleStatus = async (category) => {

    try {

      setTogglingCategoryId(category.id);

      await dispatch(
        toggleCategoryStatus(category.id)
      ).unwrap();

    } catch (error) {

      console.error(
        "Failed to update category status:",
        error
      );

    } finally {

      setTogglingCategoryId(null);

    }

  };


  return (

    <div className="min-h-screen bg-[#f8fafc]">

      {/* ================= SIDEBAR ================= */}

      <AdminSidebar />


      {/* ================= MAIN ================= */}

      <main className="ml-[214px] min-h-screen">

        {/* ================= HEADER ================= */}

        <header
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-200
            bg-white
            px-12
            py-7
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
              Category{" "}

              <span className="text-[#ff5722]">
                Management
              </span>

            </h1>

          </div>


          {/* ================= ADD CATEGORY ================= */}

          <button
            type="button"
            onClick={() =>
              navigate("/admin/categories/new")
            }
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-[#ff5722]
              px-6
              py-3
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-white
              shadow-md
              transition
              hover:bg-[#f4511e]
            "
          >

            <span className="text-xl leading-none">
              +
            </span>

            Add New Category

          </button>

        </header>


        {/* ================= CONTENT ================= */}

        <section className="px-12 py-10">


          {/* ================= SEARCH / FILTER ================= */}

          <div className="flex items-center justify-between">

            {/* Search */}

            <div className="relative w-[450px]">

              <svg
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >

                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <line
                  x1="16.65"
                  y1="16.65"
                  x2="21"
                  y2="21"
                />

              </svg>


              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search category"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  py-3
                  pl-10
                  pr-20
                  text-sm
                  outline-none
                  transition
                  focus:border-[#ff5722]
                  focus:ring-1
                  focus:ring-[#ff5722]
                "
              />


              {/* Clear */}

              {search && (

                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    font-semibold
                    text-gray-400
                    hover:text-gray-700
                  "
                >
                  Clear
                </button>

              )}

            </div>


            {/* Filter */}

            <button
              type="button"
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-gray-300
                bg-white
                px-5
                py-3
                text-sm
                font-medium
                text-gray-600
                transition
                hover:bg-gray-50
              "
            >

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
              </svg>

              Filter

            </button>

          </div>


          {/* ================= TABS ================= */}

          <div
            className="
              mt-14
              flex
              gap-8
              border-b
              border-gray-200
            "
          >

            <button
              type="button"
              className="
                border-b-2
                border-[#ff5722]
                px-1
                pb-4
                text-sm
                font-semibold
                text-gray-900
              "
            >
              All categories
            </button>


            <button
              type="button"
              className="
                px-1
                pb-4
                text-sm
                font-medium
                text-gray-500
                hover:text-gray-900
              "
            >
              Active
            </button>


            <button
              type="button"
              className="
                px-1
                pb-4
                text-sm
                font-medium
                text-gray-500
                hover:text-gray-900
              "
            >
              Inactive
            </button>

          </div>


          {/* ================= ERROR ================= */}

          {status === "failed" && (

            <div
              className="
                mt-6
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-5
                py-4
                text-sm
                text-red-600
              "
            >
              {error || "Failed to load categories."}
            </div>

          )}


          {/* ================= LOADING ================= */}

          {status === "loading" && (

            <div
              className="
                mt-8
                rounded-lg
                border
                border-gray-200
                bg-white
                px-5
                py-8
                text-center
                text-sm
                text-gray-500
              "
            >
              Loading categories...
            </div>

          )}


          {/* ================= CATEGORY GRID ================= */}

          {status !== "loading" && (

            categories.length > 0 ? (

              <div
                className="
                  mt-10
                  grid
                  grid-cols-1
                  gap-6
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                "
              >

                {categories.map((category) => (

                  <AdminCategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditCategory}
                    onToggleStatus={handleToggleStatus}
                    toggling={
                      togglingCategoryId === category.id
                    }
                  />

                ))}

              </div>

            ) : (

              <div
                className="
                  mt-10
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  px-6
                  py-16
                  text-center
                  text-sm
                  text-gray-400
                "
              >
                {search
                  ? "No categories found for your search."
                  : "No categories found."}
              </div>

            )

          )}


          {/* ================= PAGINATION ================= */}

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            limit={limit}
            onPageChange={setPage}
          />

        </section>

      </main>

    </div>

  );
}


export default Categories;