import useAuthStore from '../store/authStore';
import Logo from './Logo';
import UserAuth from './UserAuth';
import UserLogo from './UserLogo';

/**
 * Header — top navigation bar.
 *
 * Figma layout measurements:
 *   Desktop 1440px — header row starts at x:112, y:12
 *     → horizontal padding: 112px each side
 *     → vertical padding: ~12px top, ~12px bottom  (total height ≈ 72px with 48px logo)
 *   Tablet 768px  — header row at x:32, y:16
 *     → horizontal padding: 32px each side
 *     → vertical padding: 16px
 *   Mobile 320px  — same structure, smaller padding (approx 16px h, 12px v)
 *
 * Structure: flex row, justify-between, items-center.
 * Left:  <Logo />
 * Right: <UserAuth /> (unauth) | <UserLogo /> (auth)
 *
 * Responsive breakpoints (tailwind.config.js):
 *   mobile 320 | tablet 768 | desktop 1440
 */
function Header() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white"
      style={{ borderBottom: '1px solid #ECF2FF' }}
    >
      {/*
        Padding per Figma:
          mobile:  px-4   py-3
          tablet:  px-8   py-4
          desktop: px-28  py-3   (≈112px = 7rem = 28 × 4px)
      */}
      <div
        className="
          mx-auto flex items-center justify-between
          px-4 py-3
          tablet:px-8 tablet:py-4
          desktop:max-w-[1440px] desktop:px-28 desktop:py-3
        "
      >
        <Logo />
        {isLoggedIn ? <UserLogo /> : <UserAuth />}
      </div>
    </header>
  );
}

export default Header;
