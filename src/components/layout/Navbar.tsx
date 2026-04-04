import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Loader2, Search, ShoppingCart } from 'lucide-react';

import { authService } from '../../services/authService';
import { categoryService } from '../../services/categoryService';
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
} from '../../utils/authStorage';
import type { CategoryResponse, UserResponse } from '../../types';

type CategoryOption = Pick<CategoryResponse, 'id' | 'name'>;

const BRAND_ICON = (
  <svg
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
    className="h-7 w-7"
  >
    <path
      d="M8 26c6.5-8 17.5-14 30-14-6.5 8-17.5 14-30 14Z"
      fill="currentColor"
    />
    <path
      d="M10 36c6-6 15-10 26-10-6 6-15 10-26 10Z"
      fill="currentColor"
      opacity="0.7"
    />
  </svg>
);

const ALL_CATEGORIES: CategoryOption = {
  id: 0,
  name: 'All Categories',
};

const iconButtonClass =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(
    ALL_CATEGORIES
  );

  const categoryRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const getInitials = (name?: string) => {
    const trimmed = name?.trim();
    if (!trimmed) return 'U';
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await categoryService.getAllCategories();
        setCategories(data.data ?? []);
      } catch (error) {
        console.error('Failed to load categories', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'ec_user') {
        setCurrentUser(getStoredUser());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /** Đồng bộ ô tìm kiếm + category với URL khi đang ở /product */
  useEffect(() => {
    if (location.pathname !== '/product') return;
    const params = new URLSearchParams(location.search);
    const kw = params.get('keyword') ?? '';
    setSearchValue(kw);

    const cid = params.get('categoryId');
    if (!cid || cid === '0') {
      setSelectedCategory(ALL_CATEGORIES);
      return;
    }
    const id = parseInt(cid, 10);
    if (Number.isNaN(id) || id <= 0) {
      setSelectedCategory(ALL_CATEGORIES);
      return;
    }
    const found = categories.find((c) => c.id === id);
    if (found) {
      setSelectedCategory({ id: found.id, name: found.name });
    }
  }, [location.pathname, location.search, categories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsAvatarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buildProductListUrl = (category: CategoryOption, keyword: string) => {
    const params = new URLSearchParams();
    const kw = keyword.trim();
    if (kw) params.set('keyword', kw);
    if (category.id !== 0) params.set('categoryId', String(category.id));
    const qs = params.toString();
    return qs ? `/product?${qs}` : '/product';
  };

  const navigateToProductList = (category?: CategoryOption) => {
    const cat = category ?? selectedCategory;
    if (category) setSelectedCategory(category);
    navigate(buildProductListUrl(cat, searchValue));
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      navigateToProductList();
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    setIsAvatarOpen(false);
    try {
      const token = getAccessToken();
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
      clearAuthSession();
      setCurrentUser(null);
      navigate('/auth/login');
    }
  };

  const categoryOptions = [
    ALL_CATEGORIES,
    ...categories.map((category) => ({ id: category.id, name: category.name })),
  ].filter((category) => category.id !== selectedCategory.id);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)]">
      <div className="mx-auto flex max-w-300 flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-3.5">
        {/* Logo + điều hướng */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            to="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20 transition hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30"
            aria-label="Về trang chủ"
          >
            <span className="transition group-hover:scale-105">{BRAND_ICON}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 sm:gap-x-5">
            <Link
              to="/"
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-700"
            >
              Home
            </Link>
            <Link
              to="/product"
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-700"
            >
              Product
            </Link>
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-700"
                onClick={() => setIsCategoryOpen((prev) => !prev)}
              >
                {selectedCategory.name}
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition-transform ${
                    isCategoryOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>
              {isCategoryOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[12rem] rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5">
                  {isLoadingCategories && (
                    <div className="cursor-default rounded-lg px-2.5 py-2 text-left text-sm text-slate-400">
                      Loading...
                    </div>
                  )}
                  {!isLoadingCategories && categoryOptions.length === 0 && (
                    <div className="cursor-default rounded-lg px-2.5 py-2 text-left text-sm text-slate-400">
                      No other categories
                    </div>
                  )}
                  {!isLoadingCategories &&
                    categoryOptions.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 transition hover:bg-indigo-50 hover:text-indigo-800"
                        onClick={() => {
                          setIsCategoryOpen(false);
                          navigateToProductList(category);
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tìm kiếm + chuông + giỏ + avatar */}
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:max-w-none lg:flex-nowrap lg:justify-end">
          <div className="relative min-w-0 flex-1 sm:min-w-[220px] lg:max-w-md">
            <input
              type="text"
              className="w-full rounded-full border border-slate-200/90 bg-slate-50/90 py-2.5 pl-4 pr-12 text-sm text-slate-900 shadow-inner outline-none ring-0 transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
              placeholder="Tìm sản phẩm..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSearch();
              }}
              aria-label="Ô tìm kiếm sản phẩm"
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleSearch()}
              disabled={isSearching}
              aria-label="Tìm kiếm"
            >
              {isSearching ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
              ) : (
                <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
              )}
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
            <Link
              to="/notification"
              className={iconButtonClass}
              aria-label="Thông báo"
            >
              <Bell className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
            </Link>
            <Link
              to="/cart"
              className={iconButtonClass}
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
            </Link>

            <div className="relative" ref={avatarRef}>
              <button
                type="button"
                className="rounded-full ring-2 ring-white ring-offset-2 ring-offset-slate-100 transition hover:ring-indigo-200"
                onClick={() => setIsAvatarOpen((prev) => !prev)}
                aria-label="Mở menu tài khoản"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-10 w-10 rounded-full object-cover shadow-md ring-2 ring-white"
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-sm font-semibold text-white shadow-md">
                    {getInitials(currentUser?.name)}
                  </span>
                )}
              </button>
              {isAvatarOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-20 min-w-[11rem] rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5">
                  <Link
                    to="/profile"
                    className="block w-full rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 transition hover:bg-indigo-50 hover:text-indigo-900"
                    onClick={() => setIsAvatarOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block w-full rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 transition hover:bg-indigo-50 hover:text-indigo-900"
                    onClick={() => setIsAvatarOpen(false)}
                  >
                    Orders
                  </Link>
                  <button
                    type="button"
                    className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
