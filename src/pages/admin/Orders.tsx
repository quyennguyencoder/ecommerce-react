import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  ShoppingCart,
  AlertCircle,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  User,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import type { OrderResponse } from '../../types/responses';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../types/enums';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const statusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xác nhận',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.SHIPPED]: 'Đang giao',
  [OrderStatus.DELIVERED]: 'Hoàn thành',
  [OrderStatus.CANCELED]: 'Đã hủy',
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case OrderStatus.PENDING:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800">
          <Clock size={14} /> {statusLabel[status]}
        </span>
      );
    case OrderStatus.PROCESSING:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
          <Package size={14} /> {statusLabel[status]}
        </span>
      );
    case OrderStatus.SHIPPED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
          <Truck size={14} /> {statusLabel[status]}
        </span>
      );
    case OrderStatus.DELIVERED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle2 size={14} /> {statusLabel[status]}
        </span>
      );
    case OrderStatus.CANCELED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-100 text-rose-800">
          <XCircle size={14} /> {statusLabel[status]}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};

/** Các bước chuyển trạng thái hợp lý cho cửa hàng (có thể mở rộng theo backend). */
function getNextStatuses(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case OrderStatus.PENDING:
      return [OrderStatus.PROCESSING, OrderStatus.CANCELED];
    case OrderStatus.PROCESSING:
      return [OrderStatus.SHIPPED, OrderStatus.CANCELED];
    case OrderStatus.SHIPPED:
      return [OrderStatus.DELIVERED];
    case OrderStatus.DELIVERED:
    case OrderStatus.CANCELED:
      return [];
    default:
      return [];
  }
}

type FilterStatus = 'ALL' | OrderStatus;

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [repayingId, setRepayingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await orderService.getAllOrders({
        page: currentPage,
        size: 10,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
      });
      setOrders(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn hàng:', err);
      setError('Không tải được danh sách đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (value: FilterStatus) => {
    setFilterStatus(value);
    setCurrentPage(0);
  };

  const handleStatusChange = async (order: OrderResponse, newStatus: OrderStatus) => {
    if (newStatus === order.status) return;
    if (newStatus === OrderStatus.CANCELED) {
      if (!window.confirm(`Hủy đơn #${order.id}? Thao tác này thường không hoàn tác.`)) {
        return;
      }
    }
    try {
      setUpdatingId(order.id);
      await orderService.updateOrderStatus(order.id, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Không cập nhật được trạng thái. Kiểm tra quyền hoặc quy tắc trên máy chủ.');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleRepay = async (order: OrderResponse) => {
    if (order.paymentMethod !== PaymentMethod.VNPAY || order.paymentStatus !== PaymentStatus.UNPAID) {
      return;
    }

    try {
      setRepayingId(order.id);
      const paymentRes = await paymentService.createPaymentUrl({
        orderId: order.id,
        bankCode: '',
        language: 'vn',
      });
      const paymentUrl = paymentRes.data?.paymentUrl;
      if (!paymentUrl) {
        throw new Error('Không lấy được đường dẫn thanh toán VNPAY');
      }
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Lỗi tạo thanh toán VNPAY:', err);
      alert('Không thể tạo lại thanh toán VNPAY. Vui lòng thử lại.');
    } finally {
      setRepayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" /> Quản lý đơn hàng
          </h1>
          <p className="max-w-xl text-slate-500 mt-1">
            Xem và cập nhật trạng thái xử lý, giao hàng cho từng đơn.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm font-semibold text-slate-600 shrink-0">Lọc theo trạng thái:</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['ALL', 'Tất cả'],
              [OrderStatus.PENDING, statusLabel[OrderStatus.PENDING]],
              [OrderStatus.PROCESSING, statusLabel[OrderStatus.PROCESSING]],
              [OrderStatus.SHIPPED, statusLabel[OrderStatus.SHIPPED]],
              [OrderStatus.DELIVERED, statusLabel[OrderStatus.DELIVERED]],
              [OrderStatus.CANCELED, statusLabel[OrderStatus.CANCELED]],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => handleFilterChange(value as FilterStatus)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === value
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
        {isLoading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4" />
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-rose-500">
            <AlertCircle size={48} className="mb-4 opacity-80" />
            <p className="font-medium text-lg text-slate-700 mb-2">Đã xảy ra sự cố</p>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Package size={32} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700 text-lg mb-1">Không có đơn hàng</p>
            <p>Thử đổi bộ lọc hoặc quay lại sau.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-3 px-4 w-10" />
                  <th className="py-4 px-4 font-semibold w-24">Mã đơn</th>
                  <th className="py-4 px-4 font-semibold min-w-35">Khách / Liên hệ</th>
                  <th className="py-4 px-4 font-semibold">Tổng tiền</th>
                  <th className="py-4 px-4 font-semibold">Thanh toán</th>
                  <th className="py-4 px-4 font-semibold min-w-50">Trạng thái đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const next = getNextStatuses(order.status);
                  const isTerminal =
                    order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELED;
                  const isExpanded = expandedId === order.id;
                  const isBusy = updatingId === order.id;

                  return (
                    <Fragment key={order.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors align-top">
                        <td className="py-4 px-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(order.id)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-slate-800 font-semibold">#{order.id}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-2">
                            <User size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">{order.name}</p>
                              <p className="text-sm text-slate-500">{order.phone}</p>
                              <p className="text-xs text-slate-400 mt-0.5">User ID: {order.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-rose-600">{formatCurrency(order.total)}</span>
                          <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              order.paymentStatus === PaymentStatus.PAID
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <CreditCard size={12} /> {order.paymentMethod}
                          </p>
                          {order.paymentMethod === PaymentMethod.VNPAY &&
                          order.paymentStatus === PaymentStatus.UNPAID ? (
                            <button
                              type="button"
                              onClick={() => handleRepay(order)}
                              disabled={repayingId === order.id}
                              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {repayingId === order.id ? (
                                <span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin" />
                              ) : null}
                              Thanh toán lại
                            </button>
                          ) : null}
                        </td>
                        <td className="py-4 px-4">
                          {isTerminal || next.length === 0 ? (
                            <StatusBadge status={order.status} />
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <StatusBadge status={order.status} />
                              <select
                                disabled={isBusy}
                                value=""
                                onChange={(e) => {
                                  const v = e.target.value as OrderStatus;
                                  if (v) handleStatusChange(order, v);
                                  e.target.value = '';
                                }}
                                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none max-w-50 disabled:opacity-50"
                              >
                                <option value="">Chuyển trạng thái…</option>
                                {next.map((s) => (
                                  <option key={s} value={s}>
                                    → {statusLabel[s]}
                                  </option>
                                ))}
                              </select>
                              {isBusy && (
                                <span className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shrink-0" />
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={6} className="px-4 py-4 border-b border-slate-100">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                              <div>
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                  <MapPin size={18} className="text-indigo-500" /> Giao hàng
                                </h3>
                                <p className="text-slate-600 whitespace-pre-wrap">{order.shippingAddress}</p>
                                {order.note ? (
                                  <p className="mt-2 text-slate-500">
                                    <span className="font-medium text-slate-700">Ghi chú:</span> {order.note}
                                  </p>
                                ) : null}
                                <p className="mt-2 text-slate-500">
                                  Phí ship: {formatCurrency(order.shippingFee || 0)} · {order.shippingMethod}
                                </p>
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 mb-3">Sản phẩm</h3>
                                <ul className="space-y-2">
                                  {order.orderDetails.map((d) => (
                                    <li
                                      key={d.id}
                                      className="flex justify-between gap-4 py-2 border-b border-slate-200/80 last:border-0"
                                    >
                                      <span className="text-slate-800">
                                        {d.productName}{' '}
                                        <span className="text-slate-500">({d.variantSku})</span>
                                      </span>
                                      <span className="text-slate-600 shrink-0">
                                        {d.quantity} × {formatCurrency(d.price)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
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
              <div className="hidden sm:flex items-center gap-1 max-w-70 overflow-x-auto">
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
    </div>
  );
};

export default AdminOrders;
