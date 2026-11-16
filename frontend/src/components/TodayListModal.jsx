import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useWaterStore from '../store/waterStore';
import { inputClass, FieldError } from './FormField';

/**
 * TodayListModal — modal dialog for adding or editing a water record (issue #10).
 *
 * Figma ref: «Home Pop-up (add water)» / «Home Pop-up (edit water)»
 *   Desktop/Tablet: 592px max-width, padding 32px 24px, border-radius 10px (TODO-UNVERIFIED: unconfirmed from Figma due to 429 rate limit)
 *   Mobile:         calc(100vw - 40px) max-width, padding 24px 12px (TODO-UNVERIFIED: unconfirmed from Figma due to 429 rate limit)
 *   Title (add):    "Add water"  — Bold 26px/32px #2F2F2F
 *   Title (edit):   "Edit the entered amount of water" — Bold 26px/32px #2F2F2F
 *   Volume section: "Amount of water" — Medium 18px/24px #2F2F2F
 *   Volume display: big blue number "250 ml" — Bold 24px/24px #407BFF
 *   +/- buttons:    40×40px, circle, border 1px #407BFF, icon color #407BFF (TODO-UNVERIFIED: unconfirmed from Figma)
 *   Volume step:    50 ml (TODO-UNVERIFIED: step not specified in issue #10; unconfirmed from Figma due to 429 rate limit)
 *   Time field:     "Recording time" label — Medium 18px/24px #2F2F2F
 *                   input type="time" with 5-minute step (step=300s)
 *   Save button:    filled #407BFF, Roboto SemiBold 16px/20px, border-radius 10px, full-width
 *   Cancel button:  text link, Roboto Regular 16px/20px #407BFF, hover #FF9D43
 */

// TODO-UNVERIFIED: 50 ml step is an unverified assumption pending Figma rate limit reset
const VOLUME_STEP = 50;    // ml
const VOLUME_MIN  = 1;
const VOLUME_MAX  = 5000;
const TIME_STEP   = 300;   // 5 minutes in seconds

/** Returns "HH:MM" string from a Date or ISO string */
function toTimeInputValue(dateOrISO) {
  const d = dateOrISO ? new Date(dateOrISO) : new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Converts "HH:MM" time input value to a full ISO string (today's date) */
function timeInputToISO(timeStr, baseDate = null) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = baseDate ? new Date(baseDate) : new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function TodayListModal({ mode = 'add', initialRecord = null, onClose }) {
  const { add, update } = useWaterStore();

  const isEdit = mode === 'edit';

  // Form state
  const [volume, setVolume] = useState(
    isEdit && initialRecord ? initialRecord.volume : 250
  );
  const [timeValue, setTimeValue] = useState(
    isEdit && initialRecord
      ? toTimeInputValue(initialRecord.time)
      : toTimeInputValue(null)
  );
  const [volumeError, setVolumeError] = useState('');
  const [timeError,   setTimeError]   = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSaving,    setIsSaving]    = useState(false);

  const dialogRef   = useRef(null);
  const openerRef   = useRef(document.activeElement);
  const volumeInputRef = useRef(null);

  /* ── Escape key / focus trap / body scroll lock ───────────────────────── */
  useEffect(() => {
    const prevFocus = openerRef.current;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const sel =
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const els = Array.from(dialog.querySelectorAll(sel)).filter(
          (el) => el.offsetParent !== null || el.getClientRects().length > 0
        );
        if (!els.length) { e.preventDefault(); return; }
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !dialog.contains(document.activeElement)) {
            e.preventDefault(); last.focus();
          }
        } else {
          if (document.activeElement === last || !dialog.contains(document.activeElement)) {
            e.preventDefault(); first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Initial focus on the volume input
    volumeInputRef.current?.focus({ preventScroll: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (prevFocus && typeof prevFocus.focus === 'function' && document.contains(prevFocus)) {
        prevFocus.focus();
      }
    };
  }, [onClose]);

  /* ── Volume helpers ───────────────────────────────────────────────────── */
  const decrement = () => {
    setVolumeError('');
    setVolume((v) => Math.max(VOLUME_MIN, v - VOLUME_STEP));
  };
  const increment = () => {
    setVolumeError('');
    setVolume((v) => Math.min(VOLUME_MAX, v + VOLUME_STEP));
  };

  const handleVolumeInput = (e) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    setVolumeError('');
    if (raw === '') {
      setVolume('');
      return;
    }
    if (isNaN(parsed)) {
      setVolumeError('Enter a valid whole number');
      return;
    }
    setVolume(parsed);
  };

  /* ── Validation ───────────────────────────────────────────────────────── */
  function validate() {
    let valid = true;
    setVolumeError('');
    setTimeError('');

    const vol = Number(volume);
    if (!Number.isInteger(vol) || vol < VOLUME_MIN || vol > VOLUME_MAX) {
      setVolumeError(`Enter a whole number between ${VOLUME_MIN} and ${VOLUME_MAX} ml`);
      valid = false;
    }

    if (!timeValue) {
      setTimeError('Recording time is required');
      valid = false;
    }

    return valid;
  }

  /* ── Submit ───────────────────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (isSaving) return;

    setSubmitError('');
    setIsSaving(true);
    try {
      const payload = {
        volume: Number(volume),
        time: timeInputToISO(timeValue, isEdit ? initialRecord?.time : null),
      };
      if (isEdit) {
        await update(initialRecord.id, payload);
      } else {
        await add(payload);
      }
      onClose();
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || err?.message || 'Failed to save. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  const title = isEdit ? 'Edit the entered amount of water' : 'Add water';
  const btnIconAriaDecrement = 'Decrease volume by 50 ml';
  const btnIconAriaIncrement = 'Increase volume by 50 ml';

  /* ── Render ───────────────────────────────────────────────────────────── */
  return createPortal(
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="water-modal-title"
        tabIndex={-1}
        className="relative max-h-[calc(100vh-40px)] w-full max-w-[280px] overflow-y-auto rounded-[10px] bg-white p-6 shadow-xl animate-modal-in
                   tablet:max-w-[592px] tablet:px-6 tablet:py-8
                   desktop:max-w-[592px]"
      >
        {/* Close × */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text transition-colors hover:text-accent"
          aria-label="Close modal"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M12 4L4 12M4 4l8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Title */}
        <h2
          id="water-modal-title"
          className="mb-6 font-roboto text-[26px] font-bold leading-8 text-text"
        >
          {title}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Volume section ──────────────────────────────── */}
          <div className="mb-6 flex flex-col gap-4">
            <h3 className="font-roboto text-lg font-medium leading-6 text-text">
              Amount of water
            </h3>

            {/* Volume stepper */}
            <div className="flex items-center gap-4">
              {/* − button */}
              <button
                type="button"
                onClick={decrement}
                disabled={Number(volume) <= VOLUME_MIN}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={btnIconAriaDecrement}
              >
                <svg width="16" height="2" viewBox="0 0 16 2" fill="none" aria-hidden="true">
                  <path d="M1 1h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Volume display */}
              <span
                className="font-roboto text-2xl font-bold leading-6 text-primary"
                aria-live="polite"
                aria-atomic="true"
              >
                {volume} ml
              </span>

              {/* + button */}
              <button
                type="button"
                onClick={increment}
                disabled={Number(volume) >= VOLUME_MAX}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={btnIconAriaIncrement}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M8 1v14M1 8h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Manual volume input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="water-volume" className="font-roboto text-base leading-5 text-text">
                Enter the value
              </label>
              <input
                ref={volumeInputRef}
                id="water-volume"
                type="number"
                min={VOLUME_MIN}
                max={VOLUME_MAX}
                step={1}
                value={volume}
                onChange={handleVolumeInput}
                className={inputClass(Boolean(volumeError))}
                aria-invalid={Boolean(volumeError)}
                aria-describedby={volumeError ? 'volume-error' : undefined}
              />
              <FieldError id="volume-error" message={volumeError} />
            </div>
          </div>

          {/* ── Time section ─────────────────────────────────── */}
          <div className="mb-6 flex flex-col gap-2">
            <h3 className="font-roboto text-lg font-medium leading-6 text-text">
              Recording time
            </h3>
            <input
              id="water-time"
              type="time"
              step={TIME_STEP}
              value={timeValue}
              onChange={(e) => { setTimeError(''); setTimeValue(e.target.value); }}
              className={inputClass(Boolean(timeError))}
              aria-invalid={Boolean(timeError)}
              aria-describedby={timeError ? 'time-error' : undefined}
            />
            <FieldError id="time-error" message={timeError} />
          </div>

          {/* Submit error */}
          {submitError && (
            <p role="alert" className="mb-4 font-roboto text-sm text-error">
              {submitError}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 tablet:flex-row-reverse tablet:gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-[10px] bg-primary py-3 font-roboto text-base font-semibold leading-5 text-white shadow-btn transition-all hover:bg-accent hover:shadow-btn-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 tablet:flex-1"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-full py-3 font-roboto text-base leading-5 text-primary transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 tablet:flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default TodayListModal;
