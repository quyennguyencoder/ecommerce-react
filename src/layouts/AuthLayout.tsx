import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-8 hover:opacity-90 transition-opacity">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <ShoppingBag className="text-white w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">E-Commerce</span>
        </Link>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100/50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
