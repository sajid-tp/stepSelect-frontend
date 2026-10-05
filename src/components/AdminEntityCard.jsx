function AdminEntityCard({
  item,

  // What to display
  name,
  description,

  // Visual
  visual,
  visualType = "image",

  // Actions
  onEdit,
  onToggleStatus,
  onDelete,

  // Loading states
  toggling,
  deleting,
}) {
  const isToggling = toggling === item.id;
  const isDeleting = deleting === item.id;

  return (
    <div
      className="
        flex
        min-h-[244px]
        flex-col
        rounded-xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >

      {/* ================================================= */}
      {/* TOP SECTION */}
      {/* ================================================= */}

      <div className="flex items-start justify-between">

        {/* VISUAL */}

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            overflow-hidden
            rounded-full
            bg-[#fff1ec]
            text-[#ff5722]
          "
        >

          {visualType === "image" ? (

            visual ? (
              <img
                src={visual}
                alt={name}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <span
                className="
                  text-xl
                  font-bold
                "
              >
                {name?.charAt(0)?.toUpperCase()}
              </span>
            )

          ) : (

            visual ? (
              <i
                className={`${visual} text-xl`}
              />
            ) : (
              <span
                className="
                  text-xl
                  font-bold
                "
              >
                {name?.charAt(0)?.toUpperCase()}
              </span>
            )

          )}

        </div>


        {/* STATUS */}

        <span
          className={`
            rounded-full
            px-3
            py-1
            text-xs
            font-semibold
            ${
              item.isActive
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-500"
            }
          `}
        >
          {item.isActive
            ? "Active"
            : "Inactive"}
        </span>

      </div>


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="mt-5 flex-1">

        <h3
          className="
            line-clamp-1
            text-lg
            font-semibold
            text-gray-900
          "
        >
          {name}
        </h3>


        <p
          className="
            mt-2
            line-clamp-2
            min-h-[40px]
            text-sm
            leading-5
            text-gray-500
          "
        >
          {description || "No description available."}
        </p>

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
          onClick={() => onEdit(item)}
          disabled={!item.isActive}
          className={`
            flex-1
            rounded-lg
            px-3
            py-2
            text-sm
            font-medium
            transition
            ${
              item.isActive
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "cursor-not-allowed bg-gray-50 text-gray-300"
            }
          `}
        >
          Edit
        </button>


        {/* TOGGLE STATUS */}

        <button
          type="button"
          onClick={() =>
            onToggleStatus(item)
          }
          disabled={isToggling}
          className={`
            flex-1
            rounded-lg
            px-3
            py-2
            text-sm
            font-medium
            transition
            ${
              item.isActive
                ? "bg-orange-50 text-[#f4511e] hover:bg-orange-100"
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }
            ${
              isToggling
                ? "cursor-not-allowed opacity-60"
                : ""
            }
          `}
        >
          {isToggling
            ? "Updating..."
            : item.isActive
              ? "Block"
              : "Unblock"}
        </button>


        {/* DELETE */}

        <button
          type="button"
          onClick={() =>
            onDelete(item)
          }
          disabled={isDeleting}
          aria-label={`Delete ${name}`}
          title={`Delete ${name}`}
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
              className="
                h-4
                w-4
                animate-spin
              "
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

export default AdminEntityCard;