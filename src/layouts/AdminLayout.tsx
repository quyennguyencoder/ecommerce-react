import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, Settings, LogOut, Tags } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Sản phẩm', path: '/admin/products', icon: <ShoppingBag size={20} /> },
    { label: 'Đơn hàng', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { label: 'Thuộc tính', path: '/admin/attributes', icon: <Tags size={20} /> },
    { label: 'Khách hàng', path: '/admin/users', icon: <Users size={20} /> },
    { label: 'Cài đặt', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <Link to="/admin" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="text-indigo-400" /> Admin Panel
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-rose-500 hover:text-white transition-all">
            <LogOut size={20} /> Thoát Admin
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 shadow-sm z-10">
          <div className="font-semibold text-slate-800 text-lg">Hệ thống Quản trị</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                A
              </div>
              <span className="text-sm font-medium text-slate-700">Admin User</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
