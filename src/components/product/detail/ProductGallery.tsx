import { useState } from 'react';
import type { ProductImageResponse } from '../../../types/responses';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ProductGalleryProps {
  images: ProductImageResponse[];
  thumbnail: string;
}

const ProductGallery = ({ images, thumbnail }: ProductGalleryProps) => {
  // Add thumbnail to the beginning of the list if it's not already in images
  const allImages = [thumbnail, ...images.map(img => img.imageUrl)];
  
  const [activeIndex, setActiveIndex] = useState(0);

  const nextImage = () => {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100 group">
        <img
          src={allImages[activeIndex]}
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
            className={`relative flex-shrink-0 w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
              activeIndex === index ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-300'
            }`}
          >
            <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
            {activeIndex !== index && <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
