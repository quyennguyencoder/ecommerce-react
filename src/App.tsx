import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

import Cart from './pages/Cart';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import Notification from './pages/Notification';
import Checkout from './pages/Checkout';

import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import ProductVariants from './pages/admin/ProductVariants';
import AttributesConfig from './pages/admin/AttributesConfig';

// Placeholder Component for unbuilt pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[50vh] text-center">
    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 text-3xl font-bold">🛠️</div>
    <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
    <p className="text-slate-500 max-w-sm">Tính năng này đang trong quá trình phát triển và sẽ sớm được ra mắt.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Khách hàng - Main Layout */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="product" element={<Product />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="notification" element={<Notification />} />
        </Route>

        {/* Quản trị viên - Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<Placeholder title="Trang Tổng Quan Tổng Hợp (Dashboard)" />} />
           <Route path="products" element={<AdminProducts />} />
           <Route path="products/create" element={<ProductForm />} />
           <Route path="products/:id/variants" element={<ProductVariants />} />
           <Route path="orders" element={<Placeholder title="Quản lý Đơn hàng (Duyệt đơn, Đóng gói)" />} />
           <Route path="attributes" element={<AttributesConfig />} />
           <Route path="users" element={<Placeholder title="Quản lý Người dùng hệ thống" />} />
           <Route path="settings" element={<Placeholder title="Cài đặt hệ thống Cửa hàng" />} />
        </Route>

        {/* Xác thực - Auth Layout */}
        <Route path="/auth" element={<AuthLayout />}>
           <Route path="login" element={
              <div className="text-center">
                 <h2 className="text-2xl font-bold mb-2 text-slate-900">Mừng bạn quay lại</h2>
                 <p className="text-slate-500 mb-8">Vui lòng đăng nhập để tiếp tục.</p>
                 <button className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition shadow-sm mb-4">Mô phỏng Đăng nhập</button>
                 <Link to="/auth/register" className="text-indigo-600 font-medium hover:underline text-sm">Chưa có tài khoản? Đăng ký ngay</Link>
              </div>
           } />
           <Route path="register" element={<Placeholder title="Đăng Ký Tài Khoản Mới" />} />
        </Route>

        {/* 404 Not Found fallback */}
        <Route path="*" element={<Placeholder title="404 - Không tìm thấy trang" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
