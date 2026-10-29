import { create } from 'zustand';

/**
 * Minimal auth store — foundation for issue #5.
 * issue #7 will extend this with: isRefreshing, private routes, background profile refresh.
 * Do NOT add those here.
 *
 * Token persistence strategy:
 *  - localStorage['token'] → plain string  (read by api.js interceptor)
 *  - localStorage['user']  → JSON string   (hydrated on app start)
 */

// Hydrate from localStorage on module load (before first render)
const storedToken = localStorage.getItem('token') ?? null;
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const useAuthStore = create((set) => ({
  /** @type {{ email: string, name: string|null, avatarUrl: string|null } | null} */
  user: storedUser,
  /** @type {string | null} */
  token: storedToken,
  /** Derived from token presence */
  isLoggedIn: Boolean(storedToken),

  /**
   * Persist auth data to store + localStorage.
   * @param {{ email: string, name: string|null, avatarUrl: string|null }} user
   * @param {string} token — plain string, stored as-is under key 'token'
   */
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isLoggedIn: true });
  },

  /**
   * Clear auth state from store and localStorage.
   * Called after POST /api/auth/logout (or on failure — still clears locally).
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isLoggedIn: false });
  },
}));

export default useAuthStore;
