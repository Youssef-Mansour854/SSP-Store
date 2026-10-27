import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";
import { getProductByIdOrSlug } from "@/lib/products";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let product: any = null;

    try {
      await connectToDatabase();

      // Check if ID is ObjectId or slug
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id);
      } else {
        product = await Product.findOne({ slug: id });
      }
    } catch (dbErr) {
      console.warn("DB connection failed, falling back to static product catalog:", dbErr);
    }

    if (!product) {
      // Fallback to static catalog
      product = getProductByIdOrSlug(id);
    }

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    const { id } = await params;
    const fallback = getProductByIdOrSlug(id);
    if (fallback) {
      return NextResponse.json({ success: true, product: fallback });
    }
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء جلب تفاصيل المنتج" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل المنتجات. مخصص للمسؤول فقط." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const updated = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات المنتج بنجاح!",
      product: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "فشل تحديث المنتج" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "غير مصرح لك بحذف المنتجات. مخصص للمسؤول فقط." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف المنتج بنجاح من قاعدة البيانات!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "فشل حذف المنتج" },
      { status: 500 }
    );
  }
}
