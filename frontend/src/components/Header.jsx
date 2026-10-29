import useAuthStore from '../store/authStore';
import Logo from './Logo';
import UserAuth from './UserAuth';
import UserLogo from './UserLogo';

/**
 * Header — top navigation bar.
 *
 * Unauthorized state → Logo + UserAuth (Sign In button)
 * Authorized   state → Logo + UserLogo (avatar / initials + dropdown)
 *
 * Responsive breakpoints (tailwind.config.js):
 *   mobile  320px | tablet 768px | desktop 1440px
 */
function Header() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white"
    >
      <div
        className="
          mx-auto flex items-center justify-between
          px-5 py-3
          tablet:px-8 tablet:py-4
          desktop:max-w-[1440px] desktop:px-16
        "
      >
        <Logo />
        {isLoggedIn ? <UserLogo /> : <UserAuth />}
      </div>
    </header>
  );
}

export default Header;
