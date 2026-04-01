import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, LayoutGrid, AlertCircle, ShoppingBag, Layers } from 'lucide-react';
import { productService } from '../../services/productService';
import type { ProductResponse } from '../../types';
import { getImageUrl } from '../../utils/image';

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');

  const fetchProducts = async (page: number, keyword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await productService.getAllProducts({
        page,
        size: 10,
        keyword: keyword || undefined,
      });
      setProducts(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } catch (err: any) {
      console.error('Lỗi lấy danh sách sản phẩm:', err);
      setError('Lỗi khi lấy dữ liệu, vui lòng thủ định lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initially load and whenever activeKeyword or currentPage changes
  useEffect(() => {
    fetchProducts(currentPage, activeKeyword);
  }, [currentPage, activeKeyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Về trang đầu tiên
    setActiveKeyword(searchInput); // Chốt từ khóa tìm kiếm
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xoá vĩnh viễn sản phẩm "${name}" (ID: ${id})?\nHành động này không thể hoàn tác!`)) {
      try {
        await productService.deleteProduct(id);
        alert('Xoá sản phẩm thành công!');
        fetchProducts(currentPage, activeKeyword); // Tải lại danh sách
      } catch (err) {
        console.error('Lỗi khi xoá:', err);
        alert('Không thể xoá sản phẩm vì có thể nó đã sinh giao dịch hoặc lỗi máy chủ.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" /> Quản lý Sản phẩm
          </h1>
          <p className="max-w-xl text-slate-500 mt-1">
            Theo dõi, chỉnh sửa và thêm mới các mặt hàng kinh doanh trong hệ thống của bạn.
          </p>
        </div>
        <Link 
          to="/admin/products/create"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
        >
          <Plus size={20} /> Thêm Sản Phẩm
        </Link>
      </div>

      {/* Toolbar (Search) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-24 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-sans"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <button 
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-md text-sm transition-colors"
          >
            Tìm kiếm
          </button>
        </form>
        
        {/* Lọc Thể Loại (Category Dropdown) - Optional Placeholder */}
        <div className="flex gap-2 shrink-0">
          <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors font-medium flex items-center gap-2">
            <LayoutGrid size={18} /> Lọc bằng Bộ lọc
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4" />
            <p>Đang tải dữ liệu sản phẩm...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-rose-500">
            <AlertCircle size={48} className="mb-4 opacity-80" />
            <p className="font-medium text-lg text-slate-700 mb-2">Đã xảy ra sự cố</p>
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-500 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <ShoppingBag size={32} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700 text-lg mb-1">Không tìm thấy sản phẩm nào</p>
            <p>
              {activeKeyword 
                ? `Không có kết quả nào khớp với "${activeKeyword}"` 
                : 'Chưa có sản phẩm nào trong hệ thống.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-4 px-6 font-semibold w-24">ID</th>
                  <th className="py-4 px-6 font-semibold min-w-[300px]">Tên Sản Phẩm</th>
                  <th className="py-4 px-6 font-semibold">Danh Mục</th>
                  <th className="py-4 px-6 font-semibold text-right w-32">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 text-slate-500 font-medium">#{product.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.thumbnail ? (
                            <img 
                              src={getImageUrl(product.thumbnail)} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="text-slate-300 w-6 h-6" />
                          )}
                        </div>
                        <span className="line-clamp-2 leading-snug">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                        {product.categoryName || 'Không có'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/admin/products/${product.id}/variants`}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Quản lý biến thể (SKU)"
                        >
                          <Layers size={18} />
                        </Link>
                        <Link 
                          to={`/admin/products/${product.id}/edit`}
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          title="Sửa thông tin sản phẩm"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xoá vĩnh viễn"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500 pl-2">
              Trang <span className="text-indigo-600 font-bold">{currentPage + 1}</span> / {totalPages}
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Trang trước
              </button>
              
              <div className="hidden sm:flex items-center gap-1">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                      currentPage === idx
                        ? 'bg-indigo-600 text-white border-transparent'
                        : 'bg-white border text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
