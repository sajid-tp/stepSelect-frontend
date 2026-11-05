import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Uncontrolled by design — grab values with `new FormData(e.target)` in the
// form's onSubmit, or swap to value/onChange yourself once you wire up
// controlled state (useState, or an RTK form slice).
//
// Any field with type="password" automatically gets an eye icon that
// toggles the password between hidden and visible.
//
// Accessibility: when `error` is set, the input is marked aria-invalid and
// linked to its message, and the message is announced by screen readers.
//
// `invalid` marks the field red WITHOUT showing a message under it (used when
// the explanation is shown somewhere else, e.g. the password checklist).
function FormField({ label, type = 'text', name, placeholder, rightElement, value, onChange, onBlur, onKeyDown, error, invalid = false, disabled, readOnly }) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const hasMessage = Boolean(error);
  const isInvalid = hasMessage || invalid;
  const errorId = `${name}-error`;

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
        {rightElement}
      </div>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={isInvalid}
          aria-describedby={hasMessage ? errorId : undefined}
          className={`w-full rounded-md border px-4 py-3 text-sm outline-none focus:border-ink ${
            isInvalid ? 'border-red-400' : 'border-line'
          } ${isPassword ? 'pr-11' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            title={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none disabled:opacity-50"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <small id={errorId} role={hasMessage ? 'alert' : undefined} className="text-red-500">
        {error}
      </small>
    </div>
  );
}

export default FormField;
