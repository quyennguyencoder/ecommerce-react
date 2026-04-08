import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductGallery from '../components/product/detail/ProductGallery';
import ProductInfo from '../components/product/detail/ProductInfo';
import Variations from '../components/product/detail/Variations';
import ProductActions from '../components/product/detail/ProductActions';
import ProductDetailsTabs from '../components/product/detail/ProductDetailsTabs';
import RelatedProducts from '../components/product/detail/RelatedProducts';
import type {
  ProductVariantResponse,
  ProductResponse,
  ProductImageResponse,
  FeedbackResponse,
  AttributeValueResponse,
} from '../types';
import { productService } from '../services/productService';
import { productImageService } from '../services/productImageService';
import { productVariantService } from '../services/productVariantService';
import { feedbackService } from '../services/feedbackService';
import { attributeValueService } from '../services/attributeValueService';
import { cartService } from '../services/cartService';
import { getImageUrl } from '../utils/image';
import { getAccessToken } from '../utils/authStorage';

const getResponseStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || !error) return undefined;
  if (!('response' in error)) return undefined;
  const response = (error as { response?: { status?: number } }).response;
  return response?.status;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [images, setImages] = useState<ProductImageResponse[]>([]);
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [reviews, setReviews] = useState<FeedbackResponse[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductResponse[]>([]);
  const [attributeValues, setAttributeValues] = useState<AttributeValueResponse[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      setSelectedVariant(null);
      
      try {
        const productId = parseInt(id, 10);
        if (isNaN(productId)) throw new Error('Invalid product ID');
        
        // Fetch main product first
        const productRes = await productService.getProductById(productId);
        const productData = productRes.data;
        if (!productData) throw new Error('Product not found');
        
        setProduct({ ...productData, thumbnail: getImageUrl(productData.thumbnail) });

        // Fetch related data in parallel
        const [imagesRes, variantsRes, feedbackRes, relatedRes, attrRes] = await Promise.all([
          productImageService.getProductImagesByProductId(productId),
          productVariantService.getProductVariantsByProductId(productId),
          feedbackService.getAllFeedbacks({ productId, page: 0, size: 5 }),
          productService.getAllProducts({ categoryId: productData.categoryId, page: 0, size: 4 }),
          attributeValueService.getAllAttributeValues().catch((e) => {
            console.warn('Không tải được danh sách thuộc tính:', e);
            return { data: [] as AttributeValueResponse[] };
          }),
        ]);

        // Map product images
        const imagesData = imagesRes.data || [];
        setImages(imagesData.map(img => ({...img, imageUrl: getImageUrl(img.imageUrl)})));

        // Map variants images
        const variantsData = variantsRes.data || [];
        setVariants(variantsData.map(v => ({...v, image: getImageUrl(v.image)})));

        setAttributeValues(attrRes.data || []);

        // Set reviews
        if (feedbackRes.data?.content) setReviews(feedbackRes.data.content);
        
        // Map related products images
        if (relatedRes.data?.content) {
          const related = relatedRes.data.content.filter(p => p.id !== productId);
          setRelatedProducts(related.map(p => ({...p, thumbnail: getImageUrl(p.thumbnail)})));
        } else {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  const refreshReviews = async (productId: number) => {
    try {
      const feedbackRes = await feedbackService.getAllFeedbacks({ productId, page: 0, size: 5 });
      setReviews(feedbackRes.data?.content || []);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    }
  };

  const handleCreateReview = async (payload: { star: number; content?: string }) => {
    if (!id) return;
    const token = getAccessToken();
    if (!token) {
      navigate(`/auth/login?redirect=${encodeURIComponent(`/product/${id}`)}`);
      return;
    }

    const productId = parseInt(id, 10);
    if (Number.isNaN(productId)) return;

    try {
      setIsSubmittingReview(true);
      await feedbackService.createFeedback({
        star: payload.star,
        content: payload.content,
        productId,
      });
      await refreshReviews(productId);
      alert('Cảm ơn bạn đã đánh giá sản phẩm!');
    } catch (err: unknown) {
      console.error('Lỗi gửi đánh giá:', err);
      const status = getResponseStatus(err);
      if (status === 401 || status === 403) {
        alert('Vui lòng đăng nhập để đánh giá sản phẩm.');
        navigate(`/auth/login?redirect=${encodeURIComponent(`/product/${id}`)}`);
      } else {
        alert('Không thể gửi đánh giá lúc này. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = async (variantId: number, quantity: number) => {
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await cartService.addToCart({ variantId, quantity });
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
    } catch (err: unknown) {
      console.error('Lỗi khi thêm vào giỏ hàng:', err);
      const status = getResponseStatus(err);
      if (status === 401 || status === 403) {
        alert('Vui lòng đăng nhập để thêm vào giỏ hàng.');
        navigate(`/auth/login?redirect=${encodeURIComponent(`/product/${id ?? ''}`)}`);
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async (variantId: number, quantity: number) => {
    const buyNowVariant = variants.find(v => v.id === variantId);
    if (!product || !buyNowVariant) {
      alert('Dữ liệu sản phẩm chưa sẵn sàng, vui lòng tải lại trang.');
      return;
    }

    try {
      await cartService.clearCart();
      const res = await cartService.addToCart({ variantId: buyNowVariant.id, quantity });
      const addedItem = res.data?.cartItems?.find(
        item => item.variantId === buyNowVariant.id
      );
      if (!addedItem) {
        throw new Error('Không lấy được thông tin sản phẩm trong giỏ hàng.');
      }

      navigate('/checkout', {
        state: {
          isBuyNow: true,
          buyNowItem: {
            product,
            variant: buyNowVariant,
            quantity,
          },
          buyNowCartItemId: addedItem.id,
        },
      });
      return;
    } catch (err: unknown) {
      console.error('Lỗi khi xử lý mua ngay:', err);
      const status = getResponseStatus(err);
      if (status === 401 || status === 403) {
        alert('Vui lòng đăng nhập để mua ngay.');
        navigate(`/auth/login?redirect=${encodeURIComponent(`/product/${id ?? ''}`)}`);
        return;
      }
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      return;
    }

    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-6 text-lg">{error || 'Không tìm thấy sản phẩm'}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Trở về trang chủ
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb mock */}
      <nav className="text-sm text-slate-500 mb-8 pb-4">
        <span className="hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => navigate('/')}>Trang chủ</span>
        <span className="mx-2 text-slate-300">&rsaquo;</span>
        <span className="hover:text-indigo-600 cursor-pointer transition-colors">{product.categoryName}</span>
        <span className="mx-2 text-slate-300">&rsaquo;</span>
        <span className="font-medium text-slate-900 truncate inline-block max-w-[200px] sm:max-w-xs align-bottom">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
        {/* Left Col: Images */}
        <div className="w-full lg:w-[45%] xl:w-1/2">
          <ProductGallery
            images={images}
            thumbnail={product.thumbnail}
            selectedVariantImage={selectedVariant?.image}
          />
        </div>

        {/* Right Col: Info & Actions */}
        <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col pt-2 lg:pt-0">
          <ProductInfo product={product} selectedVariant={selectedVariant} />
          <Variations
            variants={variants}
            onSelectVariant={setSelectedVariant}
            attributeValues={attributeValues}
          />
          <ProductActions 
            selectedVariant={selectedVariant}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isAddingToCart={isAddingToCart}
          />
        </div>
      </div>

      {/* Tabs Layout */}
      <ProductDetailsTabs
        description={product.description}
        reviews={reviews}
        canReview={!!getAccessToken()}
        isSubmittingReview={isSubmittingReview}
        onSubmitReview={handleCreateReview}
        onRequestLogin={() =>
          navigate(`/auth/login?redirect=${encodeURIComponent(`/product/${id ?? ''}`)}`)
        }
      />

      {/* Related Layout */}
      <RelatedProducts products={relatedProducts} />
    </main>
  );
};

export default ProductDetail;
