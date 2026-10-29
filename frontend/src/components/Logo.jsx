import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * Logo component.
 * - Unauthorized → navigates to /welcome
 * - Authorized    → navigates to /home
 */
function Logo() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const destination = isLoggedIn ? '/home' : '/welcome';

  return (
    <Link
      to={destination}
      className="flex items-center gap-2 select-none"
      aria-label="Go to home"
    >
      {/* Drop icon SVG */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 3C14 3 5 12.5 5 17.5C5 22.2 9.03 26 14 26C18.97 26 23 22.2 23 17.5C23 12.5 14 3 14 3Z"
          fill="#407bff"
        />
      </svg>
      <span className="text-xl font-bold" style={{ color: '#407bff' }}>
        WaterTracker
      </span>
    </Link>
  );
}

export default Logo;

