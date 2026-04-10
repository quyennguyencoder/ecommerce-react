import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Plus, RefreshCcw, Trash2, UploadCloud } from 'lucide-react';

import { productService } from '../../services/productService';
import { productImageService } from '../../services/productImageService';
import type { ProductImageResponse, ProductResponse } from '../../types';
import { getImageUrl } from '../../utils/image';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ProductImages = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [images, setImages] = useState<ProductImageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<number | null>(null);

  const previewItems = useMemo(() => {
    return uploadPreviews.map((url, index) => ({ url, name: uploadFiles[index]?.name || 'preview' }));
  }, [uploadPreviews, uploadFiles]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const [productRes, imageRes] = await Promise.all([
        productService.getProductById(productId),
        productImageService.getProductImagesByProductId(productId),
      ]);

      setProduct(productRes.data || null);
      const list = imageRes.data || [];
      setImages(list.map((img) => ({ ...img, imageUrl: getImageUrl(img.imageUrl) })));
    } catch (err) {
      console.error('Lỗi tải ảnh sản phẩm:', err);
      setErrorMsg('Không thể tải ảnh sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(productId)) return;
    loadData();
  }, [productId]);

  useEffect(() => {
    return () => {
      uploadPreviews.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [uploadPreviews]);

  const validateFiles = (files: File[]) => {
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return 'Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP,...)';
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return `Kích thước tối đa mỗi ảnh là ${MAX_FILE_SIZE_MB}MB`;
      }
    }
    return null;
  };

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const validationError = validateFiles(files);
    if (validationError) {
      alert(validationError);
      event.target.value = '';
      return;
    }

    uploadPreviews.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });

    setUploadFiles(files);
    setUploadPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    try {
      setIsUploading(true);
      await productImageService.createProductImages(productId, uploadFiles);
      setUploadFiles([]);
      setUploadPreviews([]);
      await loadData();
    } catch (err) {
      console.error('Lỗi upload ảnh:', err);
      alert('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplaceImage = async (imageId: number, file?: File) => {
    if (!file) return;
    const validationError = validateFiles([file]);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setReplacingId(imageId);
      await productImageService.updateProductImage(imageId, file);
      await loadData();
    } catch (err) {
      console.error('Lỗi thay ảnh:', err);
      alert('Không thể cập nhật ảnh. Vui lòng thử lại.');
    } finally {
      setReplacingId(null);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    try {
      await productImageService.deleteProductImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error('Lỗi xoá ảnh:', err);
      alert('Không thể xoá ảnh lúc này. Vui lòng thử lại.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500">
        <RefreshCcw className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
        <p>Đang tải ảnh sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="text-indigo-600" /> Quản lý ảnh sản phẩm
            </h1>
            <p className="text-slate-500 font-medium">
              Sản phẩm: <span className="text-indigo-600">{product?.name || 'Không xác định'}</span>
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-600 text-sm font-semibold">
          <ImageIcon size={16} /> {images.length} ảnh
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Danh sách ảnh</h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                {images.length} ảnh
              </span>
            </div>

            {images.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p>Sản phẩm này chưa có ảnh bổ sung.</p>
                <p className="text-sm">Hãy thêm ảnh từ khung bên phải.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {images.map((img) => (
                  <div key={img.id} className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                    <div className="aspect-square bg-slate-100 overflow-hidden">
                      <img src={img.imageUrl} alt={product?.name || 'product'} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="text-xs text-slate-500">ID #{img.id}</div>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-100 rounded-lg cursor-pointer hover:bg-indigo-50">
                          <UploadCloud size={14} /> {replacingId === img.id ? 'Đang thay...' : 'Thay ảnh'}
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleReplaceImage(img.id, e.target.files?.[0])}
                            disabled={replacingId === img.id}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDelete(img.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa ảnh"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:sticky lg:top-6 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="text-indigo-600" size={20} />
            <h2 className="font-bold text-slate-800">Thêm ảnh mới</h2>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center relative hover:bg-slate-50 transition-colors">
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleSelectFiles}
            />
            <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <ImageIcon size={28} />
            </div>
            <p className="font-semibold text-slate-700 mb-1">Chọn nhiều ảnh để tải lên</p>
            <p className="text-xs text-slate-400">PNG, JPG, WEBP tối đa {MAX_FILE_SIZE_MB}MB/ảnh</p>
          </div>

          {previewItems.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {previewItems.map((item, index) => (
                <div key={`${item.name}-${index}`} className="rounded-lg border border-slate-100 overflow-hidden bg-slate-50">
                  <img src={item.url} alt={item.name} className="w-full h-24 object-cover" />
                  <div className="px-2 py-1 text-[11px] text-slate-500 truncate">{item.name}</div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={uploadFiles.length === 0 || isUploading}
            onClick={handleUpload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <UploadCloud size={18} />
            )}
            {isUploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
