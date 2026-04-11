import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle2, XCircle, CreditCard, ShoppingBag, MapPin, SearchX } from 'lucide-react';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import type { OrderResponse } from '../types/responses';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../types/enums';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(date);
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case OrderStatus.PENDING:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock size={14}/> Chờ xác nhận</span>;
    case OrderStatus.PROCESSING:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Package size={14}/> Đang chuẩn bị hàng</span>;
    case OrderStatus.SHIPPED:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"><Truck size={14}/> Đang giao hàng</span>;
    case OrderStatus.DELIVERED:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle2 size={14}/> Đã hoàn thành</span>;
    case OrderStatus.CANCELED:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700"><XCircle size={14}/> Đã hủy</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repayingId, setRepayingId] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await orderService.getMyOrders({ page: currentPage, size: 5 });
        setOrders(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 0);
      } catch (err) {
        console.error('Lỗi khi tải đơn hàng:', err);
        setError('Không thể tải danh sách đơn hàng lúc này. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

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
      window.location.href = paymentUrl;
    } catch (err) {
      console.error('Lỗi tạo thanh toán VNPAY:', err);
      alert('Không thể tạo lại thanh toán VNPAY. Vui lòng thử lại.');
    } finally {
      setRepayingId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Đang tải cấu trúc đơn hàng...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center min-h-[50vh]">
        <SearchX size={48} className="text-rose-400 mb-4" />
        <p className="text-slate-700 font-medium mb-6 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          Thử lại
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ShoppingBag className="text-indigo-600" size={32} /> Đơn hàng của tôi
        </h1>
        <p className="mt-2 text-slate-500">Quản lý và theo dõi tiến trình các đơn hàng bạn đã mua</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Package size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-slate-500 max-w-sm mb-8">Bạn chưa thực hiện giao dịch nào. Hãy bắt đầu khám phá các sản phẩm tuyệt vời của chúng tôi nhé!</p>
          <Link 
            to="/" 
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              {/* Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Mã đơn: #{order.id}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-sm text-slate-500 font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs text-slate-500 flex items-center gap-1.5"><CreditCard size={14} className="text-slate-400"/> Lập lúc thanh toán: {order.paymentMethod}</span>
                     <span className={`text-xs font-semibold px-2 py-0.5 rounded ${order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                       {order.paymentStatus}
                     </span>
                     {order.paymentMethod === PaymentMethod.VNPAY && order.paymentStatus === PaymentStatus.UNPAID ? (
                       <button
                         type="button"
                         onClick={() => handleRepay(order)}
                         disabled={repayingId === order.id}
                         className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
                       >
                         {repayingId === order.id ? (
                           <span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin" />
                         ) : null}
                         Thanh toán lại
                       </button>
                     ) : null}
                  </div>
                </div>
                <div>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.orderDetails.map((detail) => (
                    <div key={detail.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                      {/* Placeholder Image because OrderDetailResponse doesn't have image field */}
                      <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Package size={28} className="text-slate-300" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-semibold text-slate-800 line-clamp-2 leading-snug">{detail.productName}</h4>
                            <p className="text-sm text-slate-500 mt-1">Phân loại: {detail.variantSku}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-semibold text-indigo-600 block">{formatCurrency(detail.price)}</span>
                            <span className="text-sm font-medium text-slate-500">x{detail.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-2 max-w-md">
                  <MapPin size={20} className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-600 line-clamp-2">
                    <span className="font-semibold text-slate-800">{order.name}</span> ({order.phone}) - {order.shippingAddress}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-sm text-slate-500 mb-1">Thành tiền (Đã bao gồm phí ship {formatCurrency(order.shippingFee || 0)})</span>
                  <span className="text-2xl font-bold text-rose-600">{formatCurrency(order.total)}</span>
                </div>
              </div>

            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 items-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Trang trước
              </button>
              
              <div className="flex gap-1.5">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all shadow-sm ${
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
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Orders;
