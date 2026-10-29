import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';

/**
 * UserLogoModal — dropdown menu triggered by clicking UserLogo.
 *
 * Behaviours:
 *  - Closes on click outside (mousedown on document)
 *  - Closes on Escape key
 *  - Settings button → TODO: open SettingModal (issue #8)
 *    https://github.com/W33nDen/water-tracker-app/issues/8
 *  - Logout button  → POST /api/auth/logout, clear store + localStorage, redirect /welcome
 */
function UserLogoModal({ onClose }) {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  /* ── Close on outside click ── */
  useEffect(() => {
    function handleMouseDown(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        // Also check the trigger button (parent) to avoid double-toggle
        onClose();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  /* ── Close on Escape ── */
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /* ── Handlers ── */
  function handleSettings() {
    // TODO: Open SettingModal — will be implemented in issue #8
    // https://github.com/W33nDen/water-tracker-app/issues/8
    onClose();
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors — always clear locally
    } finally {
      logout();
      onClose();
      navigate('/welcome', { replace: true });
    }
  }

  /* ── Shared button styles ── */
  const btnBase =
    'flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-gray-100';

  return (
    <div
      ref={modalRef}
      role="menu"
      aria-label="User menu"
      className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
    >
      {/* Settings */}
      <button
        type="button"
        role="menuitem"
        onClick={handleSettings}
        className={btnBase}
        style={{ color: '#2f2f2f' }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z"
            stroke="#407bff"
            strokeWidth="1.5"
          />
          <path
            d="M14.25 9C14.25 9.27 14.235 9.54 14.205 9.8025L15.7725 11.025C15.9225 11.145 15.9675 11.355 15.8775 11.535L14.4525 14.0025C14.3625 14.1825 14.16 14.25 13.9725 14.19L12.135 13.47C11.745 13.77 11.3175 14.025 10.8525 14.22L10.575 16.1775C10.545 16.3725 10.3725 16.5 10.1775 16.5H7.3275C7.1325 16.5 6.96 16.3725 6.93 16.1775L6.6525 14.22C6.1875 14.025 5.76 13.77 5.37 13.47L3.5325 14.19C3.345 14.2575 3.1425 14.1825 3.0525 14.0025L1.6275 11.535C1.5375 11.355 1.5825 11.145 1.7325 11.025L3.3 9.8025C3.27 9.54 3.255 9.27 3.255 9C3.255 8.73 3.27 8.46 3.3 8.1975L1.7325 6.975C1.5825 6.855 1.5375 6.645 1.6275 6.465L3.0525 3.9975C3.1425 3.8175 3.345 3.75 3.5325 3.81L5.37 4.53C5.76 4.23 6.1875 3.975 6.6525 3.78L6.93 1.8225C6.96 1.6275 7.1325 1.5 7.3275 1.5H10.1775C10.3725 1.5 10.545 1.6275 10.575 1.8225L10.8525 3.78C11.3175 3.975 11.745 4.23 12.135 4.53L13.9725 3.81C14.16 3.7425 14.3625 3.8175 14.4525 3.9975L15.8775 6.465C15.9675 6.645 15.9225 6.855 15.7725 6.975L14.205 8.1975C14.235 8.46 14.25 8.73 14.25 9Z"
            stroke="#407bff"
            strokeWidth="1.5"
          />
        </svg>
        Settings
      </button>

      {/* Divider */}
      <div className="my-1 border-t border-gray-100" />

      {/* Logout */}
      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        className={btnBase}
        style={{ color: '#ef4444' }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.75 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H6.75"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 12.75L15.75 9L12 5.25"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.75 9H6.75"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Logout
      </button>
    </div>
  );
}

export default UserLogoModal;
