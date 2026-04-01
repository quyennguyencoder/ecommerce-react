import { Star } from 'lucide-react';
import type { ProductResponse } from '../../../types/responses';

interface ProductInfoProps {
  product: ProductResponse;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-6">
      {/* Category & Rating */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {product.categoryName}
        </span>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
          <span className="text-sm text-slate-500">({product.ratingCount} đánh giá)</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-slate-900 leading-tight">
        {product.name}
      </h1>

      {/* Price Area */}
      <div className="flex items-end gap-3 mt-2">
        <span className="text-3xl font-bold text-indigo-600">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.basePrice)}
        </span>
        {product.isHot && (
          <span className="text-xs font-bold text-white bg-rose-500 px-2 py-1 rounded uppercase tracking-wide mb-1 shadow-sm">
            Hot Trend
          </span>
        )}
      </div>

      {/* Stock status */}
      <div className="text-sm mt-1">
        {product.totalStock > 0 ? (
          <span className="text-emerald-600 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Còn hàng ({product.totalStock} sản phẩm có sẵn)
          </span>
        ) : (
           <span className="text-rose-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Hết hàng
          </span>
        )}
      </div>
      
      {/* Short Stats */}
      <div className="flex items-center gap-6 mt-2 text-sm text-slate-600">
        <div className="flex flex-col">
          <span className="text-slate-400 text-xs">Đã bán</span>
          <span className="font-semibold text-slate-800">{product.soldQuantity}+</span>
        </div>
        <div className="w-px h-8 bg-slate-200"></div>
        <div className="flex flex-col">
          <span className="text-slate-400 text-xs">Phân loại</span>
          <span className="font-semibold text-slate-800">Quần áo Nam</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
