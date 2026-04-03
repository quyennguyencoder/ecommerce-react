import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import ProductList from '../components/product/ProductList';
import { productService } from '../services/productService';
import type { ProductResponse } from '../types';

const Product = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword')?.trim() || undefined;
  const categoryIdRaw = searchParams.get('categoryId');
  const categoryId =
    categoryIdRaw != null &&
    categoryIdRaw !== '' &&
    !Number.isNaN(Number(categoryIdRaw)) &&
    Number(categoryIdRaw) > 0
      ? Number(categoryIdRaw)
      : undefined;

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 9;
  const maxVisiblePages = 5;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await productService.getAllProducts({
          page: currentPage,
          size: pageSize,
          ...(keyword ? { keyword } : {}),
          ...(categoryId != null ? { categoryId } : {}),
        });
        const content = response.data?.content ?? [];
        const totalElements = response.data?.totalElements;
        const pageCount =
          response.data?.totalPages ??
          (typeof totalElements === 'number'
            ? Math.ceil(totalElements / pageSize)
            : 0);

        setProducts(content);
        setTotalPages(pageCount);
      } catch (error) {
        console.error('Failed to load products', error);
        setErrorMessage('Unable to load products right now.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, keyword, categoryId]);

  const handlePageChange = (page: number) => {
    if (page < 0 || page >= totalPages || page === currentPage) {
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterHint = [keyword && `Từ khóa: "${keyword}"`, categoryId && `Danh mục ID: ${categoryId}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <main className="mx-auto w-full max-w-300 flex-1 px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filterHint ? (
              <span>Đang lọc: {filterHint}</span>
            ) : (
              <span>Khám phá danh sách sản phẩm.</span>
            )}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          Loading products...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && products.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          Không có sản phẩm phù hợp bộ lọc.
        </div>
      )}

      {!isLoading && !errorMessage && products.length > 0 && (
        <ProductList products={products} />
      )}

      {!isLoading && !errorMessage && totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          {(() => {
            const halfWindow = Math.floor(maxVisiblePages / 2);
            const windowStart = Math.max(0, currentPage - halfWindow);
            const windowEnd = Math.min(totalPages - 1, windowStart + maxVisiblePages - 1);
            const visibleStart = Math.max(0, windowEnd - maxVisiblePages + 1);
            const visiblePages = Array.from(
              { length: windowEnd - visibleStart + 1 },
              (_, index) => visibleStart + index,
            );

            return visiblePages.map((index) => {
              const isActive = index === currentPage;
              return (
                <button
                  key={`page-${index}`}
                  type="button"
                  onClick={() => handlePageChange(index)}
                  className={`h-9 w-9 rounded-full text-sm font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {index + 1}
                </button>
              );
            });
          })()}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
};

export default Product;
