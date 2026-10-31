import * as yup from 'yup';

/**
 * Validation rules mirror the backend Joi schema (backend/src/schemas/authSchemas.js):
 *   email    — required, valid format
 *   password — required, 8–64 characters
 */
const email = yup
  .string()
  .trim()
  .required('Email is required')
  .email('Enter a valid email');

const password = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password must be at most 64 characters');

export const signinSchema = yup.object({ email, password });

export const signupSchema = yup.object({
  email,
  password,
  repeatPassword: yup
    .string()
    .required('Repeat your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});
