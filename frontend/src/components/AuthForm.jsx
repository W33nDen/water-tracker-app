import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signinSchema, signupSchema } from '../schemas/authSchemas';
import Field from './FormField';

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
    watch,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaults,
    mode: 'onTouched', // validate on blur, then live while correcting
  });

  const passwordValue = watch('password');
  useEffect(() => {
    if (mode === 'signup' && touchedFields.repeatPassword) {
      void trigger('repeatPassword');
    }
  }, [mode, passwordValue, trigger, touchedFields.repeatPassword]);

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
