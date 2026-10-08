import {
  Pencil,
  Eye,
  Trash2,
} from "lucide-react";


function AdminProductCard({
  product,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  statusLoading = false,
}) {


  return (

    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        transition
        hover:shadow-md
      "
    >

      {/* ================================================= */}
      {/* IMAGE */}
      {/* ================================================= */}

      <div
        className="
          relative
          h-48
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
            onError={(e) => {
              e.currentTarget.style.display =
                "none";
            }}
          />

        ) : (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
              text-sm
              text-gray-400
            "
          >
            No Image
          </div>

        )}


        {/* ================================================= */}
        {/* STATUS TOGGLE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            right-3
            top-3
            flex
            items-center
            gap-2
            rounded-full
            bg-white
            px-2.5
            py-1.5
            shadow-sm
          "
        >

          <span
            className={`
              text-xs
              font-semibold
              ${
                product.isActive
                  ? "text-green-600"
                  : "text-gray-400"
              }
            `}
          >
            {product.isActive
              ? "Active"
              : "Inactive"}
          </span>


          {/* SWITCH */}

         <button
  type="button"
  disabled={statusLoading}
  onClick={() => onToggleStatus(product)}
  className={`
    relative
    h-6
    w-11
    shrink-0
    rounded-full
    transition-colors
    duration-200
    focus:outline-none
    disabled:cursor-not-allowed
    disabled:opacity-60
    ${
      product.isActive
        ? "bg-[#ff5722]"
        : "bg-gray-300"
    }
  `}
>
  <span
    className={`
      absolute
      top-1/2
      h-5
      w-5
      -translate-y-1/2
      rounded-full
      bg-white
      shadow-sm
      transition-all
      duration-200
      ${
        product.isActive
          ? "left-[22px]"
          : "left-[2px]"
      }
    `}
  />
</button>

        </div>

      </div>


      {/* ================================================= */}
      {/* BRAND */}
      {/* ================================================= */}

      <p
        className="
          mt-4
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-[#ff5722]
        "
      >
        {product.brand?.name ||
          "—"}
      </p>


      {/* ================================================= */}
      {/* PRODUCT NAME */}
      {/* ================================================= */}

      <h3
        className="
          mt-1
          truncate
          text-lg
          font-semibold
          text-gray-900
        "
        title={
          product.productName
        }
      >
        {product.productName}
      </h3>


      {/* ================================================= */}
      {/* PRICE + UNITS */}
      {/* ================================================= */}

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
            ₹{product.basePrice ?? "—"}
          </p>

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
          className="
            flex-1
            rounded-lg
            bg-gray-100
            px-3
            py-2.5
            text-sm
            font-medium
            text-gray-700
            transition
            hover:bg-gray-200
          "
        >

          <span
            className="
              flex
              items-center
              justify-center
              gap-1.5
            "
          >
            <Pencil size={15} />
            Edit
          </span>

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
            py-2.5
            text-sm
            font-medium
            text-[#ff5722]
            transition
            hover:bg-orange-100
          "
        >

          <span
            className="
              flex
              items-center
              justify-center
              gap-1.5
            "
          >
            <Eye size={15} />
            View
          </span>

        </button>


        {/* DELETE */}

        <button
          type="button"
          onClick={() =>
            onDelete(product)
          }
          className="
            rounded-lg
            px-3
            py-2.5
            text-red-500
            transition
            hover:bg-red-50
          "
          title="Delete product"
        >
          <Trash2 size={17} />
        </button>

      </div>

    </div>

  );
}


export default AdminProductCard;