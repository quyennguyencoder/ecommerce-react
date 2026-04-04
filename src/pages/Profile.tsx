import { useCallback, useEffect, useRef, useState } from 'react';

import ProfileActions from '../components/profile/ProfileActions';
import ProfileChangePassword from '../components/profile/ProfileChangePassword';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import { userService } from '../services/userService';
import { setStoredUser } from '../utils/authStorage';
import type {
  UserChangePasswordRequest,
  UserResponse,
  UserUpdateRequest,
} from '../types';

const Profile = () => {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [draftProfile, setDraftProfile] = useState<UserUpdateRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const emptyPasswordDraft: UserChangePasswordRequest = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);
  const [passwordDraft, setPasswordDraft] =
    useState<UserChangePasswordRequest>(emptyPasswordDraft);
  const [passwordErrors, setPasswordErrors] = useState<
    Partial<Record<keyof UserChangePasswordRequest, string>>
  >({});
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordSaveError, setPasswordSaveError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    phone?: string;
    name?: string;
  }>({});
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const buildDraft = useCallback((user: UserResponse): UserUpdateRequest => {
    const formatDateInput = (value?: string) => {
      if (!value) {
        return '';
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toISOString().slice(0, 10);
    };

    return {
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      dob: formatDateInput(user.dob),
    };
  }, []);

  const showToast = useCallback((nextToast: { type: 'success' | 'error'; message: string }) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(nextToast);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await userService.getMyProfile();
        const nextProfile = response.data ?? null;
        setProfile(nextProfile);
        if (nextProfile) {
          setDraftProfile(buildDraft(nextProfile));
        }
      } catch (fetchError) {
        console.error('Failed to load profile', fetchError);
        setError('Khong the tai thong tin profile. Vui long thu lai.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [buildDraft]);

  const handleAvatarChange = async (file: File) => {
    if (!profile?.id) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError('Vui long chon dung dinh dang anh.');
      return;
    }

    try {
      setIsUploading(true);
      setAvatarError('');
      setAvatarSuccess('');
      const response = await userService.uploadAvatar(profile.id, file);
      const nextProfile = response.data ?? profile;
      setProfile(nextProfile);
      if (nextProfile) {
        setDraftProfile(buildDraft(nextProfile));
        setStoredUser(nextProfile);
      }
      setAvatarSuccess('Cap nhat avatar thanh cong.');
      showToast({ type: 'success', message: 'Cap nhat avatar thanh cong.' });
      window.setTimeout(() => {
        setAvatarSuccess('');
      }, 2500);
    } catch (uploadError) {
      console.error('Failed to upload avatar', uploadError);
      setAvatarError('Khong the cap nhat avatar. Vui long thu lai.');
      showToast({
        type: 'error',
        message: 'Khong the cap nhat avatar. Vui long thu lai.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProfile = () => {
    if (!profile) {
      return;
    }
    setIsEditing(true);
    setSaveError('');
    setSaveSuccess('');
    setFieldErrors({});
    setDraftProfile(buildDraft(profile));
  };

  const handleCancelEdit = () => {
    if (profile) {
      setDraftProfile(buildDraft(profile));
    }
    setIsEditing(false);
    setSaveError('');
    setSaveSuccess('');
    setFieldErrors({});
  };

  const handleOpenChangePassword = () => {
    setIsChangingPassword(true);
    setPasswordSaveError('');
    setPasswordErrors({});
  };

  const handleCancelChangePassword = () => {
    setIsChangingPassword(false);
    setPasswordDraft(emptyPasswordDraft);
    setPasswordErrors({});
    setPasswordSaveError('');
  };

  const handleDraftChange = (field: keyof UserUpdateRequest, value: string) => {
    setDraftProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (field === 'email') {
      const errorMessage = validateEmail(value);
      setFieldErrors((prev) => ({ ...prev, email: errorMessage || undefined }));
    }
    if (field === 'phone') {
      const errorMessage = validatePhone(value);
      setFieldErrors((prev) => ({ ...prev, phone: errorMessage || undefined }));
    }
    if (field === 'name') {
      const errorMessage = value.trim() ? '' : 'Vui long nhap ho ten.';
      setFieldErrors((prev) => ({ ...prev, name: errorMessage || undefined }));
    }
  };

  const validateEmail = (value?: string) => {
    if (!value) {
      return '';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? '' : 'Email khong hop le.';
  };

  const validatePhone = (value?: string) => {
    if (!value) {
      return '';
    }
    const normalized = value.trim();
    if (!/^[\d\s()+-]+$/.test(normalized)) {
      return 'So dien thoai chi nen chua so va ky tu + - ( ).';
    }
    const digitsOnly = normalized.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 15) {
      return 'So dien thoai phai co 9-15 chu so.';
    }
    return '';
  };

  const validateChangePassword = (value: UserChangePasswordRequest) => {
    const errors: Partial<Record<keyof UserChangePasswordRequest, string>> = {};
    if (!value.oldPassword.trim()) {
      errors.oldPassword = 'Vui long nhap mat khau hien tai.';
    }
    if (!value.newPassword.trim()) {
      errors.newPassword = 'Vui long nhap mat khau moi.';
    } else if (value.newPassword.length < 8) {
      errors.newPassword = 'Mat khau moi toi thieu 8 ky tu.';
    }
    if (!value.confirmPassword.trim()) {
      errors.confirmPassword = 'Vui long nhap lai mat khau moi.';
    } else if (value.confirmPassword !== value.newPassword) {
      errors.confirmPassword = 'Mat khau nhap lai khong khop.';
    }
    return errors;
  };

  const handlePasswordDraftChange = (
    field: keyof UserChangePasswordRequest,
    value: string
  ) => {
    setPasswordDraft((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => {
      const next = { ...prev };
      if (field === 'oldPassword') {
        next.oldPassword = value.trim()
          ? ''
          : 'Vui long nhap mat khau hien tai.';
      }
      if (field === 'newPassword') {
        if (!value.trim()) {
          next.newPassword = 'Vui long nhap mat khau moi.';
        } else if (value.length < 8) {
          next.newPassword = 'Mat khau moi toi thieu 8 ky tu.';
        } else {
          next.newPassword = '';
        }
        if (passwordDraft.confirmPassword && passwordDraft.confirmPassword !== value) {
          next.confirmPassword = 'Mat khau nhap lai khong khop.';
        } else if (passwordDraft.confirmPassword) {
          next.confirmPassword = '';
        }
      }
      if (field === 'confirmPassword') {
        next.confirmPassword = value.trim()
          ? value === passwordDraft.newPassword
            ? ''
            : 'Mat khau nhap lai khong khop.'
          : 'Vui long nhap lai mat khau moi.';
      }
      return next;
    });
  };

  const handleSaveProfile = async () => {
    if (!profile?.id || !draftProfile) {
      return;
    }

    const name = draftProfile.name.trim();
    if (!name) {
      setSaveError('Vui long nhap ho ten.');
      setFieldErrors((prev) => ({ ...prev, name: 'Vui long nhap ho ten.' }));
      showToast({ type: 'error', message: 'Vui long nhap ho ten.' });
      return;
    }

    const emailValue = draftProfile.email?.trim() || '';
    const phoneValue = draftProfile.phone?.trim() || '';
    const emailError = validateEmail(emailValue);
    const phoneError = validatePhone(phoneValue);
    if (emailError || phoneError) {
      setFieldErrors({
        email: emailError || undefined,
        phone: phoneError || undefined,
      });
      setSaveError('Vui long kiem tra lai email va so dien thoai.');
      showToast({
        type: 'error',
        message: 'Vui long kiem tra lai email va so dien thoai.',
      });
      return;
    }

    setFieldErrors({});

    const payload = {
      name,
      email: emailValue || undefined,
      phone: phoneValue || undefined,
      address: draftProfile.address?.trim() || undefined,
      dob: draftProfile.dob?.trim() || undefined,
    };

    try {
      setIsSaving(true);
      setSaveError('');
      setSaveSuccess('');
      const response = await userService.updateUser(profile.id, payload);
      const nextProfile = response.data ?? profile;
      setProfile(nextProfile);
      setDraftProfile(buildDraft(nextProfile));
      setIsEditing(false);
      setSaveSuccess('Cap nhat profile thanh cong.');
      showToast({ type: 'success', message: 'Cap nhat profile thanh cong.' });
      window.setTimeout(() => {
        setSaveSuccess('');
      }, 2500);
    } catch (saveProfileError) {
      console.error('Failed to update profile', saveProfileError);
      setSaveError('Khong the cap nhat profile. Vui long thu lai.');
      showToast({
        type: 'error',
        message: 'Khong the cap nhat profile. Vui long thu lai.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!profile?.id) {
      return;
    }

    const nextErrors = validateChangePassword(passwordDraft);
    if (Object.values(nextErrors).some(Boolean)) {
      setPasswordErrors(nextErrors);
      setPasswordSaveError('Vui long kiem tra lai mat khau.');
      showToast({ type: 'error', message: 'Vui long kiem tra lai mat khau.' });
      return;
    }

    try {
      setIsPasswordSaving(true);
      setPasswordSaveError('');
      await userService.changePassword(profile.id, passwordDraft);
      setPasswordDraft(emptyPasswordDraft);
      setPasswordErrors({});
      setIsChangingPassword(false);
      showToast({ type: 'success', message: 'Doi mat khau thanh cong.' });
    } catch (savePasswordError) {
      console.error('Failed to change password', savePasswordError);
      setPasswordSaveError('Khong the doi mat khau. Vui long thu lai.');
      showToast({
        type: 'error',
        message: 'Khong the doi mat khau. Vui long thu lai.',
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-300 flex-1 px-6 py-10">
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {toast.message}
        </div>
      )}
      <div className="space-y-6">
        {isLoading && <ProfileSkeleton />}
        {!isLoading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {!isLoading && !error && profile && (
          <>
            <ProfileHeader
              user={profile}
              avatarUrl={profile.avatar ?? null}
              onAvatarChange={handleAvatarChange}
              isUploading={isUploading}
              uploadError={avatarError}
              uploadSuccess={avatarSuccess}
            />
            <ProfileInfo
              user={profile}
              isEditing={isEditing}
              draft={draftProfile}
              onChange={handleDraftChange}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
              saveError={saveError}
              saveSuccess={saveSuccess}
              fieldErrors={fieldErrors}
            />
            <ProfileActions
              onEdit={handleEditProfile}
              onChangePassword={handleOpenChangePassword}
              isEditing={isEditing}
            />
            <ProfileChangePassword
              isOpen={isChangingPassword}
              value={passwordDraft}
              errors={passwordErrors}
              isSaving={isPasswordSaving}
              saveError={passwordSaveError}
              onChange={handlePasswordDraftChange}
              onSubmit={handleSavePassword}
              onCancel={handleCancelChangePassword}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default Profile;
