import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "يرجى تسجيل الدخول للوصول إلى الطلبات" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let orders;
    if (user.role === "admin") {
      // Admin sees all customer orders
      orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    } else {
      // Normal customer sees their own orders
      orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء جلب الطلبات" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerInfo, items, subtotal, shipping, discount, totalAmount, paymentMethod } =
      body;

    if (!customerInfo?.fullName || !customerInfo?.phone || !customerInfo?.address) {
      return NextResponse.json(
        { error: "يرجى ملء جميع بيانات الشحن (الاسم، الهاتف، العنوان)" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "لا يمكن إتمام الطلب وسلة المشتريات فارغة" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user is logged in
    const user = await getCurrentUser();

    // Generate unique order number
    const orderNumber = `SSP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = await Order.create({
      orderNumber,
      user: user?._id || undefined,
      customerInfo,
      items,
      subtotal: subtotal || totalAmount,
      shipping: shipping || 0,
      discount: discount || 0,
      totalAmount,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل طلبك بنجاح!",
      orderNumber: newOrder.orderNumber,
      order: newOrder,
    });
  } catch (error: any) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { error: error.message || "فشل تسجيل الطلب" },
      { status: 500 }
    );
  }
}
