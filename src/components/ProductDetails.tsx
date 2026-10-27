"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Check,
  ArrowLeft,
  Zap,
  Volume2,
  Battery,
  SlidersHorizontal,
  Package,
} from "lucide-react";

export default function ProductDetails() {
  const [selectedColor, setSelectedColor] = useState("black");

  const colors = [
    {
      id: "black",
      name: "أسود فحمي • Matte Black",
      shortName: "أسود فحمي",
      hex: "#1e1e1e",
      image: "/colors/black.jpg",
    },
    {
      id: "white",
      name: "أبيض لؤلؤي • Pearl White",
      shortName: "أبيض لؤلؤي",
      hex: "#e8e8ed",
      image: "/colors/white.jpg",
    },
    {
      id: "blue",
      name: "أزرق عميق • Deep Navy",
      shortName: "أزرق عميق",
      hex: "#313f54",
      image: "/colors/dark-blue.jpg",
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1d1d1f] via-[#000000] to-[#000000]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[12px] font-semibold text-[#b64400] tracking-[-0.12px] uppercase block mb-2">
            جديد • الإصدار الاحترافي
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#f5f5f7] tracking-[-0.84px] leading-tight">
            امتلك أسطورة الصوت JBL Tune 730BT
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#86868b] font-normal tracking-[-0.224px]">
            شحن سريع مجاني لكافة المحافظات مع إمكانية الفحص والمعاينة قبل الاستلام وضمان الوكيل سنتين.
          </p>
        </div>

        {/* Main Product Exhibition Panel */}
        <div className="rounded-[28px] p-6 sm:p-10 bg-[#1d1d1f] border border-[#333336] mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Hardware Plinth */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="relative rounded-[28px] bg-[#000000] border border-[#333336] p-6 sm:p-8 flex flex-col items-center justify-center overflow-hidden">
                <span className="absolute top-4 right-5 text-[11px] font-medium text-[#b64400] tracking-[-0.12px] z-20">
                  متوفر للتسليم الفوري
                </span>

                {/* Museum Hardware Showcase Canvas */}
                <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] rounded-[24px] bg-[#ffffff] overflow-hidden border border-[#333336]/40 flex items-center justify-center my-4 shadow-2xl">
                  {colors.map((color) => (
                    <img
                      key={color.id}
                      src={color.image}
                      alt={color.name}
                      className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out select-none ${
                        selectedColor === color.id
                          ? "opacity-100 scale-100 pointer-events-auto"
                          : "opacity-0 scale-95 pointer-events-none"
                      }`}
                    />
                  ))}
                </div>

                {/* Quick Swatch Switcher */}
                <div className="flex items-center gap-3 my-1 z-10">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color.id)}
                      aria-label={color.name}
                      className={`w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                        selectedColor === color.id
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#000000] scale-110"
                          : "opacity-70 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.id && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            color.id === "white" ? "bg-black" : "bg-white"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="text-center mt-2 z-10">
                  <span className="text-[11px] text-[#86868b] block mb-0.5">اللون المحدد:</span>
                  <span className="text-xs font-semibold text-[#f5f5f7]">
                    {colors.find((c) => c.id === selectedColor)?.name}
                  </span>
                </div>
              </div>

              {/* Museum Hardware Service Badges */}
              <div className="grid grid-cols-3 gap-2.5 mt-4">
                <div className="p-3 rounded-[20px] bg-[#000000] border border-[#333336] text-center">
                  <Truck className="w-4 h-4 mx-auto text-[#f5f5f7] mb-1" />
                  <span className="text-[11px] font-medium text-[#f5f5f7] block">شحن مجاني</span>
                  <span className="text-[10px] text-[#86868b]">24-48 ساعة</span>
                </div>
                <div className="p-3 rounded-[20px] bg-[#000000] border border-[#333336] text-center">
                  <ShieldCheck className="w-4 h-4 mx-auto text-[#f5f5f7] mb-1" />
                  <span className="text-[11px] font-medium text-[#f5f5f7] block">ضمان سنتين</span>
                  <span className="text-[10px] text-[#86868b]">وكيل معتمد</span>
                </div>
                <div className="p-3 rounded-[20px] bg-[#000000] border border-[#333336] text-center">
                  <RotateCcw className="w-4 h-4 mx-auto text-[#f5f5f7] mb-1" />
                  <span className="text-[11px] font-medium text-[#f5f5f7] block">استرجاع 14 يوم</span>
                  <span className="text-[10px] text-[#86868b]">استرداد نقدي</span>
                </div>
              </div>
            </div>

            {/* Right: Technical Details & Purchase Path */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Product Title */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center text-[#f5f5f7]">
                  <Star className="w-3.5 h-3.5 fill-[#f5f5f7] text-[#f5f5f7]" />
                </div>
                <span className="text-[12px] font-medium text-[#f5f5f7]">4.9 / 5</span>
                <span className="text-[12px] text-[#86868b]">(1,480+ تقييم معتمد)</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold text-[#f5f5f7] tracking-tight">
                سماعة JBL Tune 730BT اللاسلكية
              </h3>
              <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed font-normal">
                عزل ضوضاء متكيف Hybrid ANC، مشغلات Pure Bass 40mm، وبطارية خارقة 76 ساعة تضمن لك تجربة استماع أسطورية بلا انقطاع.
              </p>

              {/* Color Options: Apple Minimal Swatches */}
              <div className="mt-6">
                <label className="block text-[12px] font-medium text-[#86868b] tracking-[-0.12px] mb-2.5">
                  اللون:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color.id)}
                      className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                        selectedColor === color.id
                          ? "bg-[#161617] text-[#f5f5f7] border border-white ring-1 ring-white shadow-md"
                          : "bg-[#000000]/60 text-[#86868b] border border-[#333336] hover:text-[#f5f5f7] hover:border-[#6e6e73]"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="mt-6 space-y-2.5 pt-4 border-t border-[#333336]">
                <div className="flex items-center gap-2.5 text-[13px] text-[#f5f5f7]">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>بطارية تدوم 76 ساعة مع شحن سريع Type-C</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-[#f5f5f7]">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>عزل ضوضاء متكيف نشط مع ميكروفونات دقيقة</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-[#f5f5f7]">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>اتصال متزامن بجهازين معاً (Multi-Point Connection)</span>
                </div>
              </div>

              {/* Pricing & Purchase Cluster */}
              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {/* Dark Pricing Capsule */}
                <div className="px-5 py-2.5 rounded-[36px] bg-[#424245]/70 border border-[#333336] flex items-baseline justify-between sm:justify-start gap-3">
                  <span className="text-2xl font-semibold text-[#f5f5f7] tracking-tight">$129</span>
                  <span className="text-xs text-[#86868b] font-normal">أو 4,890 ج.م</span>
                  <span className="text-xs text-[#86868b] line-through font-normal">$179</span>
                </div>

                {/* Gray Purchase Pill */}
                <Link
                  href={`/checkout?productId=jbl-tune-730bt&color=${selectedColor}`}
                  className="flex-1 py-3 px-6 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-[13px] font-normal text-center flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md"
                >
                  <span>شراء الآن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/products/jbl-tune-730bt"
                  className="py-3 px-5 rounded-full bg-[#161617] hover:bg-[#202024] text-[#f5f5f7] border border-[#333336] text-[12px] font-normal text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>تفاصيل ومواصفات المنتج</span>
                </Link>
              </div>

              <div className="mt-3 text-center text-[11px] text-[#86868b]">
                الدفع عند الاستلام متاح مع حق المعاينة والفحص مع مندوب التوصيل
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs: Multi-Column Feature Metric Tiles */}
        <div id="specs" className="mt-20">
          <div className="text-center mb-10">
            <span className="text-[12px] font-medium text-[#86868b] tracking-[-0.12px] uppercase block mb-1">
              المواصفات التقنية
            </span>
            <h3 className="text-2xl sm:text-4xl font-semibold text-[#f5f5f7] tracking-[-0.84px]">
              أدق التفاصيل الميكانيكية والهندسية
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-5 rounded-[28px] bg-[#000000] border border-[#333336] text-center">
              <Volume2 className="w-5 h-5 mx-auto text-[#f5f5f7] mb-2" />
              <div className="text-[11px] text-[#86868b] mb-1">حجم المحرك</div>
              <div className="text-[15px] font-semibold text-[#f5f5f7]">40mm Dynamic</div>
            </div>
            <div className="p-5 rounded-[28px] bg-[#000000] border border-[#333336] text-center">
              <Battery className="w-5 h-5 mx-auto text-[#f5f5f7] mb-2" />
              <div className="text-[11px] text-[#86868b] mb-1">عمر البطارية</div>
              <div className="text-[15px] font-semibold text-[#f5f5f7]">76 ساعة</div>
            </div>
            <div className="p-5 rounded-[28px] bg-[#000000] border border-[#333336] text-center">
              <Zap className="w-5 h-5 mx-auto text-[#f5f5f7] mb-2" />
              <div className="text-[11px] text-[#86868b] mb-1">سرعة الشحن</div>
              <div className="text-[15px] font-semibold text-[#f5f5f7]">5 د = 3 س</div>
            </div>
            <div className="p-5 rounded-[28px] bg-[#000000] border border-[#333336] text-center">
              <SlidersHorizontal className="w-5 h-5 mx-auto text-[#f5f5f7] mb-2" />
              <div className="text-[11px] text-[#86868b] mb-1">البلوتوث</div>
              <div className="text-[15px] font-semibold text-[#f5f5f7]">Bluetooth 5.3</div>
            </div>
            <div className="p-5 rounded-[28px] bg-[#000000] border border-[#333336] text-center">
              <ShieldCheck className="w-5 h-5 mx-auto text-[#f5f5f7] mb-2" />
              <div className="text-[11px] text-[#86868b] mb-1">الوزن الخفيف</div>
              <div className="text-[15px] font-semibold text-[#f5f5f7]">220 غرام</div>
            </div>
            <div className="p-5 rounded-[28px] bg-[#000000] border border-[#333336] text-center">
              <Package className="w-5 h-5 mx-auto text-[#f5f5f7] mb-2" />
              <div className="text-[11px] text-[#86868b] mb-1">منفذ الشحن</div>
              <div className="text-[15px] font-semibold text-[#f5f5f7]">USB Type-C</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
