type QuantityControlProps = {
  value: number;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
};

const QuantityControl = ({ value, onChange, disabled = false }: QuantityControlProps) => {
  const handleDecrease = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    onChange(value + 1);
  };

  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= 1}
        className="px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        -
      </button>
      <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled}
        className="px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
};

export default QuantityControl;
