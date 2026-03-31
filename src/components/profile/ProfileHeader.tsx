import type { ChangeEvent } from 'react';

import type { UserResponse } from '../../types';

type ProfileHeaderProps = {
  user: UserResponse;
  avatarUrl?: string | null;
  isUploading?: boolean;
  uploadError?: string;
  uploadSuccess?: string;
  onAvatarChange?: (file: File) => void;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) {
    return 'U';
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

export default function ProfileHeader({
  user,
  avatarUrl,
  isUploading = false,
  uploadError,
  uploadSuccess,
  onAvatarChange,
}: ProfileHeaderProps) {
  const initials = getInitials(user.name || 'User');
  const displayAvatar = avatarUrl || user.avatar;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
    event.target.value = '';
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email || user.phone}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? 'Uploading...' : 'Update Avatar'}
            </label>
            {uploadError ? (
              <span className="text-xs font-medium text-rose-600">
                {uploadError}
              </span>
            ) : uploadSuccess ? (
              <span className="text-xs font-medium text-emerald-600">
                {uploadSuccess}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              {user.role?.name ?? 'User'}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                user.active
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {user.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
