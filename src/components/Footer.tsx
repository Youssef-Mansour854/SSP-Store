import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="bg-[#000000] border-t border-[#333336] py-16 px-4 sm:px-6 lg:px-8 text-[#86868b] select-none">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <Link href="/" className="inline-block group">
              <BrandLogo iconClassName="w-7 h-7 text-[#f5f5f7]" textClassName="text-base" />
            </Link>
            <p className="text-[12px] text-[#86868b] leading-relaxed font-normal">
              الوجهة المعتمدة لتجهيزات الصوت اللاسلكية الاحترافية والمنتجات الأصلية بأعلى معايير الجودة والضمان.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#86868b]">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>موزع معتمد لمنتجات JBL الأصلية</span>
            </div>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-semibold text-[12px] uppercase tracking-wider text-[#f5f5f7] mb-3">
              الضمان والخدمات
            </h4>
            <ul className="space-y-2 text-[12px] text-[#86868b]">
              <li>ضمان شامل لمدة عامين من الوكيل المعتمد</li>
              <li>شحن وتوصيل فوري لكافة المحافظات</li>
              <li>سياسة استبدال واسترجاع خلال 14 يوم</li>
              <li>دعم فني وخدمة عملاء 24/7</li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="font-semibold text-[12px] uppercase tracking-wider text-[#f5f5f7] mb-3">
              خيارات الدفع
            </h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-[#1d1d1f] text-[11px] text-[#86868b] border border-[#333336]">
                الدفع عند الاستلام
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1d1d1f] text-[11px] text-[#86868b] border border-[#333336]">
                Visa / MasterCard
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1d1d1f] text-[11px] text-[#86868b] border border-[#333336]">
                Apple Pay
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1d1d1f] text-[11px] text-[#86868b] border border-[#333336]">
                فودافون كاش
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1d1d1f] text-[11px] text-[#86868b] border border-[#333336]">
                انستاباي InstaPay
              </span>
            </div>
            <p className="text-[11px] text-[#6e6e73]">
              جميع المعاملات مشفرة ومحمية ببروتوكولات SSL الآمنة.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#333336] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6e6e73] gap-3">
          <p>© 2026 متجر SSP STORE. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-1">
            <span>هندسة الصوت الأصلي بواسطة</span>
            <span className="text-[#f5f5f7] font-medium">SSP Audio Labs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
