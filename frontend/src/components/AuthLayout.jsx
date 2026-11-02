import bottleSignin from '../assets/bottle-signin.svg';
import bgSignin from '../assets/bg-signin.svg';

/**
 * AuthLayout — background + bottle illustration shared by /signin and /signup
 * (Figma «Tracker of water Sign In / Sign Up»).
 *   Desktop 1440: bottle on the left, form on the right
 *   Tablet 768:   form on the left, bottle on the right
 *   Mobile 320:   form on top, bottle underneath
 */
function AuthLayout({ children }) {
  return (
    <div className="relative min-h-[calc(100vh-73px)] w-full overflow-hidden bg-white">
      <img
        src={bgSignin}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-6 w-full max-w-[1404px] -translate-x-1/2 select-none object-cover opacity-60 desktop:top-10 desktop:opacity-100"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-[1440px] flex-col items-center justify-start px-5 pt-6 pb-10 tablet:flex-row tablet:items-start tablet:justify-between tablet:px-8 tablet:pt-10 desktop:items-center desktop:px-28 desktop:py-12">
        {/* Form container: Mobile (top), Tablet (left), Desktop (right) */}
        <div className="relative z-20 w-full max-w-[280px] tablet:max-w-[336px] desktop:max-w-[384px] order-1 tablet:order-1 desktop:order-2 desktop:ml-auto">
          {children}
        </div>

        {/* Bottle illustration: Mobile (bottom, under form), Tablet (right), Desktop (left) */}
        <div className="relative z-10 flex order-2 tablet:order-2 desktop:order-1 mt-10 tablet:mt-0 tablet:flex-1 tablet:justify-end desktop:justify-start">
          <img
            src={bottleSignin}
            alt="Bottle of water"
            className="w-[280px] h-[210px] tablet:w-[450px] tablet:h-auto tablet:max-w-none desktop:w-full desktop:max-w-[738px] select-none object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
