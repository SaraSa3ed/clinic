import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Types for menu items
interface SubMenuItem {
  title: string;
  url: string;
  icon: any;
  color: string;
  description: string;
  badge?: string;
}

interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  color?: string;
  description: string;
  submenu?: SubMenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}
import {
  Settings,
  Building,
  Users,
  Palette,
  Database,
  Shield,
  Car,
  Sparkles,
  FileText,
  BarChart,
  Package,
  Calendar,
  CreditCard,
  Headphones,
  ChevronDown,
  ChevronLeft,
  Store,
  TrendingUp,
  Zap,
  Gem,
  Stars,
  Activity,
  DollarSign,
  Globe,
  Lock,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Award,
  Timer,
  Target,
  Bookmark,
  ArrowLeft,
  Receipt,
  Monitor,
  Clock,
  User,
  MessageSquare,
  Gift,
  Plus,
  Command,
  UserPlus,
  UserMinus,
  Bell,
  LogOut,
  HelpCircle,
  Languages,
  Moon,
  Sun,
  Shield as PrivacyIcon,
  Link,
  ExternalLink,
  Brain,
  Navigation2,
  Smartphone,
  Truck,
  Calculator,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  FileText as FileTextIcon,
  Settings as AdminSettings,
  Archive,
  BarChart3,
  Building2,
  Wrench,
  TrendingUp as TrendingUpIcon,
  Trash2,
  Unlock,
  RotateCcw,
  Scale,
  GitCompare,
  FileCheck,
  Rocket,
  Video
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Main menu structure for Dental Clinic ERP with enhanced icons and styling
const menuSections: MenuSection[] = [
  {
    title: "",
    items: [
      {
        title: "الرئيسية",
        url: "/dashboard",
        icon: TrendingUp,
        color: "bg-gradient-to-r from-amber-400 to-yellow-400",
        description: "نظرة عامة شاملة على أداء العيادة"
      },
    ],
  },
  {
    title: "إدارة النظام",
    items: [
      {
        title: "إدارة النظام",
        icon: Settings,
        url: "/settings",
        color: "bg-gradient-to-r from-amber-500 to-purple-500",
        description: "إعدادات نظام العيادة الشاملة",
        submenu: [
          { title: "بيانات العيادة", url: "/settings/company", icon: Building, color: "text-amber-600", description: "معلومات العيادة الأساسية" },
          { title: "المستخدمون", url: "/settings/users", icon: Users, color: "text-yellow-600", description: "إدارة المستخدمين" },
          { title: "الأدوار والصلاحيات", url: "/settings/roles", icon: Shield, color: "text-purple-600", description: "تحديد الصلاحيات" }
        ],
      },
    ],
  },
  // {
  //   title: "إدارة المخازن",
  //   items: [
  //     {
  //       title: "إدارة المخازن",
  //       icon: Database,
  //       url: "/inventory",
  //       color: "bg-gradient-to-r from-cyan-500 to-blue-500",
  //       description: "إدارة شاملة للمخازن",
  //       submenu: [
         
  //         {
  //           title: "الأعدادات",
  //           url: "/inventory/settings",
  //           icon: Settings,
  //           color: "text-gray-500",
  //           description: "إعدادات المخازن"
  //         },
  //         {
  //           title: "المنتجات والخدمات",
  //           url: "/items",
  //           icon: Package,
  //           color: "text-green-500",
  //           description: "إدارة المنتجات والخدمات"
  //         },
  //         {
  //           title: "قائمة الأسعار",
  //           url: "/inventory/price-list",
  //           icon: DollarSign,
  //           color: "text-emerald-500",
  //           description: "إدارة أسعار المنتجات والخدمات حسب الفروع"
  //         },
  //         {
  //           title: "بضاعة أول المدة",
  //           url: "/inventory/opening-stock",
  //           icon: FileText,
  //           color: "text-orange-500",
  //           description: "بضاعة أول المدة"
  //         },
          
          
          
          
  //         {
  //           title: "البيانات والتحليل الذكي",
  //           url: "/inventory/analytics",
  //           icon: TrendingUp,
  //           color: "text-indigo-500",
  //           description: "البيانات والتحليل الذكي"
  //         },
  //       ],
  //     },
  //   ],
  // },
 
  {
    title: "إدارة المواعيد",
    items: [
      {
        title: "إدارة المواعيد",
        icon: Bookmark,
        url: "/reception/booking-dashboard",
        color: "bg-gradient-to-r from-cyan-500 to-teal-500",
        description: "نظام شامل لإدارة مواعيد العيادة",
        submenu: [
          {
            title: "لوحة تحكم المواعيد",
            url: "/reception/booking-dashboard",
            icon: BarChart,
            color: "text-cyan-600",
            description: "إحصائيات وتحليلات شاملة للمواعيد"
          },
          {
            title: "حجز موعد جديد",
            url: "/reception/create-booking",
            icon: Plus,
            color: "text-teal-600",
            description: "حجز مواعيد جديدة للمرضى"
          },
          {
            title: "قائمة المواعيد",
            url: "/reception/bookings-list",
            icon: FileText,
            color: "text-blue-600",
            description: "عرض وإدارة جميع المواعيد"
          },
          {
            title: "تقويم المواعيد",
            url: "/reception/booking-calendar",
            icon: Calendar,
            color: "text-cyan-500",
            description: "عرض تقويمي لمواعيد المرضى"
          },
          {
            title: "التحليلات والتقارير",
            url: "/reception/booking-analytics",
            icon: TrendingUp,
            color: "text-teal-500",
            description: "تقارير مفصلة وتحليلات أداء العيادة"
          },
          // {
          //   title: "مبالغ التأمين",
          //   url: "/reception/insurance-deposits",
          //   icon: DollarSign,
          //   color: "text-emerald-600",
          //   description: "إدارة مبالغ التأمين والرد والمصادرة"
          // },
          // {
          //   title: "تقرير إيراد إيجار اليوم",
          //   url: "/reports/daily-rental",
          //   icon: DollarSign,
          //   color: "text-green-500",
          //   description: "عرض جميع المبالغ المدفوعة والعمليات المالية"
          // }
        ]
      },
    ],
  },
  {
    title: "إدارة المرضى",
    items: [
      {
        title: "إدارة المرضى",
        icon: Users,
        url: "/crm",
        color: "bg-gradient-to-r from-cyan-400 to-blue-400",
        description: "إدارة شاملة لسجلات المرضى",
        submenu: [
          
          {
            title: "سجلات المرضى",
            url: "/crm/customers",
            icon: Users,
            color: "text-cyan-600",
            description: "إضافة وتعديل بيانات المرضى"
          },
        ],
      },
    ],
  },
 
  // {
  //   title: "إدارة المصروفات",
  //   items: [
  //     {
  //       title: "إدارة المصروفات",
  //       icon: Receipt,
  //       url: "/expenses",
  //       color: "bg-gradient-to-r from-red-500 to-pink-500",
  //       description: "إدارة شاملة للمصروفات والمصاريف",
  //       submenu: [
  //         {
  //           title: "المصروفات",
  //           url: "/expenses",
  //           icon: Receipt,
  //           color: "text-red-500",
  //           description: "إدارة وتتبع جميع المصروفات"
  //         }
  //       ]
  //     },
  //   ],
  // },
  {
    title: "إدارة المشتريات",
    items: [
      {
        title: "إدارة المشتريات",
        icon: ShoppingCart,
        url: "/procurement",
        color: "bg-gradient-to-r from-teal-500 to-cyan-500",
        description: "إدارة شاملة للمشتريات الطبية",
        submenu: [
          {
            title: "أوامر الشراء",
            url: "/purchase-orders",
            icon: ShoppingCart,
            color: "text-red-500",
            description: "معالجة أوامر الشراء"
          },
          
          {
            title: "مرتجع المشتريات",
            url: "/purchase-returns",
            icon: ArrowLeft,
            color: "text-orange-500",
            description: "إدارة مرتجعات المشتريات"
          },
        ],
      },
    ],
  },
  {
    title: "إدارة الموردين",
    items: [
      {
        title: "إدارة الموردين",
        icon: Gem,
        url: "/suppliers",
        color: "bg-gradient-to-r from-violet-500 to-purple-500",
        description: "إدارة شاملة للموردين والشركاء التجاريين",       
        submenu: [
          {
            title: "لوحة تحكم الموردين",
            url: "/suppliers/dashboard",
            icon: BarChart,
            color: "text-indigo-500",
            description: "نظرة شاملة على حالة الموردين والعمليات"
          },
          {
            title: "إضافة موردين",
            url: "/suppliers?tab=suppliers",
            icon: Users,
            color: "text-blue-500",
            description: "تسجيل وإدارة بيانات الموردين"
          },
          {
            title: "تقارير الموردين",
            url: "/suppliers/reports",
            icon: BarChart,
            color: "text-indigo-500",
            description: "تقارير وتحليلات الموردين"
          }
        ],
      },
    ],
  },
  // تمت إزالة أقسام: المغسلة المتنقلة، العمليات والمسارات، الاستقبال وخدمة العملاء، ونقاط البيع (POS)
];

export function AppSidebar() {
  
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccessPage, userPermissions, isLoadingPermissions, user } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("ar");
  const collapsed = state === "collapsed";

  // الحصول على اسم المستخدم والوظيفة
  const userName = user?.name || user?.username || user?.email || "المستخدم";
  
  // التعامل مع role كـ object أو string
  let userRole = "مستخدم";
  if (user?.role) {
    if (typeof user.role === 'string') {
      userRole = user.role;
    } else if (typeof user.role === 'object' && user.role.roleName) {
      userRole = user.role.roleName;
    }
  } else if (user?.roleName) {
    userRole = user.roleName;
  }
  
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || "أح";
  
  console.log('👤 AppSidebar - User data:', { 
    user, 
    userName, 
    userRole, 
    userInitials,
    userKeys: user ? Object.keys(user) : [],
    userRoleKeys: user?.role ? Object.keys(user.role) : []
  });

  // Handle button functions
  const handleNotifications = () => {
    // يمكن إضافة منطق فتح صفحة الإشعارات هنا
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLanguageToggle = () => {
    const newLang = currentLanguage === "ar" ? "en" : "ar";
    setCurrentLanguage(newLang);
    document.documentElement.setAttribute('lang', newLang);
    document.documentElement.setAttribute('dir', newLang === "ar" ? 'rtl' : 'ltr');
  };

  const handleHelp = () => {
    window.open('https://help.raghwa.com', '_blank');
  };

  const handlePrivacyPolicy = () => {
    window.open('https://raghwa.com/privacy', '_blank');
  };

  const handleTermsPolicy = () => {
    window.open('https://raghwa.com/terms', '_blank');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleAccountSettings = () => {
    navigate('/settings/account');
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // استخدام دالة تسجيل الخروج من AuthContext
    navigate('/login');
  };

  const toggleMenu = (menuTitle: string) => {
    setOpenMenus(prev =>
      prev.includes(menuTitle)
        ? prev.filter(item => item !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isSubmenuActive = (submenu: SubMenuItem[]) =>
    submenu?.some(item => location.pathname === item.url);

  // دالة لتحديد الوحدة من URL
  const getModuleFromUrl = (url: string): string | null => {
    if (!url) return null;
    
    // تحديد الوحدة من URL
    if (url === '/dashboard') {
      return 'dashboard'; // الرئيسية تنتمي لوحدة dashboard
    }
    
    // للمشتريات - يجب أن يكون أولاً لتجنب تضارب مع /settings
    if (url.includes('/procurement')) {
      return 'procurement';
    }
    if (url.includes('/purchase-orders') || url.includes('/goods-receipt') || url.includes('/invoice-processing') || url.includes('/purchase-returns') || url.includes('/debit-note')) {
      return 'procurement';
    }
    
    // للمخازن
    if (url.includes('/inventory')) {
      return 'inventory';
    }
    if (url.includes('/items')) {
      return 'inventory';
    }
    if (url.includes('/inventory-transactions')) {
      return 'inventory';
    }
    
    // للموردين
    if (url.includes('/suppliers')) {
      return 'suppliers';
    }
    
    // للـ CRM
    if (url.includes('/crm')) {
      return 'crm';
    }
    
    // للحجوزات - يجب أن يكون أولاً لتجنب تضارب مع reception-service
    if (url.includes('/reception/booking') ||url.includes('/reception/booking-dashboard') || url.includes('/reception/create-booking') || url.includes('/reception/bookings-list') || url.includes('/reception/booking-calendar') || url.includes('/reception/booking-analytics')) {
      return 'reception';
    }
    if (url.includes('/reception/insurance-deposits')) {
      return 'reception';
    }
    
    // للمصروفات
    if (url.includes('/expenses')) {
      return 'expenses';
    }
    
    // لخدمة الاستقبال - يجب أن يكون بعد الحجوزات
    if (url.includes('/reception') && !url.includes('/mobile-wash') && !url.includes('/reception/booking')) {
      return 'reception-service';
    }
    if (url.includes('/live-control-center') || url.includes('/customer-service') || url.includes('/reception/reports') || url.includes('/reception/system-integration') || url.includes('/customer-notifications')) {
      return 'reception-service';
    }
    
    // للمغسلة المتنقلة
    if (url.includes('/mobile-wash')) {
      return 'mobile-wash';
    }
    
    // للعمليات
    if (url.includes('/operations')) {
      return 'operations';
    }
    
    // لنقاط البيع
    if (url.includes('/pos')) {
      return 'pos';
    }
    
    // للموارد البشرية
    if (url.includes('/hcm')) {
      return 'hcm';
    }
    
    // للحسابات
    if (url.includes('/accounts')) {
      return 'accounting';
    }
    
    // للأصول الثابتة
    if (url.includes('/fixed-assets')) {
      return 'accounting';
    }
    
    // للعمليات المحاسبية
    if (url.includes('/accounting-operations')) {
      return 'accounting';
    }
    
    // للتقارير المالية
    if (url.includes('/financial-reports')) {
      return 'accounting';
    }
    
    // للإدارة العامة
    if (url.includes('/administration')) {
      return 'administration';
    }
    
    // لتطوير الجودة
    if (url.includes('/quality-development')) {
      return 'quality-development';
    }
    
    // إدارة النظام - يجب أن يكون آخراً لتجنب تضارب مع الوحدات الأخرى
    if (url.includes('/dashboard') && !url.includes('/inventory') && !url.includes('/suppliers') && !url.includes('/crm') && !url.includes('/reception') && !url.includes('/mobile-wash') && !url.includes('/pos') && !url.includes('/hcm') && !url.includes('/accounts') && !url.includes('/fixed-assets') && !url.includes('/accounting-operations') && !url.includes('/financial-reports') && !url.includes('/administration') && !url.includes('/quality-development')) {
      return 'system-administration'; // باقي لوحات التحكم تنتمي لوحدة إدارة النظام
    }
    if (url.includes('/settings')) {
      return 'system-administration';
    }
    
    return null;
  };

  // دالة لتحديد الصفحة من URL
  const getPageFromUrl = (url: string): string | null => {
    if (!url) return null;
    
    // تحديد الصفحة من URL
    if (url === '/dashboard') {
      return 'main-dashboard';
    }
    
    // إدارة النظام - تطابق قاعدة البيانات
    if (url.includes('/company')) {
      return 'company-settings';
    }
    if (url.includes('/branches')) {
      return 'branch-management';
    }
    if (url.includes('/warehouses')) {
      return 'warehouse-management';
    }
    if (url.includes('/users')) {
      return 'user-management';
    }
    if (url.includes('/roles')) {
      return 'roles-permissions';
    }
    if (url.includes('/themes')) {
      return 'theme-settings';
    }
    if (url.includes('/system')) {
      return 'system-settings';
    }
    if (url.includes('/devices')) {
      return 'device-settings';
    }
    if (url.includes('/advanced')) {
      return 'advanced-settings';
    }
    
    // للمخازن - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/inventory')) {
      return 'inventory-dashboard';
    }
    if (url.includes('/settings') && url.includes('/inventory')) {
      return 'inventory-settings';
    }
    if (url.includes('/items')) {
      return 'product-management';
    }
    if (url.includes('/price-list')) {
      return 'price-management';
    }
    if (url.includes('/opening-stock')) {
      return 'opening-stock';
    }
    if (url.includes('/inventory-transactions')) {
      return 'inventory-transactions';
    }
    if (url.includes('/movement-log')) {
      return 'movement-log';
    }
    if (url.includes('/stocktaking')) {
      return 'stocktaking';
    }
    if (url.includes('/policies') && url.includes('/inventory')) {
      return 'inventory-policies';
    }
    if (url.includes('/analytics') && url.includes('/inventory')) {
      return 'inventory-analytics';
    }
    
    // للموردين - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/suppliers')) {
      return 'suppliers-dashboard';
    }
    if (url.includes('/suppliers') && url.includes('tab=settings')) {
      return 'suppliers-settings';
    }
    if (url.includes('/suppliers') && url.includes('tab=suppliers')) {
      return 'suppliers-management';
    }
    if (url.includes('/payments') && url.includes('/suppliers')) {
      return 'suppliers-payments';
    }
    if (url.includes('/evaluation')) {
      return 'suppliers-evaluation';
    }
    if (url.includes('/contracts')) {
      return 'suppliers-contracts';
    }
    if (url.includes('/reports') && url.includes('/suppliers')) {
      return 'suppliers-reports';
    }
    
    // للمشتريات - تطابق قاعدة البيانات
    if (url.includes('/settings') && url.includes('/procurement')) {
      return 'procurement-settings';
    }
    if (url.includes('/procurement/settings')) {
      return 'procurement-settings';
    }
    if (url.includes('/procurement') && url.includes('/settings')) {
      return 'procurement-settings';
    }
    if (url.includes('/requisition')) {
      return 'purchase-requisition';
    }
    if (url.includes('/approval')) {
      return 'approval-workflow';
    }
    if (url.includes('/rfq')) {
      return 'rfq-management';
    }
    if (url.includes('/purchase-orders')) {
      return 'purchase-orders';
    }
    if (url.includes('/goods-receipt')) {
      return 'goods-receipt';
    }
    if (url.includes('/invoice-processing')) {
      return 'invoice-processing';
    }
    if (url.includes('/purchase-returns')) {
      return 'purchase-returns';
    }
    if (url.includes('/debit-note')) {
      return 'debit-note';
    }
    
    // للـ CRM - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/crm')) {
      return 'crm-dashboard';
    }
    if (url.includes('/customers')) {
      return 'customer-management';
    }
    if (url.includes('/vehicles')) {
      return 'vehicle-management';
    }
    if (url.includes('/campaigns')) {
      return 'campaign-management';
    }
    if (url.includes('/feedback')) {
      return 'feedback-management';
    }
    if (url.includes('/survey')) {
      return 'survey-management';
    }
    if (url.includes('/coupons')) {
      return 'coupon-management';
    }
    if (url.includes('/subscriptions')) {
      return 'subscription-management';
    }
    if (url.includes('/loyalty')) {
      return 'loyalty-management';
    }
    if (url.includes('/cards')) {
      return 'card-management';
    }
    
    // للحجوزات - تطابق قاعدة البيانات
    if (url.includes('/booking-dashboard') && url.includes('/reception')) {
      return 'booking-dashboard';
    }
    if (url.includes('/create-booking')) {
      return 'create-booking';
    }
    if (url.includes('/bookings-list')) {
      return 'bookings-list';
    }
    if (url.includes('/booking-calendar')) {
      return 'booking-calendar';
    }
    if (url.includes('/booking-analytics')) {
      return 'booking-analytics';
    }
    if (url.includes('/insurance-deposits')) {
      return 'insurance-deposits';
    }
    if (url.includes('/daily-rental')) {
      return 'daily-rental-report';
    }
    
    // للمصروفات - تطابق قاعدة البيانات
    if (url.includes('/expenses')) {
      return 'expenses-management';
    }
    
    if (url.includes('/reception') && !url.includes('/mobile-wash') && !url.includes('/booking')) {
      return 'reception-dashboard';
    }
    if (url.includes('/live-control-center')) {
      return 'live-control-center';
    }
    if (url.includes('/customer-service')) {
      return 'customer-service';
    }
    if (url.includes('/reception/reports')) {
      return 'reception-reports';
    }
    if ( url.includes('/system-integration')) {
      return 'system-integrations';
    }
    if (url.includes('/customer-notifications')) {
      return 'customer-notifications';
    }
    
    // للمغسلة المتنقلة - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/mobile-wash')) {
      return 'mobile-wash-dashboard';
    }
    if (url.includes('/bookings') && url.includes('/mobile-wash')) {
      return 'mobile-wash-bookings';
    }
    if (url.includes('/fleet')) {
      return 'fleet-management';
    }
    if (url.includes('/tracking')) {
      return 'live-tracking';
    }
    if (url.includes('/quality') && url.includes('/mobile-wash')) {
      return 'quality-management';
    }
    if (url.includes('/mobile-app')) {
      return 'mobile-app-management';
    }
    
    // للعمليات - تطابق قاعدة البيانات
    if (url.includes('/operations')) {
      return 'operations-management';
    }
    if (url.includes('/work-orders')) {
      return 'work-orders';
    }
    
    // لنقاط البيع - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/pos')) {
      return 'pos-dashboard';
    }
    if (url.includes('/pos') && !url.includes('/dashboard') && !url.includes('/orders') && !url.includes('/shifts') && !url.includes('/invoices') && !url.includes('/payments') && !url.includes('/operations') && !url.includes('/reports') && !url.includes('/settings')) {
      return 'pos-system';
    }
    if (url.includes('/orders')) {
      return 'active-orders';
    }
    if (url.includes('/shifts')) {
      return 'shift-management';
    }
    if (url.includes('/outstanding-invoices')) {
      return 'outstanding-invoices';
    }
    if (url.includes('/customer-payments')) {
      return 'customer-payments';
    }
    if (url.includes('/operations-log')) {
      return 'operations-log';
    }
    if (url.includes('/reports') && url.includes('/pos')) {
      return 'pos-reports';
    }
    if (url.includes('/pos-settings')) {
      return 'pos-settings';
    }
    
    // للموارد البشرية (HCM) - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/hcm')) {
      return 'hcm-dashboard';
    }
    if (url.includes('/recruitment')) {
      return 'recruitment-management';
    }
    if (url.includes('/contracts')) {
      return 'contract-management';
    }
    if (url.includes('/employee-files')) {
      return 'employee-files';
    }
    if (url.includes('/payroll')) {
      return 'payroll-management';
    }
    if (url.includes('/attendance')) {
      return 'attendance-management';
    }
    if (url.includes('/performance')) {
      return 'performance-management';
    }
    if (url.includes('/offboarding')) {
      return 'offboarding-management';
    }
    if (url.includes('/self-service')) {
      return 'employee-self-service';
    }
    if (url.includes('/capital-management')) {
      return 'capital-management';
    }
    if (url.includes('/reports') && url.includes('/hcm')) {
      return 'hcm-reports';
    }
    
    // للحسابات - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/accounts')) {
      return 'accounting-dashboard';
    }
    if (url.includes('/accounts')) {
      return 'accounts-management';
    }
    
    // للأصول الثابتة - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/fixed-assets')) {
      return 'fixed-assets-dashboard';
    }
    if (url.includes('/fixed-assets')) {
      return 'fixed-assets-management';
    }
    
    // للعمليات المحاسبية - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/accounting-operations')) {
      return 'accounting-operations-dashboard';
    }
    if (url.includes('/accounting-operations')) {
      return 'accounting-operations';
    }
    
    // للتقارير المالية - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/financial-reports')) {
      return 'financial-reports-dashboard';
    }
    if (url.includes('/financial-reports')) {
      return 'financial-reports';
    }
    
    // للإدارة - تطابق قاعدة البيانات
    if (url.includes('/dashboard') && url.includes('/administration')) {
      return 'administration-dashboard';
    }
    if (url.includes('/administration')) {
      return 'administration-management';
    }
    
    // لتطوير الجودة - تطابق قاعدة البيانات
    if (url.includes('/quality-development')) {
      return 'quality-development';
    }
    
    // للمستندات - تطابق قاعدة البيانات
    if (url.includes('/documents')) {
      return 'document-management';
    }
    
    // للخدمات العامة - تطابق قاعدة البيانات
    if (url.includes('/general-services')) {
      return 'general-services';
    }
    
    // للمراسلات - تطابق قاعدة البيانات
    if (url.includes('/correspondence')) {
      return 'correspondence-management';
    }
    
    // للمقارنة بين الفروع - تطابق قاعدة البيانات
    if (url.includes('/branch-comparison')) {
      return 'branch-comparison';
    }
    
    // لإدارة الفروع - تطابق قاعدة البيانات
    if (url.includes('/branch-management')) {
      return 'branch-management';
    }
    
    // لإدارة الشركة - تطابق قاعدة البيانات
    if (url.includes('/company-settings')) {
      return 'company-settings';
    }
    
    // لإعدادات الفروع - تطابق قاعدة البيانات
    if (url.includes('/branch-settings')) {
      return 'branch-settings';
    }
    
    // للإعدادات المتقدمة - تطابق قاعدة البيانات
    if (url.includes('/advanced-settings')) {
      return 'advanced-settings';
    }
    
    // لإعدادات الأجهزة - تطابق قاعدة البيانات
    if (url.includes('/device-settings')) {
      return 'device-settings';
    }
    
    // لإعدادات النظام - تطابق قاعدة البيانات
    if (url.includes('/system-settings')) {
      return 'system-settings';
    }
    
    // لإعدادات الثيمات - تطابق قاعدة البيانات
    if (url.includes('/theme-settings')) {
      return 'theme-settings';
    }
    
    // لإدارة المستخدمين - تطابق قاعدة البيانات
    if (url.includes('/user-management')) {
      return 'user-management';
    }
    
    // للأدوار والصلاحيات - تطابق قاعدة البيانات
    if (url.includes('/roles-permissions')) {
      return 'roles-permissions';
    }
    
    // لإدارة المستودعات - تطابق قاعدة البيانات
    if (url.includes('/warehouse-management')) {
      return 'warehouse-management';
    }
    
    return null;
  };

  // تصفية القوائم بناءً على صلاحيات المستخدم
  const filteredMenuSections = useMemo(() => {
    
    // إذا كان لا تزال الصلاحيات في التحميل، لا نعرض أي شيء
    if (isLoadingPermissions) {
      return [];
    }

    // إذا لم يكن لديه صلاحيات، لا نعرض أي شيء
    if (!userPermissions || Object.keys(userPermissions).length === 0) {
      return [];
    }

    
    return menuSections.map(section => ({
      ...section,
      items: section.items.map(item => {
        if (item.submenu) {
          // تصفية القوائم الفرعية
          const filteredSubmenu = item.submenu.filter(subItem => {
            // تحديد الوحدة والصفحة من URL
            const moduleName = getModuleFromUrl(subItem.url);
            const pageName = getPageFromUrl(subItem.url);
            
           
            
            if (!moduleName || !pageName) {
              return false; // إذا لم نتمكن من تحديد الوحدة، لا نعرض العنصر
            }
            
            const hasAccess = canAccessPage(moduleName, pageName);
            
            // تحقق إضافي من الصلاحيات
            const hasModulePermission = userPermissions[moduleName];
            const hasPagePermission = hasModulePermission && hasModulePermission.pages && hasModulePermission.pages[pageName];
            
              
            // نعرض فقط الصفحات التي لدى المستخدم صلاحيات لها
            return hasAccess && hasPagePermission;
          });

          // إرجاع العنصر مع القوائم الفرعية المصفاة فقط إذا كان لديه قوائم فرعية
          if (filteredSubmenu.length === 0) {
            return null; // لا نعرض العنصر إذا لم يكن لديه قوائم فرعية
          }

          return {
            ...item,
            submenu: filteredSubmenu
          };
        } else {
          // للعناصر الرئيسية، نتحقق من الصلاحيات
          const moduleName = getModuleFromUrl(item.url || '');
          const pageName = getPageFromUrl(item.url || '');
          
          console.log('🔍 فحص العنصر الرئيسي:', {
            url: item.url,
            moduleName,
            pageName,
            hasModule: !!moduleName,
            hasPage: !!pageName
          });
          
          if (!moduleName || !pageName) {
            return false; // إذا لم نتمكن من تحديد الوحدة، لا نعرض العنصر
          }
          
          const hasAccess = canAccessPage(moduleName, pageName);
          
          console.log('🔍 فحص صلاحيات العنصر الرئيسي:', {
            moduleName,
            pageName,
            canAccessPage: hasAccess
          });
          
          return hasAccess ? item : null;
        }
      }).filter((item): item is MenuItem => item !== null && item !== false) // إزالة العناصر null و false
    })).filter(section => section.items.length > 0); // إزالة الأقسام الفارغة
  }, [userPermissions, isLoadingPermissions, canAccessPage, getModuleFromUrl, getPageFromUrl]);

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "جديد": return "bg-gradient-to-r from-teal-500 to-emerald-500 text-white";
      case "متميز": return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white";
      case "عاجل": return "bg-gradient-to-r from-red-500 to-rose-500 text-white";
      case "متقدم": return "bg-gradient-to-r from-cyan-600 to-teal-600 text-white";
      case "تحليل": return "bg-gradient-to-r from-blue-400 to-cyan-400 text-white";
      case "إضافة": return "bg-gradient-to-r from-teal-400 to-green-400 text-white";
      default: return "bg-gradient-to-r from-cyan-500 to-teal-500 text-white";
    }
  };

  return (
    <Sidebar className="border-l border-amber-200 bg-gradient-to-b from-white to-amber-50/50 backdrop-blur-sm order-2 shadow-2xl" side="right">
      <SidebarHeader className="p-6 border-b-2 border-amber-300 bg-gradient-to-br from-amber-500 via-yellow-400 to-purple-500 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-xl blur-md"></div>
            <img 
              src="/logo.png" 
              alt="عيادة الأسنان" 
              className="relative w-14 h-14 rounded-xl shadow-2xl ring-4 ring-white/50 hover:ring-white/80 transition-all duration-200 hover:scale-105"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-amber-400 flex items-center justify-center shadow-lg">
              <span className="text-lg">🦷</span>
            </div>
          </div>
          {!collapsed && (
            <div className="text-right">
              <h3 className="font-bold text-2xl text-white drop-shadow-lg">
                عيادة بركاء التخصصية
              </h3>
              <p className="text-sm text-white/90 font-medium drop-shadow">نظام إدارة العيادة المتطور</p>
              <div className="flex items-center gap-1 mt-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full w-fit">
                <Stars className="w-3 h-3 text-yellow-300" />
                <span className="text-xs text-white font-semibold">احترافي ومتقدم</span>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar overflow-y-auto bg-white max-h-[calc(100vh-120px)]">
        {isLoadingPermissions ? (
          // رسالة التحميل
          <div className="flex items-center justify-center h-32 text-amber-600">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
              <p className="text-sm">جاري تحميل الصلاحيات...</p>
            </div>
          </div>
        ) : filteredMenuSections.length === 0 ? (
          // رسالة عدم وجود صلاحيات
          <div className="flex items-center justify-center h-32 text-amber-600">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium mb-1">لا توجد صلاحيات</p>
              <p className="text-xs text-gray-500">يرجى التواصل مع المدير لإعطائك الصلاحيات المناسبة</p>
            </div>
          </div>
        ) : (
          // عرض القوائم المصرح بها
          filteredMenuSections.map((section, sectionIndex) => (
          <SidebarGroup key={section.title} className="px-2 py-0.5">
            {!collapsed && section.title && (
              <SidebarGroupLabel className="text-amber-600 font-bold text-xs uppercase tracking-wider mb-0.5 px-1">
                {section.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className="space-y-0.5">
              <SidebarMenu>
                {section.items.map((item, itemIndex) => (
                  <SidebarMenuItem key={item.title}>
                    {item.submenu ? (
                      <Collapsible
                        open={openMenus.includes(item.title)}
                        onOpenChange={() => toggleMenu(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`group w-full justify-between p-3 rounded-xl transition-all duration-200 hover:shadow-md ${
                              isSubmenuActive(item.submenu)
                                ? "bg-amber-100 text-amber-900 font-semibold shadow-lg border border-amber-300"
                                : "hover:bg-amber-50 text-amber-700 hover:text-amber-900"
                            }`}
                            onMouseEnter={() => setHoveredItem(item.title)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${item.color || "bg-gradient-to-r from-gray-500 to-gray-600"} shadow-lg`}>
                                <item.icon className="w-4 h-4 text-white" />
                              </div>
                              {!collapsed && (
                                <div className="flex-1 text-right">
                                  <span className="font-medium">{item.title}</span>
                                </div>
                              )}
                            </div>
                            {!collapsed && (
                              <ChevronDown
                                className={`w-4 h-4 transition-all duration-200 ${
                                  openMenus.includes(item.title) ? "rotate-180 text-amber-900" : "text-amber-600"
                                }`}
                              />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <SidebarMenuSub className="space-y-1 pr-4">
                            {item.submenu.map((subItem, subIndex) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className={`p-3 rounded-lg transition-all duration-200 ${
                                    isActive(subItem.url)
                                      ? "bg-amber-100 text-amber-900 font-semibold shadow-lg border border-gray-300"
                                      : "hover:bg-gray-50 text-amber-700 hover:text-amber-900"
                                  }`}
                                  onMouseEnter={() => setHoveredItem(subItem.title)}
                                  onMouseLeave={() => setHoveredItem(null)}
                                >
                                  <NavLink to={subItem.url} className="flex items-center gap-3 w-full">
                                     <div className="relative">
                                        <subItem.icon className={`w-4 h-4 text-amber-600 transition-colors duration-200`} />
                                        {isActive(subItem.url) && (
                                          <div className="absolute -inset-1 bg-gray-200 rounded-full"></div>
                                        )}
                                     </div>
                                     <div className="flex-1 text-right">
                                       <span className="text-sm font-medium text-amber-900">{subItem.title}</span>
                                     </div>
                                    {isActive(subItem.url) && (
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                    )}
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={`p-3 rounded-xl transition-all duration-200 hover:shadow-md ${
                          isActive(item.url || '')
                            ? "bg-gradient-to-l from-cyan-100 to-teal-100 text-cyan-900 font-semibold shadow-lg border border-cyan-300"
                            : "hover:bg-cyan-50 text-gray-700 hover:text-cyan-900"
                        }`}
                        onMouseEnter={() => setHoveredItem(item.title)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <NavLink to={item.url || '/'} className="flex items-center gap-3 w-full">
                          <div className={`p-2 rounded-lg ${item.color || "bg-gradient-to-r from-cyan-500 to-teal-500"} shadow-lg`}>
                            <item.icon className="w-4 h-4 text-white" />
                          </div>
                          {!collapsed && (
                            <div className="flex-1 text-right">
                              <span className="font-medium">{item.title}</span>
                            </div>
                          )}
                          {isActive(item.url || '') && (
                            <CheckCircle className="w-4 h-4 text-teal-600" />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )))}
      </SidebarContent>

      {/* Footer Section */}
      <SidebarFooter className="p-4 border-t border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="space-y-3">
          {/* User Profile Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 p-3 rounded-xl hover:bg-amber-100 text-amber-900 transition-all duration-200 hover:scale-[1.02] ${
                  collapsed ? "px-2" : "px-3"
                }`}
              >
                <Avatar className="w-8 h-8 ring-2 ring-amber-300">
                  <AvatarImage src="/api/placeholder/32/32" alt="المستخدم" />
                  <AvatarFallback className="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-sm font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-amber-900">{userName}</p>
                    <p className="text-xs text-amber-600">{userRole}</p>
                  </div>
                )}
                {!collapsed && <ChevronDown className="w-4 h-4 text-amber-600" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-white backdrop-blur-sm border border-amber-200 shadow-xl"
            >
              <DropdownMenuItem onClick={handleProfile} className="gap-3 text-amber-900 hover:bg-amber-50 focus:bg-amber-50 cursor-pointer">
                <User className="w-5 h-5 stroke-2" />
                <span className="font-medium">الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAccountSettings} className="gap-3 text-amber-900 hover:bg-amber-50 focus:bg-amber-50 cursor-pointer">
                <Settings className="w-5 h-5 stroke-2" />
                <span className="font-medium">إعدادات الحساب</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-amber-200" />
              <DropdownMenuItem onClick={handleLogout} className="gap-3 text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer">
                <LogOut className="w-5 h-5 stroke-2" />
                <span className="font-medium">تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Actions Row */}
          {!collapsed && (
            <div className="flex items-center justify-between gap-2">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotifications}
                className="relative p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 hover:text-amber-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5 stroke-2" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white/20"></span>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
                className="p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 hover:text-amber-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="تبديل السمة"
              >
                {isDarkMode ? <Sun className="w-5 h-5 stroke-2" /> : <Moon className="w-5 h-5 stroke-2" />}
              </Button>

              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageToggle}
                className="p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 hover:text-amber-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="تبديل اللغة"
              >
                <Languages className="w-5 h-5 stroke-2" />
              </Button>

              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelp}
                className="p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 hover:text-amber-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="المساعدة"
              >
                <HelpCircle className="w-5 h-5 stroke-2" />
              </Button>
            </div>
          )}

          {/* Collapsed Mode Icons */}
          {collapsed && (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotifications}
                className="relative p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 hover:text-amber-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5 stroke-2" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white/20"></span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
                className="p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 hover:text-amber-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="تبديل السمة"
              >
                {isDarkMode ? <Sun className="w-5 h-5 stroke-2" /> : <Moon className="w-5 h-5 stroke-2" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageToggle}
                className="p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 hover:text-amber-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="تبديل اللغة"
              >
                <Languages className="w-5 h-5 stroke-2" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelp}
                className="p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 hover:text-amber-900 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="المساعدة"
              >
                <HelpCircle className="w-5 h-5 stroke-2" />
              </Button>
            </div>
          )}

          {/* Quick Links */}
          {!collapsed && (
            <>
              <Separator className="bg-gray-200" />
              <div className="flex items-center justify-between text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrivacyPolicy}
                  className="text-gray-500 hover:text-gray-700 p-2 h-auto font-normal hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <Link className="w-4 h-4 stroke-2 mr-1" />
                  الخصوصية
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTermsPolicy}
                  className="text-gray-500 hover:text-gray-700 p-2 h-auto font-normal hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4 stroke-2 mr-1" />
                  السياسة
                </Button>
              </div>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
