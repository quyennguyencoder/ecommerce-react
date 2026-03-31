import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CartList from '../components/cart/CartList';
import CartSkeleton from '../components/cart/CartSkeleton';
import CartSummary from '../components/cart/CartSummary';
import EmptyCart from '../components/cart/EmptyCart';
import { cartService } from '../services/cartService';
import type { CartResponse } from '../types';

const Cart = () => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((nextToast: { type: 'success' | 'error'; message: string }) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(nextToast);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2500);
  }, []);

  const formatMoney = useCallback((value: number) => {
    if (Number.isNaN(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  }, []);

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await cartService.getMyCart();
      setCart(response.data ?? null);
    } catch {
      setError('Failed to load cart.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleUpdateQuantity = useCallback(
    async (itemId: number, nextQuantity: number) => {
      if (nextQuantity < 1) {
        return;
      }
      setUpdatingItemId(itemId);
      setError('');
      try {
        const response = await cartService.updateCartItem(itemId, {
          quantity: nextQuantity,
        });
        setCart(response.data ?? null);
        showToast({ type: 'success', message: 'Quantity updated.' });
      } catch {
        setError('Failed to update quantity.');
        showToast({ type: 'error', message: 'Failed to update quantity.' });
      } finally {
        setUpdatingItemId(null);
      }
    },
    [showToast]
  );

  const handleRemoveItem = useCallback(async (itemId: number) => {
    setUpdatingItemId(itemId);
    setError('');
    try {
      const response = await cartService.removeFromCart(itemId);
      setCart(response.data ?? null);
      showToast({ type: 'success', message: 'Item removed from cart.' });
    } catch {
      setError('Failed to remove item.');
      showToast({ type: 'error', message: 'Failed to remove item.' });
    } finally {
      setUpdatingItemId(null);
    }
  }, [showToast]);

  const handleClearCart = useCallback(async () => {
    setIsClearing(true);
    setError('');
    try {
      await cartService.clearCart();
      setCart((prev) =>
        prev
          ? {
              ...prev,
              cartItems: [],
              totalItems: 0,
              totalPrice: 0,
            }
          : prev
      );
      showToast({ type: 'success', message: 'Cart cleared.' });
    } catch {
      setError('Failed to clear cart.');
      showToast({ type: 'error', message: 'Failed to clear cart.' });
    } finally {
      setIsClearing(false);
    }
  }, [showToast]);

  const cartItems = cart?.cartItems ?? [];
  const totals = useMemo(
    () => ({
      totalItems: cart?.totalItems ?? 0,
      totalPrice: cart?.totalPrice ?? 0,
    }),
    [cart?.totalItems, cart?.totalPrice]
  );

  return (
    <main className="mx-auto w-full max-w-300 flex-1 px-6 py-10">
      {toast ? (
        <div
          className={`fixed right-6 top-6 z-50 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        >
          {toast.message}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Cart</h1>
        {error ? <span className="text-sm text-rose-500">{error}</span> : null}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          {isLoading ? (
            <CartSkeleton />
          ) : cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <CartList
              items={cartItems}
              updatingItemId={updatingItemId}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              formatMoney={formatMoney}
            />
          )}
        </div>
        <CartSummary
          totalItems={totals.totalItems}
          totalPrice={totals.totalPrice}
          isClearing={isClearing}
          onClear={handleClearCart}
          formatMoney={formatMoney}
        />
      </div>
    </main>
  );
};

export default Cart;
