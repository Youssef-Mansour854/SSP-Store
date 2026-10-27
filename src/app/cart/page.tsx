"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  CartItem,
} from "@/lib/cart";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
  Sparkles,
  Lock,
} from "lucide-react";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const refreshCart = () => {
    setItems(getCart());
    setLoading(false);
  };

  useEffect(() => {
    refreshCart();
    window.addEventListener("ssp_cart_updated", refreshCart);
    return () => window.removeEventListener("ssp_cart_updated", refreshCart);
  }, []);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "SSP20" || code === "JBL") {
      setDiscount(20);
      setPromoSuccess("تم تطبيق خصم $20 بنجاح!");
      setPromoError("");
    } else {
      setPromoError("كود الخصم غير صالح. جرب كود: SSP20");
      setPromoSuccess("");
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 15;
  const total = Math.max(0, subtotal - discount + shipping);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#86868b]">جاري تحميل سلة المشتريات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] selection:bg-white selection:text-black flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-28 pb-16 flex-1">
        {/* Breadcrumb & Heading */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#282828]">
          <div>
            <span className="text-[11px] font-semibold text-[#f5f5f7] uppercase tracking-wider block mb-1">
              حقيبة التسوق
            </span>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#f5f5f7]">
              سلة المشتريات
            </h1>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors"
          >
            <span>متابعة التسوق</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="py-20 text-center max-w-md mx-auto p-8 rounded-[28px] bg-[#161617] border border-[#282828] shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#1d1d1f] border border-[#333336] flex items-center justify-center mx-auto mb-4 text-[#86868b]">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#f5f5f7] mb-1">
              سلة المشتريات فارغة حالياً
            </h2>
            <p className="text-xs text-[#86868b] mb-6 leading-relaxed">
              لم تقم بإضافة أي منتجات إلى سلتك بعد. استكشف مجموعتنا من سماعات الرأس والـ AirBuds الأصلية.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-xs font-medium transition-colors shadow-lg shadow-black/40"
            >
              <span>تصفح المنتجات الآن</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          /* Cart Content: Items List + Order Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between text-xs text-[#86868b] px-2 mb-2">
                <span>المنتجات ({items.length})</span>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>تفريغ السلة</span>
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={`${item.id}-${item.color.id}`}
                  className="p-4 sm:p-5 rounded-[24px] bg-[#161617] border border-[#282828] flex flex-col sm:flex-row items-center gap-4 transition-all hover:border-[#333336]"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${item.slug || item.id}`}
                    className="w-20 h-20 rounded-2xl bg-white p-2 shrink-0 flex items-center justify-center overflow-hidden border border-[#333336]/30 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={item.image || "/colors/black.jpg"}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#1d1d1f] text-[9px] font-semibold text-[#86868b] uppercase border border-[#333336]">
                        {item.brand}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: item.color.hex }}
                        />
                        <span className="text-[11px]">{item.color.name}</span>
                      </div>
                    </div>

                    <Link href={`/products/${item.slug || item.id}`}>
                      <h3 className="text-sm font-semibold text-[#f5f5f7] line-clamp-1 hover:text-white transition-colors">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="text-xs font-semibold text-[#f5f5f7] mt-1">
                      ${item.price}{" "}
                      <span className="text-[10px] text-[#86868b] font-normal">
                        (~{(item.price * 38).toLocaleString()} ج.م)
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[#1d1d1f] border border-[#333336] rounded-full p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.color.id, -1)}
                        className="w-6 h-6 rounded-full hover:bg-[#28282b] flex items-center justify-center text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                        title="تقليل الكمية"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold font-mono text-[#f5f5f7]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.color.id, 1)}
                        className="w-6 h-6 rounded-full hover:bg-[#28282b] flex items-center justify-center text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                        title="زيادة الكمية"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id, item.color.id)}
                      className="p-2 rounded-full hover:bg-red-500/10 text-[#86868b] hover:text-red-400 transition-colors"
                      title="حذف من السلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Guarantees Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#161617]/50 border border-[#282828] flex items-center gap-2.5 text-[11px] text-[#86868b]">
                  <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                  <span>ضمان أصلي لمدة عامين واسترجاع خلال 14 يوماً</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#161617]/50 border border-[#282828] flex items-center gap-2.5 text-[11px] text-[#86868b]">
                  <Truck className="w-4 h-4 text-white shrink-0" />
                  <span>شحن سريع ومجاني لكافة المحافظات</span>
                </div>
              </div>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-[28px] bg-[#161617] border border-[#282828] shadow-2xl space-y-5">
                <h2 className="text-base font-semibold text-[#f5f5f7] pb-3 border-b border-[#282828]">
                  ملخص الطلب
                </h2>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-[11px] font-medium text-[#86868b] block">
                    كود الخصم أو القسيمة
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="SSP20"
                      className="flex-1 bg-[#1d1d1f] border border-[#333336] rounded-xl px-3 py-2 text-xs text-[#f5f5f7] focus:outline-none focus:border-white uppercase tracking-wider font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#28282b] hover:bg-[#333336] text-xs font-medium text-[#f5f5f7] transition-colors"
                    >
                      تطبيق
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-red-400">{promoError}</p>
                  )}
                  {promoSuccess && (
                    <p className="text-[11px] text-emerald-400">{promoSuccess}</p>
                  )}
                </form>

                {/* Pricing Breakdown */}
                <div className="space-y-2.5 pt-3 border-t border-[#282828] text-xs text-[#86868b]">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span className="font-semibold text-[#f5f5f7] font-mono">${subtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>الخصم المطبق</span>
                      <span className="font-semibold font-mono">-${discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>مصاريف الشحن</span>
                    <span className="text-[#f5f5f7] font-mono">
                      {shipping === 0 ? "مجاني" : `$${shipping}`}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#282828] flex justify-between text-sm sm:text-base font-bold text-[#f5f5f7]">
                    <span>الإجمالي الكلي</span>
                    <div className="text-left">
                      <div className="text-[#f5f5f7] font-mono">${total}</div>
                      <div className="text-[10px] text-[#86868b] font-normal font-sans">
                        ~{(total * 38).toLocaleString()} ج.م
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkout CTA Buttons */}
                <div className="space-y-2.5 pt-2">
                  {/* Stripe Payment Gateway Button */}
                  <Link
                    href={`/checkout?gateway=stripe&discount=${discount}`}
                    className="w-full py-3 rounded-full bg-[#635BFF] hover:bg-[#5349e4] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#635BFF]/25 hover:shadow-[#635BFF]/40 active:scale-98"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>الدفع الآمن الفوري عبر Stripe</span>
                  </Link>

                  {/* Standard Checkout Button */}
                  <Link
                    href={`/checkout?discount=${discount}`}
                    className="w-full py-3 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/40 active:scale-98"
                  >
                    <span>الدفع عند الاستلام / المحافظ</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6e6e73] pt-1">
                  <Lock className="w-3 h-3 text-white" />
                  <span>معاملات مشفرة 256-bit بمعايير حماية PCI-DSS</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
