import bottleSignin from '../assets/bottle-signin.svg';
import bgSignin from '../assets/bg-signin.svg';

/**
 * AuthLayout — background + bottle illustration shared by /signin and /signup
 * (Figma «Tracker of water Sign In / Sign Up»).
 *   Desktop 1440: bottle on the left, form on the right
 *   Tablet / mobile: form only, centred, bubbles in the background
 */
function AuthLayout({ children }) {
  return (
    <div className="relative min-h-[calc(100vh-73px)] w-full overflow-hidden bg-white">
      <img
        src={bgSignin}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 w-full max-w-[1404px] -translate-x-1/2 select-none object-cover opacity-60 desktop:opacity-100"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-[1440px] flex-col items-center justify-center px-5 py-10 tablet:px-8 desktop:flex-row desktop:justify-between desktop:px-28 desktop:py-12">
        <div className="relative z-10 hidden flex-1 items-center justify-center desktop:flex">
          <img
            src={bottleSignin}
            alt="Bottle of water"
            className="w-full max-w-[738px] select-none object-contain"
          />
        </div>

        <div className="relative z-20 w-full max-w-[384px] desktop:ml-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
