import type { CartItemResponse } from '../../types';

import CartItem from './CartItem';

type CartListProps = {
  items: CartItemResponse[];
  updatingItemId?: number | null;
  onUpdateQuantity: (itemId: number, nextQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  formatMoney: (value: number) => string;
};

const CartList = ({
  items,
  updatingItemId = null,
  onUpdateQuantity,
  onRemoveItem,
  formatMoney,
}: CartListProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          isUpdating={updatingItemId === item.id}
          onQuantityChange={(nextQuantity) => onUpdateQuantity(item.id, nextQuantity)}
          onRemove={() => onRemoveItem(item.id)}
          formatMoney={formatMoney}
        />
      ))}
    </div>
  );
};

export default CartList;
