import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../services/api';

/**
 * UserLogoutModal — confirmation dialog for logging out (issue #24).
 *
 * Figma ref: «Desktop/Tablet/Mobile Pop-up (Log out)»
 *   node #1059:26784 (Desktop), #1059:30809 (Tablet), #1059:34363 (Mobile)
 *
 * Layout (layout_7145797b / layout_26008762):
 *   • Padding:        32px 24px  (all breakpoints)
 *   • Gap:            24px       (between title-row, subtitle, buttons-row)
 *   • Border-radius:  10px
 *   • Background:     #FFFFFF    (fill_658ab2fa = Primery Color/White)
 *
 * Title "Log out" (style_7a68d8ff):
 *   • Roboto Medium 500, 26px, lineHeight 32px, color #2F2F2F
 *
 * Subtitle "Do you really want to leave?" (style_dd7b6a41, EL-aaf55997):
 *   • Roboto Medium 500, 18px, lineHeight 20px, color #2F2F2F
 *
 * Buttons (layout_09d6db9c / layout_19e3c9be):
 *   • Desktop/Tablet: row, gap 24px — Cancel left, Log out right
 *   • Mobile:         column, center, gap 24px — Log out top, Cancel bottom
 *   • Cancel  (EL-3cc236a5): bg #D7E3FF (Secondary color / 5), padding 10px 30px desktop / 8px 30px mobile
 *   • Log out (EL-0d4558db): bg #EF5050 (Secondary color/3),   padding same, shadow 0px 4px 8px 0px rgba(64,123,255,0.34)
 *
 * Behaviour:
 *   • Closes on Escape (unless loading)
 *   • Closes on backdrop click (unless loading)
 *   • Logout → POST /api/auth/logout → logout() → navigate('/signin', { replace: true })
 *   • On error: modal stays open, toast.error shown; store NOT cleared (interceptor handles 401)
 *   • Body scroll locked while open; focus returns to opener on close
 *   • Initial focus on Cancel (safe default)
 */
function UserLogoutModal({ onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const cancelBtnRef = useRef(null);
  // Remember the element that had focus before the modal opened
  const openerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);

  /* ── Initial focus on Cancel (safe button) ──────────────────────────── */
  useEffect(() => {
    cancelBtnRef.current?.focus({ preventScroll: true });
  }, []);

  /* ── Escape, body scroll lock, focus return on unmount ─────────────── */
  useEffect(() => {
    const prevFocus = openerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      // Return focus to the element that opened the modal
      if (prevFocus && typeof prevFocus.focus === 'function' && document.contains(prevFocus)) {
        prevFocus.focus();
      }
    };
  }, [onClose, isLoading]);

  /* ── Logout handler ─────────────────────────────────────────────────── */
  async function handleLogout() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
      // Clear Zustand store + localStorage (token, user) synchronously,
      // then navigate so RestrictedRoute on /signin renders the page (not redirect to /home)
      logout();
      onClose();
      navigate('/signin', { replace: true });
    } catch (err) {
      // Note: a 401 triggers the axios interceptor which calls logout() automatically.
      // For other errors we keep the modal open and show a toast — state is NOT cleared.
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Logout failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  /* ── Backdrop click (only if click target is the backdrop itself) ───── */
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 animate-fade-in"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-[280px] rounded-[10px] bg-white outline-none animate-modal-in tablet:max-w-[592px]"
        style={{ padding: '32px 24px' }}
      >
        {/* ── Header row: title + × close button ── */}
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <h2
            id="logout-modal-title"
            className="font-roboto font-medium text-text"
            style={{ fontSize: '26px', lineHeight: '32px' }}
          >
            Log out
          </h2>

          {/* x-mark/outline — same SVG path used in SettingModal */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-primary transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* ── Subtitle ── */}
        <p
          className="font-roboto font-medium text-text"
          style={{ fontSize: '18px', lineHeight: '20px', marginBottom: '24px' }}
        >
          Do you really want to leave?
        </p>

        {/* ── Buttons ──────────────────────────────────────────────────────
              Desktop/Tablet: row — Cancel (left) | Log out (right)
              Mobile:         column, centered — Log out (top) | Cancel (bottom)
              Using order-* utilities to reorder without changing DOM order
              (Cancel first in DOM so it gets initial focus via cancelBtnRef)
        ─────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-6 tablet:flex-row tablet:justify-center">
          {/* Cancel — order-last on mobile (shown below Log out), order-first on tablet+ */}
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="order-last w-full rounded-[10px] font-roboto font-medium text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 tablet:order-first tablet:w-auto"
            style={{
              backgroundColor: '#D7E3FF',
              padding: '8px 30px',
              fontSize: '18px',
              lineHeight: '24px',
            }}
          >
            Cancel
          </button>

          {/* Log out — order-first on mobile (shown above Cancel), order-last on tablet+ */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="order-first w-full rounded-[10px] font-roboto font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 tablet:order-last tablet:w-auto"
            style={{
              backgroundColor: '#EF5050',
              padding: '8px 30px',
              fontSize: '18px',
              lineHeight: '24px',
              boxShadow: '0px 4px 8px 0px rgba(64, 123, 255, 0.34)',
            }}
          >
            {isLoading ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default UserLogoutModal;
