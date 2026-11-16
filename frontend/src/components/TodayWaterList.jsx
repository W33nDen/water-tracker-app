import useWaterStore from '../store/waterStore';

/**
 * TodayWaterList — list of today's water intake records.
 *
 * Figma ref: «Home screen Tracker of water» — TodayWaterList block (TODO-UNVERIFIED: exact dimensions/paddings unverified due to Figma 429 rate limit)
 *   Title: "Today's water" — Medium 18px/24px #2F2F2F
 *   Item background: #FFFFFF, border 1px #ECF2FF, border-radius 10px (TODO-UNVERIFIED)
 *   Item volume: Bold 24px/24px #407BFF
 *   Item time: Regular 16px/20px #2F2F2F
 *   Edit/Delete icons: 16×16px, color #407BFF, hover #FF9D43 (TODO-UNVERIFIED)
 *   "No notes yet": Regular 16px/20px #9EBBFF, centered
 */
function TodayWaterList({ onEdit, onDelete }) {
  const { records, isLoading } = useWaterStore();

  /**
   * Formats an ISO time string into HH:MM (local time of the stored time).
   * Records are stored in UTC; we display them as the browser's local time
   * so the shown time matches what the user entered.
   */
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-[10px] border border-[#ECF2FF] bg-white px-5 py-4 shadow-[0px_4px_8px_0px_rgba(158,187,255,0.12)]">
        <h2 className="font-roboto text-lg font-medium leading-6 text-text">Today's water</h2>
        <div className="flex justify-center py-4">
          <span className="animate-pulse font-roboto text-base leading-5 text-secondary">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-[#ECF2FF] bg-white px-5 py-4 shadow-[0px_4px_8px_0px_rgba(158,187,255,0.12)]">
      <h2 className="font-roboto text-lg font-medium leading-6 text-text">Today's water</h2>

      {records.length === 0 ? (
        <p className="py-4 text-center font-roboto text-base leading-5 text-secondary">
          No notes yet
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {records.map((record) => (
            <li
              key={record.id}
              className="flex items-center justify-between rounded-[10px] border border-[#ECF2FF] px-4 py-3"
            >
              {/* Volume + time */}
              <div className="flex items-end gap-3">
                {/* Water drop icon (inline SVG) */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0 text-primary"
                >
                  <path
                    d="M10 2C10 2 4 8.5 4 12.5C4 15.538 6.686 18 10 18C13.314 18 16 15.538 16 12.5C16 8.5 10 2 10 2Z"
                    fill="currentColor"
                  />
                </svg>

                <span className="font-roboto text-2xl font-bold leading-6 text-primary">
                  {record.volume} ml
                </span>
                <span className="font-roboto text-base leading-5 text-text">
                  {formatTime(record.time)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
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

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onDelete(record.id)}
                  className="text-primary transition-colors hover:text-error"
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
    </div>
  );
}

export default TodayWaterList;
