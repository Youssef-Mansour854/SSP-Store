"use client";

import Navbar from "@/components/Navbar";
import HeadphoneScroller from "@/components/HeadphoneScroller";
import BrandMarquee from "@/components/BrandMarquee";
import ProductDetails from "@/components/ProductDetails";
import ProductsMarquee from "@/components/ProductsMarquee";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#000000] text-[#f5f5f7]">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Pinned Interactive Scrollytelling Section */}
      <HeadphoneScroller />

      {/* Brand Logos Infinite Horizontal Marquee (Transparent Background) */}
      <BrandMarquee />

      {/* Post-Animation Pricing, Features, and Buy CTA Section */}
      <ProductDetails />

      {/* Moving Sample of Latest Products with Arrow Link to /products */}
      <ProductsMarquee />

      {/* E-Commerce Store Footer */}
      <Footer />
    </main>
  );
}
