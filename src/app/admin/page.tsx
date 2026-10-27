"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Database,
  RefreshCw,
  LogOut,
  ArrowRight,
  Search,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "JBL",
    category: "headphones",
    price: 129,
    originalPrice: 179,
    description: "",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    stockCount: 50,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Check current user
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      if (!userData.user || userData.user.role !== "admin") {
        setLoading(false);
        return;
      }

      // 2. Fetch admin stats
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // 3. Fetch products
      const prodRes = await fetch("/api/products?limit=100");
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.products);
      }

      // 4. Fetch orders
      const ordersRes = await fetch("/api/orders");
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleSeed = async () => {
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      setMessage(data.message || (data.success ? "تمت تهيئة الداتا بنجاح" : data.error));
      fetchData();
    } catch (err: any) {
      setMessage(`خطأ: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج نهائياً من قاعدة البيانات؟")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p._id !== productId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // If user is not admin, show access restricted view
  if (!loading && (!currentUser || currentUser.role !== "admin")) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-[28px] bg-[#1d1d1f] border border-[#333336] text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-[#f5f5f7] mb-2">
            منطقة مخصصة لمدير النظام (Admin)
          </h2>
          <p className="text-xs text-[#86868b] mb-6">
            يجب تسجيل الدخول بحساب مسؤول للوصول إلى لوحة التحكم وإدارة المنتجات والطلبات.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-[13px] font-medium transition-colors shadow-md"
            >
              <span>تسجيل الدخول كأدمن</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-block text-xs text-[#86868b] hover:text-[#f5f5f7] pt-2"
            >
              العودة للمتجر الرئيسي
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] selection:bg-white selection:text-black">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0e0e0e]/95 backdrop-blur-xl border-b border-[#282828] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/products" className="flex items-center gap-3 group">
              <BrandLogo iconClassName="w-6 h-6 text-[#f5f5f7]" textClassName="text-sm" />
              <span className="text-[11px] font-normal text-[#86868b] border-s border-[#333336] ps-2.5">
                لوحة التحكم
              </span>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-semibold">
              Admin Mode
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={actionLoading}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1d1d1f] border border-[#333336] text-[11px] text-white hover:bg-[#333336] transition-colors cursor-pointer"
              title="إدخال أو تحديث بيانات الماركات في MongoDB"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{actionLoading ? "جاري التغذية..." : "تهيئة MongoDB (Seed)"}</span>
            </button>
            <Link
              href="/shop"
              className="px-3 py-1.5 rounded-full bg-[#1d1d1f] border border-[#333336] text-[11px] text-[#f5f5f7] hover:bg-[#333336] transition-colors flex items-center gap-1"
            >
              <span>المتجر</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-full bg-[#1d1d1f] text-[#86868b] hover:text-red-400 hover:bg-[#333336] transition-colors cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {message && (
          <div className="mb-6 p-3 rounded-2xl bg-white/10 border border-white/20 text-white text-xs flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-white hover:underline">
              إغلاق
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#282828] pb-4 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#f5f5f7] text-black shadow-md"
                : "bg-[#161617] text-[#86868b] hover:text-[#f5f5f7] border border-[#333336]"
            }`}
          >
            نظرة عامة والإحصائيات
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "products"
                ? "bg-[#f5f5f7] text-black shadow-md"
                : "bg-[#161617] text-[#86868b] hover:text-[#f5f5f7] border border-[#333336]"
            }`}
          >
            إدارة المنتجات ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#f5f5f7] text-black shadow-md"
                : "bg-[#161617] text-[#86868b] hover:text-[#f5f5f7] border border-[#333336]"
            }`}
          >
            الطلبات والمبيعات ({orders.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-[24px] bg-[#161617] border border-[#282828]">
                <div className="flex items-center justify-between text-[#86868b] mb-3">
                  <span className="text-xs font-medium">إجمالي المبيعات</span>
                  <div className="p-2 rounded-xl bg-white/10 text-white">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#f5f5f7]">
                  ${stats?.totalRevenue || 0}
                </div>
                <div className="text-[11px] text-[#86868b] mt-1">
                  ~{((stats?.totalRevenue || 0) * 38).toLocaleString()} ج.م
                </div>
              </div>

              <div className="p-5 rounded-[24px] bg-[#161617] border border-[#282828]">
                <div className="flex items-center justify-between text-[#86868b] mb-3">
                  <span className="text-xs font-medium">إجمالي الطلبات</span>
                  <div className="p-2 rounded-xl bg-[#1d1d1f] text-[#f5f5f7]">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#f5f5f7]">
                  {stats?.totalOrders || orders.length}
                </div>
                <div className="text-[11px] text-[#86868b] mt-1">
                  {stats?.pendingOrders || 0} طلب قيد المعالجة
                </div>
              </div>

              <div className="p-5 rounded-[24px] bg-[#161617] border border-[#282828]">
                <div className="flex items-center justify-between text-[#86868b] mb-3">
                  <span className="text-xs font-medium">المنتجات في المخزن</span>
                  <div className="p-2 rounded-xl bg-[#1d1d1f] text-[#f5f5f7]">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#f5f5f7]">
                  {products.length}
                </div>
                <div className="text-[11px] text-[#86868b] mt-1">
                  عبر 7 ماركات عالمية
                </div>
              </div>

              <div className="p-5 rounded-[24px] bg-[#161617] border border-[#282828]">
                <div className="flex items-center justify-between text-[#86868b] mb-3">
                  <span className="text-xs font-medium">العملاء المسجلين</span>
                  <div className="p-2 rounded-xl bg-[#1d1d1f] text-[#f5f5f7]">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#f5f5f7]">
                  {stats?.totalUsers || 0}
                </div>
                <div className="text-[11px] text-[#86868b] mt-1">حسابات نشطة في MongoDB</div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="rounded-[28px] bg-[#161617] border border-[#282828] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#f5f5f7]">
                  أحدث طلبات الشراء
                </h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs text-white hover:underline"
                >
                  عرض كافة الطلبات
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#86868b]">
                  لا توجد طلبات مسجلة بعد. عند قيام أي عميل بطلب سماعة ستظهر هنا فوراً.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#282828] text-[#86868b]">
                        <th className="pb-3 font-medium">رقم الطلب</th>
                        <th className="pb-3 font-medium">العميل</th>
                        <th className="pb-3 font-medium">الهاتف</th>
                        <th className="pb-3 font-medium">المحافظة</th>
                        <th className="pb-3 font-medium">المبلغ</th>
                        <th className="pb-3 font-medium">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#282828]">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o._id} className="hover:bg-[#1d1d1f]/50">
                          <td className="py-3 font-mono font-semibold text-[#f5f5f7]">
                            {o.orderNumber}
                          </td>
                          <td className="py-3 text-[#f5f5f7]">{o.customerInfo?.fullName}</td>
                          <td className="py-3 font-mono text-[#86868b]">{o.customerInfo?.phone}</td>
                          <td className="py-3 text-[#86868b]">{o.customerInfo?.city}</td>
                          <td className="py-3 font-semibold text-[#f5f5f7]">${o.totalAmount}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                o.status === "delivered"
                                  ? "bg-green-500/20 text-green-400"
                                  : o.status === "shipped"
                                  ? "bg-white/10 text-white"
                                  : o.status === "cancelled"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-amber-500/20 text-amber-400"
                              }`}
                            >
                              {o.status === "delivered"
                                ? "تم التوصيل"
                                : o.status === "shipped"
                                ? "تم الشحن"
                                : o.status === "cancelled"
                                ? "ملغي"
                                : "قيد المعالجة"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#f5f5f7]">
                  إدارة المنتجات في قاعدة البيانات
                </h2>
                <p className="text-xs text-[#86868b] mt-0.5">
                  عرض وتعديل وحذف وإضافة سماعات الرأس والإيربودز
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="py-2.5 px-4 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-black/40"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="rounded-[28px] bg-[#161617] border border-[#282828] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#1d1d1f] text-[#86868b] border-b border-[#282828]">
                    <tr>
                      <th className="p-3.5 font-medium">المنتج</th>
                      <th className="p-3.5 font-medium">الماركة</th>
                      <th className="p-3.5 font-medium">القسم</th>
                      <th className="p-3.5 font-medium">السعر</th>
                      <th className="p-3.5 font-medium">المخزون</th>
                      <th className="p-3.5 font-medium">الحالة</th>
                      <th className="p-3.5 font-medium text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282828]">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-[#1d1d1f]/40">
                        <td className="p-3.5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#ffffff] overflow-hidden p-1 shrink-0 flex items-center justify-center">
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#f5f5f7] line-clamp-1">{p.name}</div>
                            <div className="text-[10px] text-[#86868b] font-mono">{p.slug}</div>
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-[#f5f5f7]">{p.brand}</td>
                        <td className="p-3.5 text-[#86868b]">
                          {p.category === "headphones" ? "سماعة رأس" : "إيربودز"}
                        </td>
                        <td className="p-3.5 font-semibold text-[#f5f5f7]">${p.price}</td>
                        <td className="p-3.5 text-[#86868b]">{p.stockCount} قطعة</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] ${
                              p.inStock
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {p.inStock ? "متوفر" : "نفد المخزون"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#f5f5f7]">
                إدارة طلبات الشراء
              </h2>
              <p className="text-xs text-[#86868b] mt-0.5">
                تحديث حالة الشحن والتسليم للعملاء ومتابعة الدفع
              </p>
            </div>

            <div className="rounded-[28px] bg-[#161617] border border-[#282828] overflow-hidden">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#86868b]">
                  لا توجد طلبات بعد.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#1d1d1f] text-[#86868b] border-b border-[#282828]">
                      <tr>
                        <th className="p-3.5 font-medium">رقم الطلب</th>
                        <th className="p-3.5 font-medium">العميل</th>
                        <th className="p-3.5 font-medium">الهاتف والعنوان</th>
                        <th className="p-3.5 font-medium">المنتجات المطلوبة</th>
                        <th className="p-3.5 font-medium">الإجمالي</th>
                        <th className="p-3.5 font-medium">طريقة الدفع</th>
                        <th className="p-3.5 font-medium">تغيير الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#282828]">
                      {orders.map((o) => (
                        <tr key={o._id} className="hover:bg-[#1d1d1f]/40">
                          <td className="p-3.5 font-mono font-semibold text-[#f5f5f7]">
                            {o.orderNumber}
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-[#f5f5f7]">{o.customerInfo?.fullName}</div>
                            <div className="text-[10px] text-[#86868b]">{new Date(o.createdAt).toLocaleDateString("ar-EG")}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-mono text-[#f5f5f7]">{o.customerInfo?.phone}</div>
                            <div className="text-[10px] text-[#86868b] line-clamp-1">{o.customerInfo?.city} - {o.customerInfo?.address}</div>
                          </td>
                          <td className="p-3.5">
                            {o.items?.map((item: any, idx: number) => (
                              <div key={idx} className="text-[11px] text-[#f5f5f7]">
                                • {item.name} {item.color ? `(${item.color})` : ""} × {item.quantity}
                              </div>
                            ))}
                          </td>
                          <td className="p-3.5 font-bold text-[#f5f5f7]">${o.totalAmount}</td>
                          <td className="p-3.5 text-[#86868b]">
                            {o.paymentMethod === "cod" ? "الدفع عند الاستلام" : "بطاقة / إلكتروني"}
                          </td>
                          <td className="p-3.5">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                              className="px-2.5 py-1 rounded-full bg-[#1d1d1f] border border-[#333336] text-[11px] text-[#f5f5f7] focus:outline-hidden focus:border-white"
                            >
                              <option value="pending">قيد المعالجة (Pending)</option>
                              <option value="shipped">تم الشحن (Shipped)</option>
                              <option value="delivered">تم التوصيل (Delivered)</option>
                              <option value="cancelled">ملغي (Cancelled)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-[28px] bg-[#1d1d1f] border border-[#333336] p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">
              إضافة منتج جديد لقاعدة البيانات
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#86868b] mb-1">اسم السماعة *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="مثال: Sony WH-CH720N"
                  className="w-full px-3 py-2 rounded-xl bg-[#161617] border border-[#333336] text-[#f5f5f7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1">الماركة *</label>
                  <select
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161617] border border-[#333336] text-[#f5f5f7]"
                  >
                    <option value="JBL">JBL</option>
                    <option value="Soundcore">Soundcore</option>
                    <option value="Oraimo">Oraimo</option>
                    <option value="Beats">Beats</option>
                    <option value="Sony">Sony</option>
                    <option value="Bose">Bose</option>
                    <option value="Apple">Apple</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1">القسم *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category: e.target.value as "headphones" | "earbuds",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#161617] border border-[#333336] text-[#f5f5f7]"
                  >
                    <option value="headphones">سماعة رأس (Over-Ear)</option>
                    <option value="earbuds">إيربودز (Earbuds)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1">السعر ($) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#161617] border border-[#333336] text-[#f5f5f7]"
                  />
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1">المخزون (الكمية)</label>
                  <input
                    type="number"
                    value={newProduct.stockCount}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stockCount: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#161617] border border-[#333336] text-[#f5f5f7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#86868b] mb-1">رابط صورة المنتج (URL) *</label>
                <input
                  type="text"
                  required
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161617] border border-[#333336] text-[#f5f5f7]"
                />
              </div>

              <div>
                <label className="block text-[#86868b] mb-1">وصف المنتج</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="مواصفات وعزل وبطارية السماعة..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161617] border border-[#333336] text-[#f5f5f7]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#333336]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-[#86868b] hover:text-[#f5f5f7]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-[#3e3e3c] font-medium transition-colors shadow-md"
                >
                  {actionLoading ? "جاري الحفظ..." : "حفظ المنتج"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
