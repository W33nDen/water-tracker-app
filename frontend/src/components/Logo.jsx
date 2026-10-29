import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * Logo — Figma «UI-Kit → Logo» (node 1059:30126)
 *
 * Structure per Figma:
 *   row, gap: 4px, alignItems: center
 *   ├── Logo icon  40×48px  (water-drop SVG, #407BFF)
 *   └── "TRACKER\nOF WATER"  Bold 12px UPPERCASE #407BFF
 *
 * Behaviour:
 *   unauthorised → /welcome
 *   authorised   → /home
 */
function Logo() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const destination = isLoggedIn ? '/home' : '/welcome';

  return (
    <Link
      to={destination}
      className="flex items-center gap-1 select-none"
      aria-label="WaterTracker – go to home"
    >
      {/* ── Water-drop icon (40×48, Figma node 1059:29973) ── */}
      <svg
        width="40"
        height="48"
        viewBox="0 0 40 48"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main drop body */}
        <path
          d="M20 2C20 2 3 18.5 3 29C3 38.4 10.6 46 20 46C29.4 46 37 38.4 37 29C37 18.5 20 2 20 2Z"
          fill="#407BFF"
        />
        {/* Inner highlight */}
        <path
          d="M20 8C20 8 7 20.5 7 29C7 36.2 12.8 42 20 42C27.2 42 33 36.2 33 29C33 20.5 20 8 20 8Z"
          fill="#C6D7FF"
          opacity="0.5"
        />
        {/* Shine drops */}
        <ellipse cx="14.5" cy="28" rx="2" ry="3" fill="#407BFF" opacity="0.5" />
        <ellipse cx="22" cy="24" rx="2.5" ry="4" fill="#407BFF" opacity="0.5" />
        {/* Water surface line */}
        <path
          d="M9 32C12 30 17 31 20 33C23 35 28 34 31 32"
          stroke="#407BFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.2"
        />
        {/* Sparkle drops (secondary #9EBBFF) */}
        <circle cx="9" cy="10" r="2" fill="#9EBBFF" />
        <circle cx="33.5" cy="14" r="1.5" fill="#9EBBFF" />
        <circle cx="28" cy="5.5" r="1.5" fill="#9EBBFF" />
        <circle cx="15.5" cy="0.5" r="1.2" fill="#9EBBFF" />
        <circle cx="12" cy="5.5" r="1" fill="#9EBBFF" />
        <circle cx="8" cy="10.5" r="0.7" fill="#9EBBFF" />
        <circle cx="4.5" cy="16" r="1.2" fill="#9EBBFF" />
        <circle cx="37.5" cy="25" r="1.2" fill="#9EBBFF" />
        <circle cx="38" cy="33" r="1" fill="#9EBBFF" />
        <circle cx="0.5" cy="35.5" r="1.6" fill="#9EBBFF" />
      </svg>

      {/* ── Logo text: "TRACKER\nOF WATER" ── */}
      <span
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 700,
          fontSize: '12px',
          lineHeight: '1.3',
          textTransform: 'uppercase',
          color: '#407BFF',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        Tracker
        <br />
        of water
      </span>
    </Link>
  );
}

export default Logo;
