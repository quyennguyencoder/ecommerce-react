import { Link } from 'react-router-dom';

const EmptyCart = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <h2 className="text-lg font-semibold text-slate-900">Your cart is empty</h2>
      <p className="mt-2 text-sm text-slate-500">
        Browse products to add items to your cart.
      </p>
      <Link
        to="/product"
        className="mt-6 inline-flex rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
      >
        Shop now
      </Link>
    </div>
  );
};

export default EmptyCart;
