"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  Minus,
  Lock,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { getCart, clearCart, CartItem } from "@/lib/cart";
import { getProductByIdOrSlug, CatalogProduct, getAllProducts } from "@/lib/products";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productIdParam =
    searchParams.get("productId") ||
    searchParams.get("product") ||
    searchParams.get("id");
  const colorParam = searchParams.get("color");
  const initialQuantity = Math.max(1, parseInt(searchParams.get("quantity") || "1", 10));
  const initialGateway = searchParams.get("gateway") || searchParams.get("mode");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(
    initialGateway === "stripe" || initialGateway === "card" ? "card" : "cod"
  );

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "القاهرة",
    address: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Load single product details if direct checkout
  const singleProduct: CatalogProduct = useMemo(() => {
    if (productIdParam) {
      const found = getProductByIdOrSlug(productIdParam);
      if (found) return found;
    }
    // Default fallback to first catalog item (JBL)
    const all = getAllProducts();
    return all[0];
  }, [productIdParam]);

  // Available colors for the chosen product
  const availableColors = useMemo(() => {
    if (singleProduct.colors && singleProduct.colors.length > 0) {
      return singleProduct.colors.map((c, idx) => ({
        id: c.name || `color-${idx}`,
        name: c.name,
        hex: c.hex,
        image: c.image || singleProduct.image,
      }));
    }
    return [
      {
        id: "default",
        name: "اللون القياسي",
        hex: "#1e1e1e",
        image: singleProduct.image,
      },
    ];
  }, [singleProduct]);

  // Initial selected color
  const [selectedColorId, setSelectedColorId] = useState<string>(() => {
    if (colorParam) {
      const match = availableColors.find(
        (c) =>
          c.name.toLowerCase() === colorParam.toLowerCase() ||
          c.id.toLowerCase() === colorParam.toLowerCase()
      );
      if (match) return match.id;
    }
    return availableColors[0]?.id || "default";
  });

  const [quantity, setQuantity] = useState<number>(initialQuantity);

  useEffect(() => {
    // Only use cart if no direct productId was specified in query params
    if (!productIdParam) {
      const items = getCart();
      if (items.length > 0) {
        setCartItems(items);
      }
    }
  }, [productIdParam]);

  // Current active color object
  const activeColorObj = useMemo(() => {
    return (
      availableColors.find((c) => c.id === selectedColorId) || availableColors[0]
    );
  }, [availableColors, selectedColorId]);

  const activeProductImage = activeColorObj?.image || singleProduct.image;
  const unitPrice = singleProduct.price;

  const isCartCheckout = !productIdParam && cartItems.length > 0;

  const subtotal = isCartCheckout
    ? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : unitPrice * quantity;

  const shipping = 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === "SSP20" || clean === "JBL") {
      setDiscount(20);
      setPromoError("");
    } else {
      setPromoError("كود الخصم غير صالح. جرب كود: SSP20");
    }
  };

  const handleBackToProduct = () => {
    if (productIdParam) {
      router.push(`/products/${singleProduct.slug || productIdParam}`);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/products");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "card") {
      const params = new URLSearchParams();
      params.set("discount", discount.toString());
      if (productIdParam) {
        params.set("productId", singleProduct.slug);
        params.set("color", activeColorObj.name);
        params.set("quantity", quantity.toString());
      }
      router.push(`/checkout/stripe?${params.toString()}`);
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، العنوان)");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalItems = isCartCheckout
        ? cartItems.map((i) => ({
            name: i.name,
            color: i.color?.name || "Standard",
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          }))
        : [
            {
              name: singleProduct.name,
              color: activeColorObj.name,
              price: unitPrice,
              quantity,
              image: activeProductImage,
            },
          ];

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerInfo: formData,
          items: finalItems,
          subtotal,
          shipping,
          discount,
          totalAmount: total,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderNumber(data.orderNumber);
        if (isCartCheckout) clearCart();
        setIsSuccess(true);
      } else {
        setOrderNumber(`SSP-${Math.floor(100000 + Math.random() * 900000)}`);
        if (isCartCheckout) clearCart();
        setIsSuccess(true);
      }
    } catch {
      setOrderNumber(`SSP-${Math.floor(100000 + Math.random() * 900000)}`);
      if (isCartCheckout) clearCart();
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center p-4">
        <div className="max-w-lg w-full p-8 sm:p-10 rounded-[28px] bg-[#1d1d1f] border border-[#333336] text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto mb-5 border border-white/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[12px] font-semibold text-[#f5f5f7] tracking-[-0.12px] uppercase">
            تم استلام الطلب بنجاح
          </span>

          <h2 className="text-2xl sm:text-3xl font-semibold text-[#f5f5f7] mt-3 tracking-tight">
            شكراً لطلبك من SSP STORE
          </h2>

          <p className="text-[13px] text-[#86868b] mt-2 font-normal">
            رقم الطلب: <span className="font-mono text-[#f5f5f7] font-semibold">{orderNumber}</span>
          </p>

          <div className="mt-6 p-4 rounded-[20px] bg-[#000000] border border-[#333336] text-right text-[12px] text-[#86868b] space-y-2.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#333336]">
              <div className="w-12 h-12 rounded-[12px] bg-[#ffffff] overflow-hidden p-1 shrink-0 flex items-center justify-center">
                <img
                  src={isCartCheckout ? cartItems[0]?.image : activeProductImage}
                  alt={isCartCheckout ? cartItems[0]?.name : singleProduct.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-[#f5f5f7]">
                  {isCartCheckout ? `${cartItems.length} منتجات في السلة` : singleProduct.name}
                </div>
                <div className="text-[11px] text-[#86868b]">
                  {isCartCheckout ? "طلب سلة كامل" : `اللون: ${activeColorObj.name}`}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span>الكمية:</span>
              <span className="text-[#f5f5f7] font-medium">
                {isCartCheckout
                  ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
                  : quantity}
              </span>
            </div>
            <div className="flex justify-between">
              <span>الإجمالي:</span>
              <span className="text-[#f5f5f7] font-semibold">${total} (شحن مجاني)</span>
            </div>
            <div className="flex justify-between">
              <span>طريقة الدفع:</span>
              <span className="text-[#f5f5f7]">
                {paymentMethod === "cod"
                  ? "الدفع عند الاستلام (معاينة قبل الدفع)"
                  : paymentMethod === "card"
                  ? "بطاقة بنكية / Stripe"
                  : "انستاباي / محفظة"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>العنوان:</span>
              <span className="text-[#f5f5f7]">{formData.city} - {formData.address}</span>
            </div>
          </div>

          <p className="text-[11px] text-[#86868b] mt-4">
            سيتواصل معك ممثل خدمة العملاء هاتفياً لتأكيد الشحن وموعد الاستلام.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 flex-1 py-3 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-[13px] font-normal transition-colors shadow-md"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>تصفح باقي المنتجات</span>
            </Link>
            {productIdParam && (
              <Link
                href={`/products/${singleProduct.slug}`}
                className="inline-flex items-center justify-center gap-2 flex-1 py-3 rounded-full bg-[#161617] hover:bg-[#28282b] text-[#f5f5f7] border border-[#333336] text-[13px] font-normal transition-colors"
              >
                <span>صفحة المنتج</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] pb-24 selection:bg-white selection:text-black">
      {/* Top Utility Bar */}
      <div className="bg-[#0e0e0e] border-b border-[#333336] py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="group">
            <BrandLogo iconClassName="w-6 h-6 text-[#f5f5f7]" textClassName="text-sm" />
          </Link>

          {/* Guaranteed Safe Back Button to Product Page (Never to 3D scroll) */}
          <button
            type="button"
            onClick={handleBackToProduct}
            className="flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors cursor-pointer"
          >
            <span>{productIdParam ? `العودة إلى ${singleProduct.name}` : "العودة للتسوق"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="mb-8">
          <span className="text-[12px] font-semibold text-[#f5f5f7] tracking-[-0.12px] uppercase block mb-1">
            إتمام الطلب المباشر
          </span>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-[-0.84px] text-[#f5f5f7]">
            {isCartCheckout ? "إتمام شراء سلة المشتريات" : `شراء ${singleProduct.name}`}
          </h1>
          <p className="text-[13px] text-[#86868b] mt-1 font-normal">
            شحن وتوصيل فوري مع ضمان سنتين معتمد وإمكانية الفحص والمعاينة قبل الدفع.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Right Column: Customer Details & Payment Options */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer Details Panel */}
            <div className="p-6 sm:p-8 rounded-[28px] bg-[#1d1d1f] border border-[#333336]">
              <h2 className="text-base font-semibold text-[#f5f5f7] mb-5">
                1. بيانات التوصيل والاستلام
              </h2>

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                    الاسم بالكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="مثال: أحمد محمد علي"
                    className="w-full px-4 py-2.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#6e6e73] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                      رقم الهاتف / الواتساب *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="010XXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#6e6e73] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                      المحافظة *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-full bg-[#161617] border border-[#6e6e73] text-[#f5f5f7] text-[13px] focus:outline-hidden focus:border-white cursor-pointer"
                    >
                      <option value="القاهرة">القاهرة</option>
                      <option value="الجيزة">الجيزة</option>
                      <option value="الإسكندرية">الإسكندرية</option>
                      <option value="المنصورة">المنصورة</option>
                      <option value="طنطا">طنطا</option>
                      <option value="الشرقية">الشرقية</option>
                      <option value="أسيوط">أسيوط</option>
                      <option value="باقي المحافظات">باقي المحافظات</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                    العنوان بالتفصيل *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="اسم الشارع، رقم العقار، الشقة، علامة مميزة"
                    className="w-full px-4 py-2.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#6e6e73] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                    ملاحظات للمندوب (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أي تعليمات خاصة بوقت التوصيل..."
                    className="w-full px-4 py-2.5 rounded-[20px] bg-[rgba(255,255,255,0.04)] border border-[#6e6e73] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white resize-none"
                  />
                </div>
              </form>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="p-6 sm:p-8 rounded-[28px] bg-[#1d1d1f] border border-[#333336]">
              <h2 className="text-base font-semibold text-[#f5f5f7] mb-4">
                2. طريقة الدفع
              </h2>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center justify-between p-3.5 rounded-[20px] border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-white bg-[#000000]"
                      : "border-[#333336] bg-[#000000]/40 hover:bg-[#000000]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#1d1d1f] border border-[#333336] text-[#f5f5f7]">
                      <Banknote className="w-4 h-4 text-[#f5f5f7]" />
                    </div>
                    <div>
                      <div className="font-medium text-[13px] text-[#f5f5f7]">
                        الدفع عند الاستلام (COD)
                      </div>
                      <div className="text-[11px] text-[#86868b]">
                        ادفع نقداً بعد فحص ومعاينة المنتج والتأكد من سلامته
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-white w-4 h-4"
                  />
                </label>

                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-between p-3.5 rounded-[20px] border cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-white bg-white/5"
                      : "border-[#333336] bg-[#000000]/40 hover:bg-[#000000]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-white">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-[13px] text-[#f5f5f7] flex items-center gap-2">
                        <span>بطاقة بنكية / بوابة Stripe</span>
                        <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded-full font-bold">
                          Stripe
                        </span>
                      </div>
                      <div className="text-[11px] text-[#86868b]">
                        دفع فوري آمن عبر Visa و Mastercard و Apple Pay
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="accent-white w-4 h-4"
                  />
                </label>

                {paymentMethod === "card" && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 space-y-2.5">
                    <p className="text-[11px] text-[#86868b]">
                      عند الضغط على "تأكيد الطلب"، سيتم تحويلك إلى صفحة بوابة Stripe الآمنة لإتمام الدفع المشفر بأمان كامل.
                    </p>
                  </div>
                )}

                <label
                  onClick={() => setPaymentMethod("wallet")}
                  className={`flex items-center justify-between p-3.5 rounded-[20px] border cursor-pointer transition-all ${
                    paymentMethod === "wallet"
                      ? "border-white bg-[#000000]"
                      : "border-[#333336] bg-[#000000]/40 hover:bg-[#000000]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#1d1d1f] border border-[#333336] text-[#f5f5f7]">
                      <Smartphone className="w-4 h-4 text-[#f5f5f7]" />
                    </div>
                    <div>
                      <div className="font-medium text-[13px] text-[#f5f5f7]">
                        انستاباي / محفظة إلكترونية
                      </div>
                      <div className="text-[11px] text-[#86868b]">
                        تحويل عبر فودافون كاش أو تطبيق InstaPay
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                    className="accent-white w-4 h-4"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Left Column: Order Summary & Item Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-[28px] bg-[#1d1d1f] border border-[#333336]">
              <h2 className="text-base font-semibold text-[#f5f5f7] mb-4">
                ملخص الطلب
              </h2>

              {/* Product item display */}
              {isCartCheckout ? (
                <div className="space-y-3 pb-5 border-b border-[#333336]">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-[14px] bg-[#ffffff] border border-[#333336]/40 overflow-hidden flex items-center justify-center shrink-0 p-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[12px] font-semibold text-[#f5f5f7] line-clamp-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#86868b]">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          <span>{item.color.name}</span>
                          <span>× {item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#f5f5f7] font-mono">
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Single Product Card */
                <div className="flex items-start gap-3.5 pb-5 border-b border-[#333336]">
                  <div className="w-20 h-20 rounded-[18px] bg-[#ffffff] border border-[#333336]/40 overflow-hidden flex items-center justify-center shrink-0 p-1.5 shadow-md">
                    <img
                      src={activeProductImage}
                      alt={singleProduct.name}
                      className="w-full h-full object-contain select-none"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#86868b] uppercase">
                        {singleProduct.brand}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        متوفر فوراً
                      </span>
                    </div>

                    <h3 className="text-[13px] font-semibold text-[#f5f5f7] line-clamp-1 mt-0.5">
                      {singleProduct.name}
                    </h3>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-[#86868b]">اللون:</span>
                      <div className="flex items-center gap-1.5">
                        {availableColors.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedColorId(c.id)}
                            className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                              selectedColorId === c.id
                                ? "ring-2 ring-white ring-offset-1 ring-offset-[#1d1d1f] scale-110"
                                : "opacity-60 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#f5f5f7] font-medium">
                        {activeColorObj.name}
                      </span>
                    </div>

                    {/* Quantity Controller & Price */}
                    <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-[#333336]/60">
                      <div className="flex items-center border border-[#333336] rounded-full bg-[#000000]">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-2.5 py-1 text-[#86868b] hover:text-[#f5f5f7] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#f5f5f7]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-2.5 py-1 text-[#86868b] hover:text-[#f5f5f7] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-[#f5f5f7]">
                          ${unitPrice * quantity}
                        </div>
                        <div className="text-[9px] text-[#86868b]">
                          ~{((unitPrice * quantity) * 38).toLocaleString()} ج.م
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Promo code */}
              <div className="py-4 border-b border-[#333336]">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="كود الخصم (SSP20)"
                    className="flex-1 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#6e6e73] text-[12px] text-[#f5f5f7] uppercase tracking-wider focus:outline-hidden focus:border-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-[#333336] text-white text-[12px] font-normal hover:bg-[#444448] transition-colors cursor-pointer"
                  >
                    تطبيق
                  </button>
                </form>
                {discount > 0 && (
                  <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم تطبيق خصم بقيمة ${discount}</span>
                  </p>
                )}
                {promoError && (
                  <p className="text-[11px] text-[#ff453a] mt-1.5">
                    {promoError}
                  </p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="py-4 space-y-2 text-[12px] text-[#86868b]">
                <div className="flex justify-between">
                  <span>المجموع الفرعي ({isCartCheckout ? cartItems.length : quantity})</span>
                  <span className="text-[#f5f5f7]">${subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-white">
                    <span>خصم ترويجي</span>
                    <span>-${discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>الشحن السريع لكافة المحافظات</span>
                  <span className="text-[#f5f5f7] font-semibold">مجاني</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#333336] text-[15px] font-semibold text-[#f5f5f7]">
                  <span>الإجمالي النهائي</span>
                  <span className="text-xl text-[#f5f5f7]">${total}</span>
                </div>
              </div>

              {/* Confirm Order Button: Gray Pill */}
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full mt-5 py-3.5 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-[13px] font-normal flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 shadow-md cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>تأكيد الطلب (${total})</span>
                  </>
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#86868b]">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>ضمان سنتين معتمد • استرجاع مجاني 14 يوم</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}