type CartSummaryProps = {
  totalItems: number;
  totalPrice: number;
  isClearing?: boolean;
  onClear: () => void;
  formatMoney: (value: number) => string;
};

const CartSummary = ({
  totalItems,
  totalPrice,
  isClearing = false,
  onClear,
  formatMoney,
}: CartSummaryProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Items</span>
          <span className="font-semibold text-slate-900">{totalItems}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total</span>
          <span className="text-base font-semibold text-slate-900">
            {formatMoney(totalPrice)}
          </span>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Checkout
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={isClearing}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear cart
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
