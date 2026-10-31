import api from './api';

/** POST /api/auth/signup → { token, user } */
export async function signupRequest({ email, password }) {
  const { data } = await api.post('/auth/signup', { email, password });
  return data;
}

/** POST /api/auth/signin → { token, user } */
export async function signinRequest({ email, password }) {
  const { data } = await api.post('/auth/signin', { email, password });
  return data;
}

/**
 * Turns an axios error into a message suitable for a toast.
 * Backend errors look like { message: string }.
 */
export function getErrorMessage(error) {
  if (!error?.response) return 'Server is unavailable. Please try again later.';
  return error.response.data?.message || 'Something went wrong. Please try again.';
}
