
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import Cart from './pages/Cart';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import Notification from './pages/Notification';

const AppLayout = () => (
  <div className="flex min-h-screen flex-col bg-slate-50">
    <Navbar />
    <Outlet />
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="product" element={<Product />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="notification" element={<Notification />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
