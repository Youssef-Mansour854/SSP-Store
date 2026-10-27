import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, city, address } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور)" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن لا تقل عن 6 أحرف" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "user",
      phone: phone?.trim() || "",
      city: city || "القاهرة",
      address: address?.trim() || "",
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح!",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        address: user.address,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    );
  }
}
