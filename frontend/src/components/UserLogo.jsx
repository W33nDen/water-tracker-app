import { useState } from 'react';
import useAuthStore from '../store/authStore';
import UserLogoModal from './UserLogoModal';

/**
 * Returns the avatar initials fallback character.
 * Priority (issue #5, §3): name first letter → email first letter → '?'
 */
function getInitial(user) {
  if (!user) return '?';
  if (user.name) return user.name.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return '?';
}

/**
 * UserLogo — shown in Header when the user IS logged in.
 *
 * Figma ref: «Home screen Tracker of water» node #1059:26778
 *   row, gap: 8px, alignItems: center
 *   ├── TEXT  user name  Regular 18px #2F2F2F  (textAlign: RIGHT)
 *   ├── ELLIPSE avatar   28×28px
 *   └── chevron-double-up/solid  16×16px  #407BFF
 *
 * Clicking opens UserLogoModal dropdown.
 *
 * Avatar priority (issue #5, §3):
 *   a) avatarUrl → <img>
 *   b) name present → first letter (uppercase) on #407BFF circle
 *   c) fallback → first letter of email (uppercase)
 */
function UserLogo() {
  const user = useAuthStore((s) => s.user);
  const [isOpen, setIsOpen] = useState(false);

  const initial = getInitial(user);
  const displayName = user?.name ?? user?.email ?? '';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer focus:outline-none"
        aria-label="Open user menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* ── User name — hidden on mobile, visible tablet+ ── */}
        {displayName && (
          <span
            className="hidden tablet:block max-w-[160px] truncate"
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '24px',
              color: '#2F2F2F',
              textAlign: 'right',
            }}
          >
            {displayName}
          </span>
        )}

        {/* ── Avatar 28×28 ── */}
        <span className="block flex-shrink-0 overflow-hidden rounded-full"
          style={{ width: 28, height: 28 }}>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name ?? user.email ?? 'User avatar'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span
              className="flex items-center justify-center w-full h-full rounded-full text-white"
              style={{
                backgroundColor: '#407BFF',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              {initial}
            </span>
          )}
        </span>

        {/* ── Chevron 16×16 (chevron-double-up/solid rotated for down) ── */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          className={`hidden tablet:block transition-transform duration-200 flex-shrink-0 ${isOpen ? '' : 'rotate-180'}`}
        >
          {/* chevron-double-up/solid path, #407BFF */}
          <path
            d="M11.4701 7.72L4.50009 14.69C4.35792 14.8322 4.2858 15.0202 4.28923 15.2145C4.29265 15.4088 4.37137 15.5942 4.50878 15.7316C4.64619 15.869 4.83158 15.9478 5.02588 15.9512C5.22018 15.9546 5.40823 15.8825 5.55039 15.75L12.0001 9.31L18.4701 15.75C18.6122 15.8825 18.8003 15.9546 18.9946 15.9512C19.1889 15.9478 19.3743 15.869 19.5117 15.7316C19.6491 15.5942 19.7278 15.4088 19.7313 15.2145C19.7347 15.0202 19.6626 14.8322 19.5201 14.69L12.5301 7.72C12.3895 7.5795 12.1988 7.50066 12.0001 7.50066C11.8013 7.50066 11.6107 7.5795 11.4701 7.72Z"
            fill="#407BFF"
          />
        </svg>
      </button>

      {isOpen && (
        <UserLogoModal onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export default UserLogo;
