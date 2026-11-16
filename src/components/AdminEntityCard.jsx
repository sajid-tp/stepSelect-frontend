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

  // Loading states (the status toggle is never disabled)
  deleting,
}) {
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


        {/* STATUS TOGGLE (opens the confirmation modal in the page) */}

        <div className="flex items-center gap-2">

          <span
            className={`text-xs font-semibold ${
              item.isActive ? "text-green-600" : "text-gray-400"
            }`}
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(item.isActive)}
            aria-label={`${item.isActive ? "Deactivate" : "Activate"} ${name}`}
            title={item.isActive ? "Deactivate" : "Activate"}
            onClick={() => onToggleStatus(item)}
            className={`
              relative h-6 w-11 shrink-0 rounded-full
              transition-colors duration-200 focus:outline-none
              ${item.isActive ? "bg-[#ff5722]" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full
                bg-white shadow-sm transition-all duration-200
                ${item.isActive ? "left-[22px]" : "left-[2px]"}
              `}
            />
          </button>

        </div>

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

      <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">

        {/* EDIT */}

        <button
          type="button"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${name}`}
          className="
            flex flex-1 items-center justify-center gap-2
            rounded-lg border border-gray-200 bg-white
            px-3 py-2 text-sm font-medium text-gray-700
            transition
            hover:border-[#ff5722] hover:bg-[#fff1ec] hover:text-[#ff5722]
          "
        >
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
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 7.125L16.875 4.5"
            />
          </svg>
          Edit
        </button>


        {/* DELETE */}

        <button
          type="button"
          onClick={() => onDelete(item)}
          disabled={isDeleting}
          aria-label={`Delete ${name}`}
          className={`
            flex flex-1 items-center justify-center gap-2
            rounded-lg border border-red-100 bg-red-50
            px-3 py-2 text-sm font-medium text-red-600
            transition
            hover:border-red-200 hover:bg-red-100
            ${isDeleting ? "cursor-not-allowed opacity-50" : ""}
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
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5h6v2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l1 12h6l1-12" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
            </svg>
          )}
          Delete
        </button>

      </div>

    </div>
  );
}

export default AdminEntityCard;