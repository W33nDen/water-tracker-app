import { Link } from 'react-router-dom';
import iconHabitDrive from '../assets/icon-habit-drive.svg';
import iconViewStatistics from '../assets/icon-view-statistics.svg';
import iconPersonalRate from '../assets/icon-personal-rate.svg';

const BENEFITS = [
  { icon: iconHabitDrive, label: 'Habit drive' },
  { icon: iconViewStatistics, label: 'View statistics' },
  { icon: iconPersonalRate, label: 'Personal rate setting' },
];

/**
 * WaterConsumptionTracker — first WelcomePage block (issue #23, ТЗ «WelcomePage»).
 * Title, subtitle, Tracker Benefits and the "Try tracker" button → SignupPage.
 *
 * Figma «Welcome»:
 *   Desktop 1440: benefits in a column, button 384×44
 *   Tablet 768:   benefits in a row (240px columns), button 336×44
 *   Mobile 320:   benefits in a column, 32px icons, full-width button 36px tall
 */
function WaterConsumptionTracker() {
  return (
    <div className="desktop:w-[520px]">
      <h1 className="font-roboto text-[28px] font-bold leading-8 text-text tablet:text-[36px] tablet:leading-[42px]">
        Water consumption tracker
      </h1>
      <p className="mt-4 max-w-[264px] font-roboto text-2xl leading-[30px] text-text tablet:max-w-none tablet:text-[26px] tablet:leading-8">
        Record daily water intake and track
      </p>

      <h2 className="mt-6 font-roboto text-lg font-medium leading-5 text-text">Tracker Benefits</h2>
      <ul className="mt-3 flex flex-col gap-4 tablet:flex-row tablet:gap-0 desktop:flex-col desktop:gap-4">
        {BENEFITS.map(({ icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 tablet:w-[240px] tablet:last:w-auto desktop:w-auto"
          >
            <img src={icon} alt="" aria-hidden="true" className="h-8 w-8 flex-shrink-0 tablet:h-10 tablet:w-10" />
            <span className="font-roboto text-base leading-5 text-text">{label}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/signup"
        className="mt-6 flex w-full items-center justify-center rounded-[10px] bg-primary px-[30px] py-2 font-roboto text-base font-medium leading-5 text-white shadow-btn transition-shadow hover:shadow-btn-hover active:shadow-none tablet:w-[336px] tablet:py-2.5 tablet:text-lg tablet:leading-6 desktop:w-[384px]"
      >
        Try tracker
      </Link>
    </div>
  );
}

export default WaterConsumptionTracker;
