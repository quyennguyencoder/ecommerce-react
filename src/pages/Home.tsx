import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ProductList from '../components/product/ProductList';
import { productService } from '../services/productService';
import type { ProductResponse } from '../types';

const HOT_PRODUCTS_LIMIT = 9;

export default function Home() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Chao mung ban den voi ecommerce
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Kham pha bo suu tap san pham da dang va cap nhat xu huong moi nhat.
          Tim thay nhung mon do phu hop nhat cho phong cach cua ban ngay hom nay.
        </p>
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
              className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-200"
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
