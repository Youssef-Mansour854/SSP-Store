"use client";

import React, { useEffect, useState } from "react";
import { BrandIcon } from "./BrandLogo";

interface PreloaderProps {
  progress: number;
  isLoaded: boolean;
}

export default function Preloader({ progress, isLoaded }: PreloaderProps) {
  const [shouldRender, setShouldRender] = useState(!isLoaded);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [isLoaded]);

  if (!shouldRender) return null;

  const displayProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070709] text-[#f5f5f7] transition-all duration-700 ease-out select-none ${
        isLoaded ? "opacity-0 pointer-events-none scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Animated Brand Emblem with Acoustic Aura */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Expanding Acoustic Wave Rings */}
          <div className="absolute w-28 h-28 rounded-full border border-white/20 animate-ping [animation-duration:2.5s]" />
          <div className="absolute w-36 h-36 rounded-full border border-white/10 animate-pulse [animation-duration:3s]" />

          {/* Logo Card */}
          <div className="relative w-24 h-24 rounded-[26px] bg-[#111114] border border-[#28282d] text-white flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
            <BrandIcon className="w-12 h-12 text-[#f5f5f7]" />
            
            {/* Glowing Driver Dot Accent */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-white blur-[3px] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Brand Name & Sound Equalizer Waves */}
        <div className="space-y-2 mb-8 flex flex-col items-center">
          <div className="flex items-baseline gap-1.5 font-semibold text-lg sm:text-xl tracking-tight text-[#f5f5f7]">
            <span>SSP</span>
            <span className="font-light text-[#86868b] text-xs tracking-widest uppercase">
              STORE
            </span>
          </div>

          {/* Sound Frequency Bars */}
          <div className="flex items-center gap-1.5 h-6 my-1">
            <span className="w-1 bg-white rounded-full animate-bounce [animation-duration:0.8s] h-3" />
            <span className="w-1 bg-white rounded-full animate-bounce [animation-duration:1.1s] [animation-delay:0.15s] h-5" />
            <span className="w-1 bg-white rounded-full animate-bounce [animation-duration:0.9s] [animation-delay:0.3s] h-4" />
            <span className="w-1 bg-white rounded-full animate-bounce [animation-duration:1.2s] [animation-delay:0.2s] h-6" />
            <span className="w-1 bg-white rounded-full animate-bounce [animation-duration:0.7s] [animation-delay:0.4s] h-2.5" />
          </div>

          <p className="text-[12px] font-normal text-[#86868b] tracking-wide">
            جاري تحضير تجربة الصوت التفاعلية 3D
          </p>
        </div>

        {/* Precision Progress Bar */}
        <div className="w-64 space-y-2.5">
          <div className="w-full h-1.5 bg-[#1c1c1f] rounded-full overflow-hidden p-[1px] border border-[#2d2d32]">
            <div
              className="h-full bg-gradient-to-r from-neutral-400 to-white rounded-full transition-all duration-200 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#86868b] px-1">
            <span>JBL TUNE 730BT</span>
            <span className="text-[#f5f5f7] font-semibold">{displayProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
