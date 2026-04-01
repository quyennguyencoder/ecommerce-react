import type { CartItemResponse } from '../../types';

import QuantityControl from './QuantityControl.tsx';
import { getImageUrl } from '../../utils/image';

type CartItemProps = {
  item: CartItemResponse;
  isUpdating?: boolean;
  onQuantityChange: (nextQuantity: number) => void;
  onRemove: () => void;
  formatMoney: (value: number) => string;
};

const CartItem = ({
  item,
  isUpdating = false,
  onQuantityChange,
  onRemove,
  formatMoney,
}: CartItemProps) => {
  const total = item.price * item.quantity;

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 py-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <img 
            src={getImageUrl(item.image)} 
            alt={item.productName} 
            className="h-full w-full object-cover" 
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{item.productName}</p>
          <p className="text-xs text-slate-500">SKU: {item.variantSku}</p>
          <p className="text-sm font-medium text-slate-700">
            {formatMoney(item.price)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-between gap-4 sm:justify-end">
        <QuantityControl
          value={item.quantity}
          onChange={onQuantityChange}
          disabled={isUpdating}
        />
        <div className="min-w-28 text-right text-sm font-semibold text-slate-900">
          {formatMoney(total)}
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={isUpdating}
          className="text-xs font-semibold text-rose-500 transition hover:text-rose-600 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
