import { Link } from 'react-router-dom';

/**
 * UserAuth — shown in Header when the user is NOT logged in.
 *
 * Figma ref: Desktop Main page, node #1059:30011
 *   row, gap: 8px, alignItems: center
 *   ├── TEXT "Sign in"  Regular 18px #407BFF
 *   └── IMAGE-SVG "user/outline"  28×28px
 *
 * Hover state (Figma «Desktop UI Element» → Text Button 1):
 *   Normal: #407BFF
 *   Hover:  #FF9D43  (Secondary color/5)
 */
function UserAuth() {
  return (
    <Link
      to="/signin"
      className="group flex items-center gap-2 transition-colors"
      aria-label="Sign in"
    >
      {/* "Sign in" text — 18px Regular #407BFF → hover #FF9D43 */}
      <span
        className="transition-colors"
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '24px',
          color: 'inherit',
        }}
      >
        Sign in
      </span>

      {/* user/outline icon 28×28  (Figma node 1059:30013 / 1059:30123) */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <g clipPath="url(#user-clip)">
          <path
            d="M23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5C18.3513 0.5 23.5 5.64873 23.5 12Z"
            stroke="currentColor"
          />
          <path
            d="M15.0004 7.07692C15.0004 7.89297 14.6843 8.6756 14.1216 9.25263C13.5589 9.82967 12.7958 10.1538 12 10.1538C11.2042 10.1538 10.4411 9.82967 9.8784 9.25263C9.31571 8.6756 8.9996 7.89297 8.9996 7.07692C8.9996 6.26087 9.31571 5.47824 9.8784 4.90121C10.4411 4.32417 11.2042 4 12 4C12.7958 4 13.5589 4.32417 14.1216 4.90121C14.6843 5.47824 15.0004 6.26087 15.0004 7.07692ZM6 18.6609C6.02571 17.0464 6.66916 15.507 7.79158 14.3746C8.914 13.2422 10.4255 12.6076 12 12.6076C13.5745 12.6076 15.086 13.2422 16.2084 14.3746C17.3308 15.507 17.9743 17.0464 18 18.6609C16.1177 19.5461 14.0708 20.0029 12 20C9.85891 20 7.82664 19.5208 6 18.6609Z"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="currentColor"
          />
        </g>
        <defs>
          <clipPath id="user-clip">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>

      <style>{`
        .group { color: #407BFF; }
        .group:hover { color: #FF9D43; }
      `}</style>
    </Link>
  );
}

export default UserAuth;
