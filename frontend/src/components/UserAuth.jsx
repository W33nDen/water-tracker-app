import { Link } from 'react-router-dom';

/**
 * UserAuth — shown in Header when the user is NOT logged in.
 *
 * Figma ref: «Tracker of water Sign In» / «UI-Kit»
 *   row, gap: 8px, alignItems: center
 *   ├── TEXT "Sign in" Regular 18px #407BFF
 *   └── IMAGE-SVG "user/outline" 28×28px
 *
 * Hover state (Figma «Desktop UI Element» → Text Button 1):
 *   Normal: #407BFF
 *   Hover:  #FF9D43
 */
function UserAuth() {
  return (
    <Link
      to="/signin"
      className="group flex items-center gap-2 cursor-pointer transition-colors text-[#407BFF] hover:text-[#FF9D43]"
      aria-label="Sign in"
    >
      <span
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '24px',
        }}
      >
        Sign in
      </span>

      {/* user/outline 28x28 */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current flex-shrink-0"
      >
        <circle cx="14" cy="14" r="13.5" stroke="currentColor" />
        <path
          d="M17.5 8.5C17.5 9.42826 17.1313 10.3185 16.4749 10.9749C15.8185 11.6313 14.9283 12 14 12C13.0717 12 12.1815 11.6313 11.5251 10.9749C10.8687 10.3185 10.5 9.42826 10.5 8.5C10.5 7.57174 10.8687 6.68152 11.5251 6.02513C12.1815 5.36875 13.0717 5 14 5C14.9283 5 15.8185 5.36875 16.4749 6.02513C17.1313 6.68152 17.5 7.57174 17.5 8.5ZM7 21.5C7.03 19.65 7.77 17.89 9.05 16.6C10.33 15.31 12.05 14.58 13.85 14.58C15.65 14.58 17.37 15.31 18.65 16.6C19.93 17.89 20.67 19.65 20.7 21.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

export default UserAuth;
