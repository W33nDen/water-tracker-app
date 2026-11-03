import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { settingsSchema } from '../schemas/settingsSchema';
import { updateAvatarRequest, updateProfileRequest } from '../services/usersApi';
import { getErrorMessage } from '../services/authApi';
import { getInitial } from '../utils/getInitial';
import FormField from './FormField';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // keep in sync with backend/src/middlewares/upload.js
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const sectionTitle = 'font-roboto text-lg font-medium leading-5 text-text';
const smallLabel = 'font-roboto text-base leading-5 text-text';

/**
 * SettingModal — edit profile (issue #8).
 * Figma «Setting» modal:
 *   Desktop 1440: 1008px wide, two columns (gender / name / email | password)
 *   Tablet 768:   704px, one column
 *   Mobile 320:   280px, one column
 *
 * • Photo upload sends the file immediately and updates the header avatar.
 * • Save sends only the fields that changed. Success → modal closes; error → toast.
 * • Closes on backdrop click, the × button or Escape.
 */
function SettingModal({ onClose }) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);

  const initialValues = {
    gender: user?.gender === 'male' ? 'male' : 'female',
    name: user?.name ?? '',
    email: user?.email ?? '',
    oldPassword: '',
    password: '',
    repeatPassword: '',
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(settingsSchema),
    defaultValues: initialValues,
    // Validate on Save, then live while correcting. Validating on blur would insert
    // error messages under the cursor and shift the Save button mid-click.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  /* ── Escape, scroll lock, initial focus ─────────────────────────────── */
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  /* ── Avatar upload (immediate) ──────────────────────────────────────── */
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, WEBP or GIF images are allowed');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('File is too large (max 5 MB)');
      return;
    }

    setIsUploading(true);
    try {
      const { avatarUrl } = await updateAvatarRequest(file);
      updateUser({ avatarUrl });
      toast.success('Photo updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  /* ── Save ───────────────────────────────────────────────────────────── */
  async function onSubmit(values) {
    const changes = {};
    if (values.gender !== initialValues.gender) changes.gender = values.gender;
    if ((values.name ?? '') !== initialValues.name) changes.name = values.name ?? '';
    if (values.email.toLowerCase() !== initialValues.email.toLowerCase()) changes.email = values.email;
    if (values.password) {
      changes.oldPassword = values.oldPassword;
      changes.password = values.password;
    }

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      const updated = await updateProfileRequest(changes);
      updateUser(updated);
      toast.success('Profile updated');
      onClose();
    } catch (error) {
      const message = getErrorMessage(error);
      if (message === 'Outdated password is wrong') {
        setError('oldPassword', { message });
      } else if (message === 'Email in use') {
        setError('email', { message });
      }
      toast.error(message);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-black/80 px-5 py-10"
      onMouseDown={(e) => {
        // Backdrop only — a drag that starts inside the dialog must not close it
        if (e.target === e.currentTarget) onClose();
      }}
      data-testid="setting-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="setting-title"
        tabIndex={-1}
        className="relative h-fit w-full max-w-[280px] rounded-[10px] bg-white px-3 py-8 outline-none tablet:max-w-[704px] tablet:px-6 desktop:my-auto desktop:max-w-[1008px]"
      >
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <h2 id="setting-title" className="font-roboto text-[26px] font-medium leading-8 text-text">
            Setting
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="text-primary transition-colors hover:text-accent"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Photo ── */}
        <section className="mb-6">
          <h3 className={`${sectionTitle} mb-2`}>Your photo</h3>
          <div className="flex items-center gap-2">
            <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Your avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="font-roboto text-[28px] font-medium text-white">{getInitial(user)}</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 font-roboto text-sm font-medium leading-[18px] text-primary transition-colors hover:text-accent disabled:cursor-wait disabled:opacity-60"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isUploading ? 'Uploading…' : 'Upload a photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_TYPES.join(',')}
              onChange={handleFileChange}
              className="hidden"
              data-testid="avatar-input"
            />
          </div>
        </section>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-6 desktop:flex-row desktop:gap-6">
            {/* Left column */}
            <div className="flex flex-col gap-6 tablet:w-[392px]">
              <fieldset className="desktop:mb-7">
                <legend className={`${sectionTitle} mb-3`}>Your gender identity</legend>
                <div className="flex gap-6">
                  {[
                    { value: 'female', label: 'Woman' },
                    { value: 'male', label: 'Man' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex cursor-pointer items-center gap-2 font-roboto text-base leading-5 text-text">
                      <input type="radio" value={opt.value} {...register('gender')} className="peer sr-only" />
                      {/* Figma radio: 14px blue ring, 6px blue dot when selected */}
                      <span
                        aria-hidden="true"
                        className="flex h-[14px] w-[14px] items-center justify-center rounded-full border border-primary after:h-[6px] after:w-[6px] after:rounded-full after:bg-primary after:opacity-0 peer-checked:after:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-secondary"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <FormField
                id="setting-name"
                label="Your name"
                placeholder="Name"
                autoComplete="name"
                error={errors.name}
                registration={register('name')}
                labelClassName={sectionTitle}
              />
              <FormField
                id="setting-email"
                label="E-mail"
                type="email"
                placeholder="E-mail"
                autoComplete="email"
                error={errors.email}
                registration={register('email')}
                labelClassName={sectionTitle}
              />
            </div>

            {/* Right column — password */}
            <div className="flex flex-col gap-3 tablet:w-[392px]">
              <h3 className={sectionTitle}>Password</h3>
              <FormField
                id="setting-old-password"
                label="Outdated password:"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                error={errors.oldPassword}
                registration={register('oldPassword')}
                labelClassName={smallLabel}
              />
              <FormField
                id="setting-new-password"
                label="New Password:"
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                error={errors.password}
                registration={register('password')}
                labelClassName={smallLabel}
              />
              <FormField
                id="setting-repeat-password"
                label="Repeat new password:"
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                error={errors.repeatPassword}
                registration={register('repeatPassword')}
                labelClassName={smallLabel}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full rounded-[10px] bg-primary px-[30px] py-2 font-roboto text-base font-medium leading-5 text-white shadow-btn transition-shadow hover:shadow-btn-hover active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 tablet:w-[160px] tablet:py-2.5 tablet:text-lg tablet:leading-6"
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

export default SettingModal;
