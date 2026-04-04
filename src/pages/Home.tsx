import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import ProductList from '../components/product/ProductList';
import { productService } from '../services/productService';
import type { ProductResponse } from '../types';
import { getStoredUser } from '../utils/authStorage';

const HOT_PRODUCTS_LIMIT = 9;

export default function Home() {
  const location = useLocation();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setUserName(getStoredUser()?.name ?? '');
  }, [location.pathname, location.search]);

  useEffect(() => {
    let isActive = true;

    const loadHotProducts = async () => {
      try {
        const response = await productService.getHotProducts(0, HOT_PRODUCTS_LIMIT);
        if (!isActive) {
          return;
        }
        setProducts(response.data?.content ?? []);
      } catch (error) {
        if (!isActive) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : 'Khong the tai san pham hot.';
        setErrorMessage(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadHotProducts();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Bo suu tap moi
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
            Chao mung{userName ? `, ${userName}` : ''} den voi ecommerce
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80">
            Kham pha bo suu tap san pham da dang, cap nhat xu huong moi nhat va
            chon mon do phu hop nhat cho phong cach cua ban hom nay.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/product"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Kham pha ngay
            </Link>
            <span className="text-xs text-white/60">
              Freeship don tu 299k
            </span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">San pham hot</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Cap nhat tu danh sach noi bat
            </span>
            <Link
              to="/product"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Xem them
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
            Dang tai san pham hot...
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 py-12 text-center text-sm text-rose-600">
            {errorMessage}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
            Chua co san pham hot nao.
          </div>
        ) : (
          <ProductList products={products} />
        )}
      </section>
    </main>
  );
}
