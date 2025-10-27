// بيانات الوحدات والصفحات المستخدمة في الواجهة
const modulesAndPagesData = [
  {
    moduleName: "dashboard",
    moduleTitle: "لوحة التحكم",
    pages: [
      {
        pageName: "main-dashboard",
        pageTitle: "الرئيسية",
        permissions: {
          canView: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "system-administration",
    moduleTitle: "إدارة النظام",
    pages: [
      {
        pageName: "company-settings",
        pageTitle: "بيانات الشركة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "branch-management",
        pageTitle: "الفروع",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "warehouse-management",
        pageTitle: "المستودعات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "user-management",
        pageTitle: "المستخدمون",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "roles-permissions",
        pageTitle: "الأدوار والصلاحيات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "theme-settings",
        pageTitle: "إعدادات الثيمات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "system-settings",
        pageTitle: "إعدادات النظام العامة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "device-settings",
        pageTitle: "إعدادات الأجهزة الخارجية",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "advanced-settings",
        pageTitle: "إعدادات متقدمة والأمان",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "inventory",
    moduleTitle: "إدارة المخازن",
    pages: [
            {
        pageName: "inventory-settings",
        pageTitle: "الأعدادات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "product-management",
        pageTitle: "المنتجات والخدمات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "price-management",
        pageTitle: "قائمة الأسعار",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "opening-stock",
        pageTitle: "بضاعة أول المدة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "inventory-transactions",
        pageTitle: "الحركات المخزنية",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "movement-log",
        pageTitle: "سجل الحركات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "stocktaking",
        pageTitle: "الجرد والتسويات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "inventory-policies",
        pageTitle: "السياسات والأجراءات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "inventory-analytics",
        pageTitle: "البيانات والتحليل الذكي",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "suppliers",
    moduleTitle: "إدارة الموردين",
    pages: [
      {
        pageName: "suppliers-dashboard",
        pageTitle: "لوحة تحكم الموردين",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      
      {
        pageName: "suppliers-management",
        pageTitle: "إضافة موردين",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      
      {
        pageName: "suppliers-reports",
        pageTitle: "تقارير الموردين",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "procurement",
    moduleTitle: "إدارة المشتريات",
    pages: [
      {
        pageName: "purchase-orders",
        pageTitle: "أوامر الشراء",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "purchase-returns",
        pageTitle: "مرتجع المشتريات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      
    ]
  },
  {
    moduleName: "crm",
    moduleTitle: "إدارة علاقات العملاء (CRM)",
    pages: [
     {
        pageName: "customer-management",
        pageTitle: "إدارة العملاء",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
     
    ]
  },
  {
    moduleName: "reception",
    moduleTitle: "إدارة الحجوزات",
    pages: [
      {
        pageName: "booking-dashboard",
        pageTitle: "لوحة تحكم الحجوزات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "create-booking",
        pageTitle: "إنشاء حجز جديد",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "bookings-list",
        pageTitle: "قائمة الحجوزات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "booking-calendar",
        pageTitle: "تقويم الحجوزات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "booking-analytics",
        pageTitle: "التحليلات والتقارير",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "daily-rental-report",
        pageTitle: "تقرير إيراد إيجار اليوم",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "insurance-deposits",
        pageTitle: "مبالغ التأمين",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "reception-service",
    moduleTitle: "إدارة الاستقبال وخدمة العملاء",
    pages: [
      {
        pageName: "reception-dashboard",
        pageTitle: "لوحة تحكم الاستقبال المتكاملة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "live-control-center",
        pageTitle: "مركز التحكم المباشر",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "customer-service",
        pageTitle: "خدمة العملاء",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "reception-reports",
        pageTitle: "تقارير الاستقبال",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "system-integration",
        pageTitle: "تكامل الأنظمة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "customer-notifications",
        pageTitle: "إشعارات العملاء",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "mobile-wash",
    moduleTitle: "إدارة المغسلة المتنقلة",
    pages: [
      {
        pageName: "mobile-wash-dashboard",
        pageTitle: "لوحة تحكم المغسلة المتنقلة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "mobile-wash-bookings",
        pageTitle: "إدارة الحجوزات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "fleet-management",
        pageTitle: "إدارة الأسطول",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "live-tracking",
        pageTitle: "التتبع المباشر",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "quality-management",
        pageTitle: "إدارة الجودة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "mobile-app-management",
        pageTitle: "التطبيق المحمول",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "operations",
    moduleTitle: "إدارة العمليات والمسارات",
    pages: [
      {
        pageName: "operations-management",
        pageTitle: "إدارة العمليات والمسارات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "work-orders",
        pageTitle: "أوامر العمل",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "pos",
    moduleTitle: "نقاط البيع (POS)",
    pages: [
      {
        pageName: "pos-dashboard",
        pageTitle: "لوحة تحكم نقاط البيع",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "pos-system",
        pageTitle: "نظام نقاط البيع",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "active-orders",
        pageTitle: "الطلبات الجارية",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "shift-management",
        pageTitle: "إدارة الورديات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "outstanding-invoices",
        pageTitle: "الفواتير غير المسددة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "customer-payments",
        pageTitle: "تسديدات العملاء",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "operations-log",
        pageTitle: "سجل العمليات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "pos-reports",
        pageTitle: "التقارير والتحليلات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "pos-settings",
        pageTitle: "إعدادات نقاط البيع",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "hcm",
    moduleTitle: "إدارة الموارد البشرية (HCM)",
    pages: [
      {
        pageName: "hcm-dashboard",
        pageTitle: "لوحة تحكم الموارد البشرية",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "recruitment-management",
        pageTitle: "إدارة التوظيف",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "contract-management",
        pageTitle: "إدارة العقود",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "employee-files",
        pageTitle: "ملفات الموظفين",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "accounting",
    moduleTitle: "إدارة الحسابات والمالية",
    pages: [
      {
        pageName: "accounts",
        pageTitle: "إدارة الحسابات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "fixed-assets",
        pageTitle: "الأصول الثابتة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "accounting-operations",
        pageTitle: "العمليات المحاسبية",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      },
      {
        pageName: "financial-reports",
        pageTitle: "التقارير المالية",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "administration",
    moduleTitle: "الإدارة العامة",
    pages: [
      {
        pageName: "administration",
        pageTitle: "الإدارة العامة",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "quality-development",
    moduleTitle: "إدارة الجودة والتطوير",
    pages: [
      {
        pageName: "quality-development",
        pageTitle: "إدارة الجودة والتطوير",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  },
  {
    moduleName: "expenses",
    moduleTitle: "إدارة المصروفات",
    pages: [
      {
        pageName: "expenses-management",
        pageTitle: "المصروفات",
        permissions: {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canExport: false,
          canImport: false
        }
      }
    ]
  }
];

module.exports = modulesAndPagesData;
