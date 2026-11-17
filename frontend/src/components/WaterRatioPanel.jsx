import { useEffect, useRef } from 'react';
import useWaterStore from '../store/waterStore';

/**
 * WaterRatioPanel — progress bar showing today's water intake vs daily norm (issue #10).
 *
 * Figma ref: «Home screen Tracker of water» — bottom-left panel.
 *   Structure confirmed from the view-only design file (2026-11-16):
 *   - Title: "Today" (blue)
 *   - Progress bar with a round knob at the current position (no % bubble in the design)
 *   - Markers 0% / 50% / 100% under the bar
 *   - "Add Water" button (circle-plus icon) to the right of the bar;
 *     full-width below the bar on mobile
 *   TODO-UNVERIFIED: exact pixel dimensions (bar height, knob size, paddings).
 */
function WaterRatioPanel({ onAddWater }) {
  const { percentage, isLoading, error, fetchToday } = useWaterStore();

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchToday();
    }
  }, [fetchToday]);

  // For the progress bar display, clamp to 0-100 visually but keep raw % in label.
  const displayPct = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="flex flex-col gap-4 rounded-[10px] border border-[#ECF2FF] bg-white px-5 py-4 shadow-[0px_4px_8px_0px_rgba(158,187,255,0.12)]">
      {/* Title */}
      <h2 className="font-roboto text-lg leading-6 text-primary">Today</h2>

      {/* Error state */}
      {error && (
        <p className="font-roboto text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {/* Bar + Add Water button */}
      <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:gap-6">
        <div className="flex-1">
          {/* Track with knob at the current position */}
          <div className="relative flex h-4 items-center">
            <div className="h-[10px] w-full rounded-[5px] bg-bg-light">
              {isLoading ? (
                <div className="h-full w-full animate-pulse rounded-[5px] bg-secondary/40" />
              ) : (
                <div
                  className="h-full rounded-[5px] bg-primary/60 transition-all duration-500"
                  style={{ width: `${displayPct}%` }}
                />
              )}
            </div>
            {!isLoading && (
              <>
                <div
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${percentage}% of daily water norm`}
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white transition-all duration-500"
                  style={{ left: `clamp(8px, ${displayPct}%, calc(100% - 8px))` }}
                />
              </>
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
        <button
          type="button"
          onClick={onAddWater}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-primary px-8 py-2.5 font-roboto text-base font-semibold leading-5 text-white transition-all hover:bg-accent hover:shadow-btn-hover active:scale-95 tablet:w-auto"
          aria-label="Add water"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 5.5v7M5.5 9h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add Water
        </button>
      </div>
    </div>
  );
}

export default WaterRatioPanel;
