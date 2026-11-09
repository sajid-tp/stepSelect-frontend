import {
  useEffect,
  useState,
} from "react";

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

import Pagination
  from "../../components/Pagination";

import Modal
  from "../../components/Modals";

import AdminProductCard
  from "../../components/AdminProductCard";

import useDebounce from "../../hooks/useDebounce";

import {
  getProducts,
  deleteProduct,
  toggleProductStatus,
} from "../../features/admin/productSlice";


// ===================================================
// CONSTANTS (outside the component, they never change)
// ===================================================

const PAGE_LIMIT = 5;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name (A → Z)" },
  { value: "name_desc", label: "Name (Z → A)" },
];

const STATUS_TABS = [
  { value: "all", label: "All products" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];


function Products() {

  const dispatch = useDispatch();

  const navigate = useNavigate();


  // ===================================================
  // REDUX
  // ===================================================

  const {
    products,
    totalResults,
    totalPages,
    currentPage,
    limit,
    status,
    error,
    deleteStatus,
    statusUpdateStatus,
  } = useSelector(
    (state) =>
      state.adminProducts
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

  // "all" | "active" | "inactive"
  const [statusFilter, setStatusFilter] =
    useState("all");


  const [deleteTarget, setDeleteTarget] =
    useState(null);


  /*
    Keep track of which product's
    switch is currently being changed.
  */

  const [statusTargetId, setStatusTargetId] =
    useState(null);


  /*
    The product the admin just clicked
    the switch on. While this is set,
    the confirmation modal is open.
  */

  const [statusConfirmTarget, setStatusConfirmTarget] =
    useState(null);


  // ===================================================
  // FETCH PRODUCTS
  // ===================================================

  useEffect(() => {

    dispatch(
      getProducts({
        search: debouncedSearch,
        page,
        limit: PAGE_LIMIT,
        sort,
        status: statusFilter,
      })
    );

  }, [
    dispatch,
    debouncedSearch,
    page,
    sort,
    statusFilter,
  ]);


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearchChange = (
    e
  ) => {

    setSearch(
      e.target.value
    );

    setPage(1);

  };


  // ===================================================
  // SORT
  // ===================================================

  const handleSortChange = (
    e
  ) => {

    setSort(
      e.target.value
    );

    setPage(1);

  };


  // ===================================================
  // STATUS TAB CHANGE
  // ===================================================

  const handleStatusFilterChange = (
    value
  ) => {

    setStatusFilter(
      value
    );

    setPage(1);

  };


  // ===================================================
  // EDIT
  // ===================================================

  const handleEdit = (
    product
  ) => {

    navigate(
      `/admin/products/edit/${product.id}`,
      {
        state: {
          product,
        },
      }
    );

  };


  // ===================================================
  // VIEW
  // ===================================================

  const handleView = (
    product
  ) => {

    navigate(
      `/admin/products/${product.id}`
    );

  };


  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = (
    product
  ) => {

    setDeleteTarget(
      product
    );

  };


  const confirmDelete =
    async () => {

      if (!deleteTarget) {
        return;
      }


      try {

        await dispatch(
          deleteProduct(
            deleteTarget.id
          )
        ).unwrap();


        setDeleteTarget(
          null
        );


        /*
          If we deleted the only product
          on the current page, go back
          one page.
        */

        if (
          products.length === 1 &&
          page > 1
        ) {

          setPage(
            (previous) =>
              previous - 1
          );

        }

      } catch (error) {

        console.error(
          "Delete product failed:",
          error
        );

      }

    };


  // ===================================================
  // TOGGLE STATUS
  // ===================================================

  // STEP 1: the switch was clicked.
  // Do NOT change anything yet, just ask the admin to confirm.

  const handleToggleStatus =
    (product) => {

      if (
        statusUpdateStatus ===
        "loading"
      ) {
        return;
      }

      setStatusConfirmTarget(
        product
      );

    };


  const handleCloseStatusModal =
    () => {

      if (
        statusUpdateStatus ===
        "loading"
      ) {
        return;
      }

      setStatusConfirmTarget(
        null
      );

    };


  // STEP 2: the admin pressed Confirm in the modal.
  // Now really activate / deactivate the product.

  const confirmToggleStatus =
    async () => {

      const product =
        statusConfirmTarget;

      /*
        Prevent double clicking while
        the current request is running.
      */

      if (
        !product ||
        statusUpdateStatus ===
        "loading"
      ) {
        return;
      }


      setStatusTargetId(
        product.id
      );


      try {

        await dispatch(
          toggleProductStatus({

            productId:
              product.id,

            /*
              If currently true,
              send false.

              If currently false,
              send true.
            */

            isActive:
              !product.isActive,

          })
        ).unwrap();


        /*
          The list is filtered on the server,
          so on the Active / Inactive tabs the
          toggled product no longer belongs
          there. Refetch to update the list
          and the pagination counts.
        */

        if (
          statusFilter !== "all"
        ) {

          dispatch(
            getProducts({
              search: debouncedSearch,
              page,
              limit: PAGE_LIMIT,
              sort,
              status: statusFilter,
            })
          );

        }


      } catch (error) {

        console.error(
          "Product status update failed:",
          error
        );

      } finally {

        setStatusTargetId(
          null
        );

        setStatusConfirmTarget(
          null
        );

      }

    };


  // ===================================================
  // ADD PRODUCT
  // ===================================================

  const handleAddProduct =
    () => {

      navigate(
        "/admin/products/new"
      );

    };


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
          eyebrow="Catalog"
          title="Product"
          actionLabel="Add New Product"
          onAction={handleAddProduct}
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

          {/* SEARCH */}

          <div
            className="
              mb-8
            "
          >

            <input
              type="text"
              value={search}
              onChange={
                handleSearchChange
              }
              placeholder="Search products..."
              className="
                w-full
                max-w-[450px]
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


          {/* ================================================= */}
          {/* TABS + SORT */}
          {/* ================================================= */}

          <AdminTabsSort
            className="mt-14 mb-8"
            tabs={STATUS_TABS}
            activeTab={statusFilter}
            onTabChange={handleStatusFilterChange}
            sortOptions={SORT_OPTIONS}
            sort={sort}
            onSortChange={handleSortChange}
            sortId="product-sort"
          />


          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {status === "loading" && (

            <div
              className="
                flex
                min-h-[300px]
                items-center
                justify-center
                text-sm
                text-gray-500
              "
            >
              Loading products...
            </div>

          )}


          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {status === "failed" &&
            !products.length && (

              <div
                className="
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-6
                  py-5
                  text-sm
                  text-red-600
                "
              >
                {error ||
                  "Failed to load products."}
              </div>

            )}


          {/* ================================================= */}
          {/* EMPTY */}
          {/* ================================================= */}

          {status !== "loading" &&
            !products.length &&
            !error && (

              <div
                className="
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-6
                  py-16
                  text-center
                "
              >

                <h3
                  className="
                    text-lg
                    font-semibold
                    text-gray-900
                  "
                >
                  No products found
                </h3>


                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-500
                  "
                >

                  {search
                    ? "Try searching with a different product name."
                    : statusFilter === "active"
                      ? "There are no active products."
                      : statusFilter === "inactive"
                        ? "There are no inactive products."
                        : "Try changing your search or add a new product."}

                </p>

              </div>

            )}


          {/* ================================================= */}
          {/* PRODUCTS */}
          {/* ================================================= */}

          {products.length > 0 && (

            <div
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
                2xl:grid-cols-4
              "
            >

              {products.map(
                (product) => (

                  <AdminProductCard

                    key={
                      product.id
                    }

                    product={
                      product
                    }

                    onEdit={
                      handleEdit
                    }

                    onView={
                      handleView
                    }

                    onDelete={
                      handleDelete
                    }

                    onToggleStatus={
                      handleToggleStatus
                    }

                    statusLoading={
                      statusTargetId ===
                      product.id
                    }

                  />

                )
              )}

            </div>

          )}


          {/* ================================================= */}
          {/* PAGINATION */}
          {/* ================================================= */}

          <div
            className="mt-8"
          >

            <Pagination
              currentPage={
                currentPage ||
                page
              }

              totalPages={
                totalPages ||
                1
              }

              totalResults={
                totalResults ||
                0
              }

              limit={
                limit ||
                PAGE_LIMIT
              }

              onPageChange={
                setPage
              }
            />

          </div>

        </section>

      </main>


      {/* ================================================= */}
      {/* DELETE MODAL */}
      {/* ================================================= */}

      <Modal
        open={
          !!deleteTarget
        }

        title="Delete Product"

        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.productName}"?`
            : ""
        }

        confirmText="Delete"

        cancelText="Cancel"

        variant="danger"

        loading={
          deleteStatus ===
          "loading"
        }

        onClose={() =>
          setDeleteTarget(
            null
          )
        }

        onConfirm={
          confirmDelete
        }
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
            ? "Deactivate product?"
            : "Activate product?"
        }

        message={
          statusConfirmTarget
            ? statusConfirmTarget.isActive
              ? `Are you sure you want to deactivate "${statusConfirmTarget.productName}"? It will be hidden from the store and customers will not be able to buy it. You can activate it again at any time.`
              : `Are you sure you want to activate "${statusConfirmTarget.productName}"? It will become visible in the store and customers will be able to buy it.`
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
          statusUpdateStatus ===
          "loading"
        }

        onClose={
          handleCloseStatusModal
        }

        onConfirm={
          confirmToggleStatus
        }
      />

    </div>

  );
}


export default Products;
