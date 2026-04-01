import { useState } from 'react';
import ProductReviews from './ProductReviews';
import type { FeedbackResponse } from '../../../types/responses';

interface ProductDetailsTabsProps {
  description: string;
  reviews: FeedbackResponse[];
}

const ProductDetailsTabs = ({ description, reviews }: ProductDetailsTabsProps) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  return (
    <div className="mt-16">
      {/* Tab Headers */}
      <div className="flex gap-8 border-b border-slate-200 px-4 md:px-6">
        <button
          onClick={() => setActiveTab('desc')}
          className={`pb-4 text-sm font-semibold transition-all relative
            ${activeTab === 'desc' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}
          `}
        >
          Mô tả sản phẩm
          {activeTab === 'desc' && (
            <span className="absolute left-0 bottom-[-1px] w-full h-[3px] bg-indigo-600 rounded-t-sm animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 text-sm font-semibold transition-all relative flex items-center gap-2
            ${activeTab === 'reviews' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}
          `}
        >
          Đánh giá từ khách hàng
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold leading-none ${activeTab === 'reviews' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
            {reviews.length}
          </span>
          {activeTab === 'reviews' && (
            <span className="absolute left-0 bottom-[-1px] w-full h-[3px] bg-indigo-600 rounded-t-sm animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="py-8 px-2 md:px-6">
        {activeTab === 'desc' && (
          <div className="prose prose-slate max-w-none w-full animate-fade-in text-slate-700 leading-relaxed font-[sans-serif]" 
            // Dangerously set inner html because description from pure API might be html string
            dangerouslySetInnerHTML={{ __html: description }} 
          />
        )}
        
        {activeTab === 'reviews' && (
          <div className="animate-fade-in">
            <ProductReviews reviews={reviews} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsTabs;
