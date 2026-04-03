import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

import { paymentService } from '../services/paymentService';
import { TransactionStatus } from '../types/enums';
import type { TransactionResponse } from '../types/responses';

type ResultState = 'loading' | 'success' | 'failed' | 'pending' | 'error';

const PaymentResult = () => {
	const [searchParams] = useSearchParams();
	const [status, setStatus] = useState<ResultState>('loading');
	const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const txnRef = searchParams.get('vnp_TxnRef');

	useEffect(() => {
		const fetchResult = async () => {
			setStatus('loading');
			setErrorMessage(null);

			if (!txnRef) {
				setStatus('error');
				setErrorMessage('Không tìm thấy mã giao dịch vnp_TxnRef trong URL.');
				return;
			}

			const transactionId = Number(txnRef);
			if (Number.isNaN(transactionId)) {
				setStatus('error');
				setErrorMessage('Mã giao dịch không hợp lệ.');
				return;
			}

			try {
				const res = await paymentService.queryTransaction(transactionId);
				const data = res.data ?? null;
				setTransaction(data);

				if (!data) {
					setStatus('error');
					setErrorMessage('Không thể lấy kết quả giao dịch từ hệ thống.');
					return;
				}

				switch (data.transactionStatus) {
					case TransactionStatus.SUCCESS:
						setStatus('success');
						break;
					case TransactionStatus.FAILED:
						setStatus('failed');
						break;
					case TransactionStatus.PENDING:
						setStatus('pending');
						break;
					default:
						setStatus('pending');
				}
			} catch (err) {
				console.error('Lỗi khi truy vấn kết quả giao dịch:', err);
				setStatus('error');
				setErrorMessage('Có lỗi xảy ra khi truy vấn kết quả giao dịch.');
			}
		};

		fetchResult();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [txnRef]);

	const renderStatusContent = () => {
		if (status === 'loading') {
			return (
				<div className="flex flex-col items-center justify-center py-10">
					<Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
					<p className="text-slate-600 font-medium">Đang kiểm tra kết quả thanh toán...</p>
				</div>
			);
		}

		if (status === 'error') {
			return (
				<div className="flex flex-col items-center justify-center py-10 text-center">
					<XCircle className="h-12 w-12 text-rose-500 mb-4" />
					<h2 className="text-xl font-bold text-slate-900 mb-2">Không thể xử lý giao dịch</h2>
					<p className="text-slate-600 max-w-md">{errorMessage ?? 'Đã xảy ra lỗi không xác định.'}</p>
				</div>
			);
		}

		if (status === 'success') {
			return (
				<div className="flex flex-col items-center justify-center py-10 text-center">
					<CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
					<h2 className="text-xl font-bold text-slate-900 mb-2">Thanh toán thành công</h2>
					<p className="text-slate-600 max-w-md">Cảm ơn bạn đã hoàn tất giao dịch. Đơn hàng của bạn đang được xử lý.</p>
				</div>
			);
		}

		if (status === 'failed') {
			return (
				<div className="flex flex-col items-center justify-center py-10 text-center">
					<XCircle className="h-12 w-12 text-rose-500 mb-4" />
					<h2 className="text-xl font-bold text-slate-900 mb-2">Thanh toán thất bại</h2>
					<p className="text-slate-600 max-w-md">Giao dịch không thành công. Bạn có thể thử lại hoặc chọn phương thức khác.</p>
				</div>
			);
		}

		return (
			<div className="flex flex-col items-center justify-center py-10 text-center">
				<Clock className="h-12 w-12 text-amber-500 mb-4" />
				<h2 className="text-xl font-bold text-slate-900 mb-2">Giao dịch đang xử lý</h2>
				<p className="text-slate-600 max-w-md">Hệ thống đang xác nhận thanh toán. Vui lòng kiểm tra lại trạng thái sau ít phút.</p>
			</div>
		);
	};

	return (
		<main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6 lg:px-8 py-10">
			<div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
				<div className="px-6 py-5 border-b border-slate-100">
					<h1 className="text-2xl font-bold text-slate-900">Kết quả thanh toán</h1>
					<p className="text-slate-500 mt-1">Hệ thống đang xác thực giao dịch từ VNPAY</p>
				</div>

				<div className="px-6">
					{renderStatusContent()}

					{transaction && (
						<div className="border-t border-slate-100 pt-6 pb-8">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
								<div className="flex items-center justify-between sm:justify-start sm:gap-3">
									<span className="font-medium text-slate-700">Mã giao dịch:</span>
									<span className="text-slate-900 font-semibold">{transaction.transactionId}</span>
								</div>
								<div className="flex items-center justify-between sm:justify-start sm:gap-3">
									<span className="font-medium text-slate-700">Mã đơn hàng:</span>
									<span className="text-slate-900 font-semibold">#{transaction.orderId}</span>
								</div>
								<div className="flex items-center justify-between sm:justify-start sm:gap-3">
									<span className="font-medium text-slate-700">Phương thức:</span>
									<span className="text-slate-900 font-semibold">{transaction.paymentMethod}</span>
								</div>
								<div className="flex items-center justify-between sm:justify-start sm:gap-3">
									<span className="font-medium text-slate-700">Trạng thái:</span>
									<span className="text-slate-900 font-semibold">{transaction.transactionStatus}</span>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
					<Link
						to="/orders"
						className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
					>
						Xem đơn hàng
					</Link>
					<Link
						to="/"
						className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
					>
						Tiếp tục mua sắm
					</Link>
				</div>
			</div>
		</main>
	);
};

export default PaymentResult;
