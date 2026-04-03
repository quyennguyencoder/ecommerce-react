import { useState, useEffect } from 'react';
import type { ProductVariantResponse, AttributeValueResponse } from '../../../types/responses';
import { Check } from 'lucide-react';
import { getImageUrl } from '../../../utils/image';

interface VariationsProps {
  variants: ProductVariantResponse[];
  onSelectVariant: (variant: ProductVariantResponse | null) => void;
  /** Map id thuộc tính → nhãn (cùng nguồn admin dùng khi tạo variant) */
  attributeValues?: AttributeValueResponse[];
}

function labelForVariant(
  variant: ProductVariantResponse,
  attributeValues: AttributeValueResponse[]
): string {
  if (!variant.attributeValueIds?.length) {
    return variant.sku;
  }
  const byId = new Map(attributeValues.map((a) => [a.id, a]));
  const parts = variant.attributeValueIds
    .map((id) => byId.get(id)?.value)
    .filter(Boolean) as string[];
  if (parts.length === 0) return variant.sku;
  return parts.join(' · ');
}

const Variations = ({ variants, onSelectVariant, attributeValues = [] }: VariationsProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const firstAvailable = variants.find((v) => v.stock > 0);
    if (firstAvailable) {
      setSelectedId(firstAvailable.id);
      onSelectVariant(firstAvailable);
    } else {
      setSelectedId(null);
      onSelectVariant(null);
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
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center justify-between gap-2 flex-wrap">
        <span>Chọn biến thể sản phẩm</span>
        {selectedId != null && (
          <span className="text-xs font-normal text-indigo-600">
            SKU: {variants.find((v) => v.id === selectedId)?.sku}
          </span>
        )}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {variants.map((variant) => {
          const isSelected = selectedId === variant.id;
          const isOutOfStock = variant.stock === 0;
          const title = attributeValues.length
            ? labelForVariant(variant, attributeValues)
            : variant.sku;
          const imgSrc = variant.image ? getImageUrl(variant.image) : '';

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => handleSelect(variant)}
              className={`relative flex gap-3 items-stretch p-3 rounded-xl border-2 text-left transition-all duration-200
                ${
                  isOutOfStock
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                    : isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-4 ring-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }
              `}
            >
              {imgSrc ? (
                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <div className="flex-1 min-w-0 flex flex-col items-start">
                <div className="flex justify-between items-start w-full mb-1 gap-2">
                  <span
                    className={`text-sm font-medium line-clamp-2 ${
                      isOutOfStock
                        ? 'text-slate-500'
                        : isSelected
                          ? 'text-indigo-900'
                          : 'text-slate-700'
                    }`}
                  >
                    {title}
                  </span>
                  {isSelected && <Check size={16} className="text-indigo-600 shrink-0" />}
                </div>
                <span className={`text-xs ${isOutOfStock ? 'text-slate-400' : 'text-slate-500'} block mb-1`}>
                  Kho: {variant.stock}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isOutOfStock ? 'text-slate-400' : isSelected ? 'text-indigo-700' : 'text-slate-900'
                  }`}
                >
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Variations;
