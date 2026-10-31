/*
  The top bar every admin management page uses, so they all look the same.

    <AdminPageHeader
      eyebrow="Catalog"              small grey label above the title
      title="Product"                first part of the title ...
      highlight="Management"         ... and the orange part (defaults to "Management")
      actionLabel="Add New Product"  optional button on the right (leave out for none)
      onAction={handleAdd}
    />
*/
function AdminPageHeader({
  eyebrow,
  title,
  highlight = "Management",
  actionLabel,
  onAction,
  actionDisabled = false,
}) {
  return (
    <header className="flex min-h-[104px] items-center justify-between gap-4 border-b border-gray-200 bg-white px-12 py-7">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-[#071a33]">
          {title}
          {highlight && <span className="text-[#ff5722]"> {highlight}</span>}
        </h1>
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#ff5722] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#f4511e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className="fa-solid fa-plus text-xs" />
          {actionLabel}
        </button>
      )}
    </header>
  );
}

export default AdminPageHeader;
