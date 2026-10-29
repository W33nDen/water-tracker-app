import { Link } from 'react-router-dom';

/**
 * UserAuth — shown in Header when the user is NOT logged in.
 * Single "Sign In" button that navigates to /signin.
 */
function UserAuth() {
  return (
    <Link
      to="/signin"
      className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors"
      style={{
        border: '1px solid #407bff',
        color: '#407bff',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#407bff';
        e.currentTarget.style.color = '#ffffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#407bff';
      }}
    >
      Sign In
      {/* Arrow icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 8H13M13 8L9 4M13 8L9 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

export default UserAuth;

