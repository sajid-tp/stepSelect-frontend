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
import AdminPageHeader from "../../components/AdminPageHeader";
import AdminTabsSort from "../../components/AdminTabsSort";

import AdminEntityCard
  from "../../components/AdminEntityCard";

import Pagination
  from "../../components/Pagination";

import Modal
  from "../../components/Modals";

import useDebounce from "../../hooks/useDebounce";

import {
  getCategories,
  toggleCategoryStatus,
  deleteCategory,
} from "../../features/admin/categorySlice";



const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name (A → Z)" },
  { value: "name_desc", label: "Name (Z → A)" },
];


const STATUS_TABS = [
  { value: "all", label: "All categories" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];


function Categories() {

  const dispatch = useDispatch();

  const navigate =
    useNavigate();


  const [search, setSearch] =
    useState("");

  // the list reloads after the admin pauses typing
  const debouncedSearch =
    useDebounce(search.trim(), 400);

  const [activeTab, setActiveTab] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [sort, setSort] =
    useState("newest");

  const [togglingCategoryId, setTogglingCategoryId] =
    useState(null);

  const [deletingCategoryId, setDeletingCategoryId] =
    useState(null);


  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  // The category waiting for the admin to confirm activate / deactivate
  const [statusConfirmTarget, setStatusConfirmTarget] =
    useState(null);


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


  useEffect(() => {

    dispatch(
      getCategories({
        search: debouncedSearch,
        page,
        sort,
        status : activeTab
      })
    );

  }, [
    dispatch,
    debouncedSearch,
    page,
    sort,
    activeTab
  ]);

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


  const handleSortChange =
    (e) => {

      setSort(
        e.target.value
      );

      setPage(1);

    };

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

  // STEP 1: the button was clicked -> only open the confirmation modal
  const handleToggleStatus =
    (category) => {

      setStatusConfirmTarget(
        category
      );

    };


  const handleCloseStatusModal =
    () => {

      if (
        togglingCategoryId !== null
      ) {
        return;
      }

      setStatusConfirmTarget(
        null
      );

    };


  // STEP 2: the admin confirmed -> really change the status
  const handleConfirmToggleStatus =
    async () => {

      const category =
        statusConfirmTarget;

      if (!category) {
        return;
      }


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

        setStatusConfirmTarget(
          null
        );

      }

    };


  const handleDeleteCategory =
    (category) => {

      setSelectedCategory(
        category
      );

      setDeleteModalOpen(
        true
      );

    };


  const handleConfirmDelete =
    async () => {

      if (!selectedCategory) {
        return;
      }


      try {

        setDeletingCategoryId(
          selectedCategory.id
        );

        const shouldGoToPreviousPage =
          categories.length === 1 &&
          page > 1;


        await dispatch(
          deleteCategory(
            selectedCategory.id
          )
        ).unwrap();


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


          dispatch(
            getCategories({
              search: debouncedSearch,
              page,
              limit,
              sort,
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

  const handleCloseDeleteModal =
    () => {

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

  const handleTabChange =
    (value) => {

      setActiveTab(value);
      setPage(1);

    };




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

        <AdminPageHeader
          eyebrow="Taxonomy"
          title="Category"
          actionLabel="Add New Category"
          onAction={() => navigate("/admin/categories/new")}
        />

        <section
          className="
            px-12
            py-10
          "
        >

          <div
            className="
              flex
              items-center
            "
          >

            <div
              className="
                relative
                w-full
                max-w-[450px]
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

          <AdminTabsSort
            className="mt-14"
            tabs={STATUS_TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            sortOptions={SORT_OPTIONS}
            sort={sort}
            onSortChange={handleSortChange}
            sortId="category-sort"
          />

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

                {categories.map(
                  (category) => (

                    <AdminEntityCard
                      key={category.id}

                      item={category}

                      name={
                        category.categoryName
                      }

                      description={
                        category.description
                      }

                      visual={
                        category.iconClass
                      }

                      visualType="icon"

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

          

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              limit={limit}
              onPageChange={setPage}
            />

          

        </section>


      </main>

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


      {/* ACTIVATE / DEACTIVATE MODAL */}

      <Modal
        open={
          !!statusConfirmTarget
        }

        title={
          statusConfirmTarget?.isActive
            ? "Deactivate category?"
            : "Activate category?"
        }

        message={
          statusConfirmTarget
            ? statusConfirmTarget.isActive
              ? `Are you sure you want to deactivate "${statusConfirmTarget.categoryName}"? The category and the products in it will be hidden from customers. You can activate it again at any time.`
              : `Are you sure you want to activate "${statusConfirmTarget.categoryName}"? The category and its products will become visible to customers again.`
            : ""
        }

        confirmText={
          statusConfirmTarget?.isActive
            ? "Deactivate"
            : "Activate"
        }

        cancelText="Cancel"

        variant={
          statusConfirmTarget?.isActive
            ? "danger"
            : "success"
        }

        loading={
          togglingCategoryId !== null
        }

        onClose={
          handleCloseStatusModal
        }

        onConfirm={
          handleConfirmToggleStatus
        }
      />

    </div>

  );

}


export default Categories;
