import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signinSchema, signupSchema } from '../schemas/authSchemas';
import eyeIcon from '../assets/eye.svg';
import eyeSlashIcon from '../assets/eye-slash.svg';

const CONFIG = {
  signin: {
    title: 'Sign In',
    schema: signinSchema,
    defaults: { email: '', password: '' },
    switchTo: { to: '/signup', label: 'Sign up' },
  },
  signup: {
    title: 'Sign Up',
    schema: signupSchema,
    defaults: { email: '', password: '', repeatPassword: '' },
    switchTo: { to: '/signin', label: 'Sign in' },
  },
};

const inputBase =
  'w-full rounded-md border bg-white px-2.5 py-3 font-roboto text-base leading-5 text-primary ' +
  'placeholder:text-secondary focus:outline-none transition-colors';

function inputClass(hasError) {
  return `${inputBase} ${
    hasError
      ? 'border-error text-error placeholder:text-error focus:border-error'
      : 'border-divider focus:border-primary'
  }`;
}

function FieldError({ id, message }) {
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
 */
function Field({ id, label, type = 'text', placeholder, error, registration, autoComplete }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-roboto text-lg leading-6 text-text">
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
          className={`${inputClass(Boolean(error))} ${isPassword ? 'pr-10' : ''}`}
          {...registration}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            <img src={visible ? eyeSlashIcon : eyeIcon} alt="" aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
      </div>
      <FieldError id={errorId} message={error?.message} />
    </div>
  );
}

/**
 * AuthForm — shared Sign In / Sign Up form (issue #6).
 *
 * @param {'signin'|'signup'} mode
 * @param {(values: object) => Promise<void>} onSubmit — may throw; the page handles toasts/redirects
 */
function AuthForm({ mode, onSubmit }) {
  const { title, schema, defaults, switchTo } = CONFIG[mode];
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaults,
    mode: 'onTouched', // validate on blur, then live while correcting
  });

  return (
    <div className="w-full">
      <h1 className="mb-4 font-roboto text-[26px] font-medium leading-8 text-text">{title}</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Field
          id={`${mode}-email`}
          label="Enter your email"
          type="email"
          placeholder="E-mail"
          autoComplete="email"
          error={errors.email}
          registration={register('email')}
        />
        <Field
          id={`${mode}-password`}
          label="Enter your password"
          type="password"
          placeholder="Password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          error={errors.password}
          registration={register('password')}
        />
        {mode === 'signup' && (
          <Field
            id="signup-repeat-password"
            label="Repeat password"
            type="password"
            placeholder="Repeat password"
            autoComplete="new-password"
            error={errors.repeatPassword}
            registration={register('repeatPassword')}
          />
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-[10px] bg-primary px-[30px] py-2.5 font-roboto text-lg font-medium leading-6 text-white shadow-btn transition-shadow hover:shadow-btn-hover active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Please wait…' : title}
        </button>
      </form>

      <Link
        to={switchTo.to}
        className="mt-4 inline-block font-roboto text-base leading-5 text-primary transition-colors hover:text-accent"
      >
        {switchTo.label}
      </Link>
    </div>
  );
}

export default AuthForm;
