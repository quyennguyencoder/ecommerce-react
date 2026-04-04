import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import Cart from './pages/Cart';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import Notification from './pages/Notification';
import Checkout from './pages/Checkout';
import PaymentResult from './pages/PaymentResult';

import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import ProductVariants from './pages/admin/ProductVariants';
import AttributesConfig from './pages/admin/AttributesConfig';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SocialCallback from './pages/auth/SocialCallback';
import { Role } from './types/enums';
import { getStoredUser } from './utils/authStorage';

/** Remount khi query đổi để reset phân trang, tránh gọi API với page cũ sau khi đổi bộ lọc */
function ProductRoute() {
  const { search } = useLocation();
  return <Product key={search} />;
}

// Placeholder Component for unbuilt pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[50vh] text-center">
    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 text-3xl font-bold">🛠️</div>
    <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
    <p className="text-slate-500 max-w-sm">Tính năng này đang trong quá trình phát triển và sẽ sớm được ra mắt.</p>
  </div>
);

const DashboardRoute = () => {
  const user = getStoredUser();
  const roleName = user?.role?.name?.toUpperCase() as Role | undefined;
  if (roleName === Role.STAFF) {
    return <Navigate to="/admin/products" replace />;
  }
  return <Placeholder title="Trang Tổng Quan Tổng Hợp (Dashboard)" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Khách hàng - Main Layout */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="product" element={<ProductRoute />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="payment-result" element={<PaymentResult />} />
          <Route element={<ProtectedRoute allowedRoles={[Role.USER, Role.STAFF, Role.ADMIN]} />}>
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="notification" element={<Notification />} />
          </Route>
        </Route>

        {/* Quản trị viên - Admin Layout */}
        <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.STAFF]} />}>
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<DashboardRoute />} />
             <Route path="products" element={<AdminProducts />} />
             <Route path="products/create" element={<ProductForm />} />
             <Route path="products/:id/edit" element={<ProductForm />} />
             <Route path="products/:id/variants" element={<ProductVariants />} />
             <Route path="orders" element={<AdminOrders />} />
             <Route path="attributes" element={<AttributesConfig />} />
             <Route path="users" element={<AdminUsers />} />
             <Route path="settings" element={<Placeholder title="Cài đặt hệ thống Cửa hàng" />} />
          </Route>
        </Route>

        {/* Xác thực - Auth Layout */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="google/callback"
            element={<SocialCallback provider="google" />}
          />
          <Route
            path="facebook/callback"
            element={<SocialCallback provider="facebook" />}
          />
        </Route>

        {/* 404 Not Found fallback */}
        <Route path="*" element={<Placeholder title="404 - Không tìm thấy trang" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
