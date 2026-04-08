import { useState } from 'react';
import type { FeedbackResponse } from '../../../types/responses';
import { Star, User, CalendarDays, Send } from 'lucide-react';

interface ProductReviewsProps {
  reviews: FeedbackResponse[];
  canReview?: boolean;
  isSubmitting?: boolean;
  onSubmitReview?: (payload: { star: number; content?: string }) => void;
  onRequestLogin?: () => void;
}

const ProductReviews = ({
  reviews,
  canReview = false,
  isSubmitting = false,
  onSubmitReview,
  onRequestLogin,
}: ProductReviewsProps) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canReview) {
      onRequestLogin?.();
      return;
    }
    if (rating < 1 || rating > 5) {
      setFormError('Vui lòng chọn số sao đánh giá.');
      return;
    }
    setFormError(null);
    onSubmitReview?.({
      star: rating,
      content: content.trim() ? content.trim() : undefined,
    });
    setContent('');
    setRating(5);
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Đánh giá sản phẩm</h3>
            <p className="text-sm text-slate-500 mt-1">
              Chia sẻ cảm nhận của bạn để giúp khách hàng khác nhé.
            </p>
          </div>
          {!canReview && (
            <button
              type="button"
              onClick={onRequestLogin}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Đăng nhập để đánh giá
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-amber-400 hover:scale-110 transition-transform"
              aria-label={`Đánh giá ${star} sao`}
            >
              <Star size={24} className={star <= rating ? 'fill-amber-400' : 'text-slate-200'} />
            </button>
          ))}
          <span className="text-sm text-slate-500 ml-2">{rating} / 5</span>
        </div>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          placeholder="Viết cảm nhận của bạn (không bắt buộc)..."
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
        />

        {formError && <p className="text-rose-500 text-sm mt-2">{formError}</p>}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={!canReview || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl">
          <span className="text-5xl font-bold tracking-tighter text-slate-800">
            {reviews.length > 0
              ? Math.round(reviews.reduce((acc, curr) => acc + curr.star, 0) / reviews.length)
              : 0}
            <span className="text-2xl text-slate-400">/5</span>
          </span>
          <div className="flex flex-col items-center mt-3 text-amber-400 mb-1">
            <span className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-amber-400" />
              ))}
            </span>
          </div>
          <p className="text-sm text-slate-500">{reviews.length} Bài đánh giá</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {reviews.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{review.userName}</h4>
                      <div className="flex text-amber-400 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.star ? 'fill-amber-400 block' : 'text-slate-200 block'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays size={14} />
                    <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <p className="mt-3 text-slate-700 text-sm leading-relaxed">{review.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
