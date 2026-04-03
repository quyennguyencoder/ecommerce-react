import { useState, useMemo } from 'react';
import type { ProductImageResponse } from '../../../types/responses';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ProductGalleryProps {
  images: ProductImageResponse[];
  thumbnail: string;
  /** Ảnh biến thể đang chọn — đưa lên đầu để khớp lựa chọn */
  selectedVariantImage?: string | null;
}

const ProductGallery = ({ images, thumbnail, selectedVariantImage }: ProductGalleryProps) => {
  const allImages = useMemo(() => {
    const base = [thumbnail, ...images.map((img) => img.imageUrl)].filter(Boolean);
    const v = selectedVariantImage?.trim();
    if (!v) return base;
    const rest = base.filter((u) => u !== v);
    return [v, ...rest];
  }, [thumbnail, images, selectedVariantImage]);

  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndex = allImages.length === 0 ? 0 : Math.min(activeIndex, allImages.length - 1);

  const nextImage = () => {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  if (allImages.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="aspect-3/4 w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
          Chưa có hình ảnh
        </div>
      </div>
    );
  }

  const mainSrc = allImages[currentIndex] ?? allImages[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-slate-100 group">
        <img
          src={mainSrc}
          alt="Product Main"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-crosshair"
        />
        
        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={prevImage}
            className="p-2 rounded-full bg-white/70 hover:bg-white text-slate-800 shadow-sm transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextImage}
            className="p-2 rounded-full bg-white/70 hover:bg-white text-slate-800 shadow-sm transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {allImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative shrink-0 w-20 aspect-3/4 rounded-lg overflow-hidden border-2 transition-all ${
              currentIndex === index ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-300'
            }`}
          >
            <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
            {currentIndex !== index && <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
