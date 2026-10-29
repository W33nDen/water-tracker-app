import { useState } from 'react';
import useAuthStore from '../store/authStore';
import UserLogoModal from './UserLogoModal';

/**
 * Returns the initials character for the avatar fallback.
 * Priority: name → email → '?'
 */
function getInitial(user) {
  if (!user) return '?';
  if (user.name) return user.name.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return '?';
}

/**
 * UserLogo — shown in Header when the user IS logged in.
 * Clicking opens UserLogoModal dropdown.
 *
 * Avatar priority (issue #5, §3):
 *  a) avatarUrl → <img>
 *  b) name present → first letter of name (uppercase)
 *  c) fallback → first letter of email (uppercase)
 */
function UserLogo() {
  const user = useAuthStore((s) => s.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initial = getInitial(user);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsModalOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full p-1 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ '--tw-ring-color': '#407bff' }}
        aria-label="Open user menu"
        aria-expanded={isModalOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name ?? user.email ?? 'User avatar'}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center rounded-full text-base font-semibold text-white"
              style={{ backgroundColor: '#407bff' }}
              aria-hidden="true"
            >
              {initial}
            </span>
          )}
        </span>

        {/* Name / email label — visible on tablet+ */}
        <span
          className="hidden tablet:block max-w-[120px] truncate text-sm font-medium"
          style={{ color: '#2f2f2f' }}
        >
          {user?.name ?? user?.email ?? ''}
        </span>

        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          className={`hidden tablet:block transition-transform ${isModalOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#407bff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isModalOpen && (
        <UserLogoModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default UserLogo;

