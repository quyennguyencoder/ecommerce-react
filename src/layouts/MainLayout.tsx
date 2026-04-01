import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
