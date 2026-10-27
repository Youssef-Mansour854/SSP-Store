"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

interface SampleProduct {
  id: string;
  name: string;
  brand: string;
  category: "headphones" | "earbuds";
  categoryLabel: string;
  price: number;
  image: string;
  rating: number;
  badge?: string;
  spec: string;
}

const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: "apple-airpods-pro-2",
    name: "Apple AirPods Pro 2 (USB-C)",
    brand: "Apple",
    category: "earbuds",
    categoryLabel: "إيربودز",
    price: 229,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800",
    rating: 4.95,
    badge: "الأكثر طلباً",
    spec: "عزل H2 مضاعف مرتين",
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5 Wireless",
    brand: "Sony",
    category: "headphones",
    categoryLabel: "سماعة رأس",
    price: 349,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    rating: 4.95,
    badge: "رائدة العزل",
    spec: "بطارية 30س + Hi-Res LDAC",
  },
  {
    id: "beats-studio-pro",
    name: "Beats Studio Pro Wireless",
    brand: "Beats",
    category: "headphones",
    categoryLabel: "سماعة رأس",
    price: 299,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
    rating: 4.8,
    spec: "Spatial Audio مع تتبع الرأس",
  },
  {
    id: "soundcore-liberty-4-nc",
    name: "Soundcore Liberty 4 NC",
    brand: "Soundcore",
    category: "earbuds",
    categoryLabel: "إيربودز",
    price: 99,
    image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800",
    rating: 4.86,
    badge: "أفضل قيمة",
    spec: "عزل 98.5% + بطارية 50س",
  },
  {
    id: "apple-airpods-max",
    name: "Apple AirPods Max",
    brand: "Apple",
    category: "headphones",
    categoryLabel: "سماعة رأس",
    price: 479,
    image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800",
    rating: 4.9,
    badge: "صوت استوديو",
    spec: "ألومنيوم فاخر + شريحة H1",
  },
  {
    id: "bose-quietcomfort-ultra",
    name: "Bose QuietComfort Ultra",
    brand: "Bose",
    category: "headphones",
    categoryLabel: "سماعة رأس",
    price: 399,
    image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800",
    rating: 4.9,
    spec: "CustomTune + صوت غامر",
  },
  {
    id: "jbl-live-pro-2",
    name: "JBL Live Pro 2 TWS",
    brand: "JBL",
    category: "earbuds",
    categoryLabel: "إيربودز",
    price: 139,
    image: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800",
    rating: 4.8,
    spec: "True Adaptive ANC + 40س",
  },
  {
    id: "oraimo-boompop-2",
    name: "Oraimo BoomPop 2 Heavy Bass",
    brand: "Oraimo",
    category: "headphones",
    categoryLabel: "سماعة رأس",
    price: 49,
    image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800",
    rating: 4.6,
    spec: "HavyBass + بطارية 60س",
  },
];

export default function ProductsMarquee() {
  // Duplicating the array creates a 100% seamless, continuous infinite scroll loop
  const duplicatedProducts = [...SAMPLE_PRODUCTS, ...SAMPLE_PRODUCTS];

  return (
    <section className="py-16 sm:py-24 bg-[#000000] border-t border-[#282828] overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-semibold text-[#f5f5f7] uppercase tracking-wider">
                أحدث الإصدارات العالمية • وصول حديث
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold text-[#f5f5f7] tracking-tight">
              عينة من أحدث ما وصل لمتجرنا
            </h2>
            <p className="text-xs sm:text-sm text-[#86868b] mt-1 font-normal">
              تحرك أفقياً لاستكشاف عينات المنتجات، أو اضغط على أي سماعة لتخصيص لونها ومعرفة إمكانياتها
            </p>
          </div>

          {/* Arrow Link to Standalone Products Page */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-full bg-[#161617] border border-[#333336] text-[12px] font-medium text-[#f5f5f7] hover:border-white hover:text-white hover:bg-[#1d1d1f] transition-all group"
          >
            <span>عرض كل المنتجات في المتجر</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Infinite Horizontal Running Track */}
      <div className="relative w-full brand-mask-edges overflow-hidden py-3" dir="ltr">
        <div className="product-marquee-track gap-5 px-4 items-stretch">
          {duplicatedProducts.map((p, idx) => (
            <Link
              key={`${p.id}-${idx}`}
              href={`/products/${p.id}`}
              className="group w-64 sm:w-72 p-4 rounded-[24px] bg-[#161617] border border-[#282828] hover:border-[#333336] hover:bg-[#1a1a1c] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shrink-0 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Brand & Badge Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1d1d1f] border border-[#333336] text-[10px] font-semibold text-[#f5f5f7] tracking-wider uppercase">
                    {p.brand}
                  </span>
                  <span className="text-[10px] text-[#86868b]">
                    {p.categoryLabel}
                  </span>
                </div>

                {/* Image Container with White Studio Backdrop */}
                <div className="relative w-full h-36 rounded-[18px] bg-[#ffffff] overflow-hidden p-2.5 mb-3 flex items-center justify-center border border-[#333336]/20">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {p.badge && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#b64400] text-white text-[9px] font-bold">
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 text-xs text-[#86868b] mb-1">
                  <Star className="w-3 h-3 fill-[#f5f5f7] text-[#f5f5f7]" />
                  <span className="font-medium text-[#f5f5f7] text-[11px]">{p.rating}</span>
                </div>

                <h3 className="text-[13px] font-semibold text-[#f5f5f7] tracking-tight line-clamp-1 group-hover:text-white transition-colors">
                  {p.name}
                </h3>

                <p className="text-[11px] text-[#86868b] mt-1 line-clamp-1">
                  {p.spec}
                </p>
              </div>

              {/* Price & Action */}
              <div className="mt-3 pt-2.5 border-t border-[#282828] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#f5f5f7]">${p.price}</div>
                  <div className="text-[9px] text-[#86868b]">~{(p.price * 38).toLocaleString()} ج.م</div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#1d1d1f] border border-[#333336] text-[#86868b] group-hover:bg-[#2c2c2e] group-hover:text-white group-hover:border-[#3e3e3c] flex items-center justify-center transition-all">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
