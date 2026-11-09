/*
|--------------------------------------------------------------------------
| AdminTabsSort
|--------------------------------------------------------------------------
| One shared "tabs + sort" bar for every admin list page.
| Design = the Category Management page:
|   - underline tabs on the left (orange underline on the active one)
|   - "SORT BY" label + dropdown on the right
|
| Props
|   tabs         [{ value, label, badge? }]   badge = small count pill on a tab
|   activeTab    current tab value
|   onTabChange  (value) => void
|   sortOptions  [{ value, label }]           (omit to hide the dropdown)
|   sort         current sort value
|   onSortChange (event) => void              (plain <select> onChange)
|   sortId       unique id for the <select> (label association)
|   extra        optional node shown just before the sort dropdown
|                (e.g. a date-range button)
|   className    spacing around the bar (default "mb-8")
*/

function AdminTabsSort({
  tabs = [],
  activeTab,
  onTabChange,
  sortOptions,
  sort,
  onSortChange,
  sortId = "admin-sort",
  extra = null,
  className = "mb-8",
}) {
  const hasSort = Array.isArray(sortOptions) && sortOptions.length > 0;

  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-x-6 border-b border-gray-200 ${className}`}
    >
      {/* TABS */}
      <div className="flex flex-wrap gap-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`relative px-1 pb-4 text-sm font-medium transition ${
              activeTab === tab.value
                ? "text-[#071a33]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}

            {tab.badge > 0 && (
              <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {tab.badge}
              </span>
            )}

            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#ff5722]" />
            )}
          </button>
        ))}
      </div>

      {/* EXTRA + SORT */}
      {(hasSort || extra) && (
        <div className="flex items-center gap-4 pb-3">
          {extra}

          {hasSort && (
            <div className="flex items-center gap-2">
              <label
                htmlFor={sortId}
                className="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Sort by
              </label>

              <select
                id={sortId}
                value={sort}
                onChange={onSortChange}
                className="cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 outline-none transition focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722]"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminTabsSort;
