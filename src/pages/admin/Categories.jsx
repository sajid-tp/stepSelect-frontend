import { useEffect, useState } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import AdminSidebar
  from "../../components/AdminSideBar";

import AdminCategoryCard
  from "../../components/AdminCategoryCard";

import AdminPagination
  from "../../components/AdminPagination";

import Modal
  from "../../components/Modals";

import {
  getCategories,
  toggleCategoryStatus,
  deleteCategory,
} from "../../features/admin/categorySlice";


function Categories() {

  const dispatch = useDispatch();

  const navigate =
    useNavigate();


  // ===================================================
  // LOCAL STATE
  // ===================================================

  const [search, setSearch] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [togglingCategoryId, setTogglingCategoryId] =
    useState(null);

  const [deletingCategoryId, setDeletingCategoryId] =
    useState(null);


  // Delete confirmation modal

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState(null);


  // ===================================================
  // REDUX
  // ===================================================

  const {
    categories = [],
    totalResults = 0,
    totalPages = 1,
    currentPage = 1,
    limit = 5,
    status,
    error,
    deleteError,
  } = useSelector(
    (state) =>
      state.adminCategories
  );


  // ===================================================
  // GET CATEGORIES
  // ===================================================

  useEffect(() => {

    dispatch(
      getCategories({
        search,
        page,
        limit,
      })
    );

  }, [
    dispatch,
    search,
    page,
    limit,
  ]);


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearchChange =
    (e) => {

      setSearch(
        e.target.value
      );

      setPage(1);

    };


  const handleClearSearch =
    () => {

      setSearch("");

      setPage(1);

    };


  // ===================================================
  // EDIT
  // ===================================================

  const handleEditCategory =
    (category) => {

      navigate(
        `/admin/categories/edit/${category.id}`,
        {
          state: {
            category,
          },
        }
      );

    };


  // ===================================================
  // TOGGLE STATUS
  // ===================================================

  const handleToggleStatus =
    async (category) => {

      try {

        setTogglingCategoryId(
          category.id
        );

        await dispatch(
          toggleCategoryStatus(
            category.id
          )
        ).unwrap();

      } catch (error) {

        console.error(
          "Failed to update category status:",
          error
        );

      } finally {

        setTogglingCategoryId(
          null
        );

      }

    };


  // ===================================================
  // OPEN DELETE MODAL
  // ===================================================

  const handleDeleteCategory =
    (category) => {

      setSelectedCategory(
        category
      );

      setDeleteModalOpen(
        true
      );

    };


  // ===================================================
  // CONFIRM DELETE
  // ===================================================

  const handleConfirmDelete =
    async () => {

      if (!selectedCategory) {
        return;
      }


      try {

        setDeletingCategoryId(
          selectedCategory.id
        );


        /*
         * If this is the only category
         * on the current page and we're
         * not on page 1, move to the
         * previous page after deletion.
         */

        const shouldGoToPreviousPage =
          categories.length === 1 &&
          page > 1;


        await dispatch(
          deleteCategory(
            selectedCategory.id
          )
        ).unwrap();


        // Close modal after successful delete

        setDeleteModalOpen(
          false
        );

        setSelectedCategory(
          null
        );


        if (
          shouldGoToPreviousPage
        ) {

          setPage(
            (currentPage) =>
              currentPage - 1
          );

        } else {

          /*
           * Refresh current page because
           * the backend is paginated.
           */

          dispatch(
            getCategories({
              search,
              page,
              limit,
            })
          );

        }


      } catch (error) {

        console.error(
          "Failed to delete category:",
          error
        );

      } finally {

        setDeletingCategoryId(
          null
        );

      }

    };


  // ===================================================
  // CLOSE DELETE MODAL
  // ===================================================

  const handleCloseDeleteModal =
    () => {

      /*
       * Don't allow closing while
       * delete request is running.
       */

      if (
        deletingCategoryId !== null
      ) {
        return;
      }

      setDeleteModalOpen(
        false
      );

      setSelectedCategory(
        null
      );

    };


  // ===================================================
  // TAB CHANGE
  // ===================================================

  const handleTabChange =
    (value) => {

      setActiveTab(value);

    };


  // ===================================================
  // FILTER CATEGORIES
  // ===================================================

  const filteredCategories =
    categories.filter(
      (category) => {

        if (
          activeTab === "active"
        ) {
          return category.isActive;
        }

        if (
          activeTab === "inactive"
        ) {
          return !category.isActive;
        }

        return true;

      }
    );


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

              <span
                className="
                  text-[#ff5722]
                "
              >
                Management
              </span>

            </h1>

          </div>


          {/* ================================================= */}
          {/* ADD CATEGORY */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/categories/new"
              )
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

            <span
              className="
                text-xl
                leading-none
              "
            >
              +
            </span>

            Add New Category

          </button>

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

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                relative
                w-[450px]
              "
            >

              <input
                type="text"
                value={search}
                onChange={
                  handleSearchChange
                }
                placeholder="Search category"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  py-3
                  px-4
                  pr-20
                  text-sm
                  outline-none
                  transition
                  focus:border-[#ff5722]
                  focus:ring-1
                  focus:ring-[#ff5722]
                "
              />


              {search && (

                <button
                  type="button"
                  onClick={
                    handleClearSearch
                  }
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

          </div>


          {/* ================================================= */}
          {/* TABS */}
          {/* ================================================= */}

          <div
            className="
              mt-14
              flex
              gap-8
              border-b
              border-gray-200
            "
          >

            {/* ALL CATEGORIES */}

            <button
              type="button"
              onClick={() =>
                handleTabChange("all")
              }
              className={`
                relative
                px-1
                pb-4
                text-sm
                font-medium
                transition
                ${
                  activeTab === "all"
                    ? "text-[#071a33]"
                    : "text-gray-500 hover:text-gray-800"
                }
              `}
            >

              All categories

              {activeTab === "all" && (

                <span
                  className="
                    absolute
                    bottom-0
                    left-0
                    h-[2px]
                    w-full
                    bg-[#ff5722]
                  "
                />

              )}

            </button>


            {/* ACTIVE */}

            <button
              type="button"
              onClick={() =>
                handleTabChange("active")
              }
              className={`
                relative
                px-1
                pb-4
                text-sm
                font-medium
                transition
                ${
                  activeTab === "active"
                    ? "text-[#071a33]"
                    : "text-gray-500 hover:text-gray-800"
                }
              `}
            >

              Active

              {activeTab === "active" && (

                <span
                  className="
                    absolute
                    bottom-0
                    left-0
                    h-[2px]
                    w-full
                    bg-[#ff5722]
                  "
                />

              )}

            </button>


            {/* INACTIVE */}

            <button
              type="button"
              onClick={() =>
                handleTabChange("inactive")
              }
              className={`
                relative
                px-1
                pb-4
                text-sm
                font-medium
                transition
                ${
                  activeTab === "inactive"
                    ? "text-[#071a33]"
                    : "text-gray-500 hover:text-gray-800"
                }
              `}
            >

              Inactive

              {activeTab === "inactive" && (

                <span
                  className="
                    absolute
                    bottom-0
                    left-0
                    h-[2px]
                    w-full
                    bg-[#ff5722]
                  "
                />

              )}

            </button>

          </div>


          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {(status === "failed" ||
            deleteError) && (

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

              {deleteError ||
                error ||
                "Failed to load categories."}

            </div>

          )}


          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

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


          {/* ================================================= */}
          {/* CATEGORY GRID */}
          {/* ================================================= */}

          {status !== "loading" && (

            filteredCategories.length > 0 ? (

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

                {filteredCategories.map(
                  (category) => (

                    <AdminCategoryCard
                      key={category.id}
                      category={category}

                      onEdit={
                        handleEditCategory
                      }

                      onToggleStatus={
                        handleToggleStatus
                      }

                      onDelete={
                        handleDeleteCategory
                      }

                      toggling={
                        togglingCategoryId
                      }

                      deleting={
                        deletingCategoryId
                      }
                    />

                  )
                )}

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
                  : activeTab === "active"
                    ? "There are no active categories."
                    : activeTab === "inactive"
                      ? "There are no inactive categories."
                      : "No categories found."}

              </div>

            )

          )}


          {/* ================================================= */}
          {/* PAGINATION */}
          {/* ================================================= */}

          {activeTab === "all" && (

            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              limit={limit}
              onPageChange={setPage}
            />

          )}

        </section>


      </main>


      {/* ================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ================================================= */}

      <Modal
        open={deleteModalOpen}

        title="Delete Category"

        message={
          selectedCategory
            ? `Are you sure you want to delete "${selectedCategory.categoryName}"? The category will be removed from the category list.`
            : ""
        }

        confirmText="Delete Category"

        cancelText="Cancel"

        variant="danger"

        loading={
          deletingCategoryId !== null
        }

        onClose={
          handleCloseDeleteModal
        }

        onConfirm={
          handleConfirmDelete
        }
      />

    </div>

  );

}


export default Categories;