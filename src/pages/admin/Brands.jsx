import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/AdminSideBar";
import AdminBrandCard from "../../components/AdminBrandCard";
import AdminPagination from "../../components/AdminPagination";
import Modal from "../../components/Modals";

import {
  getBrands,
  toggleBrandStatus,
  deleteBrand,
} from "../../features/admin/brandSlice";

function Brands() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    brands,
    totalResults,
    totalPages,
    currentPage,
    limit,
    status,
    error,
    deleteError,
  } = useSelector((state) => state.adminBrands);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [activeTab, setActiveTab] = useState("all");

  const [togglingBrandId, setTogglingBrandId] =
    useState(null);

  const [deletingBrandId, setDeletingBrandId] =
    useState(null);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [selectedBrand, setSelectedBrand] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH BRANDS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(
      getBrands({
        search,
        page,
      })
    );
  }, [dispatch, search, page]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | TAB CHANGE
  |--------------------------------------------------------------------------
  */

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  /*
  |--------------------------------------------------------------------------
  | FRONTEND STATUS FILTER
  |--------------------------------------------------------------------------
  */

  const filteredBrands = brands.filter((brand) => {
    if (activeTab === "active") {
      return brand.isActive;
    }

    if (activeTab === "inactive") {
      return !brand.isActive;
    }

    return true;
  });

  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const handleEdit = (brand) => {
    navigate(`/admin/brands/edit/${brand.id}`, {
      state: {
        brand,
      },
    });
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE STATUS
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus = async (brand) => {
    try {
      setTogglingBrandId(brand.id);

      await dispatch(
        toggleBrandStatus(brand.id)
      ).unwrap();
    } catch (error) {
      console.error(error);
    } finally {
      setTogglingBrandId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN DELETE MODAL
  |--------------------------------------------------------------------------
  */

  const handleDeleteClick = (brand) => {
    setSelectedBrand(brand);
    setDeleteModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleConfirmDelete = async () => {
    if (!selectedBrand) return;

    try {
      setDeletingBrandId(selectedBrand.id);

      await dispatch(
        deleteBrand(selectedBrand.id)
      ).unwrap();

      setDeleteModalOpen(false);
      setSelectedBrand(null);

      /*
      |--------------------------------------------------------------------------
      | If current page becomes empty,
      | move to previous page.
      |--------------------------------------------------------------------------
      */

      if (brands.length === 1 && page > 1) {
        setPage((previousPage) => previousPage - 1);
      } else {
        dispatch(
          getBrands({
            search,
            page,
          })
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingBrandId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen">
        {/* ================================================================
            HEADER
        ================================================================= */}

        <header className="border-b border-gray-200 bg-white px-12 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                COLLECTION
              </p>

              <h1 className="mt-1 text-4xl font-bold tracking-tight text-[#071a33]">
                Brand{" "}
                <span className="text-[#ff5722]">
                  Management
                </span>
              </h1>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/brands/new")
              }
              className="
                inline-flex items-center gap-2
                rounded-full
                bg-[#ff5722]
                px-7 py-3.5
                text-sm font-bold
                uppercase tracking-wide
                text-white
                shadow-sm
                transition
                hover:bg-[#f4511e]
                hover:shadow-md
              "
            >
              <span className="text-lg leading-none">
                +
              </span>

              Add New Brand
            </button>
          </div>
        </header>

        {/* ================================================================
            CONTENT
        ================================================================= */}

        <section className="px-12 py-10">
          {/* SEARCH */}
          <div className="mb-12">
            <div className="w-[450px]">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search brand"
                className="
                  h-12
                  w-full
                  rounded-lg
                  border border-gray-300
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

          {/* ================================================================
              TABS
          ================================================================= */}

          <div
            className="
              mb-10
              flex
              items-center
              gap-9
              border-b border-gray-200
            "
          >
            <button
              type="button"
              onClick={() =>
                handleTabChange("all")
              }
              className={`
                relative
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
              All brands

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

            <button
              type="button"
              onClick={() =>
                handleTabChange("active")
              }
              className={`
                relative
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

            <button
              type="button"
              onClick={() =>
                handleTabChange("inactive")
              }
              className={`
                relative
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

          {/* ================================================================
              ERROR
          ================================================================= */}

          {error && (
            <div
              className="
                mb-6
                rounded-lg
                border border-red-200
                bg-red-50
                px-4 py-3
                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* ================================================================
              LOADING
          ================================================================= */}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
                    h-[244px]
                    animate-pulse
                    rounded-xl
                    border border-gray-200
                    bg-white
                  "
                />
              ))}
            </div>
          ) : filteredBrands.length === 0 ? (
            /* ================================================================
                EMPTY STATE
            ================================================================= */

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
                  className="h-7 w-7"
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

              <h2 className="mt-5 text-lg font-semibold text-gray-900">
                No brands found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try searching with a different brand name."
                  : activeTab === "active"
                    ? "There are no active brands."
                    : activeTab === "inactive"
                      ? "There are no inactive brands."
                      : "Create your first brand to get started."}
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
                      px-5 py-2.5
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
              {/* ============================================================
                  BRAND GRID
              ============================================================= */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-6
                  md:grid-cols-2
                  xl:grid-cols-4
                "
              >
                {filteredBrands.map((brand) => (
                  <AdminBrandCard
                    key={brand.id}
                    brand={brand}
                    onEdit={handleEdit}
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
                ))}
              </div>

              {/* ============================================================
                  PAGINATION
              ============================================================= */}

              {activeTab === "all" && (
                <AdminPagination
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

      {/* ================================================================
          DELETE MODAL
      ================================================================= */}

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
            setDeleteModalOpen(false);
            setSelectedBrand(null);
          }
        }}
      />

      {/* DELETE ERROR */}
      {deleteError && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-[110]
            max-w-sm
            rounded-lg
            border border-red-200
            bg-red-50
            px-4 py-3
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