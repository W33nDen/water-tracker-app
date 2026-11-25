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
 *   • Padding:        32px 24px (px-6 py-8 on all breakpoints)
 *   • Gap:            24px between title-row, subtitle, and buttons-row
 *   • Border-radius:  10px
 *   • Background:     #FFFFFF (fill_658ab2fa = Primery Color/White)
 *
 * Title "Log out" (style_7a68d8ff):
 *   • Roboto Medium 500, 26px, lineHeight 32px, text-text (#2F2F2F)
 *
 * Subtitle "Do you really want to leave?" (style_dd7b6a41, EL-aaf55997):
 *   • Roboto Medium 500, 18px, lineHeight 20px, text-text (#2F2F2F)
 *
 * Buttons:
 *   • Desktop/Tablet: row, gap-6 (24px), aligned to start (tablet:justify-start),
 *                     each button width: 160px (tablet:w-40), centered text.
 *                     Cancel is left, Log out is right.
 *   • Mobile (320px): column, centered, full width (w-full).
 *                     Log out is on top (order-first), Cancel is on bottom (order-last).
 *   • Cancel:         bg-divider (#D7E3FF), text-primary (#407BFF), rounded-[10px].
 *                     Padding: 8px 30px mobile, 10px 30px tablet/desktop (Figma layout_19e3c9be / layout_09d6db9c).
 *   • Log out:        bg-error (#EF5050), text-white, shadow-btn, rounded-[10px].
 *                     Padding: 8px 30px mobile, 10px 30px tablet/desktop.
 *
 * Authentication & Error Handling:
 *   • Success (204):  logout() clears Zustand store + localStorage, closes modal, navigates to /signin.
 *   • 401 Response:   server session is already invalid (e.g. session replaced on another device,
 *                     expired, or logged out in another tab). Since services/api.js skips /auth/* routes,
 *                     we explicitly handle 401 here: clear local session and redirect to /signin without error toast.
 *   • Network / 5xx:  server session may still be active. Local state is NOT cleared.
 *                     Modal stays open, fixed error toast is shown, Log out button is re-enabled for retry.
 *
 * Accessibility & Focus Management:
 *   • Initial focus lands on Cancel button (safe default).
 *   • Focus trap: Tab/Shift+Tab cycles between ×, Cancel, and Log out buttons.
 *   • During request (isLoading): all buttons disabled; focus is held on dialog container.
 *   • On request failure: focus returns deterministically to Log out button after render.
 *   • On dismiss (Cancel, ×, Escape, backdrop): focus returns to avatar button (returnFocusRef).
 *   • On successful logout: focus return is skipped (page changes).
 *   • Body scroll is locked while open and restored on unmount.
 */
function UserLogoutModal({ onClose, returnFocusRef }) {
  const [isLoading, setIsLoading] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const logoutBtnRef = useRef(null);

  // Stable references for single-setup event listener
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  const returnFocusRefStable = useRef(returnFocusRef);
  returnFocusRefStable.current = returnFocusRef;

  // Flag to avoid returning focus when navigating away on logout
  const shouldReturnFocusRef = useRef(true);

  // Flag to deterministically refocus Log out button after request failure
  const focusLogoutAfterFailureRef = useRef(false);

  /* ── Initial focus on Cancel (safe default) ─────────────────────────── */
  useEffect(() => {
    cancelBtnRef.current?.focus({ preventScroll: true });
  }, []);

  /* ── Refocus Log out button after request failure (post-render) ────── */
  useEffect(() => {
    if (!isLoading && focusLogoutAfterFailureRef.current) {
      focusLogoutAfterFailureRef.current = false;
      logoutBtnRef.current?.focus();
    }
  }, [isLoading]);

  /* ── Keydown listener (Escape + Focus Trap) & Body Scroll Lock ───────── */
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (!isLoadingRef.current) {
          onCloseRef.current();
        }
        return;
      }

      if (e.key === 'Tab') {
        // While loading, all buttons are disabled; keep focus on dialog container
        if (isLoadingRef.current) {
          e.preventDefault();
          dialogRef.current?.focus({ preventScroll: true });
          return;
        }

        const focusable = dialogRef.current
          ? Array.from(dialogRef.current.querySelectorAll('button:not([disabled])'))
          : [];

        if (focusable.length === 0) {
          e.preventDefault();
          dialogRef.current?.focus({ preventScroll: true });
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        const active = document.activeElement;
        const inside = dialogRef.current?.contains(active) && active !== dialogRef.current;

        if (!inside) {
          e.preventDefault();
          if (e.shiftKey) {
            last.focus();
          } else {
            first.focus();
          }
          return;
        }

        if (e.shiftKey) {
          if (active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;

      // Return focus to the avatar button only on dismissal (not on successful logout)
      if (shouldReturnFocusRef.current && returnFocusRefStable.current?.current) {
        returnFocusRefStable.current.current.focus?.();
      }
    };
  }, []);

  /* ── Logout handler ─────────────────────────────────────────────────── */
  async function handleLogout() {
    if (isLoading) return;
    setIsLoading(true);

    // Keep focus inside dialog while buttons are disabled
    dialogRef.current?.focus({ preventScroll: true });

    try {
      await api.post('/auth/logout');
      // 204 Success: server session invalidated
      shouldReturnFocusRef.current = false;
      logout();
      onCloseRef.current();
      navigate('/signin', { replace: true });
    } catch (err) {
      if (err?.response?.status === 401) {
        // 401 Unauthorized: server session is already dead.
        // services/api.js response interceptor skips /auth/* URLs, so we handle it explicitly.
        shouldReturnFocusRef.current = false;
        logout();
        onCloseRef.current();
        navigate('/signin', { replace: true });
        return;
      }

      // Network error or 5xx: server session might still exist.
      // Do NOT clear local state. Keep modal open so the user can retry.
      focusLogoutAfterFailureRef.current = true;
      setIsLoading(false);
      toast.error('Logout failed. Please try again.');
    }
  }

  /* ── Backdrop click ─────────────────────────────────────────────────── */
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
        className="relative w-full max-w-[280px] rounded-[10px] bg-white px-6 py-8 outline-none animate-modal-in tablet:max-w-[592px]"
      >
        {/* ── Header row: title + × close button ── */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="logout-modal-title"
            className="font-roboto text-[26px] font-medium leading-8 text-text"
          >
            Log out
          </h2>

          {/* x-mark/outline */}
          <button
            ref={closeBtnRef}
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
        <p className="mb-6 font-roboto text-lg font-medium leading-5 text-text">
          Do you really want to leave?
        </p>

        {/* ── Buttons ──────────────────────────────────────────────────────
              Desktop/Tablet: row, gap 24px (gap-6), aligned to start (tablet:justify-start),
                              width 160px each (tablet:w-40), centered text.
                              Cancel (left) | Log out (right).
              Mobile (320px): column, centered, full width (w-full).
                              Log out (top, order-first) | Cancel (bottom, order-last).
        ─────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-6 tablet:flex-row tablet:justify-start">
          {/* Cancel — order-last on mobile (shown below Log out), order-first on tablet+ */}
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="order-last flex w-full items-center justify-center rounded-[10px] bg-divider px-[30px] py-2 font-roboto text-base font-medium leading-6 text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 tablet:order-first tablet:w-40 tablet:py-2.5 tablet:text-lg"
          >
            Cancel
          </button>

          {/* Log out — order-first on mobile (shown above Cancel), order-last on tablet+ */}
          <button
            ref={logoutBtnRef}
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="order-first flex w-full items-center justify-center rounded-[10px] bg-error px-[30px] py-2 font-roboto text-base font-medium leading-6 text-white shadow-btn transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 tablet:order-last tablet:w-40 tablet:py-2.5 tablet:text-lg"
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
