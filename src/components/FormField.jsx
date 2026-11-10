import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
