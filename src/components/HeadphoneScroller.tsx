"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Preloader from "./Preloader";

const TOTAL_FRAMES = 240;

// Hermite interpolation (smoothstep) for natural, fluid S-curve fading
function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Dynamic script loader helper
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve();
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

// Module-level global image cache so returning to Home is instantaneous
let globalCachedImages: HTMLImageElement[] | null = null;

export default function HeadphoneScroller() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loadingProgress, setLoadingProgress] = useState(() =>
    globalCachedImages && globalCachedImages.length === TOTAL_FRAMES ? 100 : 0
  );
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(
    () => !globalCachedImages || globalCachedImages.length !== TOTAL_FRAMES
  );
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // References to keep images and frame states
  const imagesRef = useRef<HTMLImageElement[]>(globalCachedImages || []);
  const currentFrameRef = useRef<number>(0);
  const lastProgressRef = useRef<number>(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // High-DPI Crystal Clear Canvas Drawing
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!ctxRef.current || ctxRef.current.canvas !== canvas) {
      ctxRef.current = canvas.getContext("2d", { willReadFrequently: false, alpha: false });
      if (ctxRef.current) {
        ctxRef.current.imageSmoothingEnabled = true;
        ctxRef.current.imageSmoothingQuality = "high";
      }
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < 25; offset++) {
        const prev = imagesRef.current[frameIndex - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          break;
        }
        const next = imagesRef.current[frameIndex + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          img = next;
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (canvasWidth === 0 || canvasHeight === 0) return;

    const imgRatio = img.naturalWidth / img.naturalHeight; // 16:9 = 1.77778
    const canvasRatio = canvasWidth / canvasHeight;

    // Clear with studio background color #ebebeb
    ctx.fillStyle = "#ebebeb";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    let drawWidth: number;
    let drawHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (canvasRatio >= 1.0) {
      // Landscape / Desktop / Laptop screens:
      // Full-bleed cover so video fills 100% of the screen with zero borders
      if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
      } else {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
      }
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      // Portrait / Mobile screens:
      // Scale headphone proportionally to fill ~85% of mobile width at razor-sharp Retina resolution
      drawWidth = canvasWidth * 1.35;
      drawHeight = drawWidth / imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = (canvasHeight - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    currentFrameRef.current = frameIndex;
  }, []);

  // High-DPI Retina Canvas Size Handler (Fixes Mobile Pixelation!)
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // CRITICAL: Use full Retina pixel ratio (up to 2.5x) on Mobile & Desktop!
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    // Buffer dimensions at true Retina resolution
    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);

    // Display dimensions in CSS pixels
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    if (ctxRef.current) {
      ctxRef.current.imageSmoothingEnabled = true;
      ctxRef.current.imageSmoothingQuality = "high";
    }

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // Preload Images (Progressive Loading with Global Memory Cache)
  useEffect(() => {
    let mounted = true;

    // Instant restoration if already cached in memory from previous visit
    if (globalCachedImages && globalCachedImages.length === TOTAL_FRAMES) {
      imagesRef.current = globalCachedImages;
      setLoadingProgress(100);
      setIsPreloaderVisible(false);
      updateCanvasDimensions();
      drawFrame(0);

      const rafId = requestAnimationFrame(() => {
        if (mounted) {
          updateCanvasDimensions();
          drawFrame(0);
        }
      });

      const timerId = setTimeout(() => {
        if (mounted) {
          updateCanvasDimensions();
          drawFrame(0);
        }
      }, 50);

      return () => {
        mounted = false;
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
      };
    }

    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let loadedCount = 0;

    const autoDismiss = setTimeout(() => {
      if (mounted) setIsPreloaderVisible(false);
    }, 2000);

    const onImageLoaded = (index: number) => {
      if (!mounted) return;
      loadedCount++;
      const percent = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
      setLoadingProgress(percent);

      if (index === 0) {
        updateCanvasDimensions();
        drawFrame(0);
      }

      if (loadedCount >= TOTAL_FRAMES || percent >= 90) {
        setIsPreloaderVisible(false);
        updateCanvasDimensions();
        drawFrame(0);
      }
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i + 1).padStart(4, "0");
      img.src = `/frames/frame_${frameNum}.webp`;

      img.onload = () => onImageLoaded(i);
      img.onerror = () => onImageLoaded(i);

      if (typeof img.decode === "function") {
        img.decode().catch(() => {});
      }

      images[i] = img;
    }

    imagesRef.current = images;
    globalCachedImages = images;

    return () => {
      mounted = false;
      clearTimeout(autoDismiss);
    };
  }, [updateCanvasDimensions, drawFrame]);

  // Resize Listener
  useEffect(() => {
    window.addEventListener("resize", updateCanvasDimensions, { passive: true });
    updateCanvasDimensions();
    return () => window.removeEventListener("resize", updateCanvasDimensions);
  }, [updateCanvasDimensions]);

  // Scroll Engine: GSAP ScrollTrigger Scrub + Lenis Smooth Scroll + LERP Fallback
  useEffect(() => {
    let destroyed = false;
    let lenisInstance: any = null;
    let gsapTween: any = null;
    let rafFallbackId: number | null = null;
    let isGsapActive = false;

    let tickerFn: ((time: number) => void) | null = null;
    let gsapInstance: any = null;
    let scrollTriggerInstance: any = null;
    let refreshTimer1: any = null;
    let refreshTimer2: any = null;

    // Smooth fallback LERP for frames before GSAP initializes
    let targetProgress = 0;
    let currentInterpolatedProgress = 0;

    const handleNativeScrollFallback = () => {
      if (isGsapActive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalDistance = containerRef.current.offsetHeight - window.innerHeight;
      if (totalDistance <= 0) return;
      const scrolled = -rect.top;
      targetProgress = Math.min(1, Math.max(0, scrolled / totalDistance));
    };

    // If entering home from another route, reset scroll to top immediately
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo(0, 0);
    }

    // Always ensure frame 0 and progress 0 initially
    currentFrameRef.current = 0;
    lastProgressRef.current = 0;
    drawFrame(0);
    setScrollProgress(0);

    const runFallbackLerp = () => {
      if (destroyed) return;
      if (!isGsapActive) {
        currentInterpolatedProgress += (targetProgress - currentInterpolatedProgress) * 0.08;
        const targetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(currentInterpolatedProgress * (TOTAL_FRAMES - 1)))
        );
        if (targetFrame !== currentFrameRef.current) {
          drawFrame(targetFrame);
        }
        setScrollProgress(currentInterpolatedProgress);
      }
      rafFallbackId = requestAnimationFrame(runFallbackLerp);
    };

    window.addEventListener("scroll", handleNativeScrollFallback, { passive: true });
    rafFallbackId = requestAnimationFrame(runFallbackLerp);

    // Initialize GSAP, ScrollTrigger, and Lenis
    const initEngine = () => {
      if (destroyed) return;
      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;
      const Lenis = (window as any).Lenis;

      if (!gsap || !ScrollTrigger) return;
      gsapInstance = gsap;
      scrollTriggerInstance = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Kill ANY previous ScrollTriggers across navigations to eliminate ghost triggers
      ScrollTrigger.getAll().forEach((st: any) => st.kill());

      // Initialize or reset Lenis Smooth Scroll
      if (Lenis) {
        if ((window as any).__lenisInstance) {
          try {
            (window as any).__lenisInstance.destroy();
          } catch (e) {}
          (window as any).__lenisInstance = null;
        }

        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 0.85,
          touchMultiplier: 1.2,
        });
        (window as any).__lenisInstance = lenisInstance;

        if (typeof window !== "undefined" && !window.location.hash) {
          window.scrollTo(0, 0);
          lenisInstance.scrollTo(0, { immediate: true });
        }

        lenisInstance.on("scroll", () => {
          ScrollTrigger.update();
        });

        tickerFn = (time: number) => {
          if (lenisInstance) {
            lenisInstance.raf(time * 1000);
          }
        };
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);
      }

      if (containerRef.current) {
        isGsapActive = true;
        if (rafFallbackId) {
          cancelAnimationFrame(rafFallbackId);
          rafFallbackId = null;
        }
        window.removeEventListener("scroll", handleNativeScrollFallback);

        // Frame state always starts at 0
        const frameState = { frame: 0 };
        currentFrameRef.current = 0;
        lastProgressRef.current = 0;
        setScrollProgress(0);
        drawFrame(0);

        gsapTween = gsap.fromTo(
          frameState,
          { frame: 0 },
          {
            frame: TOTAL_FRAMES - 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.1, // True inertial damping
              onUpdate: (self: any) => {
                const progress = self.progress;
                if (Math.abs(progress - lastProgressRef.current) > 0.0015) {
                  lastProgressRef.current = progress;
                  setScrollProgress(progress);
                }
              },
            },
            onUpdate: () => {
              const nextFrame = Math.min(
                TOTAL_FRAMES - 1,
                Math.max(0, Math.round(frameState.frame))
              );
              if (nextFrame !== currentFrameRef.current) {
                drawFrame(nextFrame);
              }
            },
          }
        );

        ScrollTrigger.refresh();
        ScrollTrigger.update();

        // Refresh after Next.js layout finishes settling
        refreshTimer1 = setTimeout(() => {
          if (!destroyed && ScrollTrigger) {
            ScrollTrigger.refresh();
            ScrollTrigger.update();
          }
        }, 100);

        refreshTimer2 = setTimeout(() => {
          if (!destroyed && ScrollTrigger) {
            ScrollTrigger.refresh();
            ScrollTrigger.update();
            drawFrame(currentFrameRef.current);
          }
        }, 300);
      }
    };

    // Check if scripts are already available on window (from beforeInteractive in layout.tsx)
    if ((window as any).gsap && (window as any).ScrollTrigger) {
      initEngine();
    } else {
      Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"),
        loadScript("https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"),
      ])
        .then(initEngine)
        .catch((err) => {
          console.warn("GSAP/Lenis CDN loading fallback active:", err);
        });
    }

    return () => {
      destroyed = true;
      window.removeEventListener("scroll", handleNativeScrollFallback);
      if (rafFallbackId) cancelAnimationFrame(rafFallbackId);

      clearTimeout(refreshTimer1);
      clearTimeout(refreshTimer2);

      // CRITICAL: Remove ticker listener to prevent calling destroyed Lenis
      if (tickerFn && gsapInstance) {
        gsapInstance.ticker.remove(tickerFn);
        tickerFn = null;
      }

      if (gsapTween) {
        if (gsapTween.scrollTrigger) gsapTween.scrollTrigger.kill();
        gsapTween.kill();
        gsapTween = null;
      }

      if (scrollTriggerInstance) {
        scrollTriggerInstance.getAll().forEach((st: any) => st.kill());
      }

      if (lenisInstance) {
        try {
          lenisInstance.destroy();
        } catch (e) {}
        lenisInstance = null;
        if ((window as any).__lenisInstance) {
          (window as any).__lenisInstance = null;
        }
      }
    };
  }, [drawFrame]);

  // 1. Hero / Intro: 0.00 -> 0.16 (S-curve fade-out)
  const isStage1 = scrollProgress < 0.16;
  const stage1Opacity = 1 - smoothStep(0.06, 0.15, scrollProgress);
  const stage1TranslateY = -scrollProgress * 450;
  const stage1Scale = 1 + scrollProgress * 0.25;

  // 2. Design & Ergonomics: 0.18 -> 0.48 (matches headphone rotating to profile)
  const stage2Opacity =
    scrollProgress < 0.18 || scrollProgress > 0.48
      ? 0
      : scrollProgress < 0.25
      ? smoothStep(0.18, 0.25, scrollProgress)
      : scrollProgress > 0.42
      ? 1 - smoothStep(0.42, 0.48, scrollProgress)
      : 1;

  // 3. Exploded Architecture & 4 Components: 0.52 -> 0.80 (ear cups decouple and separate)
  const stage3Opacity =
    scrollProgress < 0.52 || scrollProgress > 0.80
      ? 0
      : scrollProgress < 0.60
      ? smoothStep(0.52, 0.60, scrollProgress)
      : scrollProgress > 0.74
      ? 1 - smoothStep(0.74, 0.80, scrollProgress)
      : 1;

  // 4. Sequential Performance Highlights: 0.82 -> 0.98
  const stage4Opacity =
    scrollProgress < 0.82 || scrollProgress > 0.98
      ? 0
      : scrollProgress < 0.87
      ? smoothStep(0.82, 0.87, scrollProgress)
      : scrollProgress > 0.94
      ? 1 - smoothStep(0.94, 0.98, scrollProgress)
      : 1;

  const feat1Active = scrollProgress >= 0.85; // ANC
  const feat2Active = scrollProgress >= 0.88; // Battery 76h
  const feat3Active = scrollProgress >= 0.91; // Pure Bass

  return (
    <>
      {/* Preloader */}
      <Preloader progress={loadingProgress} isLoaded={!isPreloaderVisible} />

      {/* Main 500vh Smooth Scroll Track */}
      <section
        id="experience"
        ref={containerRef}
        className="relative w-full h-[500vh] bg-[#ebebeb]"
      >
        {/* Sticky 100vh Viewport Stage */}
        <div
          ref={stickyRef}
          className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#ebebeb] transform-gpu will-change-transform"
        >
          {/* ========================================================== */}
          {/* STAGE 1: Giant Typography BEHIND Headphone (z-0)           */}
          {/* Full-bleed old style presentation                          */}
          {/* ========================================================== */}
          <div
            className={`absolute inset-0 z-0 flex flex-col items-center justify-center select-none pointer-events-none transition-opacity duration-200 ${
              isStage1 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="relative z-10 text-center px-4 max-w-6xl will-change-transform"
              style={{
                transform: `translate3d(0, ${stage1TranslateY}px, 0) scale(${stage1Scale})`,
                opacity: stage1Opacity,
              }}
            >
              <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[14rem] font-black tracking-tighter text-[#141414] leading-[0.88]">
                JBL TUNE
              </h1>
              <div className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-black tracking-tight mt-1">
                730BT
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* CANVAS: Razor-Sharp Retina Canvas (z-10)                   */}
          {/* Full-bleed drawing across 100% of viewport                 */}
          {/* ========================================================== */}
          <canvas
            ref={canvasRef}
            className={`relative z-10 w-full h-full block pointer-events-none transform-gpu will-change-transform ${
              isStage1 ? "mix-blend-darken" : "mix-blend-normal"
            }`}
          />

          {/* Seamless Transition Overlay into Obsidian #000000 below */}
          <div
            className="absolute inset-0 z-15 pointer-events-none bg-[#000000] transition-opacity duration-200"
            style={{
              opacity: smoothStep(0.92, 1.00, scrollProgress),
            }}
          />

          {/* ========================================================== */}
          {/* STAGE 2: Modern Lifestyle & Ergonomics (Hold Zone 1)       */}
          {/* Pure Floating Typography - Zero Background Boxes           */}
          {/* ========================================================== */}
          <div
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-start p-6 sm:px-14 lg:px-24 transition-opacity duration-500"
            style={{ opacity: stage2Opacity }}
          >
            <div className="max-w-lg space-y-3 pointer-events-auto select-none">
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-500 uppercase block">
                AERODYNAMIC PROFILE
              </span>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#141416] tracking-tight leading-[1.05]">
                خفة استثنائية.<br />انسيابية تتنفس معك.
              </h2>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal pt-1 max-w-md">
                هيكل مرن فائق الخفة يزن 220 غراماً فقط مع مفاصل دوران ثلاثية الأبعاد تلتف بسلاسة لترافقك بكل راحة طوال يومك في العمل، السفر والنادي.
              </p>

              <div className="flex items-center gap-10 pt-4">
                <div>
                  <span className="block text-2xl sm:text-4xl font-black text-[#141416] font-mono">220g</span>
                  <span className="text-xs text-neutral-500 font-medium tracking-wide">الوزن الكلي</span>
                </div>
                <div className="w-[1px] h-10 bg-black/15" />
                <div>
                  <span className="block text-2xl sm:text-4xl font-black text-[#141416] font-mono">3D Multi-Fold</span>
                  <span className="text-xs text-neutral-500 font-medium tracking-wide">مفاصل الدوران</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* STAGE 3: Exploded Architecture (Hold Zone 2)               */}
          {/* Pure Floating Typography & Hairline Pointers               */}
          {/* ========================================================== */}
          <div
            id="exploded-tech"
            className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-500 overflow-hidden"
            style={{ opacity: stage3Opacity }}
          >
            {/* Top Minimal Typography Title */}
            <div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 pointer-events-none select-none text-center">
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-neutral-500 uppercase block mb-1">
                INTERNAL ARCHITECTURE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#141416] tracking-tight">
                التشريح الهندسي الداخلي
              </h3>
            </div>

            {/* 4 Pure Floating Spatial Callouts with Hairline Indicators */}
            <div className="w-full h-full relative pointer-events-none">
              {/* Callout 1: Top-Left (Battery) */}
              <div className="absolute top-[20%] left-6 sm:left-12 lg:left-20 pointer-events-none select-none max-w-[260px]">
                <span className="text-[11px] font-mono font-bold tracking-wider text-neutral-500 block">
                  01 / POWER CELL
                </span>
                <h4 className="text-base sm:text-lg font-black text-[#141416] mt-0.5">
                  بطارية ليثيوم 76 ساعة
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  شحنة واحدة تدوم أسبوعين كاملين مع دارة حماية ذكية.
                </p>
                <div className="hidden lg:flex items-center gap-2 mt-3">
                  <div className="w-14 h-[1.5px] bg-[#141416]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141416]" />
                </div>
              </div>

              {/* Callout 2: Bottom-Left (Processor PCB) */}
              <div className="absolute bottom-[18%] left-6 sm:left-12 lg:left-20 pointer-events-none select-none max-w-[260px]">
                <span className="text-[11px] font-mono font-bold tracking-wider text-neutral-500 block">
                  02 / DSP AUDIO CHIP
                </span>
                <h4 className="text-base sm:text-lg font-black text-[#141416] mt-0.5">
                  معالج الصوت المزدوج
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  عزل ذكي متقدم ومعالجة فورية للموجات بدون أي تأخير زمني.
                </p>
                <div className="hidden lg:flex items-center gap-2 mt-3">
                  <div className="w-14 h-[1.5px] bg-[#141416]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141416]" />
                </div>
              </div>

              {/* Callout 3: Top-Right (Memory Foam Cushion) */}
              <div className="absolute top-[20%] right-6 sm:right-12 lg:right-20 pointer-events-none select-none max-w-[260px] text-right">
                <span className="text-[11px] font-mono font-bold tracking-wider text-neutral-500 block">
                  03 / MEMORY FOAM
                </span>
                <h4 className="text-base sm:text-lg font-black text-[#141416] mt-0.5">
                  وسائد الفوم المتكيفة
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  جلد بروتيني فائق النعومة يتطابق مع تضاريس الأذن لعزل مريح.
                </p>
                <div className="hidden lg:flex items-center justify-end gap-2 mt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141416]" />
                  <div className="w-14 h-[1.5px] bg-[#141416]" />
                </div>
              </div>

              {/* Callout 4: Bottom-Right (PureBass Driver) */}
              <div className="absolute bottom-[18%] right-6 sm:right-12 lg:right-20 pointer-events-none select-none max-w-[260px] text-right">
                <span className="text-[11px] font-mono font-bold tracking-wider text-neutral-500 block">
                  04 / 40MM DRIVER
                </span>
                <h4 className="text-base sm:text-lg font-black text-[#141416] mt-0.5">
                  مكبر الصوت Pure Bass
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  غشاء تيتانيوم صلب مع ملف نحاسي لنغمات بيس عميقة وتفاصيل نقية.
                </p>
                <div className="hidden lg:flex items-center justify-end gap-2 mt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#141416]" />
                  <div className="w-14 h-[1.5px] bg-[#141416]" />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* STAGE 4: Performance Highlights (0.73 -> 0.98)             */}
          {/* Pure Floating Typography in Clean Lower Viewport Strip     */}
          {/* Completely clear of headphone parts with zero background   */}
          {/* ========================================================== */}
          <div
            id="features"
            className="absolute inset-x-0 bottom-6 sm:bottom-10 z-20 pointer-events-none flex flex-col items-center justify-end px-4 sm:px-8 lg:px-16 transition-opacity duration-300"
            style={{ opacity: stage4Opacity }}
          >
            <div className="w-full max-w-5xl mx-auto pointer-events-auto select-none">
              {/* Header */}
              <div className="text-center mb-3 sm:mb-5">
                <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-neutral-500 uppercase block mb-1">
                  ACOUSTIC MASTERY
                </span>
                <h3 className="text-xl sm:text-3xl font-black text-[#141416] tracking-tight">
                  أداء صوتي يفوق التوقعات
                </h3>
              </div>

              {/* 3 Columns in the Clear Bottom Space */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 text-center sm:text-right">
                {/* Feature 1 */}
                <div
                  className={`transition-all duration-500 ${
                    feat1Active ? "opacity-100 translate-y-0" : "opacity-20 translate-y-2"
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-neutral-500 block mb-0.5">01 / HYBRID ANC</span>
                  <h4 className="text-sm sm:text-base font-bold text-[#141416]">
                    عزل الصوت الذكي
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-600 mt-1 leading-relaxed font-normal">
                    يعزل حتى 95% من الضوضاء المحيطة لنقاء صوتي كامل.
                  </p>
                </div>

                {/* Feature 2 */}
                <div
                  className={`transition-all duration-500 ${
                    feat2Active ? "opacity-100 translate-y-0" : "opacity-20 translate-y-2"
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-neutral-500 block mb-0.5">02 / BATTERY LIFE</span>
                  <h4 className="text-sm sm:text-base font-bold text-[#141416]">
                    بطارية تدوم 76 ساعة
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-600 mt-1 leading-relaxed font-normal">
                    استخدام أسبوعين كاملين مع شحن فائق السرعة.
                  </p>
                </div>

                {/* Feature 3 */}
                <div
                  className={`transition-all duration-500 ${
                    feat3Active ? "opacity-100 translate-y-0" : "opacity-20 translate-y-2"
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-neutral-500 block mb-0.5">03 / PURE BASS</span>
                  <h4 className="text-sm sm:text-base font-bold text-[#141416]">
                    صوت JBL Pure Bass
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-600 mt-1 leading-relaxed font-normal">
                    نغمات بيس عميقة وطبقات صوت سينمائية واضحة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
