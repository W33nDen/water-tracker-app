import WaterConsumptionTracker from '../components/WaterConsumptionTracker';
import WhyDrinkWater from '../components/WhyDrinkWater';
import bgDesktop from '../assets/bg-welcome-desktop.svg';
import bgTablet from '../assets/bg-welcome-tablet.svg';
import bgMobile from '../assets/bg-welcome-mobile.svg';

/**
 * WelcomePage /welcome (issue #23, ТЗ «WelcomePage»).
 * Two blocks — WaterConsumptionTracker and WhyDrinkWater — over the Figma
 * background (waves, bubbles, bottle). Backgrounds are exported from the Figma
 * frames per breakpoint and anchored to the bottom of the page.
 * min-height = viewport minus header (header is 73px on mobile/desktop, 81px on tablet).
 *
 *   Desktop 1440: blocks side by side
 *   Tablet 768 / Mobile 320: blocks stacked
 */
function WelcomePage() {
  return (
    <section className="relative min-h-[calc(100vh-73px)] overflow-hidden tablet:min-h-[calc(100vh-81px)] desktop:min-h-[calc(100vh-73px)]">
      {/* Background art — decorative */}
      <img src={bgMobile} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 w-full select-none tablet:hidden" />
      <img src={bgTablet} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 hidden w-full select-none tablet:block desktop:hidden" />
      <img src={bgDesktop} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 hidden w-full select-none desktop:block" />

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-10 px-5 pb-10 pt-4 tablet:gap-[60px] tablet:px-8 tablet:pb-[50px] tablet:pt-6 desktop:flex-row desktop:gap-0 desktop:pb-10 desktop:pl-[216px] desktop:pr-0 desktop:pt-[68px]">
        <WaterConsumptionTracker />
        <div className="desktop:mt-[34px]">
          <WhyDrinkWater />
        </div>
      </div>
    </section>
  );
}

export default WelcomePage;
