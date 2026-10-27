"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ArrowLeft, Menu, X, User, UserPlus, LogIn, LogOut, Shield } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { getCartCount } from "@/lib/cart";

export default function Navbar({ cartCount }: { cartCount?: number }) {
  const pathname = usePathname();
  const isProductsPage = pathname === "/products" || pathname === "/shop";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkNavbar, setIsDarkNavbar] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);

  // Sync cart count with localStorage
  useEffect(() => {
    setCartItemsCount(getCartCount());

    const handleCartUpdate = () => {
      setCartItemsCount(getCartCount());
    };

    window.addEventListener("ssp_cart_updated", handleCartUpdate);
    return () => window.removeEventListener("ssp_cart_updated", handleCartUpdate);
  }, []);

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
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // Listen to scroll: navbar is light studio white during the 3D animation,
  // and turns sleek obsidian black as soon as the animation finishes into the store!
  useEffect(() => {
    const handleScroll = () => {
      const expEl = document.getElementById("experience");
      if (!expEl) {
        // If there's no experience section (e.g. subpages /products, /cart, /checkout), default to dark mode
        setIsDarkNavbar(true);
        return;
      }
      const rect = expEl.getBoundingClientRect();
      // On homepage: while inside the 500vh #experience section (rect.bottom > window.innerHeight * 0.8),
      // the navbar is in white studio mode. As soon as the animation finishes, it turns black!
      const isPastAnimation = rect.bottom <= window.innerHeight * 0.8;
      setIsDarkNavbar(isPastAnimation);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 px-3 sm:px-6 select-none transition-all duration-500 ease-out">
      <div
        className={`max-w-6xl mx-auto h-12 px-4 sm:px-6 rounded-[20px] backdrop-blur-xl flex items-center justify-between transition-all duration-500 ease-out ${
          isDarkNavbar
            ? "bg-[#0e0e0e]/92 border border-[#282828] text-[#f5f5f7] shadow-2xl"
            : "bg-white/85 border border-black/[0.08] text-[#141416] shadow-[0_4px_25px_rgba(0,0,0,0.06)]"
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <BrandLogo
            iconClassName="w-6 h-6"
            textClassName="text-[13px]"
            className={`transition-colors duration-300 ${
              isDarkNavbar ? "text-[#f5f5f7]" : "text-[#141416]"
            }`}
          />
          <span
            className={`text-[10px] tracking-wider font-medium hidden sm:inline border-s ps-2 ms-0.5 transition-colors duration-300 ${
              isDarkNavbar ? "text-[#86868b] border-[#333336]" : "text-neutral-500 border-neutral-300"
            }`}
          >
            JBL Official
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-[12px] font-normal tracking-[-0.12px]">
          <Link
            href="/products"
            className={`transition-colors py-1 flex items-center gap-1.5 ${
              isProductsPage
                ? isDarkNavbar
                  ? "text-white font-semibold"
                  : "text-black font-semibold"
                : isDarkNavbar
                ? "text-[#86868b] hover:text-[#f5f5f7] font-normal"
                : "text-neutral-600 hover:text-[#141416] font-normal"
            }`}
          >
            <span>المنتجات والأقسام</span>
          </Link>
          <a
            href="/#features"
            className={`transition-colors py-1 ${
              isDarkNavbar ? "text-[#86868b] hover:text-[#f5f5f7]" : "text-neutral-600 hover:text-[#141416]"
            }`}
          >
            المميزات
          </a>
          <a
            href="/#pricing"
            className={`transition-colors py-1 ${
              isDarkNavbar ? "text-[#86868b] hover:text-[#f5f5f7]" : "text-neutral-600 hover:text-[#141416]"
            }`}
          >
            طلب JBL 730BT
          </a>
        </nav>

        {/* CTA & Cart Action */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              {currentUser.role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-[#f5f5f7] border border-white/20 text-[11px] font-semibold hover:bg-white/20 transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  <span>الأدمن</span>
                </Link>
              )}
              <span
                className={`text-[12px] font-medium hidden lg:inline max-w-[100px] truncate ${
                  isDarkNavbar ? "text-[#f5f5f7]" : "text-[#141416]"
                }`}
              >
                {currentUser.name?.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className={`p-1.5 rounded-full hover:text-red-500 transition-colors ${
                  isDarkNavbar ? "hover:bg-[#333336]/60 text-[#86868b]" : "hover:bg-black/[0.06] text-neutral-500"
                }`}
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Twin Button 1: Sign in */}
              <Link
                href="/login"
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[12px] font-medium transition-all shadow-sm ${
                  isDarkNavbar
                    ? "text-[#f5f5f7] bg-[#1d1d1f] hover:bg-[#28282b] border border-[#333336] hover:border-white/40"
                    : "text-[#141416] bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.1] hover:border-black/30"
                }`}
              >
                <LogIn className="w-3.5 h-3.5 opacity-70" />
                <span>تسجيل الدخول</span>
              </Link>

              {/* Twin Button 2: Register */}
              <Link
                href="/register"
                className={`inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[12px] font-medium transition-all shadow-sm ${
                  isDarkNavbar
                    ? "text-[#f5f5f7] bg-[#1d1d1f] hover:bg-[#28282b] border border-[#333336] hover:border-white/40"
                    : "text-[#141416] bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.1] hover:border-black/30"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 opacity-80" />
                <span>إنشاء حساب</span>
              </Link>
            </div>
          )}

          {/* Cart Icon -> Leads to /cart, badge ONLY if > 0 */}
          <Link
            href="/cart"
            className={`relative p-2 rounded-full transition-colors flex items-center justify-center group ${
              isDarkNavbar
                ? "bg-[#333336]/60 hover:bg-[#333336] text-[#f5f5f7]"
                : "bg-black/[0.05] hover:bg-black/[0.1] text-[#141416]"
            }`}
            title="سلة المشتريات"
          >
            <ShoppingBag className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            {(cartCount !== undefined ? cartCount : cartItemsCount) > 0 && (
              <span
                className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center shadow-lg ${
                  isDarkNavbar ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                {cartCount !== undefined ? cartCount : cartItemsCount}
              </span>
            )}
          </Link>

          {/* Gray Purchase Pill: 12px/400, -0.12px tracking, 170px radius */}
          <Link
            href="/checkout"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-[6px] rounded-full text-[12px] font-medium tracking-[-0.12px] active:scale-98 transition-all shadow-sm ${
              isDarkNavbar
                ? "bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c]"
                : "bg-neutral-800 hover:bg-neutral-900 text-white border border-neutral-700"
            }`}
          >
            <span>شراء</span>
            <ArrowLeft className="w-3 h-3" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-1.5 rounded-lg transition-colors ${
              isDarkNavbar
                ? "text-[#f5f5f7] hover:bg-[#333336]/50"
                : "text-[#141416] hover:bg-black/[0.06]"
            }`}
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden mt-2 mx-auto max-w-6xl p-5 rounded-[20px] backdrop-blur-2xl flex flex-col gap-3 shadow-2xl transition-all duration-300 ${
            isDarkNavbar
              ? "bg-[#161617]/98 border border-[#282828] text-[#f5f5f7]"
              : "bg-white/95 border border-black/[0.08] text-[#141416]"
          }`}
        >
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-[14px] py-1 transition-colors ${
              isProductsPage
                ? isDarkNavbar
                  ? "text-white font-semibold"
                  : "text-black font-semibold"
                : isDarkNavbar
                ? "text-[#86868b] hover:text-[#f5f5f7] font-medium"
                : "text-neutral-600 hover:text-[#141416] font-medium"
            }`}
          >
            المنتجات والأقسام
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-[14px] font-medium py-1 transition-colors ${
              isDarkNavbar ? "text-[#f5f5f7]" : "text-[#141416]"
            }`}
          >
            المميزات
          </a>
          <a
            href="/#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-[14px] font-medium py-1 transition-colors ${
              isDarkNavbar ? "text-[#f5f5f7]" : "text-[#141416]"
            }`}
          >
            طلب JBL 730BT
          </a>
          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-[14px] font-medium py-1 flex items-center justify-between transition-colors ${
              isDarkNavbar ? "text-[#f5f5f7]" : "text-[#141416]"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-current" />
              <span>سلة المشتريات</span>
            </div>
            {cartItemsCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isDarkNavbar ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Auth Section in Mobile Menu */}
          <div
            className={`pt-2 pb-1 border-t flex flex-col gap-2 ${
              isDarkNavbar ? "border-[#282828]" : "border-black/[0.08]"
            }`}
          >
            {currentUser ? (
              <div
                className={`flex items-center justify-between py-1 px-2 rounded-xl border ${
                  isDarkNavbar
                    ? "bg-[#1d1d1f] border-[#333336]"
                    : "bg-black/[0.04] border-black/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-current" />
                  <span
                    className={`text-[13px] font-medium ${
                      isDarkNavbar ? "text-[#f5f5f7]" : "text-[#141416]"
                    }`}
                  >
                    {currentUser.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[12px] text-red-500 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-[13px] font-medium flex items-center justify-between transition-colors ${
                    isDarkNavbar
                      ? "bg-[#1d1d1f] border-[#333336] text-[#f5f5f7] hover:bg-[#28282b]"
                      : "bg-black/[0.04] border-black/[0.08] text-[#141416] hover:bg-black/[0.08]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-current" />
                    <span>إنشاء حساب جديد</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isDarkNavbar
                        ? "text-white bg-white/10"
                        : "text-black bg-black/5"
                    }`}
                  >
                    مجاناً
                  </span>
                </Link>

                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2 px-3 text-[13px] font-normal flex items-center gap-2 transition-colors ${
                    isDarkNavbar
                      ? "text-[#86868b] hover:text-[#f5f5f7]"
                      : "text-neutral-600 hover:text-[#141416]"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>تسجيل الدخول إلى حسابك</span>
                </Link>
              </>
            )}

            {currentUser?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[14px] font-medium hover:underline py-1 flex items-center gap-2 ${
                  isDarkNavbar ? "text-white" : "text-black"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>لوحة تحكم الأدمن</span>
              </Link>
            )}
          </div>

          <div
            className={`pt-2 border-t ${
              isDarkNavbar ? "border-[#333336]" : "border-black/[0.08]"
            }`}
          >
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-center text-[12px] font-normal flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>شراء الآن — $129</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
