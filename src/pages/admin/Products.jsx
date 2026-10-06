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

import AdminProductCard
  from "../../components/AdminProductCard";

import Pagination
  from "../../components/Pagination";

import Modal
  from "../../components/Modals";

import {
  getProducts,
  deleteProduct,
  toggleProductStatus,
} from "../../features/admin/productSlice";


function Products() {

  const dispatch = useDispatch();

  const navigate = useNavigate();


  // ===================================================
  // LOCAL STATE
  // ===================================================

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [deletingProductId, setDeletingProductId] =
    useState(null);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);


  // ===================================================
  // REDUX
  // ===================================================

  const {
    products = [],

    totalResults = 0,

    totalPages = 1,

    currentPage = 1,

    limit = 5,

    status,

    error,

    deleteError,

  } = useSelector(
    (state) => state.adminProducts
  );


  // ===================================================
  // GET PRODUCTS
  // ===================================================

  useEffect(() => {

    dispatch(
      getProducts({
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

  const handleSearchChange = (e) => {

    setSearch(
      e.target.value
    );

    setPage(1);

  };


  const handleClearSearch = () => {

    setSearch("");

    setPage(1);

  };


  // ===================================================
  // ADD
  // ===================================================

  const handleAddProduct = () => {

    navigate(
      "/admin/products/new"
    );

  };


  // ===================================================
  // EDIT
  // ===================================================

  const handleEditProduct = (
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

  const handleViewProduct = (
    product
  ) => {

    navigate(
      `/admin/products/${product.id}`
    );

  };


  // ===================================================
  // DELETE
  // ===================================================

  const handleDeleteProduct = (
    product
  ) => {

    setSelectedProduct(product);

    setDeleteModalOpen(true);

  };


  // ===================================================
  // CONFIRM DELETE
  // ===================================================

  const handleConfirmDelete =
    async () => {

      if (!selectedProduct) {
        return;
      }


      try {

        setDeletingProductId(
          selectedProduct.id
        );


        const shouldGoToPreviousPage =
          products.length === 1 &&
          page > 1;


        await dispatch(
          deleteProduct(
            selectedProduct.id
          )
        ).unwrap();


        setDeleteModalOpen(
          false
        );

        setSelectedProduct(
          null
        );


        if (
          shouldGoToPreviousPage
        ) {

          setPage(
            (previous) =>
              previous - 1
          );

        } else {

          dispatch(
            getProducts({
              search,
              page,
              limit,
            })
          );

        }

      } catch (error) {

        console.error(
          "Failed to delete product:",
          error
        );

      } finally {

        setDeletingProductId(
          null
        );

      }

    };


  // ===================================================
  // TOGGLE STATUS
  // ===================================================

  const handleToggleStatus =
    async (product) => {

      try {

        await dispatch(
          toggleProductStatus(
            product.id
          )
        ).unwrap();

      } catch (error) {

        console.error(
          "Failed to update product status:",
          error
        );

      }

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

      {/* SIDEBAR */}

      <AdminSidebar />


      {/* MAIN */}

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
              Catalog
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


          {/* ADD */}

          <button
            type="button"
            onClick={handleAddProduct}
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

            Add New Product

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

          {/* SEARCH */}

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
                placeholder="Search product"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-3
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
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    font-medium
                    text-gray-400
                    hover:text-gray-700
                  "
                >
                  Clear
                </button>

              )}

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div
              className="
                mt-6
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


          {deleteError && (

            <div
              className="
                mt-6
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
              {deleteError}
            </div>

          )}


          {/* LOADING */}

          {status === "loading" ? (

            <div
              className="
                mt-10
                rounded-xl
                border
                border-gray-200
                bg-white
                p-12
                text-center
                text-sm
                text-gray-500
              "
            >
              Loading products...
            </div>

          ) : products.length === 0 ? (

            <div
              className="
                mt-10
                rounded-xl
                border
                border-dashed
                border-gray-300
                bg-white
                p-16
                text-center
              "
            >

              <h3
                className="
                  text-lg
                  font-semibold
                  text-gray-800
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

          ) : (

            <>

              {/* PRODUCT GRID */}

              <div
                className="
                  mt-10
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
                      key={product.id}
                      product={product}
                      onEdit={
                        handleEditProduct
                      }
                      onView={
                        handleViewProduct
                      }
                      onDelete={
                        handleDeleteProduct
                      }
                      deleting={
                        deletingProductId
                      }
                    />

                  )
                )}

              </div>


              {/* PAGINATION */}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalResults={totalResults}
                limit={limit}
                onPageChange={
                  setPage
                }
              />

            </>

          )}

        </section>

      </main>


      {/* ================================================= */}
      {/* DELETE MODAL */}
      {/* ================================================= */}

      <Modal
        open={deleteModalOpen}
        title="Delete Product"
        message={
          `Are you sure you want to delete "${selectedProduct?.productName}"? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={
          handleConfirmDelete
        }
        onClose={() =>
          setDeleteModalOpen(false)
        }
        loading={
          deletingProductId !== null
        }
        variant="danger"
      />

    </div>

  );
}


export default Products;