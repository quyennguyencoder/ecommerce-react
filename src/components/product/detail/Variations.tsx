import { useState, useEffect } from 'react';
import type { ProductVariantResponse } from '../../../types/responses';
import { Check } from 'lucide-react';

interface VariationsProps {
  variants: ProductVariantResponse[];
  onSelectVariant: (variant: ProductVariantResponse | null) => void;
}

const Variations = ({ variants, onSelectVariant }: VariationsProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    // Select the first variant with stock by default
    const firstAvailable = variants.find(v => v.stock > 0);
    if (firstAvailable) {
      setSelectedId(firstAvailable.id);
      onSelectVariant(firstAvailable);
    }
  }, [variants, onSelectVariant]);

  const handleSelect = (variant: ProductVariantResponse) => {
    if (variant.stock === 0) return;
    setSelectedId(variant.id);
    onSelectVariant(variant);
  };

  if (!variants || variants.length === 0) return null;

  return (
    <div className="my-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center justify-between">
        <span>Chọn biến thể sản phẩm</span>
        {selectedId && (
          <span className="text-xs font-normal text-indigo-600">Đã chọn SKU: {variants.find(v => v.id === selectedId)?.sku}</span>
        )}
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {variants.map((variant) => {
          const isSelected = selectedId === variant.id;
          const isOutOfStock = variant.stock === 0;

          return (
            <button
              key={variant.id}
              disabled={isOutOfStock}
              onClick={() => handleSelect(variant)}
              className={`relative flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all duration-200
                ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' : 
                  isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-4 ring-indigo-50' : 
                  'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}
              `}
            >
              <div className="flex justify-between items-start w-full mb-1">
                <span className={`text-sm font-medium ${isOutOfStock ? 'text-slate-500' : isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {variant.sku.split('-').slice(1).join(' ')} {/* Dummy logic to show part of sku */}
                </span>
                {isSelected && <Check size={16} className="text-indigo-600" />}
              </div>
              <span className={`text-xs ${isOutOfStock ? 'text-slate-400' : 'text-slate-500'} block mb-2`}>
                Kho: {variant.stock}
              </span>
              <span className={`text-sm font-semibold ${isOutOfStock ? 'text-slate-400' : isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Variations;
