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
  getBrands,
  toggleBrandStatus,
  deleteBrand,
} from "../../features/admin/brandSlice";


// ===================================================
// SORT OPTIONS (constant, so it lives outside the component)
// ===================================================

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name (A → Z)" },
  { value: "name_desc", label: "Name (Z → A)" },
];


const STATUS_TABS = [
  { value: "all", label: "All brands" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];


function Brands() {

  const dispatch = useDispatch();

  const navigate =
    useNavigate();


  // ===================================================
  // REDUX
  // ===================================================

  const {
    brands = [],
    totalResults = 0,
    totalPages = 1,
    currentPage = 1,
    limit = 8,
    status,
    error,
    deleteError,
  } = useSelector(
    (state) =>
      state.adminBrands
  );


  // ===================================================
  // LOCAL STATE
  // ===================================================

  const [search, setSearch] =
    useState("");

  // the list reloads after the admin pauses typing
  const debouncedSearch =
    useDebounce(search.trim(), 400);

  const [page, setPage] =
    useState(1);

  const [sort, setSort] =
    useState("newest");

  const [activeTab, setActiveTab] =
    useState("all");

  const [togglingBrandId, setTogglingBrandId] =
    useState(null);

  const [deletingBrandId, setDeletingBrandId] =
    useState(null);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [selectedBrand, setSelectedBrand] =
    useState(null);

  // The brand waiting for the admin to confirm activate / deactivate
  const [statusConfirmTarget, setStatusConfirmTarget] =
    useState(null);


  // ===================================================
  // FETCH BRANDS
  // ===================================================

  useEffect(() => {

    dispatch(
      getBrands({
        search: debouncedSearch,
        page,
        sort,
      })
    );

  }, [
    dispatch,
    debouncedSearch,
    page,
    sort,
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


  // ===================================================
  // SORT
  // ===================================================

  const handleSortChange =
    (e) => {

      setSort(
        e.target.value
      );

      setPage(1);

    };


  // ===================================================
  // TAB CHANGE
  // ===================================================

  const handleTabChange =
    (tab) => {

      setActiveTab(tab);

    };


  // ===================================================
  // FRONTEND STATUS FILTER
  // ===================================================

  const filteredBrands =
    brands.filter(
      (brand) => {

        if (
          activeTab === "active"
        ) {
          return brand.isActive;
        }


        if (
          activeTab === "inactive"
        ) {
          return !brand.isActive;
        }


        return true;

      }
    );


  // ===================================================
  // EDIT
  // ===================================================

  const handleEdit =
    (brand) => {

      navigate(
        `/admin/brands/edit/${brand.id}`,
        {
          state: {
            brand,
          },
        }
      );

    };


  // ===================================================
  // TOGGLE STATUS
  // ===================================================

  // STEP 1: the button was clicked -> only open the confirmation modal
  const handleToggleStatus =
    (brand) => {

      setStatusConfirmTarget(
        brand
      );

    };


  const handleCloseStatusModal =
    () => {

      if (
        togglingBrandId !== null
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

      const brand =
        statusConfirmTarget;

      if (!brand) {
        return;
      }


      try {

        setTogglingBrandId(
          brand.id
        );


        await dispatch(
          toggleBrandStatus(
            brand.id
          )
        ).unwrap();


      } catch (error) {

        console.error(error);

      } finally {

        setTogglingBrandId(
          null
        );

        setStatusConfirmTarget(
          null
        );

      }

    };


  // ===================================================
  // OPEN DELETE MODAL
  // ===================================================

  const handleDeleteClick =
    (brand) => {

      setSelectedBrand(
        brand
      );

      setDeleteModalOpen(
        true
      );

    };


  // ===================================================
  // DELETE
  // ===================================================

  const handleConfirmDelete =
    async () => {

      if (!selectedBrand) {
        return;
      }


      try {

        setDeletingBrandId(
          selectedBrand.id
        );


        await dispatch(
          deleteBrand(
            selectedBrand.id
          )
        ).unwrap();


        setDeleteModalOpen(
          false
        );

        setSelectedBrand(
          null
        );


        /*
         * If current page becomes empty,
         * move to previous page.
         */

        if (
          brands.length === 1 &&
          page > 1
        ) {

          setPage(
            (previousPage) =>
              previousPage - 1
          );

        } else {

          dispatch(
            getBrands({
              search: debouncedSearch,
              page,
              sort,
            })
          );

        }


      } catch (error) {

        console.error(error);

      } finally {

        setDeletingBrandId(
          null
        );

      }

    };


  // ===================================================
  // LOADING
  // ===================================================

  const isLoading =
    status === "loading";


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#f7f9fc]
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

        <AdminPageHeader
          eyebrow="Collection"
          title="Brand"
          actionLabel="Add New Brand"
          onAction={() => navigate("/admin/brands/new")}
        />


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
              mb-12
            "
          >

            <div
              className="
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
                placeholder="Search brand"
                className="
                  h-12
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-[#ff5722]
                  focus:ring-2
                  focus:ring-[#ff5722]/10
                "
              />

            </div>

          </div>


          {/* ================================================= */}
          {/* TABS + SORT */}
          {/* ================================================= */}

          <AdminTabsSort
            className="mt-14 mb-10"
            tabs={STATUS_TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            sortOptions={SORT_OPTIONS}
            sort={sort}
            onSortChange={handleSortChange}
            sortId="brand-sort"
          />


          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (

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
              {error}
            </div>

          )}


          {/* ================================================= */}
          {/* LOADING / CONTENT */}
          {/* ================================================= */}

          {isLoading ? (

            <div
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
                xl:grid-cols-4
              "
            >

              {[1, 2, 3, 4].map(
                (item) => (

                  <div
                    key={item}
                    className="
                      h-[244px]
                      animate-pulse
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                    "
                  />

                )
              )}

            </div>

          ) : filteredBrands.length === 0 ? (

            /* ================================================= */
            /* EMPTY STATE */
            /* ================================================= */

            <div
              className="
                flex
                min-h-[400px]
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-gray-300
                bg-white
                text-center
              "
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-[#ffe1d6]
                  text-[#ff5722]
                "
              >

                <svg
                  className="
                    h-7
                    w-7
                  "
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >

                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="2"
                  />

                  <path d="M8 9h8" />

                  <path d="M8 13h5" />

                </svg>

              </div>


              <h2
                className="
                  mt-5
                  text-lg
                  font-semibold
                  text-gray-900
                "
              >
                No brands found
              </h2>


              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500
                "
              >

                {search

                  ? "Try searching with a different brand name."

                  : activeTab === "active"

                    ? "There are no active brands."

                    : activeTab === "inactive"

                      ? "There are no inactive brands."

                      : "Create your first brand to get started."

                }

              </p>


              {!search &&
                activeTab === "all" && (

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/admin/brands/new"
                      )
                    }
                    className="
                      mt-5
                      rounded-lg
                      bg-[#ff5722]
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-[#f4511e]
                    "
                  >
                    Add Brand
                  </button>

                )}

            </div>

          ) : (

            <>

              {/* ================================================= */}
              {/* BRAND GRID */}
              {/* ================================================= */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-6
                  md:grid-cols-2
                  xl:grid-cols-4
                "
              >

                {filteredBrands.map(
                  (brand) => (

                    <AdminEntityCard
                      key={brand.id}

                      item={brand}

                      name={
                        brand.brandName
                      }

                      description={
                        brand.description
                      }

                      visual={
                        brand.logo
                      }

                      visualType="image"

                      onEdit={
                        handleEdit
                      }

                      onToggleStatus={
                        handleToggleStatus
                      }

                      onDelete={
                        handleDeleteClick
                      }

                      toggling={
                        togglingBrandId
                      }

                      deleting={
                        deletingBrandId
                      }
                    />

                  )
                )}

              </div>


              {/* ================================================= */}
              {/* PAGINATION */}
              {/* ================================================= */}

              {activeTab === "all" && (

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalResults={totalResults}
                  limit={limit}
                  onPageChange={setPage}
                />

              )}

            </>

          )}

        </section>

      </main>


      {/* ================================================= */}
      {/* DELETE MODAL */}
      {/* ================================================= */}

      <Modal
        open={deleteModalOpen}

        title="Delete brand?"

        message={
          selectedBrand
            ? `Are you sure you want to delete "${selectedBrand.brandName}"? This brand will be removed from the brand list.`
            : ""
        }

        confirmText="Delete"

        cancelText="Cancel"

        variant="danger"

        loading={
          deletingBrandId !== null
        }

        onConfirm={
          handleConfirmDelete
        }

        onClose={() => {

          if (
            deletingBrandId === null
          ) {

            setDeleteModalOpen(
              false
            );

            setSelectedBrand(
              null
            );

          }

        }}
      />


      {/* ================================================= */}
      {/* ACTIVATE / DEACTIVATE MODAL */}
      {/* ================================================= */}

      <Modal
        open={
          !!statusConfirmTarget
        }

        title={
          statusConfirmTarget?.isActive
            ? "Deactivate brand?"
            : "Activate brand?"
        }

        message={
          statusConfirmTarget
            ? statusConfirmTarget.isActive
              ? `Are you sure you want to deactivate "${statusConfirmTarget.brandName}"? The brand and its products will be hidden from customers. You can activate it again at any time.`
              : `Are you sure you want to activate "${statusConfirmTarget.brandName}"? The brand and its products will become visible to customers again.`
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
          togglingBrandId !== null
        }

        onClose={
          handleCloseStatusModal
        }

        onConfirm={
          handleConfirmToggleStatus
        }
      />


      {/* ================================================= */}
      {/* DELETE ERROR */}
      {/* ================================================= */}

      {deleteError && (

        <div
          className="
            fixed
            bottom-6
            right-6
            z-[110]
            max-w-sm
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
            shadow-lg
          "
        >
          {deleteError}
        </div>

      )}

    </div>

  );

}


export default Brands;
