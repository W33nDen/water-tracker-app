import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import logoSvg from '../assets/logo.svg';

/**
 * Logo — Figma «UI-Kit → Logo» (node 1059:30126)
 *
 * Structure per Figma:
 *   row, gap: 4px, alignItems: center
 *   ├── Logo icon 40×48px (exact vector from Figma)
 *   └── "TRACKER\nOF WATER" Bold 12px UPPERCASE #407BFF
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
      className="flex items-center gap-2 select-none"
      aria-label="WaterTracker – go to home"
    >
      <img
        src={logoSvg}
        alt="WaterTracker Logo"
        width={40}
        height={48}
        className="w-10 h-12 flex-shrink-0"
      />
      <span
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 700,
          fontSize: '12px',
          lineHeight: '1.2',
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
