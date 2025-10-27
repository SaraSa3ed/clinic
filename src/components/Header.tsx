import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Calendar,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

// Custom theme colors for Header - Barka Dental Clinic
const LIGHT_BG = "bg-white";
const GOLD_GRADIENT = "bg-gradient-to-r from-amber-50 to-yellow-50";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // الحصول على بيانات المستخدم
  const userName =
    user?.name || user?.username || user?.email || "المستخدم";

  // التعامل مع role كـ object أو string
  let userRole = "مستخدم";
  if (user?.role) {
    if (typeof user.role === "string") {
      userRole = user.role;
    } else if (typeof user.role === "object" && user.role.roleName) {
      userRole = user.role.roleName;
    }
  } else if (user?.roleName) {
    userRole = user.roleName;
  }

  const userEmail = user?.email || "user@example.com";
  const userInitials =
    userName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2) || "أح";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getCurrentFiscalYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    // العام المالي يبدأ من أبريل
    const fiscalYear = now.getMonth() >= 3 ? year : year - 1;
    return `${fiscalYear}/${fiscalYear + 1}`;
  };

  // Determine header background based on theme
  const headerBg = "bg-gradient-to-r from-amber-50 to-yellow-50";

  // For text color in logo and header
  const logoTextGradient = "bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-amber-200 ${headerBg} backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-elegant transition-colors duration-500`}
    >
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4 order-1">
          <SidebarTrigger className="text-amber-800 hover:bg-amber-100 hover:scale-105 transition-all duration-200 p-2 rounded-lg" />

          {/* Logo and Company Name */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 mr-4 group cursor-pointer"
          >
            <div className="relative">
              <img
                src="/logo.png"
                alt=" "
                className="w-12 h-12 rounded-xl shadow-lg ring-2 ring-amber-300 hover:ring-amber-400 transition-all duration-300 hover:scale-110"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tl from-amber-200/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="hidden md:block text-right">
              <h2
                className={`text-xl font-bold ${logoTextGradient} group-hover:text-amber-700 transition-all duration-300 relative overflow-hidden group animate-glow`}
                style={{ direction: 'rtl' }}
              >
               عيادة بركاء التخصصية
              
                
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out animate-shimmer"></div>
              </h2>
              {/* <p className="text-xs text-gray-600 font-medium group-hover:text-gray-800 " >
              نظام إدارة العيادة المتطور
              </p> */}
            </div>
            {/* Show only logo on small screens */}
            <div className="md:hidden text-right">
              <h1
                className={`text-lg font-bold ${logoTextGradient} relative overflow-hidden group animate-glow`}
                style={{ direction: 'ltr' }}
              >
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '0.1s' }}>
                  F
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '0.2s' }}>
                  L
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '0.3s' }}>
                  O
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '0.4s' }}>
                  R
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '0.5s' }}>
                  I
                </span>
                <span className="inline-block mx-1 text-purple-500 animate-sparkle hover:scale-125 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '0.6s' }}>
                  ✨
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '0.7s' }}>
                  A
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '0.8s' }}>
                  T
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '0.9s' }}>
                  E
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '1.0s' }}>
                  L
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '1.1s' }}>
                  I
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '1.2s' }}>
                  E
                </span>
                <span className="inline-block animate-fade-in-up hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ animationDelay: '1.3s' }}>
                  R
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out animate-shimmer"></div>
              </h1>
            </div>
          </Link>

          <div className="relative w-80 max-w-sm animate-fade-in">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="بحث..."
              className="pr-10 pl-4 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-300 rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center order-2 animate-fade-in">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100">
              <Calendar className="h-4 w-4 text-gray-600" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(currentDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100">
              <Clock className="h-4 w-4 text-gray-600" />
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 font-mono">
                  {formatTime(currentDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-200 text-gray-900">
              <div className="text-center">
                <p className="text-xs">العام المالي</p>
                <p className="text-sm font-bold">{getCurrentFiscalYear()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 order-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="hover:bg-gray-100 hover:scale-105 transition-all duration-200 rounded-xl"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-700" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-500" />
            <span className="sr-only">تبديل الوضع</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <Bell className="h-4 w-4 text-gray-700" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-tr from-red-500 via-red-400 to-red-300 text-white animate-bounce-gentle">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 bg-white backdrop-blur-xl border border-gray-200 shadow-glass animate-scale-in"
            >
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-bold text-gray-900">
                  الإشعارات
                </h4>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                <div className="flex items-start gap-3 p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
                  <div className="w-3 h-3 bg-gradient-to-tr from-blue-500 via-blue-400 to-blue-300 rounded-full mt-2 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      تم إنجاز طلب غسيل جديد
                    </p>
                    <p className="text-xs text-gray-600">
                      منذ 5 دقائق
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      موعد جديد قيد المراجعة
                    </p>
                    <p className="text-xs text-gray-600">
                      منذ 15 دقيقة
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      تم استلام دفعة جديدة
                    </p>
                    <p className="text-xs text-gray-600">
                      منذ ساعة
                    </p>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 hover:bg-amber-100 hover:scale-105 transition-all duration-200 rounded-xl p-3"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-amber-900">{userName}</p>
                  <p className="text-xs text-amber-600">{userRole}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-400 to-purple-600 text-white flex items-center justify-center shadow-brand">
                  <span className="text-lg font-bold">{userInitials}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 bg-white backdrop-blur-xl border border-gray-200 shadow-glass animate-scale-in"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 text-white flex items-center justify-center shadow-brand">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-600">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <DropdownMenuItem
                  asChild
                  className="gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                >
                  <Link to="/profile" className="text-gray-900">
                    <User className="h-4 w-4" />
                    الملف الشخصي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                >
                  <Link to="/user-settings" className="text-gray-900">
                    <Settings className="h-4 w-4" />
                    الإعدادات
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 bg-gray-200" />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer flex items-center w-full"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}