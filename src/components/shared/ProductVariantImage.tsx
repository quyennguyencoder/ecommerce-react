interface ProductVariantImageProps {
  imageUrl?: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
}

const ProductVariantImage = ({
  imageUrl,
  alt,
  className = '',
  fallbackText = 'No image',
}: ProductVariantImageProps) => {
  const src = imageUrl?.trim();

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-xs text-slate-400 ${className}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
    />
  );
};

export default ProductVariantImage;
