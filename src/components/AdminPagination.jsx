function AdminPagination({
  currentPage,
  totalPages,
  totalResults,
  limit,
  onPageChange,
}) {
  // No pagination needed
  if (!totalResults || totalPages <= 1) {
    return null;
  }

  const startResult =
    (currentPage - 1) * limit + 1;

  const endResult = Math.min(
    currentPage * limit,
    totalResults
  );

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];

    // Show all pages when there are only a few
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    // Always show first page
    pages.push(1);

    // Ellipsis before current area
    if (currentPage > 3) {
      pages.push("left-ellipsis");
    }

    // Pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Ellipsis after current area
    if (currentPage < totalPages - 2) {
      pages.push("right-ellipsis");
    }

    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className="
        mt-8
        flex
        items-center
        justify-between
        border-t
        border-gray-200
        pt-6
      "
    >
      {/* ================= RESULT COUNT ================= */}

      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium text-gray-700">
          {startResult}
        </span>
        {"–"}
        <span className="font-medium text-gray-700">
          {endResult}
        </span>
        {" "}of{" "}
        <span className="font-medium text-gray-700">
          {totalResults}
        </span>
        {" "}results
      </p>


      {/* ================= PAGINATION CONTROLS ================= */}

      <div className="flex items-center gap-2">

        {/* Previous */}

        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() =>
            onPageChange(currentPage - 1)
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            border
            border-gray-200
            bg-white
            text-gray-600
            transition
            hover:bg-gray-50
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          aria-label="Previous page"
        >
          ←
        </button>


        {/* Page Numbers */}

        {getPageNumbers().map(
          (page, index) => {

            // Ellipsis
            if (
              page === "left-ellipsis" ||
              page === "right-ellipsis"
            ) {
              return (
                <span
                  key={`${page}-${index}`}
                  className="
                    flex
                    h-10
                    w-8
                    items-center
                    justify-center
                    text-sm
                    text-gray-400
                  "
                >
                  ...
                </span>
              );
            }


            // Page button
            return (
              <button
                key={page}
                type="button"
                onClick={() =>
                  onPageChange(page)
                }
                className={`
                  flex
                  h-10
                  min-w-10
                  items-center
                  justify-center
                  rounded-lg
                  border
                  px-3
                  text-sm
                  font-medium
                  transition
                  ${
                    page === currentPage
                      ? `
                        border-[#ff5722]
                        bg-[#ff5722]
                        text-white
                      `
                      : `
                        border-gray-200
                        bg-white
                        text-gray-700
                        hover:bg-gray-50
                      `
                  }
                `}
              >
                {page}
              </button>
            );
          }
        )}


        {/* Next */}

        <button
          type="button"
          disabled={
            currentPage >= totalPages
          }
          onClick={() =>
            onPageChange(currentPage + 1)
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            border
            border-gray-200
            bg-white
            text-gray-600
            transition
            hover:bg-gray-50
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          aria-label="Next page"
        >
          →
        </button>

      </div>
    </div>
  );
}

export default AdminPagination;