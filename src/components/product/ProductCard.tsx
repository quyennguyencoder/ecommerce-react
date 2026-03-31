import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { productService } from '../../services/productService';
import type { ProductResponse } from '../../types';

type ProductCardProps = {
  product: ProductResponse;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export default function ProductCard({ product }: ProductCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let objectUrl: string | null = null;

    const loadThumbnail = async () => {
      try {
        const blob = await productService.getProductThumbnail(product.id);
        if (!isActive) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setThumbnailUrl(objectUrl);
      } catch {
        if (!isActive) {
          return;
        }
        setThumbnailUrl(product.thumbnail || null);
      }
    };

    loadThumbnail();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [product.id, product.thumbnail]);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link
        to={`/product/${product.id}`}
        className="aspect-4/3 w-full overflow-hidden bg-slate-100"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {product.categoryName}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            <Link
              to={`/product/${product.id}`}
              className="transition hover:text-slate-700"
            >
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">
            {formatPrice(product.basePrice)}
          </span>
          <span>•</span>
          <span>
            {product.rating.toFixed(1)} ({product.ratingCount})
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            View
          </Link>
          <button
            type="button"
            className="flex-1 rounded-lg bg-sky-200 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-300"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
