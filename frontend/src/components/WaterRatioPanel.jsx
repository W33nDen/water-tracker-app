import { useEffect, useRef } from 'react';
import useWaterStore from '../store/waterStore';
import useAuthStore from '../store/authStore';

/**
 * WaterRatioPanel — progress bar showing today's water intake vs daily norm.
 *
 * Figma ref: «Home screen Tracker of water» — WaterRatioPanel block (TODO-UNVERIFIED: exact dimensions/paddings unverified due to Figma 429 rate limit)
 *   Background: #FFFFFF
 *   Border: 1px solid #ECF2FF, border-radius: 10px (TODO-UNVERIFIED)
 *   Box shadow: 0px 4px 8px 0px rgba(158, 187, 255, 0.12) (TODO-UNVERIFIED)
 *   Title: "Today" — Medium 18px/24px #2F2F2F
 *   Progress bar: 10px tall, bg-track #ECF2FF, fill #407BFF, border-radius 5px (TODO-UNVERIFIED)
 *   Percent label (bubble): 10px × 10px white circle above bar track (Roboto Regular 16px/20px) (TODO-UNVERIFIED)
 *   Markers: 0%, 50%, 100% — Regular 12px/16px #9EBBFF
 *   "Add water" button: filled #407BFF, Roboto SemiBold 16px/20px #FFFFFF, border-radius 10px, px-8 py-2 (TODO-UNVERIFIED)
 */
function WaterRatioPanel({ onAddWater }) {
  const { records, percentage, isLoading, error, fetchToday } = useWaterStore();
  const user = useAuthStore((s) => s.user);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchToday();
    }
  }, [fetchToday]);

  // For the progress bar display, clamp to 0-100 visually but keep raw % in label.
  const displayPct = Math.min(Math.max(percentage, 0), 100);

  const normaLiters = ((user?.dailyNorma ?? 2000) / 1000).toFixed(1);

  return (
    <div className="flex flex-col gap-4 rounded-[10px] border border-[#ECF2FF] bg-white px-5 py-4 shadow-[0px_4px_8px_0px_rgba(158,187,255,0.12)]">
      {/* Title */}
      <h2 className="font-roboto text-lg font-medium leading-6 text-text">Today</h2>

      {/* Error state */}
      {error && (
        <p className="font-roboto text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {/* Progress track with dedicated clearance for the percentage bubble */}
      <div className="relative pt-8 pb-1">
        {/* Bubble showing percentage above the fill handle */}
        <div
          className="pointer-events-none absolute top-0 flex -translate-x-1/2 flex-col items-center transition-all duration-300"
          style={{ left: `clamp(20px, ${displayPct}%, calc(100% - 20px))` }}
          aria-hidden="true"
        >
          <span className="rounded-full bg-white px-2 py-0.5 font-roboto text-sm font-medium leading-5 text-text shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">
            {percentage}%
          </span>
          {/* Small triangle pointer */}
          <span
            className="mt-0.5 h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
          />
        </div>

        {/* Track */}
        <div className="h-[10px] w-full overflow-hidden rounded-[5px] bg-[#ECF2FF]">
          {isLoading ? (
            <div className="h-full w-full animate-pulse bg-secondary/40" />
          ) : (
            <div
              className="h-full rounded-[5px] bg-primary transition-all duration-500"
              style={{ width: `${displayPct}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${percentage}% of daily water norm`}
            />
          )}
        </div>

        {/* Markers */}
        <div className="mt-1 flex justify-between font-roboto text-xs leading-4 text-secondary">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Add water button */}
      <div className="flex items-center justify-between gap-2">
        <p className="font-roboto text-sm leading-[18px] text-secondary">
          Daily norm:{' '}
          <span className="whitespace-nowrap font-medium text-primary">
            {normaLiters}&nbsp;L
          </span>
        </p>
        <button
          type="button"
          onClick={onAddWater}
          className="shrink-0 rounded-[10px] bg-primary px-6 py-2 font-roboto text-base font-semibold leading-5 text-white transition-all hover:bg-accent hover:shadow-btn-hover active:scale-95 tablet:px-8"
          aria-label="Add water"
        >
          + Add water
        </button>
      </div>

      {/* Volume summary */}
      {!isLoading && (
        <p className="font-roboto text-xs leading-4 text-secondary">
          {records.reduce((s, r) => s + r.volume, 0)} ml consumed today
        </p>
      )}
    </div>
  );
}

export default WaterRatioPanel;
