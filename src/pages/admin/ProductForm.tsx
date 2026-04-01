import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';

import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import type { CategoryResponse } from '../../types';
import { getImageUrl } from '../../utils/image';

const productSchema = z.object({
  name: z.string().min(5, 'Tên sản phẩm phải có ít nhất 5 ký tự').max(100, 'Tên quá dài (tối đa 100 kí tự)'),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0, 'Giá tiền không được nhỏ hơn 0').optional(),
  categoryId: z.coerce.number().min(1, 'Vui lòng chọn danh mục'),
  isHot: z.boolean().default(false),
  active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm = () => {
  const navigate = useNavigate();
  const { id: idParam } = useParams();
  const productId = idParam ? Number(idParam) : NaN;
  const isEditMode = Number.isFinite(productId) && productId > 0;

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trạng thái độc lập cho Ảnh Thumbnail (Vì API nhận file riêng qua form data)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      categoryId: 0,
      isHot: false,
      active: true,
    }
  });

  // Gọi API lấy Category Dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getAllCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục', err);
      }
    };
    fetchCats();
  }, []);

  // Chế độ sửa: tải sản phẩm và đổ form
  useEffect(() => {
    if (!isEditMode) return;

    const load = async () => {
      try {
        setIsLoadingProduct(true);
        setLoadError(null);
        const res = await productService.getProductById(productId);
        const p = res.data;
        if (!p) {
          setLoadError('Không tìm thấy sản phẩm.');
          return;
        }
        setThumbnailFile(null);
        reset({
          name: p.name,
          description: p.description || '',
          basePrice: p.basePrice ?? 0,
          categoryId: p.categoryId,
          isHot: p.isHot,
          active: p.active,
        });
        setThumbnailPreview(p.thumbnail ? getImageUrl(p.thumbnail) : null);
      } catch (err) {
        console.error(err);
        setLoadError('Không tải được sản phẩm. Vui lòng thử lại.');
      } finally {
        setIsLoadingProduct(false);
      }
    };
    load();
  }, [isEditMode, productId, reset]);

  // Hủy Preview URL blob cũ để tránh rò rỉ bộ nhớ (Memory Leak)
  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG,...)');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 5MB');
      e.target.value = '';
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      if (isEditMode) {
        await productService.updateProduct(productId, {
          name: data.name,
          description: data.description || undefined,
          basePrice: data.basePrice !== undefined && data.basePrice !== null
            ? Number(data.basePrice)
            : undefined,
          categoryId: Number(data.categoryId),
          isHot: data.isHot,
          active: data.active,
        });

        if (thumbnailFile) {
          try {
            await productService.updateProductThumbnail(productId, thumbnailFile);
          } catch (uploadErr) {
            console.error('Thumbnail Error', uploadErr);
            throw new Error('Đã cập nhật thông tin nhưng tải ảnh lên thất bại. Bạn có thể thử lại sau.');
          }
        }

        alert('Đã cập nhật sản phẩm thành công!');
      } else {
        // BƯỚC 1: Khởi tạo sản phẩm với dạng văn bản JSON
        const createRes = await productService.createProduct({
          name: data.name,
          description: data.description || undefined,
          basePrice: data.basePrice ? Number(data.basePrice) : undefined,
          categoryId: Number(data.categoryId),
          isHot: data.isHot,
          active: data.active,
        });

        const newProductId = createRes.data?.id;
        if (!newProductId) {
          throw new Error('Sản phẩm tạo bị thất bại ở Backend.');
        }

        // BƯỚC 2: Nếu tạo Ok và có chọn ảnh -> Up ảnh bổ sung
        if (thumbnailFile) {
          try {
            await productService.updateProductThumbnail(newProductId, thumbnailFile);
          } catch (uploadErr) {
            console.error('Thumbnail Error', uploadErr);
            throw new Error('Đã tạo thành công SP nhưng cập nhật ảnh bị lỗi. Xin hãy sửa ảnh sau.');
          }
        }

        alert('Đã thêm sản phẩm thành công!');
      }

      navigate('/admin/products');

    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message ||
          (isEditMode
            ? 'Lỗi kết nối. Không thể cập nhật sản phẩm lúc này.'
            : 'Lỗi kết nối. Không thể tạo sản phẩm lúc này.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-slate-500">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="font-medium">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (isEditMode && loadError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
          <Link to="/admin/products" className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa Sản phẩm</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex gap-3 items-start">
          <AlertCircle size={22} className="shrink-0 mt-0.5" />
          <p className="font-medium">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      
      {/* Header Nút quay lại & Nút Lưu */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Chỉnh sửa Sản phẩm' : 'Thêm mới Sản phẩm'}
          </h1>
        </div>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex gap-3 items-start">
          <AlertCircle size={22} className="shrink-0 mt-0.5" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Grid Bố Cục Thông Tin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột Chiếm 2/3 (Thông tin chính) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Thông tin cơ bản</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
                    errors.name ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                  }`}
                />
                {errors.name && <p className="mt-1.5 text-sm text-rose-500 font-medium">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mô tả sản phẩm
                </label>
                <textarea
                  {...register('description')}
                  rows={8}
                  placeholder="Viết vài dòng giới thiệu độ hấp dẫn của sản phẩm này..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 resize-y"
                />
              </div>

            </div>
          </div>

        </div>

        {/* Cột Chiếm 1/3 (Thiết lập phụ & Ảnh) */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Phân loại & Giá</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Danh mục (Category) <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('categoryId')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white outline-none transition-all ${
                    errors.categoryId ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                  }`}
                >
                  <option value="0" disabled>-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1.5 text-sm text-rose-500 font-medium">{errors.categoryId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Giá cơ bản khởi điểm (VNĐ)
                </label>
                <input
                  type="number"
                  {...register('basePrice')}
                  placeholder="0"
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
                    errors.basePrice ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                  }`}
                />
                {errors.basePrice && <p className="mt-1.5 text-sm text-rose-500 font-medium">{errors.basePrice.message}</p>}
                <p className="text-xs text-slate-400 mt-1">Sẽ bị ghi đè nếu bạn tạo các gói Biến Thể cụ thể (Variant) sau này.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-5 text-center">Ảnh Đại Diện</h2>
            
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative hover:bg-slate-50 transition-colors group cursor-pointer overflow-hidden pb-6">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              
              {thumbnailPreview ? (
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mb-4 mt-2">
                  <ImageIcon size={32} />
                </div>
              )}
              
              <p className="font-semibold text-slate-700 mb-1">Kéo thả ảnh vào đây</p>
              <p className="text-xs text-slate-400 max-w-[180px]">PNG, JPG kích thước tối đa 5MB</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Trạng thái (Toggles)</h2>
            <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" {...register('active')} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
              <div>
                <p className="font-semibold text-slate-700 text-sm">Còn hàng (Active)</p>
                <p className="text-xs text-slate-400">Hiển thị SP lên giỏ hàng trên App.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-rose-50 cursor-pointer group">
              <input type="checkbox" {...register('isHot')} className="w-5 h-5 accent-rose-500 cursor-pointer" />
              <div>
                <p className="font-semibold text-rose-600 text-sm group-hover:text-rose-700">Mặt hàng Hot 🔥</p>
                <p className="text-xs max-w-[150px] text-rose-400 group-hover:text-rose-500">Cho trang Sản phẩm nổ bật.</p>
              </div>
            </label>
          </div>

        </div>

      </div>
    </form>
  );
};

export default ProductForm;
