function AdminProductCard({
  product,
  onEdit,
  onView,
  onDelete,
  deleting,
}) {

  const isDeleting =
    deleting === product.id;


  return (

    <div
      className="
        flex
        min-h-[350px]
        flex-col
        rounded-xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >

      {/* ================================================= */}
      {/* IMAGE + STATUS */}
      {/* ================================================= */}

      <div
        className="
          relative
          h-48
          w-full
          overflow-hidden
          rounded-lg
          bg-gray-100
        "
      >

        {product.image ? (

          <img
            src={product.image}
            alt={product.productName}
            className="
              h-full
              w-full
              object-cover
            "
          />

        ) : (

          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              text-3xl
              font-bold
              text-gray-400
            "
          >
            {product.productName
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

        )}


        <span
          className={`
            absolute
            right-3
            top-3
            rounded-full
            px-3
            py-1
            text-xs
            font-semibold
            ${
              product.isActive
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-500"
            }
          `}
        >
          {product.isActive
            ? "Active"
            : "Inactive"}
        </span>

      </div>


      {/* ================================================= */}
      {/* PRODUCT INFORMATION */}
      {/* ================================================= */}

      <div className="mt-4 flex-1">

        {/* BRAND */}

        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-[#ff5722]
          "
        >
          {product.brand?.name || "Unknown Brand"}
        </p>


        {/* NAME */}

        <h3
          className="
            mt-1
            line-clamp-1
            text-lg
            font-semibold
            text-gray-900
          "
        >
          {product.productName}
        </h3>


        {/* PRICE + UNITS */}

        <div
          className="
            mt-4
            grid
            grid-cols-2
            gap-4
          "
        >

          <div>

            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Base Price
            </p>

            <p
              className="
                mt-1
                text-base
                font-semibold
                text-gray-900
              "
            >
              {product.basePrice !== null &&
              product.basePrice !== undefined
                ? `₹${product.basePrice}`
                : "—"}
            </p>

          </div>


          <div>

            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Units
            </p>

            <p
              className="
                mt-1
                text-base
                font-semibold
                text-gray-900
              "
            >
              {product.units ?? "—"}
            </p>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* ACTIONS */}
      {/* ================================================= */}

      <div
        className="
          mt-5
          flex
          items-center
          gap-2
          border-t
          border-gray-100
          pt-4
        "
      >

        {/* EDIT */}

        <button
          type="button"
          onClick={() =>
            onEdit(product)
          }
          disabled={!product.isActive}
          className={`
            flex-1
            rounded-lg
            px-3
            py-2
            text-sm
            font-medium
            transition
            ${
              product.isActive
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "cursor-not-allowed bg-gray-50 text-gray-300"
            }
          `}
        >
          Edit
        </button>


        {/* VIEW */}

        <button
          type="button"
          onClick={() =>
            onView(product)
          }
          className="
            flex-1
            rounded-lg
            bg-orange-50
            px-3
            py-2
            text-sm
            font-medium
            text-[#f4511e]
            transition
            hover:bg-orange-100
          "
        >
          View
        </button>


        {/* DELETE */}

        <button
          type="button"
          onClick={() =>
            onDelete(product)
          }
          disabled={isDeleting}
          aria-label={`Delete ${product.productName}`}
          title={`Delete ${product.productName}`}
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-red-500
            transition
            hover:bg-red-50
            hover:text-red-600
            ${
              isDeleting
                ? "cursor-not-allowed opacity-50"
                : ""
            }
          `}
        >

          {isDeleting ? (

            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >

              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="
                  M4 12a8 8 0 018-8v4
                  a4 4 0 00-4 4H4z
                "
              />

            </svg>

          ) : (

            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 7h12"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 7V5h6v2"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7l1 12h6l1-12"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 11v5M14 11v5"
              />

            </svg>

          )}

        </button>

      </div>

    </div>

  );
}


export default AdminProductCard;