import { useState, useEffect, useCallback } from 'react';
import {
  Users as UsersIcon,
  Search,
  AlertCircle,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import type { UserResponse, UserUpdateRequest, RoleResponse } from '../../types';
import { Role } from '../../types/enums';
import { getImageUrl } from '../../utils/image';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const buildDraft = (user: UserResponse): UserUpdateRequest => {
  const formatDateInput = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().slice(0, 10);
  };
  return {
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    address: user.address ?? '',
    dob: formatDateInput(user.dob),
  };
};

const roleBadgeClass = (roleName: string) => {
  const n = roleName?.toUpperCase();
  if (n === Role.ADMIN) return 'bg-indigo-100 text-indigo-800';
  if (n === Role.STAFF) return 'bg-blue-100 text-blue-800';
  return 'bg-slate-100 text-slate-700';
};

type RoleFilter = 'ALL' | Role;

const AdminUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editForm, setEditForm] = useState<UserUpdateRequest | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [busyRoleId, setBusyRoleId] = useState<number | null>(null);
  const [busyActiveId, setBusyActiveId] = useState<number | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await userService.getAllUsers({
        page: currentPage,
        size: 10,
        keyword: activeKeyword || undefined,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
      });
      setUsers(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách người dùng.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, activeKeyword, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await roleService.getAllRoles();
        setRoles(res.data || []);
      } catch (e) {
        console.error('Không tải danh sách vai trò', e);
      }
    };
    loadRoles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    setActiveKeyword(searchInput.trim());
  };

  const handleRoleFilter = (value: RoleFilter) => {
    setRoleFilter(value);
    setCurrentPage(0);
  };

  const openEdit = (user: UserResponse) => {
    setEditingUser(user);
    setEditForm(buildDraft(user));
    setSaveError(null);
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditForm(null);
    setSaveError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editForm?.name?.trim()) {
      setSaveError('Tên không được để trống.');
      return;
    }
    try {
      setIsSaving(true);
      setSaveError(null);
      await userService.updateUser(editingUser.id, {
        name: editForm.name.trim(),
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        address: editForm.address || undefined,
        dob: editForm.dob || undefined,
      });
      closeEdit();
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setSaveError('Lưu thất bại. Kiểm tra dữ liệu hoặc quyền trên máy chủ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (user: UserResponse, roleId: number) => {
    if (roleId === user.role.id) return;
    try {
      setBusyRoleId(user.id);
      await userService.updateUserRole(user.id, roleId);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Không đổi được vai trò.');
    } finally {
      setBusyRoleId(null);
    }
  };

  const handleToggleActive = async (user: UserResponse) => {
    const next = !user.active;
    const msg = next
      ? `Kích hoạt tài khoản "${user.name}"?`
      : `Vô hiệu hóa tài khoản "${user.name}"? Người dùng sẽ không đăng nhập được.`;
    if (!window.confirm(msg)) return;
    try {
      setBusyActiveId(user.id);
      if (next) await userService.activateUser(user.id);
      else await userService.deactivateUser(user.id);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Không cập nhật được trạng thái tài khoản.');
    } finally {
      setBusyActiveId(null);
    }
  };

  const handleDelete = async (user: UserResponse) => {
    if (
      !window.confirm(
        `Xóa vĩnh viễn người dùng "${user.name}" (ID ${user.id})?\nHành động không hoàn tác.`
      )
    ) {
      return;
    }
    try {
      setBusyDeleteId(user.id);
      await userService.deleteUser(user.id);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Không xóa được (có thể còn dữ liệu liên quan).');
    } finally {
      setBusyDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UsersIcon className="text-indigo-600" /> Quản lý người dùng
          </h1>
          <p className="max-w-xl text-slate-500 mt-1">
            Tìm kiếm, chỉnh sửa thông tin, vai trò và trạng thái tài khoản.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-24 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-md text-sm transition-colors"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-600">Vai trò:</span>
          {(
            [
              ['ALL', 'Tất cả'],
              [Role.USER, 'Khách hàng'],
              [Role.STAFF, 'Nhân viên'],
              [Role.ADMIN, 'Quản trị'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRoleFilter(value as RoleFilter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4" />
            <p>Đang tải...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-rose-500">
            <AlertCircle size={48} className="mb-4 opacity-80" />
            <p className="font-medium text-slate-700">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 text-center">
            <UsersIcon size={40} className="text-slate-300 mb-4" />
            <p className="font-semibold text-slate-700">Không có người dùng</p>
            <p className="text-sm mt-1">Thử đổi từ khóa hoặc bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-4 px-4 font-semibold">Người dùng</th>
                  <th className="py-4 px-4 font-semibold">Liên hệ</th>
                  <th className="py-4 px-4 font-semibold">Vai trò</th>
                  <th className="py-4 px-4 font-semibold">Trạng thái</th>
                  <th className="py-4 px-4 font-semibold whitespace-nowrap">Ngày tạo</th>
                  <th className="py-4 px-4 font-semibold text-right w-40">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-sm font-bold text-slate-500">
                          {user.avatar ? (
                            <img
                              src={getImageUrl(user.avatar)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (user.name || '?').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <p className="flex items-center gap-1.5 text-slate-700 truncate max-w-[200px]">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        {user.email || '—'}
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-600 mt-1">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        {user.phone || '—'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {roles.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <select
                            disabled={busyRoleId === user.id}
                            value={user.role.id}
                            onChange={(e) =>
                              handleRoleChange(user, Number(e.target.value))
                            }
                            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none max-w-[160px] disabled:opacity-50"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          {busyRoleId === user.id && (
                            <span className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shrink-0" />
                          )}
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${roleBadgeClass(user.role.name)}`}
                        >
                          <Shield size={12} />
                          {user.role.name}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span
                          className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-semibold ${
                            user.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {user.active ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                        <button
                          type="button"
                          disabled={busyActiveId === user.id}
                          onClick={() => handleToggleActive(user)}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border transition-colors ${
                            user.active
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          } disabled:opacity-50`}
                        >
                          {user.active ? (
                            <>
                              <UserX size={14} /> Khóa
                            </>
                          ) : (
                            <>
                              <UserCheck size={14} /> Mở
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sửa thông tin"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          disabled={busyDeleteId === user.id}
                          onClick={() => handleDelete(user)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && !error && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm font-medium text-slate-500 pl-2">
              Trang <span className="text-indigo-600 font-bold">{currentPage + 1}</span> / {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Trang trước
              </button>
              <div className="hidden sm:flex items-center gap-1 max-w-[280px] overflow-x-auto">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPage(idx)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all shadow-sm shrink-0 ${
                      currentPage === idx
                        ? 'bg-indigo-600 text-white border-transparent'
                        : 'bg-white border text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>

      {editingUser && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Sửa người dùng</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {saveError && (
                <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  {saveError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Họ tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={editForm.email ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phone ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa chỉ</label>
                <textarea
                  rows={3}
                  value={editForm.address ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày sinh</label>
                <input
                  type="date"
                  value={editForm.dob ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
