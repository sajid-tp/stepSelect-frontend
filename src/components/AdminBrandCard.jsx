function AdminBrandCard({
  brand,
  onEdit,
  onToggleStatus,
  onDelete,
  toggling,
  deleting,
}) {
  const {
    id,
    brandName,
    description,
    logo,
    isActive,
  } = brand;

  const isDeleting = deleting === id;
  const isToggling = toggling === id;

  return (
    <div
      className={`
        flex
        min-h-[244px]
        flex-col
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
      {/* TOP */}
      <div className="flex items-start justify-between">
        {/* LOGO */}
        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            overflow-hidden
            rounded-full
            ${
              isActive
                ? "bg-[#ffe1d6]"
                : "bg-gray-200"
            }
          `}
        >
          {logo ? (
            <img
              src={logo}
              alt={brandName}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <span
              className={`
                text-lg
                font-bold
                ${
                  isActive
                    ? "text-[#ff5722]"
                    : "text-gray-500"
                }
              `}
            >
              {brandName
                ?.charAt(0)
                ?.toUpperCase()}
            </span>
          )}
        </div>

        {/* STATUS */}
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

          {isActive
            ? "Active"
            : "Inactive"}
        </span>
      </div>

      {/* CONTENT */}
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
          {brandName}
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
          <p className="mt-3 text-sm text-gray-400">
            No description
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          disabled={
            !isActive ||
            isToggling ||
            isDeleting
          }
          onClick={() => onEdit(brand)}
          className="
            flex-1
            rounded-md
            border
            border-gray-300
            bg-white
            px-3
            py-2.5
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-gray-600
            transition
            hover:border-gray-400
            hover:bg-gray-50
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Edit
        </button>

        <button
          type="button"
          disabled={
            isToggling ||
            isDeleting
          }
          onClick={() =>
            onToggleStatus(brand)
          }
          className={`
            flex-1
            rounded-md
            px-3
            py-2.5
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-white
            transition
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${
              isActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-600 hover:bg-gray-700"
            }
          `}
        >
          {isToggling
            ? "Updating..."
            : isActive
              ? "Block"
              : "Unblock"}
        </button>

        <button
          type="button"
          disabled={
            isDeleting ||
            isToggling
          }
          onClick={() =>
            onDelete(brand)
          }
          title="Delete brand"
          aria-label={`Delete ${brandName}`}
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-md
            border
            border-red-200
            bg-white
            text-red-500
            transition
            hover:border-red-300
            hover:bg-red-50
            hover:text-red-600
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          {isDeleting ? (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-25"
              />

              <path
                d="M21 12a9 9 0 0 1-9 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
              <path d="M9 6V4h6v2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default AdminBrandCard;