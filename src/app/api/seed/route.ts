import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Seed or update Admin User
    const existingAdmin = await User.findOne({ email: "admin@sspstore.com" });
    if (!existingAdmin) {
      const hashedPassword = await hashPassword("admin123456");
      await User.create({
        name: "مدير المتجر • SSP Admin",
        email: "admin@sspstore.com",
        password: hashedPassword,
        role: "admin",
        phone: "01000000000",
        city: "القاهرة",
        address: "مقر إدارة SSP Store",
      });
    }

    // 2. Check if products already exist
    const count = await Product.countDocuments();
    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: `قاعدة البيانات تحتوي بالفعل على ${count} منتج. تم التأكد من وجود حساب الأدمن (admin@sspstore.com).`,
        productsCount: count,
      });
    }

    // 3. Products Seed List (Headphones & Earbuds across JBL, Soundcore, Oraimo, Beats, Sony, Bose, Apple)
    const initialProducts = [
      // 1. JBL Tune 730BT (Hero Product)
      {
        name: "JBL Tune 730BT Wireless",
        slug: "jbl-tune-730bt",
        brand: "JBL",
        category: "headphones",
        price: 129,
        originalPrice: 179,
        description:
          "أسطورة الصوت اللاسلكي من JBL، عزل ضوضاء متكيف Hybrid ANC، مشغلات صوت Pure Bass 40mm، وبطارية خارقة تدوم حتى 76 ساعة متواصلة.",
        image: "/colors/black.jpg",
        images: ["/colors/black.jpg", "/colors/white.jpg", "/colors/dark-blue.jpg"],
        colors: [
          { name: "أسود فحمي", hex: "#1e1e1e", image: "/colors/black.jpg" },
          { name: "أبيض لؤلؤي", hex: "#e8e8ed", image: "/colors/white.jpg" },
          { name: "أزرق عميق", hex: "#313f54", image: "/colors/dark-blue.jpg" },
        ],
        features: [
          "بطارية تدوم 76 ساعة مع شحن سريع 5 دقائق يعطي 3 ساعات",
          "عزل ضوضاء هجين نشط Hybrid ANC مع ميكروفونات دقيقة",
          "اتصال متزامن بجهازين معاً (Multi-Point)",
          "مكبر صوت 40mm بتوقيع صوت JBL Pure Bass الأصلي",
        ],
        specs: {
          battery: "76 ساعة",
          driver: "40mm Dynamic",
          bluetooth: "Bluetooth 5.3",
          anc: "Hybrid ANC",
          weight: "220g",
          charging: "USB Type-C",
        },
        rating: 4.9,
        reviewsCount: 1480,
        inStock: true,
        stockCount: 45,
        isFeatured: true,
      },

      // 2. Sony WH-1000XM5
      {
        name: "Sony WH-1000XM5 Wireless",
        slug: "sony-wh-1000xm5",
        brand: "Sony",
        category: "headphones",
        price: 349,
        originalPrice: 399,
        description:
          "الرائدة عالمياً في عزل الضوضاء بمعالجين متطورين و8 ميكروفونات لتجربة صوت نقية بتقنية Hi-Res Audio اللاسلكية.",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود كلاسيكي", hex: "#111111", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80" },
          { name: "فضي بلاتيني", hex: "#dedede", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "تقنية Auto NC Optimizer لضبط العزل الذاتي وفق البيئة المحيطة",
          "مشغلات 30mm مصممة بدقة فائقة مع غشاء ألياف كربونية",
          "بطارية 30 ساعة مع شحن فائق السرعة 3 دقائق = 3 ساعات",
          "ميكروفونات بتقنية تكوين الشعاع لعزل الرياح والمكالمات فائقة الوضوح",
        ],
        specs: {
          battery: "30 ساعة",
          driver: "30mm Carbon Fiber",
          bluetooth: "Bluetooth 5.2 (LDAC)",
          anc: "Industry Leading Dual Chip ANC",
          weight: "250g",
          charging: "USB Type-C (PD)",
        },
        rating: 4.95,
        reviewsCount: 890,
        inStock: true,
        stockCount: 20,
        isFeatured: true,
      },

      // 3. Beats Studio Pro
      {
        name: "Beats Studio Pro Wireless",
        slug: "beats-studio-pro",
        brand: "Beats",
        category: "headphones",
        price: 299,
        originalPrice: 349,
        description:
          "تصميم Beats الأيقوني المطور بالكامل، يدعم الصوت المكاني المخصص Spatial Audio مع تتبع حركة الرأس وعزل نشط متفوق.",
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود غير لامع", hex: "#1c1c1e", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80" },
          { name: "كحلي داكن", hex: "#1b263b", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "صوت فائق الدقة بدون فقدان Lossless Audio عبر منفذ USB-C",
          "وسائد أذن UltraPlush من الجلد الناعم لراحة تدوم طوال اليوم",
          "بطارية 40 ساعة تشغيل متواصلة",
          "توافق كامل بلمسة واحدة مع كل من أنظمة Apple و Android",
        ],
        specs: {
          battery: "40 ساعة",
          driver: "40mm Custom Active",
          bluetooth: "Class 1 Bluetooth",
          anc: "Adaptive ANC + Transparency",
          weight: "260g",
          charging: "USB-C Audio / Charging",
        },
        rating: 4.8,
        reviewsCount: 640,
        inStock: true,
        stockCount: 30,
        isFeatured: true,
      },

      // 4. Soundcore Space Q45
      {
        name: "Soundcore Space Q45 by Anker",
        slug: "soundcore-space-q45",
        brand: "Soundcore",
        category: "headphones",
        price: 119,
        originalPrice: 149,
        description:
          "عزل ضوضاء متكيف يقلل حتى 98% من الضوضاء مع مكبرات صوت مزدوجة الطبقات وبطارية عملاقة 65 ساعة.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود نفاث", hex: "#0f0f10", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80" },
          { name: "أبيض سحابي", hex: "#f0f0f2", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "عزل ضوضاء مطور خماسي المستويات بذكاء اصطناعي",
          "دعم ترميز LDAC للحصول على 3 أضعاف تفاصيل الصوت العادي",
          "بطارية تدوم 65 ساعة (أو 50 ساعة مع تفعيل ANC)",
          "تطبيق Soundcore مخصص لضبط معادل الصوت EQ بدقة",
        ],
        specs: {
          battery: "65 ساعة",
          driver: "40mm Double-Layer Silk & Metal",
          bluetooth: "Bluetooth 5.3 (LDAC)",
          anc: "Adaptive 98% ANC",
          weight: "292g",
          charging: "Type-C Fast Charge",
        },
        rating: 4.85,
        reviewsCount: 520,
        inStock: true,
        stockCount: 35,
        isFeatured: false,
      },

      // 5. Apple AirPods Max
      {
        name: "Apple AirPods Max",
        slug: "apple-airpods-max",
        brand: "Apple",
        category: "headphones",
        price: 479,
        originalPrice: 549,
        description:
          "القمة في هندسة الصوت الحسابي مع شريحة H1 في كل سماعة، هيكل ألومنيوم أنيق، وصوت مكاني ثلاثي الأبعاد مذهل.",
        image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "رمادي فلكي Space Gray", hex: "#343538", image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&auto=format&fit=crop&q=80" },
          { name: "فضي Silver", hex: "#e0e0e3", image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "شريحة Apple H1 مع هندسة صوتية حسابية فريدة",
          "تاج رقمي Digital Crown للتحكم الدقيق في مستوى الصوت والمكالمات",
          "عزل ضوضاء نشط احترافي مع نمط شفافية الصوت المحيطي",
          "مظلة شبكية قابلة للتهوية وإطار متين من الفولاذ المقاوم للصدأ",
        ],
        specs: {
          battery: "20 ساعة",
          driver: "40mm Apple Custom Driver",
          bluetooth: "Bluetooth 5.0 (Apple H1)",
          anc: "Pro Active Noise Cancellation",
          weight: "384.8g",
          charging: "Lightning / USB-C",
        },
        rating: 4.9,
        reviewsCount: 1120,
        inStock: true,
        stockCount: 15,
        isFeatured: true,
      },

      // 6. Bose QuietComfort Ultra Headphones
      {
        name: "Bose QuietComfort Ultra",
        slug: "bose-quietcomfort-ultra",
        brand: "Bose",
        category: "headphones",
        price: 399,
        originalPrice: 429,
        description:
          "الراحة الأسطورية من Bose مع تقنية الصوت الغامر Bose Immersive Audio وعزل الضوضاء الأقوى في فئتها.",
        image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود أسمنتي", hex: "#1c1c1c", image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&auto=format&fit=crop&q=80" },
          { name: "أبيض دخاني White Smoke", hex: "#eae6e1", image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "تقنية CustomTune لضبط الترددات الصوتية وفق شكل أذنك الفريد",
          "أوضاع استماع ذكية: هادئ، وعي كامل، وانغماس صوتي",
          "عمر بطارية 24 ساعة لرحلات الطيران الطويلة",
          "ميكروفونات تتبع الصوت لعزل فائق للمكالمات بدون صدى",
        ],
        specs: {
          battery: "24 ساعة",
          driver: "Bose Custom Spatial Drivers",
          bluetooth: "Bluetooth 5.3 (Snapdragon Sound)",
          anc: "CustomTune World-Class ANC",
          weight: "253g",
          charging: "USB Type-C",
        },
        rating: 4.9,
        reviewsCount: 410,
        inStock: true,
        stockCount: 18,
        isFeatured: false,
      },

      // 7. Oraimo BoomPop 2
      {
        name: "Oraimo BoomPop 2 Heavy Bass",
        slug: "oraimo-boompop-2",
        brand: "Oraimo",
        category: "headphones",
        price: 49,
        originalPrice: 65,
        description:
          "صوت قوي بنغمات بيس عميقة HavyBass، بطارية 60 ساعة، وتصميم مريح قابل للطي مثالي للاستخدام اليومي والرياضة.",
        image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود أبنوسي", hex: "#181818", image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&auto=format&fit=crop&q=80" },
          { name: "أزرق رياضي", hex: "#1e3a5f", image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "تقنية HavyBass لرفع كفاءة النغمات المنخفضة بأعلى نقاء",
          "وضع ألعاب بزمن استجابة فائق الانخفاض (Low Latency Mode)",
          "بطارية تصمد حتى 60 ساعة تشغيل متواصل",
          "ميكروفونات ENC لإلغاء ضوضاء البيئة أثناء المكالمات",
        ],
        specs: {
          battery: "60 ساعة",
          driver: "40mm Dynamic Driver",
          bluetooth: "Bluetooth 5.3",
          anc: "Environmental Noise Canceling (ENC)",
          weight: "215g",
          charging: "Type-C",
        },
        rating: 4.6,
        reviewsCount: 320,
        inStock: true,
        stockCount: 60,
        isFeatured: false,
      },

      // ==========================================
      // EARBUDS / AIR BUDS CATEGORY
      // ==========================================

      // 8. Apple AirPods Pro 2 (USB-C)
      {
        name: "Apple AirPods Pro 2 (USB-C)",
        slug: "apple-airpods-pro-2",
        brand: "Apple",
        category: "earbuds",
        price: 229,
        originalPrice: 249,
        description:
          "الجيل الثاني الأسطوري مع شريحة H2، عزل ضوضاء مضاعف مرتين، وميزة إدراك المحادثة والصوت المكاني المخصص.",
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أبيض لامع Glossy White", hex: "#ffffff", image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "شريحة H2 تقدم معالجة صوتية ذكية وصوتاً ثلاثي الأبعاد فائق الواقعية",
          "علبة شحن MagSafe مع مكبر صوت مدمج وحلقة للشريط ومنفذ USB-C",
          "مقاومة العرق والماء بتصنيف IP54 للسماعات والعلبة معاً",
          "عمر بطارية يصل إلى 30 ساعة مع علبة الشحن",
        ],
        specs: {
          battery: "30 ساعة إجمالية (6 ساعات للسماعة)",
          driver: "Apple Custom High-Excursion Driver",
          bluetooth: "Bluetooth 5.3 (Apple H2)",
          anc: "2x Active Noise Cancellation + Adaptive Audio",
          weight: "5.3g per earbud",
          charging: "USB-C / MagSafe / Apple Watch Charger",
        },
        rating: 4.95,
        reviewsCount: 2300,
        inStock: true,
        stockCount: 40,
        isFeatured: true,
      },

      // 9. Sony WF-1000XM5 Earbuds
      {
        name: "Sony WF-1000XM5 True Wireless",
        slug: "sony-wf-1000xm5",
        brand: "Sony",
        category: "earbuds",
        price: 279,
        originalPrice: 299,
        description:
          "أصغر حجماً وأخف وزناً مع أفضل عزل ضوضاء داخل الأذن بفضل معالج QN2e ومكبرات Dynamic Driver X.",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود كربوني", hex: "#161616", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80" },
          { name: "فضي أنيق", hex: "#e2e2e4", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "محرك Dynamic Driver X بقطر 8.4mm لصوت غني وترددات منخفضة عميقة",
          "مستشعرات التوصيل العظمي Bone Conduction لالتقاط صوتك بوضوح",
          "مقاومة للرذاذ والعرق بمعيار IPX4",
          "شحن لاسلكي Qi متوافق مع كافة منصات الشحن",
        ],
        specs: {
          battery: "24 ساعة مع العلبة (8 ساعات مستمرة)",
          driver: "8.4mm Dynamic Driver X",
          bluetooth: "Bluetooth 5.3 (LDAC)",
          anc: "Integrated Processor V2 + HD QN2e",
          weight: "5.9g per earbud",
          charging: "Qi Wireless / Type-C",
        },
        rating: 4.88,
        reviewsCount: 780,
        inStock: true,
        stockCount: 25,
        isFeatured: true,
      },

      // 10. Soundcore Liberty 4 NC
      {
        name: "Soundcore Liberty 4 NC",
        slug: "soundcore-liberty-4-nc",
        brand: "Soundcore",
        category: "earbuds",
        price: 99,
        originalPrice: 129,
        description:
          "بطل القيمة بلا منازع: عزل ضوضاء يصل لـ 98.5%، صوت Hi-Res Wireless، وبطارية جبارة 50 ساعة.",
        image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود مخملي", hex: "#121214", image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80" },
          { name: "أبيض جليدي", hex: "#f3f4f6", image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80" },
          { name: "أزرق فاتح", hex: "#4b6584", image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "تقنية Adaptive ANC 2.0 التي تتكيف في الوقت الفعلي مع قناة الأذن",
          "مشغلات 11mm مصممة خصيصاً مع شهادة Hi-Res Audio Wireless",
          "50 ساعة عمل إجمالية (10 ساعات للسماعة بشحنة واحدة)",
          "6 ميكروفونات مع خوارزمية ذكاء اصطناعي لمكالمات فائقة النقاء",
        ],
        specs: {
          battery: "50 ساعة إجمالية (10 ساعات شحنة واحدة)",
          driver: "11mm Custom Drivers",
          bluetooth: "Bluetooth 5.3 (LDAC)",
          anc: "Adaptive ANC 2.0 (98.5%)",
          weight: "4.9g per earbud",
          charging: "Wireless Qi + USB Type-C",
        },
        rating: 4.86,
        reviewsCount: 940,
        inStock: true,
        stockCount: 50,
        isFeatured: true,
      },

      // 11. JBL Live Pro 2 TWS
      {
        name: "JBL Live Pro 2 TWS Earbuds",
        slug: "jbl-live-pro-2",
        brand: "JBL",
        category: "earbuds",
        price: 139,
        originalPrice: 169,
        description:
          "عزل ضوضاء تكيفي حقيقي True Adaptive NC مع أنابيب بيضاوية مريحة وتوقيع صوت JBL Signature Sound الأسطوري.",
        image: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود لامع", hex: "#1c1c1e", image: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800&auto=format&fit=crop&q=80" },
          { name: "فضي كرومي", hex: "#d1d5db", image: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800&auto=format&fit=crop&q=80" },
          { name: "أزرق معدني", hex: "#2b4c7e", image: "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "True Adaptive Noise Cancelling مع وضع Smart Ambient",
          "مكبرات صوت ديناميكية 11mm لنغمات جهير متوازنة ونقية",
          "40 ساعة تشغيل (10 ساعات في السماعة + 30 في العلبة)",
          "مقاومة الماء بتصنيف IPX5 مع 6 ميكروفونات للمكالمات",
        ],
        specs: {
          battery: "40 ساعة إجمالية (10س + 30س)",
          driver: "11mm Dynamic Driver",
          bluetooth: "Bluetooth 5.2",
          anc: "True Adaptive Noise Cancelling",
          weight: "4.8g per earbud",
          charging: "Qi Wireless Charging + Type-C",
        },
        rating: 4.8,
        reviewsCount: 610,
        inStock: true,
        stockCount: 30,
        isFeatured: false,
      },

      // 12. Beats Fit Pro
      {
        name: "Beats Fit Pro True Wireless",
        slug: "beats-fit-pro",
        brand: "Beats",
        category: "earbuds",
        price: 199,
        originalPrice: 219,
        description:
          "أجنحة تثبيت مرنة ومريحة مصممة للتمارين الرياضية العنيفة والاستخدام اليومي، مدعومة بشريحة Apple H1 المتطورة.",
        image: "https://images.unsplash.com/photo-1631867675167-90a456a90863?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1631867675167-90a456a90863?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود رياضي", hex: "#1e1e1e", image: "https://images.unsplash.com/photo-1631867675167-90a456a90863?w=800&auto=format&fit=crop&q=80" },
          { name: "رمادي حجري Stone Purple", hex: "#8d818c", image: "https://images.unsplash.com/photo-1631867675167-90a456a90863?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "أطراف تثبيت مريحة ومقاومة للسقوط مثبتة سريرياً للرياضيين",
          "صوت مكاني مخصص مع تتبع ديناميكي لحركة الرأس",
          "عزل نشط للضوضاء ANC مع نمط الشفافية المحيطية",
          "مقاومة العرق والماء بتصنيف IPX4",
        ],
        specs: {
          battery: "24 ساعة مع العلبة (6 ساعات مع ANC)",
          driver: "Beats Custom Dual-Element Diaphragm",
          bluetooth: "Apple H1 Headphone Chip",
          anc: "Active Noise Cancelling",
          weight: "5.6g per earbud",
          charging: "Fast Fuel Type-C (5 min = 1 hour)",
        },
        rating: 4.82,
        reviewsCount: 450,
        inStock: true,
        stockCount: 22,
        isFeatured: false,
      },

      // 13. Oraimo FreePods 4
      {
        name: "Oraimo FreePods 4 ANC",
        slug: "oraimo-freepods-4",
        brand: "Oraimo",
        category: "earbuds",
        price: 39,
        originalPrice: 55,
        description:
          "عزل ضوضاء فعال حتى 30dB، صوت جهير فائق بنظام HavyBass، وبطارية 35.5 ساعة بأفضل سعر اقتصادي.",
        image: "https://images.unsplash.com/photo-1590658006821-04f4008d5717?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1590658006821-04f4008d5717?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود ليلي", hex: "#1a1a1a", image: "https://images.unsplash.com/photo-1590658006821-04f4008d5717?w=800&auto=format&fit=crop&q=80" },
          { name: "أبيض قطبي", hex: "#f8f9fa", image: "https://images.unsplash.com/photo-1590658006821-04f4008d5717?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "عزل ضوضاء نشط حتى 30dB يزيل أصوات الشارع والمحركات",
          "خوارزمية 4 ميكروفونات لتقليل الضوضاء أثناء المكالمات",
          "تطبيق Oraimo Sound لتعديل توازن الصوت والتحكم باللمس",
          "شحن سريع جداً: 10 دقائق تمنحك 170 دقيقة استماع",
        ],
        specs: {
          battery: "35.5 ساعة إجمالية (8.5س للسماعة)",
          driver: "10mm Bass Drivers",
          bluetooth: "Bluetooth 5.2",
          anc: "30dB Active Noise Cancellation",
          weight: "4.1g per earbud",
          charging: "Type-C Anifast",
        },
        rating: 4.7,
        reviewsCount: 880,
        inStock: true,
        stockCount: 70,
        isFeatured: false,
      },

      // 14. Bose QuietComfort Ultra Earbuds
      {
        name: "Bose QuietComfort Ultra Earbuds",
        slug: "bose-quietcomfort-ultra-earbuds",
        brand: "Bose",
        category: "earbuds",
        price: 269,
        originalPrice: 299,
        description:
          "صوت مكاني ثوري ينقلك لقلب الموسيقى مع عزل ضوضاء رائد عالمياً وراحة فائقة تناسب كل أذن.",
        image: "https://images.unsplash.com/photo-1629367494173-c78a56567877?w=800&auto=format&fit=crop&q=80",
        images: ["https://images.unsplash.com/photo-1629367494173-c78a56567877?w=800&auto=format&fit=crop&q=80"],
        colors: [
          { name: "أسود حالك", hex: "#151515", image: "https://images.unsplash.com/photo-1629367494173-c78a56567877?w=800&auto=format&fit=crop&q=80" },
          { name: "أبيض دخاني", hex: "#e7e4df", image: "https://images.unsplash.com/photo-1629367494173-c78a56567877?w=800&auto=format&fit=crop&q=80" },
        ],
        features: [
          "تقنية الصوت الغامر Bose Immersive Audio التي تجعل الصوت يبدو خارج أذنيك تماماً",
          "تقنية CustomTune الذكية لمعايرة الصوت وإلغاء الضوضاء شخصياً",
          "عمر بطارية 24 ساعة مع العلبة (6 ساعات مع الصوت العادي)",
          "مقاومة الماء والعرق بتصنيف IPX4",
        ],
        specs: {
          battery: "24 ساعة مع العلبة",
          driver: "Bose Immersive Spatial Transducers",
          bluetooth: "Bluetooth 5.3 (aptX Adaptive)",
          anc: "World-Class Active Noise Cancelling",
          weight: "6.2g per earbud",
          charging: "Wireless Charging Case + Type-C",
        },
        rating: 4.89,
        reviewsCount: 390,
        inStock: true,
        stockCount: 16,
        isFeatured: false,
      },
    ];

    await Product.insertMany(initialProducts);

    return NextResponse.json({
      success: true,
      message: `تمت تهيئة قاعدة البيانات بنجاح! تم إضافة ${initialProducts.length} منتجاً لجميع الماركات وحساب الأدمن الافتراضي.`,
      productsCount: initialProducts.length,
      adminEmail: "admin@sspstore.com",
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "فشل الاتصال بقاعدة البيانات. تأكد من ضبط MONGODB_URI في ملف .env.local",
      },
      { status: 500 }
    );
  }
}
