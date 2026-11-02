import { useState } from 'react';
import eyeIcon from '../assets/eye.svg';
import eyeSlashIcon from '../assets/eye-slash.svg';

const inputBase =
  // Figma Text Input: 44px tall (11 + 20 line-height + 11 + 2 border), 10px side padding
  'w-full rounded-md border bg-white px-2.5 py-[11px] font-roboto text-base leading-5 text-primary ' +
  'placeholder:text-secondary focus:outline-none transition-colors';

export function inputClass(hasError) {
  return `${inputBase} ${
    hasError
      ? 'border-error text-error placeholder:text-error focus:border-error'
      : 'border-divider focus:border-primary'
  }`;
}

export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="font-roboto text-sm leading-[18px] text-error">
      {message}
    </p>
  );
}

/**
 * Text field with label + inline validation error.
 * `type="password"` adds a show/hide toggle (hidden by default).
 * Shared by AuthForm (issue #6) and SettingModal (issue #8).
 */
function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  registration,
  autoComplete,
  labelClassName = 'font-roboto text-lg leading-6 text-text',
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`${inputClass(Boolean(error))} ${isPassword ? 'pr-8' : ''}`}
          {...registration}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            <img src={visible ? eyeIcon : eyeSlashIcon} alt="" aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
      <FieldError id={errorId} message={error?.message} />
    </div>
  );
}

export default FormField;
