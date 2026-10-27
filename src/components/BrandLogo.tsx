"use client";

import React from "react";

interface BrandLogoProps {
  variant?: "lockup" | "icon";
  direction?: 1 | 2 | 3;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function BrandIcon({
  direction = 1,
  className = "w-7 h-7",
}: {
  direction?: 1 | 2 | 3;
  className?: string;
}) {
  // Direction 02: Headband Equalizer
  if (direction === 2) {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="SSP STORE"
      >
        <path d="M11.5 40 A20.5 20.5 0 0 1 52.5 40" stroke="currentColor" strokeWidth="3.5" />
        <rect x="7" y="36" width="9" height="19" rx="4.5" fill="currentColor" />
        <rect x="48" y="36" width="9" height="19" rx="4.5" fill="currentColor" />
        <rect x="25.5" y="39" width="3" height="10" rx="1.5" fill="currentColor" />
        <rect x="30.5" y="34" width="3" height="20" rx="1.5" fill="currentColor" />
        <rect x="35.5" y="39" width="3" height="10" rx="1.5" fill="currentColor" />
      </svg>
    );
  }

  // Direction 03: Open Driver
  if (direction === 3) {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="SSP STORE"
      >
        <path d="M50.02 44.62 A22 22 0 1 1 50.02 19.38" stroke="currentColor" strokeWidth="3.5" />
        <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="3.5" />
        <circle cx="32" cy="32" r="4" fill="currentColor" />
        <path d="M57 26 A8 8 0 0 1 57 38" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.6" />
      </svg>
    );
  }

  // Direction 01: Resonance S (Default & Recommended)
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="SSP STORE"
    >
      <path
        d="M43 21 A11 11 0 1 0 32 32 A11 11 0 1 1 21 43"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="butt"
      />
      <circle cx="32" cy="32" r="2.75" fill="currentColor" />
    </svg>
  );
}

export default function BrandLogo({
  variant = "lockup",
  direction = 1,
  className = "",
  iconClassName = "w-6 h-6",
  textClassName = "",
}: BrandLogoProps) {
  if (variant === "icon") {
    return <BrandIcon direction={direction} className={iconClassName} />;
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none text-current ${className}`}>
      <div className="flex-shrink-0 flex items-center justify-center text-current transition-transform duration-300 group-hover:scale-105">
        <BrandIcon direction={direction} className={iconClassName} />
      </div>
      <div className={`flex items-baseline tracking-tight font-semibold text-sm ${textClassName}`}>
        <span className="text-current">SSP</span>
        <span className="font-light opacity-70 ms-1 text-[11px] tracking-wider uppercase">
          STORE
        </span>
      </div>
    </div>
  );
}
