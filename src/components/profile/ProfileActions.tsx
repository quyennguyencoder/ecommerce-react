type ProfileActionsProps = {
  onEdit?: () => void;
  onChangePassword?: () => void;
  isEditing?: boolean;
};

export default function ProfileActions({
  onEdit,
  onChangePassword,
  isEditing = false,
}: ProfileActionsProps) {
  const isEditDisabled = !onEdit || isEditing;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
      <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onEdit}
          disabled={isEditDisabled}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          Update Profile
        </button>
        <button
          type="button"
          onClick={onChangePassword}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
        >
          Change Password
        </button>
      </div>
    </section>
  );
}
