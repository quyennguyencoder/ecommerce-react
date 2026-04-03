import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import type { ProductVariantResponse } from '../../../types/responses';

interface ProductActionsProps {
  selectedVariant: ProductVariantResponse | null;
  onAddToCart: (variantId: number, quantity: number) => void;
  onBuyNow: (variantId: number, quantity: number) => void;
  isAddingToCart?: boolean;
}

const ProductActions = ({ selectedVariant, onAddToCart, onBuyNow, isAddingToCart = false }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false); // Just for UI mock

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);

  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-medium text-slate-700">Số lượng:</span>
        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
          <button 
            onClick={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-2.5 hover:bg-slate-100 text-slate-600 disabled:opacity-50 transition-colors"
          >
            <Minus size={18} />
          </button>
          <div className="w-12 text-center text-sm font-medium text-slate-800">
            {quantity}
          </div>
          <button 
            onClick={handleIncrease}
            disabled={isOutOfStock || (selectedVariant && quantity >= selectedVariant.stock)}
            className="p-2.5 hover:bg-slate-100 text-slate-600 disabled:opacity-50 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        {selectedVariant && (
          <span className="text-xs text-slate-500">
            (Có sẵn {selectedVariant.stock} sản phẩm)
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 gap-3">
          <button
            onClick={() => selectedVariant && onAddToCart(selectedVariant.id, quantity)}
            disabled={isOutOfStock || isAddingToCart}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ShoppingCart size={20} />
            )}
            <span>{isAddingToCart ? 'Đang thêm...' : 'Thêm giỏ hàng'}</span>
          </button>
          
          <button
            onClick={() => selectedVariant && onBuyNow(selectedVariant.id, quantity)}
            disabled={isOutOfStock}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed leading-tight"
          >
            Mua Ngay
          </button>
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={() => setIsSaved(!isSaved)}
          className={`p-3.5 rounded-xl border-2 transition-all duration-200 ${
            isSaved ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500'
          }`}
          title="Lưu yêu thích"
        >
          <Heart size={24} className={isSaved ? 'fill-rose-500' : ''} />
        </button>
      </div>
    </div>
  );
};

export default ProductActions;
