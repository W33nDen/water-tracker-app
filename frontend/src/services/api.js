import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT to every request when the user is logged in.
// The backend also accepts an httpOnly cookie, but cross-site deployments
// (Vercel ↔ Render) won't send it, so the Bearer header is the single source of truth.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Called when an authenticated request comes back 401 (expired token,
 * or the session was replaced by a sign-in on another device).
 * Registered by the auth store to avoid a circular import.
 */
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    // /auth/* 401s mean "wrong credentials" or "already logged out" — not a dead session.
    const isAuthEndpoint = config?.url?.startsWith('/auth/');

    if (response?.status === 401 && !isAuthEndpoint) {
      const rawHeader =
        typeof config?.headers?.get === 'function'
          ? config.headers.get('Authorization')
          : (config?.headers?.Authorization || config?.headers?.authorization);

      const sentToken = typeof rawHeader === 'string'
        ? rawHeader.replace(/^Bearer\s+/i, '').trim()
        : null;

      const currentToken = localStorage.getItem('token');

      // Only expire session if the 401 was returned for the currently active token.
      // Stale 401 responses from a previous session must not log out a new session,
      // and if the user is already logged out, no action is needed.
      if (currentToken && sentToken === currentToken) {
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
