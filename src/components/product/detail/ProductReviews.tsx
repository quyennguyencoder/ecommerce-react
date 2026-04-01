import type { FeedbackResponse } from '../../../types/responses';
import { Star, User, CalendarDays } from 'lucide-react';

interface ProductReviewsProps {
  reviews: FeedbackResponse[];
}

const ProductReviews = ({ reviews }: ProductReviewsProps) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-500 font-medium">Chưa có đánh giá nào cho sản phẩm này.</p>
        <button className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition-colors">
          Trở thành người đánh giá đầu tiên
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl">
          <span className="text-5xl font-bold tracking-tighter text-slate-800">
            {Math.round(reviews.reduce((acc, curr) => acc + curr.star, 0) / reviews.length)}<span className="text-2xl text-slate-400">/5</span>
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
          {reviews.map((review) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
