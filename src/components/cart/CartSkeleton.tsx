const CartSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-24 rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
};

export default CartSkeleton;
