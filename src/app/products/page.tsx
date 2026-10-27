"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  Star,
  Battery,
  Check,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  category: "headphones" | "earbuds";
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  colors?: { name: string; hex: string; image: string }[];
  features?: string[];
  specs?: {
    battery?: string;
    driver?: string;
    bluetooth?: string;
    anc?: string;
  };
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  isFeatured?: boolean;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlBrand = searchParams.get("brand") || "all";
  const urlCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(urlBrand);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");

  const brands = ["all", "JBL", "Soundcore", "Oraimo", "Beats", "Sony", "Bose", "Apple"];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedBrand !== "all") params.append("brand", selectedBrand);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let list: Product[] = data.products || [];
        if (sortBy === "price-low") {
          list = [...list].sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
          list = [...list].sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
          list = [...list].sort((a, b) => b.rating - a.rating);
        }
        setProducts(list);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] selection:bg-white selection:text-black flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#1d1d1f] border border-[#333336] text-[#f5f5f7] text-[11px] font-semibold tracking-wider uppercase mb-3">
            المتجر الرسمي • جميع الماركات والأنواع
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#f5f5f7] tracking-tight leading-tight">
            تصفح منتجات الصوت الفاخرة
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#86868b] font-normal">
            تشكيلة كاملة من سماعات الرأس الاحترافية وإيربودز أشهر الماركات العالمية بضمان سنتين وشحن سريع لجميع المحافظات.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mt-7 max-w-xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الماركة، أو المواصفات..."
                className="w-full pl-4 pr-11 py-3 rounded-full bg-[#161617] border border-[#333336] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white"
              />
              <Search className="w-4 h-4 text-[#86868b] absolute right-4 top-3.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    fetchProducts();
                  }}
                  className="absolute left-3.5 top-3.5 text-[#86868b] hover:text-[#f5f5f7]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-[13px] font-medium transition-colors cursor-pointer shrink-0 shadow-md"
            >
              بحث
            </button>
          </form>
        </div>

        {/* Filter & Sort Controls */}
        <div className="mb-10 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 border-b border-[#282828] pb-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 ${
                selectedCategory === "all"
                  ? "bg-[#f5f5f7] text-black shadow-lg"
                  : "bg-[#161617] text-[#86868b] hover:text-[#f5f5f7] border border-[#333336]"
              }`}
            >
              جميع المنتجات ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("headphones")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 ${
                selectedCategory === "headphones"
                  ? "bg-[#f5f5f7] text-black shadow-lg"
                  : "bg-[#161617] text-[#86868b] hover:text-[#f5f5f7] border border-[#333336]"
              }`}
            >
              سماعات الرأس (Over-Ear)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("earbuds")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 ${
                selectedCategory === "earbuds"
                  ? "bg-[#f5f5f7] text-black shadow-lg"
                  : "bg-[#161617] text-[#86868b] hover:text-[#f5f5f7] border border-[#333336]"
              }`}
            >
              إيربودز / Air Buds (In-Ear)
            </button>
          </div>

          {/* Brands & Sort Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Brand Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
              <span className="text-[11px] text-[#86868b] pl-2 shrink-0">الماركة:</span>
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                    selectedBrand === b
                      ? "bg-[#2c2c2e] text-white border border-[#3e3e3c]"
                      : "bg-[#1d1d1f] text-[#86868b] border border-[#333336] hover:text-[#f5f5f7]"
                  }`}
                >
                  {b === "all" ? "كل الماركات" : b}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#86868b]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-full bg-[#161617] border border-[#333336] text-[11px] text-[#f5f5f7] focus:outline-hidden focus:border-white"
              >
                <option value="featured">الترتيب: المميز أولاً</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#86868b]">جاري تحميل المنتجات من MongoDB Atlas...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto p-8 rounded-[28px] bg-[#161617] border border-[#282828]">
            <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
            <h4 className="text-base font-semibold text-[#f5f5f7]">لا توجد نتائج مطابقة</h4>
            <p className="text-xs text-[#86868b] mt-1">جرب اختيار قسم أو ماركة أخرى.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => (
              <div
                key={p._id}
                className="group rounded-[28px] bg-[#161617] border border-[#282828] hover:border-[#333336] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#1d1d1f] border border-[#333336] text-[10px] font-semibold text-[#f5f5f7] tracking-wider uppercase">
                      {p.brand}
                    </span>
                    <span className="text-[10px] text-[#86868b]">
                      {p.category === "headphones" ? "سماعة رأس" : "إيربودز"}
                    </span>
                  </div>

                  {/* Product Image Frame */}
                  <Link
                    href={`/products/${p.slug || p._id}`}
                    className="relative block w-full aspect-square rounded-[20px] bg-[#ffffff] overflow-hidden p-3 mb-4 border border-[#333336]/20"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {p.isFeatured && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#b64400] text-white text-[9px] font-bold">
                        مميز
                      </span>
                    )}
                  </Link>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-1.5 text-xs text-[#86868b] mb-1.5">
                    <div className="flex items-center text-[#f5f5f7]">
                      <Star className="w-3.5 h-3.5 fill-[#f5f5f7] text-[#f5f5f7]" />
                    </div>
                    <span className="font-medium text-[#f5f5f7] text-[11px]">{p.rating}</span>
                    <span className="text-[10px]">({p.reviewsCount})</span>
                  </div>

                  <Link href={`/products/${p.slug || p._id}`}>
                    <h3 className="text-[14px] font-semibold text-[#f5f5f7] tracking-tight line-clamp-1 hover:text-white transition-colors">
                      {p.name}
                    </h3>
                  </Link>

                  <p className="text-[11px] text-[#86868b] mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Quick Feature Specs */}
                  {p.specs?.battery && (
                    <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-[#282828] text-[10px] text-[#86868b]">
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3 text-white" />
                        <span>{p.specs.battery}</span>
                      </span>
                      {p.specs.anc && (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-white" />
                          <span className="truncate">{p.specs.anc.split(" ")[0]} ANC</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Price & Purchase CTA */}
                <div className="mt-4 pt-3 border-t border-[#282828] flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-[#f5f5f7]">
                        ${p.price}
                      </span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-[#86868b] line-through">
                          ${p.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#86868b]">
                      ~{(p.price * 38).toLocaleString()} ج.م
                    </div>
                  </div>

                  {/* Gray Buy & Color Link */}
                  <Link
                    href={`/products/${p.slug || p._id}`}
                    className="py-2 px-3.5 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-[11px] font-medium active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-black/40"
                  >
                    <span>تحديد اللون والشراء</span>
                    <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#000000] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-white animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
