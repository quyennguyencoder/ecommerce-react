import { useState, useEffect } from 'react';
import { productVariantService } from '../../services/productVariantService';

interface ProductVariantImageProps {
  variantId: number;
  alt: string;
  className?: string;
  fallbackText?: string;
}

const ProductVariantImage = ({ 
  variantId, 
  alt, 
  className = '', 
  fallbackText = 'No image' 
}: ProductVariantImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    let isMounted = true;
    
    const fetchImage = async () => {
      try {
        const blob = await productVariantService.getProductVariantImage(variantId);
        if (isMounted) {
          url = URL.createObjectURL(blob);
          setImageUrl(url);
          setError(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [variantId]);

  if (error || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-xs text-slate-400 ${className}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default ProductVariantImage;
