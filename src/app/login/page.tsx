"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      // If user is admin and no specific redirect, go to admin
      if (data.user?.role === "admin" && !redirect) {
        router.push("/admin");
      } else if (redirect) {
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

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="rounded-[28px] bg-[#1d1d1f] border border-[#333336] p-7 sm:p-9 shadow-2xl">
          <div className="text-center mb-8">
            <span className="text-[11px] font-semibold text-[#f5f5f7] uppercase tracking-wider block mb-1">
              تسجيل الدخول
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#f5f5f7] tracking-tight">
              أهلاً بك مجدداً
            </h1>
            <p className="text-xs text-[#86868b] mt-1.5 font-normal">
              سجل دخولك لحفظ مشترياتك في السلة أو متابعة طلباتك
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-3 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#333336] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white"
                />
                <Mail className="w-4 h-4 text-[#86868b] absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#333336] text-[#f5f5f7] text-[13px] placeholder:text-[#6e6e73] focus:outline-hidden focus:border-white focus:ring-1 focus:ring-white"
                />
                <Lock className="w-4 h-4 text-[#86868b] absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Gray Pill Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-[13px] font-medium flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-black/40"
            >
              <span>{loading ? "جاري التحقق..." : "تسجيل الدخول"}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Admin Helper Hint */}
          <div className="mt-5 p-3 rounded-xl bg-[#000000]/40 border border-[#333336] text-[11px] text-[#86868b] text-center">
            <span>حساب الأدمن التجريبي: </span>
            <span className="font-mono text-[#f5f5f7]">admin@sspstore.com</span>
            <span className="block mt-0.5">
              كلمة المرور: <span className="font-mono text-[#f5f5f7]">admin123456</span>
            </span>
          </div>

          <div className="mt-6 text-center text-xs text-[#86868b]">
            ليس لديك حساب بعد؟{" "}
            <Link
              href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}
              className="text-white hover:underline font-medium"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>

      {/* Security badge */}
      <div className="text-center text-[11px] text-[#86868b] flex items-center justify-center gap-1.5 mt-8">
        <ShieldCheck className="w-3.5 h-3.5 text-white" />
        <span>نظام تسجيل دخول مشفر وآمن 100% بتقنية JWT</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}