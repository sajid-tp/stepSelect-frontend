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

import Pagination
  from "../../components/Pagination";

import Modal
  from "../../components/Modals";

import AdminProductCard
  from "../../components/AdminProductCard";

import {
  getProducts,
  deleteProduct,
  toggleProductStatus,
} from "../../features/admin/productSlice";


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

  const [page, setPage] =
    useState(1);


  const [deleteTarget, setDeleteTarget] =
    useState(null);


  /*
    Keep track of which product's
    switch is currently being changed.
  */

  const [statusTargetId, setStatusTargetId] =
    useState(null);


  // ===================================================
  // FETCH PRODUCTS
  // ===================================================

  useEffect(() => {

    dispatch(
      getProducts({
        search,
        page,
        limit: 5,
      })
    );

  }, [
    dispatch,
    search,
    page,
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

  const handleToggleStatus =
    async (product) => {

      /*
        Prevent double clicking while
        the current request is running.
      */

      if (
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


      } catch (error) {

        console.error(
          "Product status update failed:",
          error
        );

      } finally {

        setStatusTargetId(
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

        <header
          className="
            border-b
            border-gray-200
            bg-white
            px-12
            py-7
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
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
                Catalog
              </p>


              <h1
                className="
                  mt-1
                  text-4xl
                  font-bold
                  text-gray-900
                "
              >

                Product{" "}

                <span
                  className="
                    text-[#ff5722]
                  "
                >
                  Management
                </span>

              </h1>

            </div>


            <button
              type="button"
              onClick={
                handleAddProduct
              }
              className="
                rounded-lg
                bg-[#ff5722]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#f4511e]
              "
            >
              + Add New Product
            </button>

          </div>

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
                w-[450px]
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
                  Try changing your search
                  or add a new product.
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
                5
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

    </div>

  );
}


export default Products;