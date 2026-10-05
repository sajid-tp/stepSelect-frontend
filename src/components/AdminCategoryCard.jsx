function AdminCategoryCard({
  category,
  onEdit,
  onToggleStatus,
  toggling,
}) {

  const {
    id,
    categoryName,
    iconClass,
    description,
    isActive,
  } = category;


  return (
    <div
      className={`
        flex min-h-[315px] flex-col
        rounded-xl
        border
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-200
        hover:shadow-md
        ${
          !isActive
            ? "border-red-200"
            : "border-gray-200"
        }
      `}
    >

      {/* ================= TOP ================= */}

      <div className="flex items-start justify-between">

        {/* Icon */}

        <div
          className={`
            flex h-12 w-12
            items-center justify-center
            rounded-full
            text-lg
            ${
              isActive
                ? "bg-[#ffe1d6] text-[#ff5722]"
                : "bg-gray-200 text-gray-500"
            }
          `}
        >
          <i className={iconClass}></i>
        </div>


        {/* Status */}

        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-3
            py-1
            text-xs
            font-semibold
            ${
              isActive
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }
          `}
        >

          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${
                isActive
                  ? "bg-green-600"
                  : "bg-red-500"
              }
            `}
          />

          {isActive ? "Active" : "Inactive"}

        </span>

      </div>


      {/* ================= CATEGORY INFO ================= */}

      <div className="mt-5 flex-1">

        <h2
          className="
            line-clamp-2
            text-2xl
            font-bold
            leading-tight
            text-gray-900
          "
        >
          {categoryName}
        </h2>


        {description ? (
          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-5
              text-gray-500
            "
          >
            {description}
          </p>
        ) : (
          <p
            className="
              mt-3
              text-sm
              text-gray-400
            "
          >
            No description
          </p>
        )}

      </div>


      {/* ================= ACTIONS ================= */}

      <div className="mt-6 flex gap-2">

        {/* Edit */}

        <button
          type="button"
          onClick={() => onEdit(category)}
          className="
            flex-1
            rounded-md
            border-2
            border-gray-500
            bg-white
            px-3
            py-2.5
            text-xs
            font-bold
            uppercase
            tracking-wide
            text-gray-600
            transition
            hover:bg-gray-50
          "
        >
          Edit
        </button>


        {/* Toggle */}

        <button
          type="button"
          disabled={toggling}
          onClick={() => onToggleStatus(category)}
          className={`
            flex-1
            rounded-md
            px-3
            py-2.5
            text-xs
            font-bold
            uppercase
            tracking-wide
            text-white
            transition
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${
              isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 hover:bg-gray-700"
            }
          `}
        >
          {toggling
            ? "Updating..."
            : isActive
              ? "Block"
              : "Unblock"}
        </button>

      </div>

    </div>
  );
}

export default AdminCategoryCard;