// Uncontrolled by design — grab values with `new FormData(e.target)` in the
// form's onSubmit, or swap to value/onChange yourself once you wire up
// controlled state (useState, or an RTK form slice).
function FormField({ label, type = 'text', name, placeholder, rightElement, value, onChange, onBlur, error, disabled, readOnly }) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
        {rightElement}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        className="w-full rounded-md border border-line px-4 py-3 text-sm outline-none focus:border-ink"
      />
      <small className="text-red-500">{error}</small>
    </div>
  );
}

export default FormField;
