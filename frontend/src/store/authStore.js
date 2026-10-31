import { create } from 'zustand';
import api, { setUnauthorizedHandler } from '../services/api';

/**
 * Global auth store (issue #7).
 *
 * Token persistence strategy:
 *  - localStorage['token'] → plain string  (read by api.js interceptor as-is)
 *  - localStorage['user']  → JSON string   (cached profile, shown instantly on load)
 *
 * On app start, refreshUser() re-fetches /api/users/current in the background.
 * The cached user is shown meanwhile, so the UI never blocks on a slow backend.
 */

// ── Hydrate from localStorage on module load (before first render) ────────
const storedToken = localStorage.getItem('token') ?? null;
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const useAuthStore = create((set, get) => ({
  /** @type {{ email: string, name: string|null, gender: string|null, dailyNorma: number, avatarUrl: string|null } | null} */
  user: storedUser,
  /** @type {string | null} */
  token: storedToken,
  /** True when a token is present */
  isLoggedIn: Boolean(storedToken),
  /** True while GET /users/current is in flight */
  isRefreshing: false,

  /**
   * Persist auth data to store + localStorage (after sign in).
   */
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isLoggedIn: true });
  },

  /**
   * Fetch the current user's profile with the saved token.
   * 401 → the interceptor calls logout(); other errors (offline, 5xx)
   * keep the cached session so a flaky network doesn't log the user out.
   */
  refreshUser: async () => {
    if (!get().token || get().isRefreshing) return;
    set({ isRefreshing: true });
    try {
      const { data: user } = await api.get('/users/current');
      // Ignore the response if the user logged out while it was in flight
      if (!get().token) return;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch {
      // handled by the 401 interceptor / intentionally ignored
    } finally {
      set({ isRefreshing: false });
    }
  },

  /**
   * Clear auth state from store and localStorage.
   * Called after POST /api/auth/logout (or on failure — still clears locally),
   * and automatically when an authenticated request returns 401.
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isLoggedIn: false });
  },
}));

setUnauthorizedHandler(() => useAuthStore.getState().logout());

export default useAuthStore;
