"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Star,
  Check,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Battery,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import { addToCart } from "@/lib/cart";

interface ProductQuickViewProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
}: ProductQuickViewProps) {
  const router = useRouter();

  const defaultColors = [
    { id: "black", name: "أسود مطفي", hex: "#1c1c1e" },
    { id: "white", name: "أبيض جليدي", hex: "#f5f5f7" },
    { id: "blue", name: "أزرق نايت", hex: "#1e3a8a" },
    { id: "silver", name: "فضي معدني", hex: "#9ca3af" },
  ];

  const availableColors =
    product?.colors && product.colors.length > 0
      ? product.colors.map((c: any, index: number) => ({
          id: c.name || `color-${index}`,
          name: c.name || `لون ${index + 1}`,
          hex: c.hex || "#1c1c1e",
          image: c.image || product.image,
        }))
      : defaultColors;

  const [selectedColor, setSelectedColor] = useState(availableColors[0]);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      color: selectedColor,
      image: selectedColor.image || product.image,
      quantity,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product._id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      color: selectedColor,
      image: selectedColor.image || product.image,
      quantity,
    });
    onClose();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#161617] border border-[#282828] rounded-[32px] overflow-hidden shadow-2xl p-6 sm:p-8 text-[#f5f5f7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-[#1d1d1f] border border-[#333336] text-[#86868b] hover:text-[#f5f5f7] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Product Image Frame */}
          <div className="relative aspect-square rounded-[24px] bg-white border border-[#333336]/30 p-6 flex items-center justify-center overflow-hidden">
            <img
              src={selectedColor.image || product.image}
              alt={product.name}
              className="w-full h-full object-contain transition-all duration-300"
            />
            {product.isFeatured && (
              <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#b64400] text-white text-[10px] font-bold">
                مميز
              </span>
            )}
          </div>

          {/* Details & Customization */}
          <div className="space-y-4">
            {/* Brand & Category */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1d1d1f] border border-[#333336] text-[10px] font-semibold uppercase text-[#f5f5f7] tracking-wider">
                {product.brand}
              </span>
              <span className="text-xs text-[#86868b]">
                {product.category === "headphones" ? "سماعة رأس فاخرة" : "سماعة إيربودز لا سلكية"}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f5f5f7] leading-snug">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#f5f5f7] font-mono">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#86868b] line-through font-mono">
                  ${product.originalPrice}
                </span>
              )}
              <span className="text-xs text-[#86868b]">
                (~{(product.price * 38).toLocaleString()} ج.م)
              </span>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2 pt-2 border-t border-[#282828]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868b]">اللون المختار:</span>
                <span className="font-medium text-[#f5f5f7]">{selectedColor.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {availableColors.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      selectedColor.id === c.id
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#161617] scale-110"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor.id === c.id && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          c.hex.toLowerCase() === "#ffffff" || c.hex.toLowerCase() === "#f5f5f7"
                            ? "text-black"
                            : "text-white"
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-[#282828]">
              <span className="text-xs text-[#86868b]">الكمية المطلوبة:</span>
              <div className="flex items-center bg-[#1d1d1f] border border-[#333336] rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full hover:bg-[#28282b] flex items-center justify-center text-[#86868b] hover:text-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold font-mono text-[#f5f5f7]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-full hover:bg-[#28282b] flex items-center justify-center text-[#86868b] hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedSuccess}
                className={`w-full py-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-[#1d1d1f] hover:bg-[#28282b] border border-[#333336] text-[#f5f5f7] hover:border-white/40"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تمت الإضافة إلى السلة بنجاح!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>إضافة إلى السلة — ${(product.price * quantity)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/40 cursor-pointer active:scale-98"
              >
                <span>شراء فوري مباشر</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#86868b] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>ضمان أصلي لمدة سنتين • شحن سريع</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
