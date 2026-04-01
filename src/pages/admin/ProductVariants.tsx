import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, Plus, Trash2, Image as ImageIcon,
  Package, DollarSign, Fingerprint, Save, RefreshCcw, Layers
} from 'lucide-react';

import { productService } from '../../services/productService';
import { productVariantService } from '../../services/productVariantService';
import { attributeValueService } from '../../services/attributeValueService';
import { getImageUrl } from '../../utils/image';
import type { ProductResponse, ProductVariantResponse, AttributeValueResponse } from '../../types';

const variantSchema = z.object({
  sku: z.string().min(3, 'Mã SKU phải có ít nhất 3 ký tự').max(50, 'Mã SKU không được quá dài'),
  price: z.coerce.number().min(0, 'Giá tiền không được nhỏ hơn 0'),
  stock: z.coerce.number().min(0, 'Tồn kho không được nhỏ hơn 0'),
  attributeValueIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất 1 thuộc tính'),
});

type VariantFormValues = z.infer<typeof variantSchema>;

const ProductVariants = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [attributeValues, setAttributeValues] = useState<AttributeValueResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Variant Image State
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema) as any,
    defaultValues: {
      sku: '',
      price: 0,
      stock: 0,
      attributeValueIds: [],
    }
  });

  const selectedAttributeValueIds = watch('attributeValueIds');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, variantRes, attrRes] = await Promise.all([
        productService.getProductById(productId),
        productVariantService.getProductVariantsByProductId(productId),
        attributeValueService.getAllAttributeValues()
      ]);
      setProduct(prodRes.data || null);
      setVariants(variantRes.data || []);
      setAttributeValues(attrRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Biến thể', err);
      setErrorMsg('Không thể tải dữ liệu sản phẩm và biến thể. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  // Cleanup Image URL
  useEffect(() => {
    return () => {
       if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    }
  }, [thumbnailPreview]);

  // Group attributes for nice display (e.g. Color -> [Red, Blue], Storage -> [64GB, 128GB])
  const groupedAttributes = useMemo(() => {
    const map = new Map<string, AttributeValueResponse[]>();
    for (const attr of attributeValues) {
      if (!map.has(attr.attributeName)) {
        map.set(attr.attributeName, []);
      }
      map.get(attr.attributeName)!.push(attr);
    }
    return Array.from(map.entries());
  }, [attributeValues]);

  const handleToggleAttribute = (attrId: number) => {
    const current = [...selectedAttributeValueIds];
    const index = current.indexOf(attrId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(attrId);
    }
    setValue('attributeValueIds', current, { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn ảnh hợp lệ.');
      e.target.value = '';
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleCreateVariant = async (data: VariantFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Bước 1: Tạo Variant
      const createRes = await productVariantService.createProductVariant({
        productId,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        attributeValueIds: data.attributeValueIds,
      });

      const newVariantId = createRes.data?.id;
      if (!newVariantId) throw new Error('Thất bại khi tạo Phiên bản.');

      // Bước 2: Tải lên Ảnh
      if (thumbnailFile) {
        try {
          await productVariantService.uploadProductVariantImage(newVariantId, thumbnailFile);
        } catch (imgErr) {
          console.error("Lỗi upload ảnh Variant", imgErr);
          alert('Biến thể đã được tạo nhưng Không thể cập nhật ảnh! Hãy thử xóa và làm lại sau.');
        }
      }

      // Reset form & Refresh dữ liệu
      reset();
      setThumbnailFile(null);
      setThumbnailPreview(null);
      await fetchData(); 

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Có lỗi xảy ra khi tạo mã sản phẩm này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVariant = async (id: number, sku: string) => {
    if (window.confirm(`Bạn có chắc muốn xoá phiên bản [${sku}]?\nHành động này không thể hoàn tác.`)) {
      try {
        await productVariantService.deleteProductVariant(id);
        setVariants(prev => prev.filter(v => v.id !== id));
      } catch (err) {
        alert('Xóa thất bại! Phiên bản này có thể đang kẹt trong một đơn hàng.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500">
        <RefreshCcw className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
        <p>Đang tải thông tin Sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Link */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="text-indigo-600" /> Quản lý Biến thể (Variants)
            </h1>
            <p className="text-slate-500 font-medium">Sản phẩm: <span className="text-indigo-600">{product?.name || 'Không xác định'}</span></p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* Grid Bố cục 2 Cột: Bên trái (Bảng Listing) - Bên phải (Form Thêm mới) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Listing variants */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Danh sách mã hàng (SKU)</h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{variants.length} mẫu</span>
            </div>

            {variants.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Package className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p>Sản phẩm này chưa có biến thể nào.</p>
                <p className="text-sm">Hãy tự tạo mã hàng đầu tiên bằng form bên phải nhé.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-slate-500 text-sm">
                      <th className="py-3 px-4 font-semibold w-24">Hình ảnh</th>
                      <th className="py-3 px-4 font-semibold">Mã (SKU)</th>
                      <th className="py-3 px-4 font-semibold">Tồn Kho</th>
                      <th className="py-3 px-4 font-semibold">Thuộc tính</th>
                      <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            {v.image ? (
                              <img src={getImageUrl(v.image)} alt={v.sku} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-full h-full p-3 text-slate-300" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{v.sku}</div>
                          <div className="text-sm text-indigo-600 font-semibold mt-0.5">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-md ${v.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {v.stock} chiếc
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-[200px]">
                            {/* Vì server chỉ trả List IDs, việc map ngược lại name hơi cực ở mảng tĩnh, ta có thể hiển thị ID hoặc render mờ text nếu rảnh */}
                            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg font-medium inline-block">
                              + {v.attributeValueIds.length} Lựa chọn
                            </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => handleDeleteVariant(v.id, v.sku)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                            title="Xóa biến thể"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Form Create */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:sticky lg:top-6">
          <form onSubmit={handleSubmit(handleCreateVariant as any)} className="space-y-5">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Plus className="text-indigo-600 border border-indigo-200 rounded-md p-0.5" size={22} />
                Thêm mã hàng mới
              </h2>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">Mã SKU <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  {...register('sku')}
                  placeholder="Vd: IP15-RED-256G"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 uppercase text-sm font-semibold text-slate-800"
                />
              </div>
              {errors.sku && <p className="text-rose-500 text-xs mt-1">{errors.sku.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">Giá bán <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="number"
                    {...register('price')}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">Kho <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                     type="number"
                    {...register('stock')}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Attributes Mapping */}
            <div className="border border-indigo-100 rounded-xl bg-indigo-50/30 p-4 space-y-4">
               <div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">Kết hợp Thuộc tính <span className="text-rose-500">*</span></h3>
                  <p className="text-xs text-slate-500">Tích chọn các tùy chọn áp dụng cho mã này.</p>
               </div>

               {errors.attributeValueIds && <p className="text-rose-500 text-xs font-medium">{errors.attributeValueIds.message}</p>}

               <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {groupedAttributes.map(([attrName, values]) => (
                     <div key={attrName}>
                        <div className="text-xs font-bold text-indigo-800 uppercase tracking-widest bg-indigo-100/50 inline-block px-2 py-1 rounded-md mb-2">
                          {attrName}
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {values.map(val => {
                              const isChecked = selectedAttributeValueIds.includes(val.id);
                              return (
                                 <button
                                    type="button"
                                    key={val.id}
                                    onClick={() => handleToggleAttribute(val.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all border font-medium ${
                                      isChecked 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                                    }`}
                                 >
                                    {val.value}
                                 </button>
                              )
                           })}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

             {/* Small Image Uploader */}
             <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Ảnh minh hoạ</label>
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                      {thumbnailPreview ? (
                         <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Preview"/>
                      ) : (
                         <ImageIcon size={20} className="text-slate-400" />
                      )}
                   </div>
                   <div className="flex-1">
                      <input 
                         type="file" 
                         accept="image/png, image/jpeg, image/webp" 
                         onChange={handleFileChange}
                         className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 outline-none transition-colors cursor-pointer"
                      />
                   </div>
                </div>
             </div>

             <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
             >
                {isSubmitting ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                Tạo Biến thể mới
             </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProductVariants;
