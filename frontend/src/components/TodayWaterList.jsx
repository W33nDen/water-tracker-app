import useWaterStore from '../store/waterStore';

/**
 * TodayWaterList — list of today's water intake records (issue #10).
 *
 * Figma ref: «Home screen Tracker of water» — Today block inside the right card.
 *   Structure/texts confirmed from the view-only design file (2026-11-16):
 *   - Title: "Today" (dark, bold)
 *   - Rows: glass icon + blue bold volume + dark time, separated by light dividers
 *   - Edit icon blue, delete icon red
 *   - "+ Add water" blue text entry below the list
 *   TODO-UNVERIFIED: exact pixel dimensions; the mockup's 12-hour AM/PM times
 *   (inconsistent in the design itself, e.g. "14:00 PM") — 24-hour format kept
 *   as an open product question.
 */
function TodayWaterList({ onEdit, onDelete, onAdd }) {
  const { records, isLoading } = useWaterStore();

  /**
   * Formats an ISO time string into HH:MM (local time of the stored time).
   * Records are stored in UTC; we display them as the browser's local time
   * so the shown time matches what the user entered.
   * NOTE: Figma shows 12-hour AM/PM; kept 24-hour pending product decision.
   */
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const addEntry = (
    <button
      type="button"
      onClick={onAdd}
      className="mt-1 flex items-center gap-2 self-start font-roboto text-base font-medium leading-5 text-primary transition-colors hover:text-accent"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Add water
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-[10px] border border-[#ECF2FF] bg-white px-5 py-4 shadow-[0px_4px_8px_0px_rgba(158,187,255,0.12)]">
        <h2 className="font-roboto text-2xl font-bold leading-8 text-text">Today</h2>
        <div className="flex justify-center py-4">
          <span className="animate-pulse font-roboto text-base leading-5 text-secondary">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-[#ECF2FF] bg-white px-5 py-4 shadow-[0px_4px_8px_0px_rgba(158,187,255,0.12)]">
      <h2 className="font-roboto text-2xl font-bold leading-8 text-text">Today</h2>

      {records.length === 0 ? (
        <p className="py-4 text-center font-roboto text-base leading-5 text-secondary">
          No notes yet
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-[#ECF2FF]">
          {records.map((record) => (
            <li
              key={record.id}
              className="flex items-center justify-between py-3"
            >
              {/* Glass icon + volume + time */}
              <div className="flex items-center gap-4">
                {/* Glass of water icon (inline SVG, per Figma) */}
                <svg
                  width="22"
                  height="28"
                  viewBox="0 0 22 28"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0 text-primary"
                >
                  <path
                    d="M3.5 1.5h15l-1.9 23.1a2.4 2.4 0 0 1-2.4 2.2H7.8a2.4 2.4 0 0 1-2.4-2.2L3.5 1.5z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.2 11h11.6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <circle cx="8.6" cy="16" r="0.9" fill="currentColor" />
                  <circle cx="12.4" cy="19.5" r="0.9" fill="currentColor" />
                  <circle cx="10.2" cy="23" r="0.9" fill="currentColor" />
                </svg>

                <span className="font-roboto text-lg font-bold leading-6 text-primary">
                  {record.volume} ml
                </span>
                <span className="font-roboto text-sm leading-[18px] text-text">
                  {formatTime(record.time)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                {/* Edit */}
                <button
                  type="button"
                  onClick={() => onEdit(record)}
                  className="text-primary transition-colors hover:text-accent"
                  aria-label={`Edit water record of ${record.volume} ml`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.333 13.333l-3.333.667.667-3.333L11.333 2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Delete (red, per Figma) */}
                <button
                  type="button"
                  onClick={() => onDelete(record.id)}
                  className="text-error transition-opacity hover:opacity-70"
                  aria-label={`Delete water record of ${record.volume} ml`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* "+ Add water" entry (per Figma, below the list) */}
      {addEntry}
    </div>
  );
}

export default TodayWaterList;
