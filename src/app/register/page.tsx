"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Phone, MapPin, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "القاهرة",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إنشاء الحساب");
      }

      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/products");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (redirect) {
      router.push(redirect);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/products");
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 selection:bg-white selection:text-black">
      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للخلف</span>
        </button>
        <Link href="/" className="group">
          <BrandLogo iconClassName="w-5 h-5 text-[#f5f5f7]" textClassName="text-xs" />
        </Link>
      </div>

      {/* Main Register Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="rounded-[28px] bg-[#1d1d1f] border border-[#333336] p-7 sm:p-9 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-[11px] font-semibold text-[#f5f5f7] uppercase tracking-wider block mb-1">
              حساب جديد
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#f5f5f7] tracking-tight">
              انضم إلى عائلة SSP
            </h1>
            <p className="text-xs text-[#86868b] mt-1.5 font-normal">
              أنشئ حسابك لإضافة المنتجات إلى السلة وحفظها وتتبع طلباتك
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-[#86868b] mb-1">
                الاسم بالكامل *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="محمد أحمد"
                  className="w-full pl-4 pr-10 py-2.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#333336] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white"
                />
                <User className="w-4 h-4 text-[#86868b] absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#86868b] mb-1">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-2.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#333336] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white"
                />
                <Mail className="w-4 h-4 text-[#86868b] absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#86868b] mb-1">
                كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="6 أحرف أو أكثر"
                  className="w-full pl-4 pr-10 py-2.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#333336] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white"
                />
                <Lock className="w-4 h-4 text-[#86868b] absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#86868b] mb-1">
                  رقم الهاتف *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full pl-4 pr-10 py-2.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#333336] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white"
                  />
                  <Phone className="w-4 h-4 text-[#86868b] absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#86868b] mb-1">
                  المحافظة
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full bg-[#161617] border border-[#333336] text-[#f5f5f7] text-[13px] focus:outline-hidden focus:border-white cursor-pointer"
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
              <label className="block text-[11px] font-medium text-[#86868b] mb-1">
                العنوان
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="الشارع، رقم العمارة"
                  className="w-full pl-4 pr-10 py-2.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#333336] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white"
                />
                <MapPin className="w-4 h-4 text-[#86868b] absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-6 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-[13px] font-medium flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-black/40"
            >
              <span>{loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب الآن"}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#86868b]">
            لديك حساب بالفعل؟{" "}
            <Link
              href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
              className="text-white hover:underline font-medium"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>

      {/* Security badge */}
      <div className="text-center text-[11px] text-[#86868b] flex items-center justify-center gap-1.5 mt-8">
        <ShieldCheck className="w-3.5 h-3.5 text-white" />
        <span>بياناتك الشخصية مشفرة ومحمية بالكامل</span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}