import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import type { CategoryResponse } from '../../types';

type CategoryOption = Pick<CategoryResponse, 'id' | 'name'>;

const CART_ICON = (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    className="h-5 w-5"
  >
    <path
      d="M7 6h14l-1.6 8.5a2 2 0 0 1-2 1.5H9.2a2 2 0 0 1-2-1.6L5.1 3H2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="20" r="1.6" />
    <circle cx="18" cy="20" r="1.6" />
  </svg>
);

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

export default function Navbar() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
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

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      await productService.getAllProducts(
        searchValue.trim() ? { keyword: searchValue.trim() } : undefined
      );
    } catch (error) {
      console.error('Failed to search products', error);
    } finally {
      setIsSearching(false);
    }
  };

  const categoryOptions = [
    ALL_CATEGORIES,
    ...categories.map((category) => ({ id: category.id, name: category.name })),
  ].filter((category) => category.id !== selectedCategory.id);

  return (
    <nav className="border-b border-slate-200 bg-white shadow-[0_1px_0_rgba(16,24,40,0.04)]">
      <div className="mx-auto flex max-w-300 items-center gap-7 px-5 py-3.5 max-[900px]:flex-wrap max-[900px]:gap-3.5">
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100/60 text-indigo-600"
          aria-label="Go to home"
        >
          {BRAND_ICON}
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-slate-800 transition hover:text-indigo-600"
          >
            Home
          </Link>
          <Link
            to="/product"
            className="text-sm font-medium text-slate-800 transition hover:text-indigo-600"
          >
            Product
          </Link>
          <div className="relative" ref={categoryRef}>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 transition hover:text-indigo-600"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
            >
              {selectedCategory.name}
              <span
                className={`text-[11px] transition-transform ${
                  isCategoryOpen ? 'rotate-180' : ''
                }`}
              >
                v
              </span>
            </button>
            {isCategoryOpen && (
              <div className="absolute left-0 top-[calc(100%+10px)] z-10 min-w-45 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
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
                      className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-100"
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsCategoryOpen(false);
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <Link
            to="/notification"
            className="text-sm font-medium text-slate-800 transition hover:text-indigo-600"
          >
            Notification
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3.5 max-[900px]:w-full max-[900px]:justify-between">
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <input
              type="text"
              className="min-w-60 border-0 bg-transparent px-3 py-2 text-sm outline-none max-[900px]:min-w-40"
              placeholder="Search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button
              type="button"
              className="bg-sky-200 px-3.5 py-2 text-sm font-semibold text-slate-900 transition disabled:cursor-default disabled:opacity-60"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          <Link
            to="/cart"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:text-slate-900"
            aria-label="Cart"
          >
            {CART_ICON}
          </Link>

          <div className="relative" ref={avatarRef}>
            <button
              type="button"
              className="p-0"
              onClick={() => setIsAvatarOpen((prev) => !prev)}
              aria-label="Open profile menu"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                U
              </span>
            </button>
            {isAvatarOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-10 min-w-45 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
                <Link
                  to="/profile"
                  className="block w-full rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-100"
                  onClick={() => setIsAvatarOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="block w-full rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-100"
                  onClick={() => setIsAvatarOpen(false)}
                >
                  Orders
                </Link>
                <button
                  type="button"
                  className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-100"
                  onClick={() => setIsAvatarOpen(false)}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
