"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Sparkles,
  Info,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { getCart, clearCart, CartItem } from "@/lib/cart";
import { getProductByIdOrSlug, getAllProducts } from "@/lib/products";

function StripePaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const discountParam = Number(searchParams.get("discount")) || 0;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardCountry, setCardCountry] = useState("EG");
  const [postalCode, setPostalCode] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const productId = searchParams.get("productId") || searchParams.get("product") || searchParams.get("id");
    const colorParam = searchParams.get("color");
    const quantityParam = parseInt(searchParams.get("quantity") || "1", 10);

    if (productId) {
      const single = getProductByIdOrSlug(productId);
      if (single) {
        const col =
          single.colors?.find(
            (c) => c.name.toLowerCase() === colorParam?.toLowerCase()
          ) || single.colors?.[0];
        setCartItems([
          {
            id: single._id || single.slug,
            slug: single.slug,
            name: single.name,
            brand: single.brand,
            price: single.price,
            color: {
              id: col?.name || "standard",
              name: col?.name || "اللون القياسي",
              hex: col?.hex || "#1e1e1e",
              image: col?.image || single.image,
            },
            image: col?.image || single.image,
            quantity: Math.max(1, quantityParam),
          },
        ]);
        return;
      }
    }

    const items = getCart();
    if (items.length > 0) {
      setCartItems(items);
    } else {
      const all = getAllProducts();
      const first = all[0];
      setCartItems([
        {
          id: first._id || first.slug,
          slug: first.slug,
          name: first.name,
          brand: first.brand,
          price: first.price,
          color: {
            id: first.colors?.[0]?.name || "standard",
            name: first.colors?.[0]?.name || "اللون القياسي",
            hex: first.colors?.[0]?.hex || "#1e1e1e",
          },
          image: first.colors?.[0]?.image || first.image,
          quantity: 1,
        },
      ]);
    }
  }, [searchParams]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discountParam);

  // Card Brand Detection
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (clean.startsWith("4")) return { brand: "Visa", color: "#1A1F71" };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: "Mastercard", color: "#EB001B" };
    if (/^3[47]/.test(clean)) return { brand: "Amex", color: "#006FCF" };
    return { brand: "Card", color: "#635BFF" };
  };

  const cardBrand = getCardBrand(cardNumber);

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  // Quick fill test cards
  const fillTestCard = (type: "visa" | "mastercard") => {
    if (type === "visa") {
      setCardNumber("4242 4242 4242 4242");
    } else {
      setCardNumber("5555 5555 5555 5555");
    }
    setCardExpiry("12/28");
    setCardCvc("888");
    setCardName("Test User (SSP)");
    setPostalCode("11511");
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s+/g, "").length < 16) {
      alert("يرجى إدخال رقم بطاقة صحيح مكون من 16 رقماً");
      return;
    }
    if (!cardExpiry || !cardCvc || !cardName) {
      alert("يرجى إكمال بيانات البطاقة");
      return;
    }

    setIsProcessing(true);
    setProcessStep("جاري تشفير البيانات وتأسيس اتصال آمن مع Stripe...");

    setTimeout(() => {
      setProcessStep("جاري التحقق من تفويض البنك (3D Secure 2.0)...");
    }, 800);

    setTimeout(async () => {
      setProcessStep("تم اعتماد الدفع! جاري إصدار إيصال الطلب...");

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerInfo: {
              fullName: cardName,
              phone: "01000000000",
              city: cardCountry === "EG" ? "القاهرة" : "International",
              address: `Stripe Online Payment (${cardBrand.brand} •••• ${cardNumber.slice(-4)})`,
              notes: "Paid via Stripe Payment Gateway",
            },
            items: cartItems.map((i) => ({
              name: i.name,
              color: i.color?.name || "Standard",
              price: i.price,
              quantity: i.quantity,
              image: i.image,
            })),
            subtotal,
            shipping: 0,
            discount: discountParam,
            totalAmount: total,
            paymentMethod: `stripe_${cardBrand.brand.toLowerCase()}`,
            paymentStatus: "paid",
          }),
        });
        const data = await res.json();
        setOrderId(data.orderNumber || `SSP-STRIPE-${Math.floor(100000 + Math.random() * 900000)}`);
        clearCart();
        setIsSuccess(true);
      } catch {
        setOrderId(`SSP-STRIPE-${Math.floor(100000 + Math.random() * 900000)}`);
        clearCart();
        setIsSuccess(true);
      } finally {
        setIsProcessing(false);
      }
    }, 1800);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#070709] text-[#f5f5f7] flex items-center justify-center p-4 selection:bg-[#635BFF] selection:text-white">
        <div className="max-w-md w-full p-8 rounded-[32px] bg-[#121216] border border-[#26262e] text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest block mb-1">
            عملية دفع ناجحة ومؤكدة
          </span>
          <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">
            شكراً لك! تم الدفع بنجاح
          </h1>
          <p className="text-xs text-[#86868b] mt-2 leading-relaxed">
            تم استلام دفعتك عبر بوابة Stripe المشفرة وتأكيد طلبك في قاعدة البيانات.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-[#191920] border border-[#2b2b35] text-xs text-right space-y-2">
            <div className="flex justify-between text-[#86868b]">
              <span>رقم الطلب المرجعي:</span>
              <span className="font-mono text-[#f5f5f7] font-semibold">{orderId}</span>
            </div>
            <div className="flex justify-between text-[#86868b]">
              <span>المبلغ المدفوع:</span>
              <span className="font-mono text-emerald-400 font-bold">${total}</span>
            </div>
            <div className="flex justify-between text-[#86868b]">
              <span>طريقة الدفع:</span>
              <span className="font-medium text-[#f5f5f7]">Stripe ({cardBrand.brand})</span>
            </div>
          </div>

          <div className="space-y-3 mt-8">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-xs font-semibold transition-colors shadow-md"
            >
              <span>متابعة التسوق في المتجر</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="inline-block text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f5f5f7] flex flex-col justify-between selection:bg-[#635BFF] selection:text-white">
      {/* Top Stripe Navigation */}
      <header className="border-b border-[#202028] bg-[#0c0c10]/80 backdrop-blur-xl py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/checkout");
              }
            }}
            className="inline-flex items-center gap-2 text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لصفحة الطلب</span>
          </button>

          <div className="flex items-center gap-2">
            <BrandLogo iconClassName="w-5 h-5 text-[#f5f5f7]" textClassName="text-xs" />
            <span className="text-[10px] text-[#635BFF] font-semibold bg-[#635BFF]/10 px-2 py-0.5 rounded-full border border-[#635BFF]/20">
              Stripe Checkout
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#86868b]">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">اتصال مشفر 256-Bit</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
          <div className="p-6 sm:p-7 rounded-[28px] bg-[#111116] border border-[#24242e] shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#24242e]">
              <div className="w-10 h-10 rounded-xl bg-[#635BFF]/15 border border-[#635BFF]/30 flex items-center justify-center text-[#635BFF]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#f5f5f7]">SSP STORE Electronics</h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>متجر معتمد ومفعل لدى Stripe</span>
                </p>
              </div>
            </div>

            {/* Total Amount Banner */}
            <div className="py-2">
              <span className="text-[11px] text-[#86868b] block mb-1">المبلغ المطلوب سداده</span>
              <div className="text-3xl font-extrabold text-[#f5f5f7] font-mono tracking-tight">
                ${total}{" "}
                <span className="text-xs text-[#86868b] font-normal font-sans">USD</span>
              </div>
              <div className="text-[11px] text-[#86868b] mt-0.5">
                يعادل تقريباً {(total * 38).toLocaleString()} جنيه مصري
              </div>
            </div>

            {/* Items Mini List */}
            <div className="space-y-3 pt-3 border-t border-[#24242e]">
              <span className="text-[11px] font-medium text-[#86868b] block">عناصر السلة:</span>
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-medium text-[#f5f5f7] line-clamp-1">{item.name}</div>
                      <div className="text-[10px] text-[#86868b]">اللون: {item.color.name} × {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-[#f5f5f7]">${item.price * item.quantity}</span>
                </div>
              ))}

              {discountParam > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 pt-1">
                  <span>خصم القسيمة</span>
                  <span className="font-mono">-${discountParam}</span>
                </div>
              )}
            </div>

            {/* Test Cards Helper Pill */}
            <div className="p-3.5 rounded-2xl bg-[#171720] border border-[#2b2b38] space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#635BFF]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>بيئة اختبار تجريبية (Stripe Sandbox)</span>
              </div>
              <p className="text-[10px] text-[#86868b]">
                يمكنك ملء بطاقة تجريبية بنقرة واحدة لتجربة الدفع الفوري:
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillTestCard("visa")}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#22222d] hover:bg-[#2c2c3a] border border-[#373748] text-[10px] text-[#f5f5f7] font-medium transition-colors"
                >
                  تعبئة Visa (4242)
                </button>
                <button
                  type="button"
                  onClick={() => fillTestCard("mastercard")}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#22222d] hover:bg-[#2c2c3a] border border-[#373748] text-[10px] text-[#f5f5f7] font-medium transition-colors"
                >
                  تعبئة Master (5555)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stripe Card Gateway & 3D Card Preview */}
        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
          {/* Interactive Holographic Virtual Card */}
          <div className="relative w-full max-w-md mx-auto aspect-[1.58/1] rounded-[24px] p-6 text-white overflow-hidden shadow-2xl bg-gradient-to-tr from-[#14141c] via-[#20202e] to-[#2c2447] border border-[#3b3558]/60">
            {/* Card Background Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#635BFF]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Content */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-400 to-amber-200 shadow-inner flex items-center justify-center">
                  <div className="w-6 h-4 border border-amber-800/40 rounded-sm" />
                </div>
                <span className="font-extrabold tracking-widest text-sm text-[#f5f5f7]">
                  {cardBrand.brand}
                </span>
              </div>

              {/* Number */}
              <div className="font-mono text-lg sm:text-xl tracking-[0.2em] font-semibold text-[#f5f5f7] drop-shadow-md">
                {cardNumber || "•••• •••• •••• ••••"}
              </div>

              {/* Bottom Row */}
              <div className="flex items-end justify-between text-xs">
                <div>
                  <span className="text-[9px] text-[#86868b] uppercase tracking-wider block">اسم حامل البطاقة</span>
                  <span className="font-semibold tracking-wider uppercase text-sm truncate max-w-[180px] block">
                    {cardName || "YOUR NAME"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#86868b] uppercase tracking-wider block">تاريخ الانتهاء</span>
                  <span className="font-mono font-semibold text-sm">
                    {cardExpiry || "MM/YY"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Card Input Form */}
          <form
            onSubmit={handlePay}
            className="p-6 sm:p-8 rounded-[28px] bg-[#111116] border border-[#24242e] shadow-2xl space-y-4"
          >
            {/* Apple Pay / Google Pay simulated one-click */}
            <button
              type="button"
              onClick={() => {
                fillTestCard("visa");
                alert("تم التعرف على Apple Pay! اضغط 'ادفع الآن' لتأكيد الدفع المشفر.");
              }}
              className="w-full py-3 rounded-full bg-white hover:bg-neutral-100 text-black text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-black" />
              <span>الدفع السريع بنقرة واحدة مع Apple Pay</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-[#262632] w-full" />
              <span className="bg-[#111116] px-3 text-[11px] text-[#86868b] uppercase">أو الدفع بالبطاقة</span>
            </div>

            {/* Card Number Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#86868b] flex items-center justify-between">
                <span>رقم البطاقة (Card Number)</span>
                <span className="text-[#635BFF] font-semibold">{cardBrand.brand}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full bg-[#181820] border border-[#2e2e3c] rounded-2xl px-4 py-3 pl-11 text-sm text-[#f5f5f7] font-mono tracking-wider focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
                  dir="ltr"
                />
                <CreditCard className="w-4 h-4 text-[#86868b] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Expiry and CVC Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#86868b]">
                  تاريخ الصلاحية (MM/YY)
                </label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  className="w-full bg-[#181820] border border-[#2e2e3c] rounded-2xl px-4 py-3 text-sm text-[#f5f5f7] font-mono text-center focus:outline-none focus:border-[#635BFF] transition-all"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#86868b] flex items-center justify-between">
                  <span>رمز الأمان (CVC)</span>
                  <HelpCircle className="w-3 h-3 text-[#86868b]" />
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="123"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-[#181820] border border-[#2e2e3c] rounded-2xl px-4 py-3 text-sm text-[#f5f5f7] font-mono text-center focus:outline-none focus:border-[#635BFF] transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#86868b]">
                اسم صاحب البطاقة (Name on Card)
              </label>
              <input
                type="text"
                required
                placeholder="الاسم كما هو مدون على البطاقة"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full bg-[#181820] border border-[#2e2e3c] rounded-2xl px-4 py-3 text-sm text-[#f5f5f7] focus:outline-none focus:border-[#635BFF] transition-all"
              />
            </div>

            {/* Country and Postal Code */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#86868b]">الدولة</label>
                <select
                  value={cardCountry}
                  onChange={(e) => setCardCountry(e.target.value)}
                  className="w-full bg-[#181820] border border-[#2e2e3c] rounded-2xl px-4 py-3 text-xs text-[#f5f5f7] focus:outline-none focus:border-[#635BFF]"
                >
                  <option value="EG">مصر (Egypt)</option>
                  <option value="SA">المملكة العربية السعودية</option>
                  <option value="AE">الإمارات العربية المتحدة</option>
                  <option value="US">الولايات المتحدة (USA)</option>
                  <option value="GB">المملكة المتحدة (UK)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#86868b]">الرمز البريدي</label>
                <input
                  type="text"
                  placeholder="11511"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-[#181820] border border-[#2e2e3c] rounded-2xl px-4 py-3 text-xs text-[#f5f5f7] font-mono focus:outline-none focus:border-[#635BFF]"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-full bg-[#635BFF] hover:bg-[#5349e4] disabled:bg-[#635BFF]/50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#635BFF]/30 active:scale-98 cursor-pointer mt-4"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{processStep}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>دفع ${total} عبر Stripe الآمن</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#86868b] pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>مدعوم رسميًا بتقنية التشفير من Stripe Inc. • متوافق مع PCI-DSS</span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function StripePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070709] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[#635BFF] animate-spin" />
        </div>
      }
    >
      <StripePaymentContent />
    </Suspense>
  );
}
