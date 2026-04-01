import type { ProductResponse } from '../../../types/responses';
import ProductCard from '../ProductCard';

interface RelatedProductsProps {
  products: ProductResponse[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Sản phẩm liên quan</h2>
        <a href="#" className="hidden sm:block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Xem tất cả &rarr;
        </a>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          // ProductCard handles its own internal layout, we just map it into the grid
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center sm:hidden">
         <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Xem tất cả &rarr;
        </a>
      </div>
    </div>
  );
};

export default RelatedProducts;
