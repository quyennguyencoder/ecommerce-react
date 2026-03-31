import { useState } from 'react';

import type { UserChangePasswordRequest } from '../../types';

type ProfileChangePasswordProps = {
  isOpen?: boolean;
  value: UserChangePasswordRequest;
  errors?: Partial<Record<keyof UserChangePasswordRequest, string>>;
  isSaving?: boolean;
  saveError?: string;
  onChange?: (field: keyof UserChangePasswordRequest, value: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
};

const getInputClassName = (hasError?: boolean) =>
  `mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 ${
    hasError
      ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
      : 'border-slate-200 focus:border-indigo-300 focus:ring-indigo-100'
  }`;

export default function ProfileChangePassword({
  isOpen = false,
  value,
  errors,
  isSaving = false,
  saveError,
  onChange,
  onSubmit,
  onCancel,
}: ProfileChangePasswordProps) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
      <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Current password
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={value.oldPassword}
                onChange={(event) => onChange?.('oldPassword', event.target.value)}
                className={getInputClassName(Boolean(errors?.oldPassword))}
                placeholder="Current password"
                aria-invalid={Boolean(errors?.oldPassword)}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
              >
                {showOldPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>
          {errors?.oldPassword ? (
            <p className="mt-1 text-xs text-rose-600">{errors.oldPassword}</p>
          ) : null}
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-400">
            New password
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={value.newPassword}
                onChange={(event) => onChange?.('newPassword', event.target.value)}
                className={getInputClassName(Boolean(errors?.newPassword))}
                placeholder="New password"
                aria-invalid={Boolean(errors?.newPassword)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>
          {errors?.newPassword ? (
            <p className="mt-1 text-xs text-rose-600">{errors.newPassword}</p>
          ) : null}
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Confirm password
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={value.confirmPassword}
                onChange={(event) => onChange?.('confirmPassword', event.target.value)}
                className={getInputClassName(Boolean(errors?.confirmPassword))}
                placeholder="Confirm password"
                aria-invalid={Boolean(errors?.confirmPassword)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>
          {errors?.confirmPassword ? (
            <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSaving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isSaving ? 'Saving...' : 'Update Password'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Cancel
        </button>
        {saveError ? (
          <span className="text-xs font-medium text-rose-600">{saveError}</span>
        ) : null}
      </div>
    </section>
  );
}
