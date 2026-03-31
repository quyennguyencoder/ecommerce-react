import type { UserResponse, UserUpdateRequest } from '../../types';

type ProfileInfoProps = {
  user: UserResponse;
  isEditing?: boolean;
  draft?: UserUpdateRequest | null;
  isSaving?: boolean;
  saveError?: string;
  saveSuccess?: string;
  fieldErrors?: Partial<Record<keyof UserUpdateRequest, string>>;
  onChange?: (field: keyof UserUpdateRequest, value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
};

const formatDate = (value?: string) => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const renderValue = (value?: string) =>
  value && value.trim().length > 0 ? value : '—';

const getInputClassName = (hasError?: boolean) =>
  `mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 ${
    hasError
      ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
      : 'border-slate-200 focus:border-indigo-300 focus:ring-indigo-100'
  }`;

export default function ProfileInfo({
  user,
  isEditing = false,
  draft,
  isSaving = false,
  saveError,
  saveSuccess,
  fieldErrors,
  onChange,
  onSave,
  onCancel,
}: ProfileInfoProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
      <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
      {isEditing && draft ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Full name
                <input
                  value={draft.name ?? ''}
                  onChange={(event) => onChange?.('name', event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors?.name))}
                  placeholder="Your name"
                  aria-invalid={Boolean(fieldErrors?.name)}
                />
              </label>
              {fieldErrors?.name ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Email
                <input
                  type="email"
                  value={draft.email ?? ''}
                  onChange={(event) => onChange?.('email', event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors?.email))}
                  placeholder="Email"
                  aria-invalid={Boolean(fieldErrors?.email)}
                />
              </label>
              {fieldErrors?.email ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Phone
                <input
                  type="tel"
                  value={draft.phone ?? ''}
                  onChange={(event) => onChange?.('phone', event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors?.phone))}
                  placeholder="Phone"
                  aria-invalid={Boolean(fieldErrors?.phone)}
                />
              </label>
              {fieldErrors?.phone ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.phone}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Date of birth
                <input
                  type="date"
                  value={draft.dob ?? ''}
                  onChange={(event) => onChange?.('dob', event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors?.dob))}
                  aria-invalid={Boolean(fieldErrors?.dob)}
                />
              </label>
              {fieldErrors?.dob ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.dob}</p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                Address
                <input
                  value={draft.address ?? ''}
                  onChange={(event) => onChange?.('address', event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors?.address))}
                  placeholder="Address"
                  aria-invalid={Boolean(fieldErrors?.address)}
                />
              </label>
              {fieldErrors?.address ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.address}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
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
              <span className="text-xs font-medium text-rose-600">
                {saveError}
              </span>
            ) : saveSuccess ? (
              <span className="text-xs font-medium text-emerald-600">
                {saveSuccess}
              </span>
            ) : null}
          </div>
        </>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Full name</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {renderValue(user.name)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {renderValue(user.email)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Phone</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {renderValue(user.phone)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Date of birth</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {formatDate(user.dob)}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">Address</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {renderValue(user.address)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
