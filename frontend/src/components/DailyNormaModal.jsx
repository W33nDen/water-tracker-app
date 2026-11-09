import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { dailyNormaSchema } from '../schemas/dailyNormaSchema';
import { updateWaterRateRequest } from '../services/usersApi';
import { getErrorMessage } from '../services/authApi';
import { inputClass, FieldError } from './FormField';

const sectionTitle = 'font-roboto text-lg font-medium leading-5 text-text';
const fieldLabel = 'font-roboto text-base leading-5 text-text';

/**
 * Calculates daily water requirement in liters according to formula:
 *   For women/girls: V = (M * 0.03) + (T * 0.4)
 *   For men:         V = (M * 0.04) + (T * 0.6)
 * M = body weight in kg, T = active sport time in hours.
 */
function calculateWaterRate(gender, weight, activityTime) {
  const toNum = (v) => Number(String(v ?? '').trim().replace(',', '.')) || 0;
  const m = toNum(weight);
  const t = toNum(activityTime);
  if (m <= 0) return 0;
  const factorM = gender === 'male' ? 0.04 : 0.03;
  const factorT = gender === 'male' ? 0.6 : 0.4;
  const result = m * factorM + t * factorT;
  return Math.round(result * 10) / 10;
}

/**
 * DailyNormaModal — modal dialog for calculating and editing daily water rate (issue #9).
 *
 * Figma ref: «Desktop / Tablet Pop-up (my daily norma)» #1059:28013 / #1059:31589
 *   Desktop 1440: 592px max-width, padding 32px 24px
 *   Tablet 768:   704px max-width, padding 32px 24px
 *   Mobile 320:   280px max-width, padding 24px 12px
 *
 * Behavior:
 *   • Closes on backdrop click, Escape key, or × button.
 *   • Background scroll is locked when open.
 *   • Dynamic calculation updates live on gender/weight/activity changes.
 *   • Save converts liters to milliliters and sends PATCH /api/users/water-rate.
 */
function DailyNormaModal({ onClose }) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const dialogRef = useRef(null);

  const currentLiters = ((user?.dailyNorma ?? 2000) / 1000).toFixed(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(dailyNormaSchema),
    defaultValues: {
      gender: user?.gender === 'male' ? 'male' : 'female',
      weight: '',
      activityTime: '',
      waterRate: currentLiters,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const watchedGender = watch('gender');
  const watchedWeight = watch('weight');
  const watchedActivityTime = watch('activityTime');

  const calculatedRate = calculateWaterRate(
    watchedGender,
    watchedWeight,
    watchedActivityTime
  );

  /* ── Escape key, focus trap, initial focus & restore ────────────────── */
  useEffect(() => {
    const previousFocus = document.activeElement;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusableSelector =
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(
          dialog.querySelectorAll(focusableSelector)
        ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialog.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialog.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previousFocus && typeof previousFocus.focus === 'function' && document.contains(previousFocus)) {
        previousFocus.focus();
      }
    };
  }, [onClose]);

  /* ── Form submission ─────────────────────────────────────────────────── */
  async function onSubmit(values) {
    // Convert liters to integer milliliters for backend storage (e.g. 2.5 L -> 2500 ml).
    // Rounded to nearest integer to avoid float precision issues.
    const dailyNormaMl = Math.round(Number(values.waterRate) * 1000);

    try {
      const updatedUser = await updateWaterRateRequest(dailyNormaMl);
      updateUser({ dailyNorma: updatedUser.dailyNorma });
      toast.success('Daily water rate updated');
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-black/80 px-5 py-10"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-testid="daily-norma-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-norma-title"
        tabIndex={-1}
        className="relative h-fit w-full max-w-[280px] rounded-[10px] bg-white px-3 py-6 outline-none tablet:max-w-[704px] tablet:px-6 tablet:py-8 desktop:my-auto desktop:max-w-[592px]"
      >
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="daily-norma-title"
            className="font-roboto text-[26px] font-medium leading-8 text-text"
          >
            My daily norma
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-primary transition-colors hover:text-accent cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* ── Formula explanation ── */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex flex-col gap-4 tablet:flex-row tablet:gap-6">
            <p className="flex items-center gap-1 font-roboto text-base leading-5 text-text">
              <span>For girl:</span>
              <span className="font-roboto text-lg leading-6 text-primary">
                V=(M*0,03) + (T*0,4)
              </span>
            </p>
            <p className="flex items-center gap-1 font-roboto text-base leading-5 text-text">
              <span>For man:</span>
              <span className="font-roboto text-lg leading-6 text-primary">
                V=(M*0,04) + (T*0,6)
              </span>
            </p>
          </div>

          <div className="rounded-[10px] border border-divider p-2.5">
            <p className="font-roboto text-xs leading-4 text-[#8F8F8F]">
              <span className="text-primary">*</span> V is the volume of the water norm in liters per day, M is your body weight, T is the time of active sports, or another type of activity commensurate in terms of loads (in the absence of these, you must set 0)
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
          {/* Calculate your rate */}
          <div className="flex flex-col gap-4">
            <h3 className={sectionTitle}>Calculate your rate:</h3>

            {/* Gender radio */}
            <div className="flex gap-6">
              {[
                { value: 'female', label: 'For woman' },
                { value: 'male', label: 'For man' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 font-roboto text-base leading-5 text-text"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('gender')}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="flex h-[14px] w-[14px] items-center justify-center rounded-full border border-primary after:h-[6px] after:w-[6px] after:rounded-full after:bg-primary after:opacity-0 peer-checked:after:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-secondary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* Weight input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="weight" className={fieldLabel}>
                Your weight in kilograms:
              </label>
              <input
                id="weight"
                type="text"
                inputMode="decimal"
                placeholder="0"
                aria-invalid={errors.weight ? 'true' : 'false'}
                aria-describedby={errors.weight ? 'weight-error' : undefined}
                className={inputClass(Boolean(errors.weight))}
                {...register('weight')}
              />
              <FieldError id="weight-error" message={errors.weight?.message} />
            </div>

            {/* Activity time input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="activityTime" className={fieldLabel}>
                The time of active participation in sports or other activities with a high physical. load in hours:
              </label>
              <input
                id="activityTime"
                type="text"
                inputMode="decimal"
                placeholder="0"
                aria-invalid={errors.activityTime ? 'true' : 'false'}
                aria-describedby={errors.activityTime ? 'activityTime-error' : undefined}
                className={inputClass(Boolean(errors.activityTime))}
                {...register('activityTime')}
              />
              <FieldError id="activityTime-error" message={errors.activityTime?.message} />
            </div>

            {/* Calculated required amount */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={fieldLabel}>
                The required amount of water in liters per day:
              </span>
              <span
                className="font-roboto text-lg font-bold leading-6 text-primary"
                data-testid="calculated-rate"
              >
                {calculatedRate > 0 ? `${calculatedRate.toFixed(1)} L` : '0 L'}
              </span>
            </div>
          </div>

          {/* Planned water intake input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="waterRate" className={sectionTitle}>
              Write down how much water you will drink:
            </label>
            <input
              id="waterRate"
              type="text"
              inputMode="decimal"
              placeholder="0"
              aria-invalid={errors.waterRate ? 'true' : 'false'}
              aria-describedby={errors.waterRate ? 'waterRate-error' : undefined}
              className={inputClass(Boolean(errors.waterRate))}
              {...register('waterRate')}
            />
            <FieldError id="waterRate-error" message={errors.waterRate?.message} />
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-[10px] bg-primary px-[30px] py-2 font-roboto text-base font-medium leading-5 text-white shadow-btn transition-shadow hover:shadow-btn-hover active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 tablet:w-[160px] tablet:py-2.5 tablet:text-lg tablet:leading-6 cursor-pointer"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default DailyNormaModal;

