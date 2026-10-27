import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let products: any[] = [];

    try {
      await connectToDatabase();

      const query: any = {};
      if (category && category !== "all") {
        query.category = category;
      }
      if (brand && brand !== "all") {
        query.brand = { $regex: new RegExp(`^${brand}$`, "i") };
      }
      if (featured === "true") {
        query.isFeatured = true;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      products = await Product.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(limit);
    } catch (dbErr) {
      console.warn("DB connection failed, falling back to static catalog:", dbErr);
    }

    // Fallback to static catalog if DB returned no products
    if (!products || products.length === 0) {
      let staticList = getAllProducts();
      if (category && category !== "all") {
        staticList = staticList.filter((p) => p.category === category);
      }
      if (brand && brand !== "all") {
        staticList = staticList.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
      }
      if (featured === "true") {
        staticList = staticList.filter((p) => p.isFeatured);
      }
      if (search) {
        const s = search.toLowerCase();
        staticList = staticList.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.brand.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s)
        );
      }
      products = staticList.slice(0, limit);
    }

    return NextResponse.json({ success: true, products, count: products.length });
  } catch (error: any) {
    console.error("Products GET error:", error);
    // Even in error, return static products
    const staticList = getAllProducts();
    return NextResponse.json({ success: true, products: staticList, count: staticList.length });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "غير مصرح لك بإضافة منتجات. يجب تسجيل الدخول كمسؤول (Admin)." },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.name || !body.brand || !body.price || !body.category) {
      return NextResponse.json(
        { error: "يرجى ملء البيانات الإلزامية للمنتج (الاسم، الماركة، السعر، القسم)" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Auto-generate slug if not provided
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Date.now()}`;

    const newProduct = await Product.create({
      ...body,
      slug,
    });

    return NextResponse.json({
      success: true,
      message: "تمت إضافة المنتج بنجاح!",
      product: newProduct,
    });
  } catch (error: any) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: error.message || "فشل إضافة المنتج" },
      { status: 500 }
    );
  }
}
