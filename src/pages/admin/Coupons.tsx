import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, TicketPercent, Plus, Edit2, Trash2 } from 'lucide-react';

import { couponService } from '../../services/couponService';
import type { CouponResponse } from '../../types';
import { DiscountType } from '../../types/enums';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const renderDiscountValue = (coupon: CouponResponse) => {
  if (coupon.discountType === DiscountType.PERCENTAGE) {
    return `${coupon.discountValue}%`;
  }
  return formatCurrency(coupon.discountValue);
};

const renderDiscountTypeLabel = (type: DiscountType) => {
  return type === DiscountType.PERCENTAGE ? 'Phần trăm' : 'Giá cố định';
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await couponService.getAllCoupons();
      setCoupons(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách coupon:', err);
      setError('Không tải được danh sách coupon. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon: CouponResponse) => {
    const nextActive = !coupon.active;
    if (
      !window.confirm(
        `Bạn có chắc muốn ${nextActive ? 'kích hoạt' : 'tạm ngưng'} coupon "${coupon.code}"?`
      )
    ) {
      return;
    }

    try {
      setUpdatingId(coupon.id);
      await couponService.updateCouponActive(coupon.id, nextActive);
      await fetchCoupons();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái coupon:', err);
      alert('Không cập nhật được trạng thái coupon. Vui lòng thử lại.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (coupon: CouponResponse) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xoá coupon "${coupon.code}" (ID: ${coupon.id})?
Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(coupon.id);
      await couponService.deleteCoupon(coupon.id);
      alert('Xoá coupon thành công!');
      await fetchCoupons();
    } catch (err) {
      console.error('Lỗi xoá coupon:', err);
      alert('Không thể xoá coupon. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TicketPercent className="text-indigo-600" /> Quản lý Coupon
          </h1>
          <p className="max-w-xl text-slate-500 mt-1">
            Theo dõi và kích hoạt/tạm ngưng các coupon đang áp dụng.
          </p>
        </div>
        <Link
          to="/admin/coupons/create"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
        >
          <Plus size={20} /> Thêm Coupon
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4" />
            <p>Đang tải danh sách coupon...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-rose-500">
            <AlertCircle size={48} className="mb-4 opacity-80" />
            <p className="font-medium text-lg text-slate-700 mb-2">Đã xảy ra sự cố</p>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <p>Chưa có coupon nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Mã</th>
                  <th className="text-left px-6 py-4 font-semibold">Loại</th>
                  <th className="text-left px-6 py-4 font-semibold">Giá trị</th>
                  <th className="text-left px-6 py-4 font-semibold">Đơn tối thiểu</th>
                  <th className="text-left px-6 py-4 font-semibold">Giảm tối đa</th>
                  <th className="text-left px-6 py-4 font-semibold">Sử dụng</th>
                  <th className="text-left px-6 py-4 font-semibold">Hiệu lực</th>
                  <th className="text-left px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="text-right px-6 py-4 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{coupon.code}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {renderDiscountTypeLabel(coupon.discountType)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {renderDiscountValue(coupon)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatCurrency(coupon.minOrderValue)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatCurrency(coupon.maxDiscount)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {coupon.usedCount}/{coupon.usageLimit}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex flex-col">
                        <span>{formatDate(coupon.startDate)}</span>
                        <span className="text-slate-400">→ {formatDate(coupon.endDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          coupon.active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {coupon.active ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/coupons/${coupon.id}/edit`}
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          title="Sửa coupon"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          type="button"
                          disabled={updatingId === coupon.id}
                          onClick={() => handleToggleActive(coupon)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            coupon.active
                              ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          } ${updatingId === coupon.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {coupon.active ? 'Tạm ngưng' : 'Kích hoạt'}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === coupon.id}
                          onClick={() => handleDelete(coupon)}
                          className={`p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ${
                            deletingId === coupon.id ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          title="Xoá coupon"
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
      </div>
    </div>
  );
};

export default AdminCoupons;
