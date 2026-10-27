"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Battery,
  Zap,
  Volume2,
  Lock,
  UserPlus,
  LogIn,
  X,
  AlertCircle,
  PackageCheck,
  Plus,
  Minus,
} from "lucide-react";
import { addToCart } from "@/lib/cart";
import { getProductByIdOrSlug, getRelatedProducts, CatalogProduct } from "@/lib/products";

interface PageProps {
  params: Promise<{ id: string }>;
}

function ProductDetailContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Check login status
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, []);

  // Fetch product data
  useEffect(() => {
    setLoading(true);
    // 1. Try static catalog first for instant response
    const staticItem = getProductByIdOrSlug(productId);
    if (staticItem) {
      setProduct(staticItem);
      setActiveImage(staticItem.colors?.[0]?.image || staticItem.image);
      setLoading(false);
      return;
    }

    // 2. Otherwise fetch from API
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
          setActiveImage(data.product.colors?.[0]?.image || data.product.image);
        }
      })
      .catch((err) => console.error("Fetch product error:", err))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#86868b]">جاري تجهيز تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center px-4 py-32">
          <div className="w-16 h-16 rounded-full bg-[#1d1d1f] border border-[#333336] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#86868b]" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">عذراً، المنتج غير متوفر</h1>
          <p className="text-xs text-[#86868b] mb-6">
            ربما تم نقل المنتج أو تغير الرابط الخاص به. يمكنك تصفح باقي المنتجات في المتجر.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-xs font-medium transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لجميع المنتجات</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const colors = product.colors && product.colors.length > 0
    ? product.colors
    : [{ name: "اللون القياسي", hex: "#1e1e1e", image: product.image }];

  const currentColor = colors[selectedColorIndex] || colors[0];
  const displayImage = activeImage || currentColor.image || product.image;
  const relatedProducts = getRelatedProducts(product.slug, product.category, 4);

  const handleSelectColor = (index: number) => {
    setSelectedColorIndex(index);
    const col = colors[index];
    if (col?.image) {
      setActiveImage(col.image);
    }
  };

  const handleAddToCart = () => {
    // REQUIRE ACCOUNT: check if logged in
    if (!currentUser) {
      setShowAuthRequiredModal(true);
      return;
    }

    addToCart({
      id: product._id || product.slug,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      color: {
        id: currentColor.name,
        name: currentColor.name,
        hex: currentColor.hex,
        image: currentColor.image,
      },
      image: displayImage,
      quantity,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  const handleDirectBuy = () => {
    const params = new URLSearchParams();
    params.set("productId", product.slug);
    params.set("color", currentColor.name);
    params.set("price", product.price.toString());
    params.set("quantity", quantity.toString());
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] selection:bg-white selection:text-black flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-20 flex-1">
        {/* Breadcrumb Navigation & Back Link */}
        <div className="flex items-center justify-between py-3 mb-6 border-b border-[#282828] text-xs">
          <nav className="flex items-center gap-2 text-[#86868b]">
            <Link href="/" className="hover:text-white transition-colors">
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-white transition-colors">
              المنتجات
            </Link>
            <span>/</span>
            <span className="text-[#f5f5f7] font-medium truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/products");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors cursor-pointer"
          >
            <span>العودة للخلف</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Product Section: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Column 1 (Left on RTL, Images Showcase) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative w-full aspect-square rounded-[28px] bg-[#ffffff] border border-[#333336]/40 p-6 sm:p-10 flex items-center justify-center overflow-hidden shadow-2xl">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-contain select-none transition-all duration-500 ease-out"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                <span className="px-3 py-1 rounded-full bg-[#1d1d1f]/90 backdrop-blur-md border border-[#333336] text-[11px] font-semibold text-[#f5f5f7] uppercase tracking-wider">
                  {product.brand}
                </span>
                {product.isFeatured && (
                  <span className="px-3 py-0.5 rounded-full bg-[#b64400] text-white text-[10px] font-bold">
                    إصدار مميز
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 right-4 text-[11px] font-medium text-neutral-800 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-300">
                اللون: {currentColor.name}
              </div>
            </div>

            {/* Gallery Thumbnails (Colors & Additional Images) */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {colors.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectColor(idx)}
                  className={`relative w-20 h-20 rounded-[18px] bg-[#ffffff] p-1.5 border transition-all cursor-pointer shrink-0 flex items-center justify-center overflow-hidden ${
                    selectedColorIndex === idx
                      ? "border-white ring-2 ring-white/80 shadow-lg scale-105"
                      : "border-[#333336] opacity-70 hover:opacity-100"
                  }`}
                  title={color.name}
                >
                  <img
                    src={color.image || product.image}
                    alt={color.name}
                    className="w-full h-full object-contain"
                  />
                  <div
                    className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-black/20 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                </button>
              ))}
            </div>

            {/* Guarantee Trust Badges Grid */}
            <div className="grid grid-cols-3 gap-2.5 mt-2">
              <div className="p-3.5 rounded-[20px] bg-[#161617] border border-[#282828] text-center">
                <ShieldCheck className="w-4 h-4 mx-auto text-[#f5f5f7] mb-1.5" />
                <span className="text-[11px] font-semibold text-[#f5f5f7] block">ضمان سنتين</span>
                <span className="text-[10px] text-[#86868b]">ضمان محلي معتمد</span>
              </div>
              <div className="p-3.5 rounded-[20px] bg-[#161617] border border-[#282828] text-center">
                <Truck className="w-4 h-4 mx-auto text-[#f5f5f7] mb-1.5" />
                <span className="text-[11px] font-semibold text-[#f5f5f7] block">شحن سريع</span>
                <span className="text-[10px] text-[#86868b]">لكافة المحافظات</span>
              </div>
              <div className="p-3.5 rounded-[20px] bg-[#161617] border border-[#282828] text-center">
                <RotateCcw className="w-4 h-4 mx-auto text-[#f5f5f7] mb-1.5" />
                <span className="text-[11px] font-semibold text-[#f5f5f7] block">استبدال 14 يوم</span>
                <span className="text-[10px] text-[#86868b]">استرداد نقدي كامل</span>
              </div>
            </div>
          </div>

          {/* Column 2 (Right on RTL, Product Details & Purchase CTAs) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Rating & Availability */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
                  <div className="flex items-center text-[#f5f5f7]">
                    <Star className="w-3.5 h-3.5 fill-[#f5f5f7] text-[#f5f5f7]" />
                  </div>
                  <span className="font-semibold text-[#f5f5f7] text-[13px]">{product.rating}</span>
                  <span>({product.reviewsCount} تقييم معتمد)</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>متوفر للتسليم الفوري ({product.stockCount || 12} قطعة)</span>
                </div>
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl sm:text-4xl font-semibold text-[#f5f5f7] tracking-tight leading-snug">
                {product.name}
              </h1>

              <p className="text-xs sm:text-[13px] text-[#86868b] mt-3 leading-relaxed font-normal">
                {product.description}
              </p>

              {/* Price Banner */}
              <div className="mt-5 p-4 rounded-[22px] bg-[#161617] border border-[#282828] flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#f5f5f7] tracking-tight">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-[#86868b] line-through font-normal">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#86868b] block mt-0.5 font-normal">
                    ما يعادل تقريباً {(product.price * 38).toLocaleString()} ج.م • شامل الشحن والضريبة
                  </span>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-[#1d1d1f] border border-[#333336] text-[10px] font-medium text-[#f5f5f7]">
                    أصلي 100%
                  </span>
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-[12px] font-medium text-[#86868b]">
                    تحديد اللون المتاح:
                  </label>
                  <span className="text-xs font-semibold text-[#f5f5f7]">
                    {currentColor.name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectColor(idx)}
                      className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        selectedColorIndex === idx
                          ? "bg-[#2c2c2e] text-[#f5f5f7] border border-white ring-1 ring-white shadow-md"
                          : "bg-[#161617] text-[#86868b] border border-[#333336] hover:text-[#f5f5f7] hover:border-[#6e6e73]"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-6 flex items-center justify-between p-3.5 rounded-[20px] bg-[#161617] border border-[#282828]">
                <span className="text-xs font-medium text-[#86868b]">الكمية المطلوبة:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-full bg-[#1d1d1f] border border-[#333336] text-white flex items-center justify-center hover:bg-[#28282b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold text-[#f5f5f7] w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    className="w-8 h-8 rounded-full bg-[#1d1d1f] border border-[#333336] text-white flex items-center justify-center hover:bg-[#28282b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Action Buttons: Direct Checkout & Add To Cart */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {/* 1. Direct Checkout Button */}
                <button
                  type="button"
                  onClick={handleDirectBuy}
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-xs sm:text-sm font-medium transition-all shadow-lg shadow-black/40 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>شراء فوري مباشر</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>

                {/* 2. Add To Cart Button (Requires account) */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#161617] hover:bg-[#1f1f22] text-[#f5f5f7] border border-[#333336] hover:border-white/40 text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة إلى السلة</span>
                </button>
              </div>

              {/* Notification if added */}
              {addedToast && (
                <div className="mt-3 p-3 rounded-2xl bg-white/10 border border-white/20 text-[#f5f5f7] text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تمت إضافة المنتج إلى سلة مشترياتك بنجاح!</span>
                  </div>
                  <Link
                    href="/cart"
                    className="underline text-xs font-semibold hover:text-white"
                  >
                    عرض السلة
                  </Link>
                </div>
              )}

              {/* Technical Specs Accordion / Grid */}
              <div className="mt-8 pt-6 border-t border-[#282828]">
                <h3 className="text-sm font-semibold text-[#f5f5f7] mb-3">
                  المواصفات الفنية المعتمدة
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.specs?.battery && (
                    <div className="p-3 rounded-[16px] bg-[#161617] border border-[#282828]">
                      <span className="text-[10px] text-[#86868b] block mb-0.5">البطارية</span>
                      <span className="text-xs font-semibold text-[#f5f5f7]">{product.specs.battery}</span>
                    </div>
                  )}
                  {product.specs?.driver && (
                    <div className="p-3 rounded-[16px] bg-[#161617] border border-[#282828]">
                      <span className="text-[10px] text-[#86868b] block mb-0.5">مشغلات الصوت</span>
                      <span className="text-xs font-semibold text-[#f5f5f7]">{product.specs.driver}</span>
                    </div>
                  )}
                  {product.specs?.bluetooth && (
                    <div className="p-3 rounded-[16px] bg-[#161617] border border-[#282828]">
                      <span className="text-[10px] text-[#86868b] block mb-0.5">البلوتوث</span>
                      <span className="text-xs font-semibold text-[#f5f5f7]">{product.specs.bluetooth}</span>
                    </div>
                  )}
                  {product.specs?.anc && (
                    <div className="p-3 rounded-[16px] bg-[#161617] border border-[#282828]">
                      <span className="text-[10px] text-[#86868b] block mb-0.5">عزل الضوضاء</span>
                      <span className="text-xs font-semibold text-[#f5f5f7]">{product.specs.anc}</span>
                    </div>
                  )}
                  {product.specs?.weight && (
                    <div className="p-3 rounded-[16px] bg-[#161617] border border-[#282828]">
                      <span className="text-[10px] text-[#86868b] block mb-0.5">الوزن</span>
                      <span className="text-xs font-semibold text-[#f5f5f7]">{product.specs.weight}</span>
                    </div>
                  )}
                  {product.specs?.charging && (
                    <div className="p-3 rounded-[16px] bg-[#161617] border border-[#282828]">
                      <span className="text-[10px] text-[#86868b] block mb-0.5">منفذ الشحن</span>
                      <span className="text-xs font-semibold text-[#f5f5f7]">{product.specs.charging}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Features List */}
              {product.features && product.features.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#282828]">
                  <h3 className="text-sm font-semibold text-[#f5f5f7] mb-3">
                    أهم المميزات والتقنيات
                  </h3>
                  <div className="space-y-2">
                    {product.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#86868b]">
                        <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                        <span className="text-[#f5f5f7] leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#282828]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-semibold text-[#f5f5f7] uppercase tracking-wider block mb-1">
                  اقتراحات مشابهة
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#f5f5f7] tracking-tight">
                  منتجات قد تنال إعجابك
                </h2>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors"
              >
                <span>تصفح الكل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/products/${rel.slug}`}
                  className="group rounded-[24px] bg-[#161617] border border-[#282828] hover:border-[#333336] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-[#86868b] uppercase">
                        {rel.brand}
                      </span>
                      <span className="text-[10px] text-[#86868b]">
                        {rel.category === "headphones" ? "سماعة رأس" : "إيربودز"}
                      </span>
                    </div>

                    <div className="relative w-full aspect-square rounded-[18px] bg-[#ffffff] overflow-hidden p-2.5 mb-3 flex items-center justify-center border border-[#333336]/20">
                      <img
                        src={rel.image}
                        alt={rel.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    <h3 className="text-xs font-semibold text-[#f5f5f7] line-clamp-1 group-hover:text-white transition-colors">
                      {rel.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#282828] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#f5f5f7]">${rel.price}</span>
                    <span className="text-[11px] text-[#86868b] group-hover:text-white flex items-center gap-1">
                      <span>عرض</span>
                      <ArrowLeft className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Auth Required Modal (Enforces account requirement for cart) */}
      {showAuthRequiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full p-7 rounded-[28px] bg-[#1d1d1f] border border-[#333336] shadow-2xl text-center">
            <button
              onClick={() => setShowAuthRequiredModal(false)}
              className="absolute top-4 left-4 p-2 rounded-full text-[#86868b] hover:text-white hover:bg-[#28282b] transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Lock className="w-7 h-7" />
            </div>

            <span className="text-[11px] font-semibold text-[#f5f5f7] uppercase tracking-wider block mb-1">
              تسجيل الحساب مطلوب
            </span>

            <h3 className="text-xl font-semibold text-[#f5f5f7] tracking-tight">
              يلزم وجود حساب للإضافة إلى السلة
            </h3>

            <p className="text-xs text-[#86868b] mt-2.5 leading-relaxed">
              لحفظ منتجاتك في سلة المشتريات ومزامنتها على مختلف أجهزتك ومتابعة حالة التوصيل، يرجى تسجيل الدخول أو إنشاء حساب جديد خلال ثوانٍ.
            </p>

            <div className="mt-6 space-y-2.5">
              <Link
                href={`/register?redirect=/products/${product.slug}`}
                className="w-full py-3 px-5 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>إنشاء حساب جديد</span>
              </Link>

              <Link
                href={`/login?redirect=/products/${product.slug}`}
                className="w-full py-3 px-5 rounded-full bg-[#161617] hover:bg-[#28282b] text-[#f5f5f7] border border-[#333336] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول إلى حسابي</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}