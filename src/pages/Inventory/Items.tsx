import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
 
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Package,
  Car,
  Wrench,
  Edit,
  Eye,
  MoreVertical,
  Filter,
  Save,
  FileText,
  DollarSign,
  Clock,
  Image,
  Upload,
  Folder,
  Activity,
  TrendingUp,
  ShoppingCart,
  Info,
  Camera,
  X,
  Trash2,
  CheckCircle,
  Settings,
  PackageOpen,
  ArrowRightLeft,
  ClipboardCheck,
  Gem,
  ChevronDown,
  ArrowLeft,
  AlertTriangle,
  Droplets,
  Sparkles,
  Zap,
  Palette,
  RefreshCw,
  Star,
  Crown,
  Truck,
  Fuel,
  Brush,
  Scissors,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ProductForm } from "@/components/Inventory/ProductForm";
import { useGetAllProductsQuery, useGetProductByIdQuery } from "@/services/productApi";
import { useGetUsersQuery } from "@/services/userApi";

// Build full URL for images coming from backend uploads
const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5011").replace(/\/$/, "");
const withFullImageUrl = (url?: string) => {
  if (!url) return undefined as any;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/")) return url as any;
  if (url.startsWith("/Uploads")) return `${API_BASE}${url}` as any;
  return url as any;
};

interface Item {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: "خدمة" | "منتج" | "مستهلكات";
  serviceType?: string;
  categoryTree?: string;
  category: string;
  subcategory?: string;
  unit: string;
  price: number;
  costPrice?: number;
  rentalPrice?: number;
  size?: string;
  weightKg?: number;
  dimensions?: string;
  wholesalePrice?: number;
  discountPrice?: number;
  discountType?: "بدون خصم" | "نسبة" | "قيمة";
  discountValue?: number;
  taxType?: "مع ضريبة قيمة مضافة" | "بدون ضريبة";
  taxRate?: number;
  targetVehicle?: string;
  executionUnit?: string;
  attachments?: any[];
  adminNotes?: string;
  consumableMaterials?: any[];
  duration?: number;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  status: "نشط" | "غير نشط";
  description: string;
  barcode?: string;
  supplier?: string;
  manufacturer?: string;
  partNumber?: string;
  expiryDate?: string;
  warehouse?: string;
  image?: string;
  appliedBranches: string[];
  applyToAllBranches: boolean;
  consumables?: ConsumableItem[];
}

interface ConsumableItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  cost: number;
}

const Items = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("list");
  const [activeSubTab, setActiveSubTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mainCategoryFilter, setMainCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  const [viewingItem, setViewingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedItemForLog, setSelectedItemForLog] = useState<Item | null>(
    null
  );
  const [isActivityLogDialogOpen, setIsActivityLogDialogOpen] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      [
        "services",
        "products",
        "add",
        "activity-log",
        "unit-templates",
        "consumption",
        "reports",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Reset form state when changing tabs
  useEffect(() => {
    if (activeTab !== "add") {
      setEditingItem(null);
    }
  }, [activeTab]);

  // Items list (combined services + products)
  const [items, setItems] = useState<Item[]>([
    // البيانات المحلية - تحتوي على خدمات، منتجات، قطع غيار، ومستهلكات
    {
      id: "1",
      code: "DR-VEIL-001",
      nameAr: "فستان زفاف دانتيل فاخر",
      nameEn: "Luxury Lace Wedding Dress",
      type: "منتج",
      category: "خامات ومنتجات > زفاف",
      unit: "قطعة",
      price: 2500,
      quantity: 5,
      status: "نشط",
      description: "فستان زفاف دانتيل بتصميم ملكي مع ذيل طويل",
      warehouse: "main",
      appliedBranches: ["main", "riyadh"],
      applyToAllBranches: false,
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=200&fit=crop",
    },
    // ===== منتج =====
    {
      id: "2",
      code: "DR-EVE-002",
      nameAr: "فستان سهرة حرير أنيق",
      nameEn: "Elegant Silk Evening Dress",
      type: "منتج",
      category: "خامات ومنتجات > سهرة",
      unit: "قطعة",
      price: 1200,
      costPrice: 700,
      wholesalePrice: 900,
      quantity: 12,
      minStock: 3,
      maxStock: 40,
      status: "نشط",
      description: "فستان سهرة حرير بقصة حورية البحر",
      barcode: "1112223334445",
      supplier: "دار الأزياء الراقية",
      manufacturer: "Maison Couture",
      partNumber: "EV-2025-SILK",
      warehouse: "main",
      appliedBranches: ["main", "riyadh"],
      applyToAllBranches: false,
    },
    {
      id: "3",
      code: "DR-CAS-003",
      nameAr: "فستان كاجوال صيفي",
      nameEn: "Summer Casual Dress",
      type: "منتج",
      category: "خامات ومنتجات > كاجوال",
      unit: "قطعة",
      price: 350,
      quantity: 25,
      status: "نشط",
      description: "فستان كتان خفيف مناسب للصيف",
      warehouse: "main",
      appliedBranches: ["main", "riyadh", "jeddah"],
      applyToAllBranches: false,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=200&fit=crop",
    },

    // ===== مستهلكات =====
    {
      id: "5",
      code: "AC-BELT-001",
      nameAr: "حزام خامات ومنتجات مزخرف",
      nameEn: "Decorative Dress Belt",
      type: "منتج",
      category: "إكسسوارات > أحزمة",
      unit: "قطعة",
      price: 80,
      costPrice: 40,
      quantity: 60,
      minStock: 10,
      maxStock: 300,
      status: "نشط",
      description: "حزام مزخرف يضيف أناقة للخامات ومنتجات",
      barcode: "9988776655443",
      supplier: "إكسسوارات موضة",
      manufacturer: "Elegance Accessories",
      warehouse: "main",
      appliedBranches: ["main", "riyadh", "jeddah"],
      applyToAllBranches: false,
    },
  ]);

  // عرض البيانات المحلية عند بدء التطبيق
  useEffect(() => {
    console.log("🏠 البيانات المحلية (منتجات فقط):", items.filter(item => item.type === "منتج"));
    console.log("🔍 إجمالي المنتجات:", items.filter(item => item.type === "منتج").length);
  }, []);

  // Fetch real data
  const { data: productsData, isLoading: isProductsLoading } = useGetAllProductsQuery(undefined);
  const { data: productDetailsData, isLoading: isProductDetailsLoading } = useGetProductByIdQuery(editingItem?.code as any, { skip: !editingItem?.code });
  const { data: usersResponse } = useGetUsersQuery({ page: 1, limit: 100000 } as any);


  // Normalize helper
  const normalize = (data: any, key?: string) => {
    if (!data) return [] as any[];
    if (Array.isArray(data)) return data as any[];
    if (key) {
      const fromRoot = (data as any)[key];
      if (Array.isArray(fromRoot)) return fromRoot as any[];
      const fromDataKey = (data as any)?.data && (data as any).data[key];
      if (Array.isArray(fromDataKey)) return fromDataKey as any[];
    }
    if (Array.isArray((data as any)?.data)) return (data as any).data as any[];
    return [] as any[];
  };

  // Map services/products to unified Item shape
  useEffect(() => {
    const productsArr = normalize(productsData, "products");
    
    console.log("🔍 البيانات المُستلمة:", {
      products: productsArr.length,
      productsData,
      
    });

    

    const mappedProducts: Item[] = productsArr.map((p: any) => ({
      id: String(p.product_id ?? cryptoRandomId()),
      code: String(p.product_id ?? ""),
      nameAr: String(p.name_ar ?? ""),
      nameEn: String(p.name_en ?? ""),
      type: "منتج",
      category: String(p.category?.name_ar ?? ""),
      unit: String(p.unit_of_measure ?? "قطعة"),
      price: Number(p.selling_price ?? 0),
      rentalPrice: Number(p.rental_price ?? 0),
      costPrice: Number(p.cost_price ?? 0),
      size: p.size ?? undefined,
      weightKg: p.weight_kg != null ? Number(p.weight_kg) : undefined,
      dimensions: p.dimensions ?? undefined,
      wholesalePrice: p.wholesale_price != null ? Number(p.wholesale_price) : undefined,
      quantity: Number(p.current_stock ?? 0),
      status: p.status === "active" ? "نشط" : "غير نشط",
      description: String(p.description ?? ""),
      barcode: p.barcode ?? undefined,
      supplier: p.supplier?.name_ar ?? undefined,
      manufacturer: p.manufacturer?.name_ar ?? undefined,
      expiryDate: p.expiry_date ?? undefined,
      warehouse: undefined,
      appliedBranches: [],
      applyToAllBranches: false,
      image: withFullImageUrl(p.image_url) ?? undefined,
    }));

    if (mappedProducts.length) {
      const finalItems = [...mappedProducts];
      console.log("📦 العناصر النهائية من API:", {
        products: mappedProducts.length,
        total: finalItems.length
      });
      setItems(finalItems);
    } else {
      console.log("⚠️ لا توجد بيانات من API، الاحتفاظ بالبيانات المحلية");
      // لا نقوم بتحديث items إذا لم تكن هناك بيانات من API
      // البيانات المحلية ستبقى كما هي
    }
    
    // إذا لم تكن هناك بيانات من API، نتأكد من أن البيانات المحلية موجودة
    if (!mappedProducts.length && items.length === 0) {
      console.log("🔄 إعادة تعيين البيانات المحلية");
      setItems([
        {
          id: "2",
          code: "OIL-EN-005",
          nameAr: "زيت محرك شل 5W-30",
          nameEn: "Shell Engine Oil 5W-30",
          type: "منتج",
          category: "مواد استهلاكية > زيوت > زيت محرك",
          unit: "لتر",
          price: 40,
          costPrice: 25,
          wholesalePrice: 30,
          quantity: 150,
          minStock: 50,
          maxStock: 500,
          status: "نشط",
          description: "زيت تخليقي عالي الجودة مناسب لجميع أنواع السيارات",
          barcode: "1234567890123",
          supplier: "شركة شل",
          manufacturer: "Shell",
          partNumber: "SH-5W30-1L",
          warehouse: "main",
          appliedBranches: ["main", "riyadh"],
          applyToAllBranches: false
        },
        {
          id: "5",
          code: "MS-SHP-001",
          nameAr: "شامبو سيارات مركز",
          nameEn: "Concentrated Car Shampoo",
          type: "منتج",
          category: "منتجات > تنظيف > شامبو",
          unit: "لتر",
          price: 25,
          costPrice: 15,
          quantity: 200,
          minStock: 50,
          maxStock: 500,
          status: "نشط",
          description: "شامبو مركز عالي الجودة لتنظيف السيارات",
          barcode: "1122334455667",
          supplier: "شركة مواد التنظيف المتقدمة",
          manufacturer: "Chemical Solutions",
          warehouse: "main",
          appliedBranches: ["main", "riyadh", "jeddah"],
          applyToAllBranches: false
        }
      ]);
    }
  }, [productsData]);

  // Build editing product payload for ProductForm (normalized to its expected shape)
  const editingProductForForm = useMemo(() => {
    if (!editingItem) return undefined;

    const extractProductObject = (data: any) => {
      if (!data) return null;
      if (data.product) return data.product;
      if (data.data?.product) return data.data.product;
      if (data.data && !Array.isArray(data.data)) return data.data;
      return data;
    };

    const raw = extractProductObject(productDetailsData) || {};
    const product = {
      product_id: String(raw.product_id ?? editingItem.code ?? ""),
      barcode: raw.barcode ?? editingItem.barcode ?? "",
      name_ar: raw.name_ar ?? editingItem.nameAr ?? "",
      name_en: raw.name_en ?? editingItem.nameEn ?? "",
      category_id: Number(raw.category_id ?? raw.category?.category_id ?? 0),
      brand_id: Number(raw.brand_id ?? raw.brand?.brand_id ?? 0),
      model: raw.model ?? "",
      status: raw.status ?? (editingItem.status === "نشط" ? "active" : "inactive"),
      description: raw.description ?? editingItem.description ?? "",
      manufacturer_id: Number(raw.manufacturer_id ?? raw.manufacturer?.manufacturer_id ?? 0),
      supplier_id: Number(raw.supplier_id ?? raw.supplier?.supplier_id ?? 0),
      selling_price: Number(raw.selling_price ?? editingItem.price ?? 0),
      rental_price: Number(raw.rental_price ?? 0),
      image_url: withFullImageUrl(raw.image_url ?? editingItem.image) ?? "",
      weight_kg: Number(raw.weight_kg ?? 0),
      color: raw.color ?? "",
      size: raw.size ?? "",
      material: raw.material ?? "",
      shelf_location: raw.shelf_location ?? "",
      current_stock: Number(raw.current_stock ?? editingItem.quantity ?? 0),
    } as any;
    return product;
  }, [editingItem, productDetailsData]);

  // Simple random id fallback
  const cryptoRandomId = () => Math.random().toString(36).slice(2);

  // Branches data
  const branches = [
    { value: "main", label: "الفرع الرئيسي - الدمام" },
    { value: "riyadh", label: "فرع الرياض" },
    { value: "jeddah", label: "فرع جدة" },
    { value: "mecca", label: "فرع مكة" },
  ];


  // Filters

  const filteredProducts = items.filter((item) => {
    const matchesSearch =
      (typeof item.nameAr === "string"
        ? item.nameAr.toLowerCase().includes(searchTerm.toLowerCase())
        : false) ||
      (typeof item.nameEn === "string"
        ? item.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
        : false) ||
      (typeof item.code === "string"
        ? item.code.toLowerCase().includes(searchTerm.toLowerCase())
        : false);
    const matchesBranch =
      branchFilter === "all" || (item.warehouse ? item.warehouse === branchFilter : true);
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    
    const isProductType = item.type === "منتج"; // نعرض الخامات ومنتجات فقط
    
    if (isProductType) {
      console.log(`🔍 فحص ${item.type}:`, {
        name: item.nameAr,
        type: item.type,
        matchesSearch,
        matchesBranch,
        matchesType
      });
    }
    
    return (
      isProductType &&
      matchesSearch &&
      matchesBranch &&
      matchesType
    );
  });

  // Pagination: show 10 dresses per page
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredProducts, currentPage]
  );
  useEffect(() => {
    // Reset to first page when filters or items change
    setCurrentPage(1);
  }, [searchTerm, branchFilter, typeFilter, items]);

  // عرض النتائج النهائية
  useEffect(() => {
    console.log("📊 نتائج الفلترة:", {
      "إجمالي العناصر": items.length,
      "الخامات ومنتجات": filteredProducts.length,
      "تفاصيل الخامات ومنتجات": filteredProducts.map(item => ({ name: item.nameAr, type: item.type, code: item.code }))
    });
    
    if (filteredProducts.length === 0 && items.length > 0) {
      console.log("⚠️ لا توجد خامات ومنتجات في الفلتر، فحص البيانات:");
      items.forEach(item => {
            if (item.type === "منتج") {
      console.log(`🔍 ${item.type}:`, item.nameAr, item.code);
    }
      });
    }
    
    console.log("📋 عرض تبويب الخامات ومنتجات:", {
      "إجمالي الخامات ومنتجات": filteredProducts.length,
      "تفاصيل الخامات ومنتجات": filteredProducts.map(item => ({ name: item.nameAr, type: item.type, code: item.code }))
    });
  }, [items, filteredProducts]);

  // Helper functions
  const getStatusColor = (status: string) => {
    return status === "نشط"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const calculateConsumablesCost = (consumables: ConsumableItem[] = []) => {
    return consumables.reduce((total, item) => total + item.cost, 0);
  };

  // أيقونة افتراضية للمنتجات فقط
  const getServiceIcon = () => (
        <Sparkles className="w-8 h-8 text-white transition-transform duration-300 group-hover:rotate-12" />
      );

  const handleBackToDashboard = () => {
    navigate("/inventory");
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setActiveTab("add");
  };

  const handleViewDetails = (item: Item) => {
    setViewingItem(item);
    setIsDetailsDialogOpen(true);
  };

  const handleDelete = (item: Item) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicate = (item: Item) => {
    const duplicatedItem: Item = {
      ...item,
      id: Date.now().toString(),
      code: `${item.code}-COPY`,
      nameAr: `${item.nameAr} - نسخة`,
      nameEn: `${item.nameEn} - Copy`,
    };
    setItems((prev) => [...prev, duplicatedItem]);
    toast({
      title: "تم النسخ بنجاح",
      description: `تم نسخ الصنف "${item.nameAr}" بنجاح`,
    });
  };

  const handlePrintReport = (item: Item) => {
    // فتح نافذة طباعة مع تفاصيل الصنف
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>تقرير الصنف - ${item.nameAr}</title></head>
          <body style="font-family: Arial; direction: rtl; text-align: right;">
            <h1>تقرير الصنف</h1>
            <p><strong>الكود:</strong> ${item.code}</p>
            <p><strong>الاسم بالعربية:</strong> ${item.nameAr}</p>
            <p><strong>الاسم بالإنجليزية:</strong> ${item.nameEn}</p>
            <p><strong>النوع:</strong> ${item.type}</p>
            <p><strong>السعر:</strong> ${item.price} جنية مصري</p>
            <p><strong>الحالة:</strong> ${item.status}</p>
            <p><strong>الوصف:</strong> ${item.description}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast({
      title: "تم إنشاء التقرير",
      description: `تم إنشاء تقرير الصنف "${item.nameAr}" للطباعة`,
    });
  };

  const handleActivityLog = (item: Item) => {
    setSelectedItemForLog(item);
    setIsActivityLogDialogOpen(true);
  };

  const handleAdvancedSettings = (item: Item) => {
    // فتح إعدادات متقدمة حقيقية
    setEditingItem({ ...item });
    setActiveTab("add");
    toast({
      title: "الإعدادات المتقدمة",
      description: `فتح الإعدادات المتقدمة للصنف "${item.nameAr}"`,
    });
  };

  const confirmDelete = () => {
    if (deletingItem) {
      setItems((prev) => prev.filter((item) => item.id !== deletingItem.id));
      toast({
        title: "تم حذف الصنف",
        description: `تم حذف الصنف "${deletingItem.nameAr}" بنجاح`,
      });
      setDeletingItem(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Activity Log Component
  const ActivityLogComponent = () => {
    // Build from real products (created_at / updated_at)
    const productsArr = normalize(productsData, "products");
    const users = (usersResponse as any)?.users || (usersResponse as any)?.data?.users || [];
    const userIdToName = new Map<string, string>(
      users.map((u: any) => [String(u.id ?? u.user_id ?? u._id ?? ""), String(u.full_name ?? u.name ?? u.username ?? u.email ?? "")])
    );
    const getInitials = (name: string) => {
      if (!name) return "?";
      const parts = String(name).trim().split(/\s+/);
      const first = parts[0]?.[0] || "";
      const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
      return (first + last).toUpperCase();
    };
    const activities = productsArr
      .map((p: any) => {
        const createdAt = p.created_at ? new Date(p.created_at) : null;
        const updatedAt = p.updated_at ? new Date(p.updated_at) : null;
        const isEdit = createdAt && updatedAt && updatedAt.getTime() > createdAt.getTime() + 1000;
        // Try by id mapping first, then fallback to embedded fields
        const userIdRaw =
          p.updated_by_id ??
          p.updated_by ??
          p.created_by_id ??
          p.created_by ??
          p.user_id ??
          p.userId ??
          p.last_modified_by_id ??
          p.last_modified_by ??
          p.performed_by_id ??
          p.actor_id ??
          p.executor_id;
        const mappedName = userIdRaw != null ? userIdToName.get(String(userIdRaw)) : "";
        const userName =
          mappedName ||
          p.updated_by_user?.full_name ||
          p.updated_by_user?.name ||
          p.updated_by_name ||
          p.updated_by ||
          p.created_by_user?.full_name ||
          p.created_by_user?.name ||
          p.created_by_name ||
          p.created_by_username ||
          p.updated_by_username ||
          p.user_name ||
          p.user?.name ||
          p.actor?.name ||
          p.performed_by?.name ||
          "";
        return {
          id: String(p.product_id || Math.random()),
          action: isEdit ? "تعديل فستان" : "إضافة فستان",
          itemName: p.name_ar || p.name_en || "",
          itemCode: p.product_id || "",
          userName,
          userId: userIdRaw != null ? String(userIdRaw) : "",
          timestamp: (updatedAt || createdAt || new Date()),
          details: isEdit ? "تم تعديل تفاصيل الخامه او المنتج" : "تم إضافة فستان جديد",
          type: isEdit ? "edit" : "add",
        } as any;
      })
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-صxl font-bold text-gray-900">سجل الأنشطة</h2>
          <p className="text-gray-600">تتبع جميع العمليات على المنتجات</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              الأنشطة الأخيرة ({activities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    {activity.type === "edit" ? (
                      <Edit className="h-5 w-5" />
                    ) : (
                    <Plus className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {activity.action}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {activity.itemName} - {activity.itemCode}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">
                        {getInitials(activity.userName || "")}
                      </div>
                      <span className="text-sm text-gray-600">
                        المنفّذ: {activity.userName || (activity.userId ? `ID: ${activity.userId}` : "غير معروف")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{activity.details}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {activity.timestamp.toLocaleString("ar-SA")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للمخزون
            </Button>
            <div className="space-y-2">
              <h1 className="text-4xl font-black bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] bg-clip-text text-transparent">
                إدارة الخامات ومنتجات
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                إضافة وإدارة جميع أنواع الخامات ومنتجات بمزايا متقدمة
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* إجمالي الأصناف */}
            <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-950/30 dark:to-blue-900/30 overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 opacity-0 group-hover:opacity-15 transition-opacity duration-700"></div>
              <div className="absolute top-3 right-3 w-3 h-3 bg-blue-400/70 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 bg-blue-300/50 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-1200"></div>

              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-lg group-hover:shadow-xl">
                    <Sparkles className="h-8 w-8 text-blue-600 group-hover:animate-bounce" />
                  </div>
                  <div className="text-left">
                    <p className="text-4xl font-black text-blue-600 group-hover:scale-125 transition-transform duration-500 mb-1">
                      {items.filter((i) => i.type === "منتج").length}
                    </p>
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm font-bold text-blue-700/90 group-hover:text-blue-800 transition-colors duration-300">
                  إجمالي الخامات ومنتجات
                </p>
                <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center rounded-t-lg"></div>
              </CardContent>
            </Card>

           

            {/* المنتجات */}
            {/* <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-950/30 dark:to-purple-900/30 overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 opacity-0 group-hover:opacity-15 transition-opacity duration-700"></div>
              <div className="absolute top-3 right-3 w-3 h-3 bg-purple-400/70 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-lg group-hover:shadow-xl">
                    <ShoppingCart className="h-8 w-8 text-purple-600 group-hover:animate-bounce" />
                  </div>
                  <div className="text-left">
                    <p className="text-4xl font-black text-purple-600 group-hover:scale-125 transition-transform duration-500 mb-1">
                      {items.filter((i) => i.type === "منتج" || i.type === "مستهلكات").length}
                    </p>
                    <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm font-bold text-purple-700/90 group-hover:text-purple-800 transition-colors duration-300">
                  المنتجات والمواد المستهلكة
                </p>
                <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center rounded-t-lg"></div>
              </CardContent>
            </Card> */}

            {/* إجمالي القيمة */}
            <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30 overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 opacity-0 group-hover:opacity-15 transition-opacity duration-700"></div>
              <div className="absolute top-3 right-3 w-3 h-3 bg-amber-400/70 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-lg group-hover:shadow-xl">
                    <DollarSign className="h-8 w-8 text-amber-600 group-hover:animate-bounce" />
                  </div>
                  <div className="text-left">
                    <p className="text-3xl font-black text-amber-600 group-hover:scale-125 transition-transform duration-500 mb-1">
                      {items
                        .filter((i) => i.type === "منتج")
                        .reduce((total, item) => total + (item.price || 0), 0)
                        .toLocaleString()}
                    </p>
                    <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm font-bold text-amber-700/90 group-hover:text-amber-800 transition-colors duration-300">
                  إجمالي قيمة الخامات ومنتجات (جنية مصري)
                </p>
                <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center rounded-t-lg"></div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-15 w-full grid-cols-5 bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] p-2 rounded-2xl shadow-xl border-0 backdrop-blur-sm">
            <TabsTrigger
              value="list"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-[#1e3a8a] data-[state=active]:border-[#0ea5e9]/30 data-[state=active]:border-2 transition-all duration-500 hover:scale-105 hover:shadow-lg rounded-xl py-3 px-4 font-bold group text-white hover:text-white hover:bg-white/10"
            >
              <Package className="w-4 h-4 transition-all duration-500 group-hover:rotate-90 group-data-[state=active]:animate-pulse group-data-[state=active]:text-[#0ea5e9]" />
              <span className="group-data-[state=active]:bg-gradient-to-r group-data-[state=active]:from-[#1e3a8a] group-data-[state=active]:to-[#0ea5e9] group-data-[state=active]:bg-clip-text group-data-[state=active]:text-transparent">
                قائمة الخامات ومنتجات
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="add"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-[#1e3a8a] data-[state=active]:border-[#0ea5e9]/30 data-[state=active]:border-2 transition-all duration-500 hover:scale-105 hover:shadow-lg rounded-xl py-3 px-4 font-bold group text-white hover:text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 transition-all duration-500 group-hover:rotate-90 group-data-[state=active]:animate-pulse group-data-[state=active]:text-[#0ea5e9]" />
              <span className="group-data-[state=active]:bg-gradient-to-r group-data-[state=active]:from-[#1e3a8a] group-data-[state=active]:to-[#0ea5e9] group-data-[state=active]:bg-clip-text group-data-[state=active]:text-transparent">
                إضافة جديد
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="activity-log"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-[#1e3a8a] data-[state=active]:border-[#0ea5e9]/30 data-[state=active]:border-2 transition-all duration-500 hover:scale-105 hover:shadow-lg rounded-xl py-3 px-4 font-bold group text-white hover:text-white hover:bg-white/10"
            >
              <Activity className="w-4 h-4 transition-all duration-500 group-hover:rotate-12 group-data-[state=active]:animate-pulse group-data-[state=active]:text-[#0ea5e9]" />
              <span className="group-data-[state=active]:bg-gradient-to-r group-data-[state=active]:from-[#1e3a8a] group-data-[state=active]:to-[#0ea5e9] group-data-[state=active]:bg-clip-text group-data-[state=active]:text-transparent">
                سجل الأنشطة
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-[#1e3a8a] data-[state=active]:border-[#0ea5e9]/30 data-[state=active]:border-2 transition-all duration-500 hover:scale-105 hover:shadow-lg rounded-xl py-3 px-4 font-bold group text-white hover:text-white hover:bg-white/10"
            >
              <TrendingUp className="w-4 h-4 transition-all duration-500 group-hover:rotate-12 group-data-[state=active]:animate-pulse group-data-[state=active]:text-[#0ea5e9]" />
              <span className="group-data-[state=active]:bg-gradient-to-r group-data-[state=active]:from-[#1e3a8a] group-data-[state=active]:to-[#0ea5e9] group-data-[state=active]:bg-clip-text group-data-[state=active]:text-transparent">
                التقارير
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Products List Tab */}
          <TabsContent value="list" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  قائمة الخامات ومنتجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Products List */}
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="البحث في الخامات ومنتجات..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border-[#0ea5e9]/20 focus:border-[#0ea5e9] focus:ring-[#0ea5e9]/20"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select
                        value={typeFilter}
                        onValueChange={setTypeFilter}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="نوع الخامه او المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الأنواع</SelectItem>
                          <SelectItem value="منتج">فستان</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={branchFilter}
                        onValueChange={setBranchFilter}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="الفرع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الفروع</SelectItem>
                          {branches.map((branch) => (
                            <SelectItem
                              key={branch.value}
                              value={branch.value}
                            >
                              {branch.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => {
                          setActiveTab("add");
                        }}
                        className="bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] hover:from-[#1e40af] hover:via-[#2563eb] hover:to-[#06b6d4] text-white shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 border-0 gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        إضافة فستان جديد
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-[#0ea5e9]/20 shadow-lg bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-[#1e3a8a]/5 via-[#2563eb]/5 to-[#0ea5e9]/5 border-b border-[#0ea5e9]/20">
                          <tr>
                            <th className="text-right py-6 px-6 font-bold text-[#1e3a8a]">
                              الكود
                            </th>
                            <th className="text-right py-6 px-6 font-bold text-[#1e3a8a]">
                              الخامه او المنتج
                            </th>
                            <th className="text-right py-6 px-6 font-bold text-[#1e3a8a]">
                              النوع
                            </th>
                            <th className="text-right py-6 px-6 font-bold text-[#1e3a8a]">
                              الأسعار
                            </th>
                            <th className="text-right py-6 px-6 font-bold text-[#1e3a8a]">
                              المقاس/الكمية
                            </th>
                            <th className="text-right py-6 px-6 font-bold text-[#1e3a8a]">
                              الوزن/الأبعاد
                            </th>
                            <th className="text-right py-6 px-6 font-bold text-[#1e3a8a]">
                              الحالة
                            </th>
                            <th className="text-center py-6 px-6 font-bold text-[#1e3a8a]">
                              الإجراءات
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedProducts.map((item, index) => (
                            <tr
                              key={item.id}
                              className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#0ea5e9]/5 hover:to-[#2563eb]/5 transition-all duration-300 hover:shadow-md ${
                                index % 2 === 0
                                  ? "bg-white"
                                  : "bg-gradient-to-r from-slate-50/50 to-blue-50/30"
                              }`}
                            >
                              <td className="py-6 px-6">
                                <span className="font-mono text-sm bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-3 py-2 rounded-lg shadow-sm font-medium">
                                  {item.code}
                                </span>
                              </td>
                              <td className="py-6 px-6">
                                <div className="flex items-center gap-4">
                                  <div className="relative w-16 h-16 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg group">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.nameAr}
                                        className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
                                      />
                                    ) : (
                                      getServiceIcon()
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-900 text-lg mb-1">
                                      {item.nameAr}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">
                                      {item.nameEn}
                                    </div>
                                    {item.description && (
                                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                        {item.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-6 px-6">
                                <Badge
                                  variant="outline"
                                  className="bg-purple-100 text-purple-800 border-purple-200 border-2 font-medium px-3 py-1 shadow-sm"
                                >
                                  {item.type}
                                </Badge>
                              </td>
                              <td className="py-6 px-6">
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">الإيجار:</span>
                                    <span className="text-base font-bold text-emerald-600">
                                      {item.rentalPrice != null ? item.rentalPrice.toLocaleString() : 0}
                                  </span>
                                    <span className="text-xs text-gray-400">ج.م</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">سعر الخامه او المنتج:</span>
                                    <span className="text-base font-bold text-[#0ea5e9]">
                                      {item.price != null ? item.price.toLocaleString() : 0}
                                  </span>
                                    <span className="text-xs text-gray-400">ج.م</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-6 px-6">
                                <div className="flex flex-col items-end">
                                  <span className="font-bold text-lg text-gray-700">
                                    {item.quantity?.toLocaleString() || 0}
                                  </span>
                                  <span className="text-sm text-gray-500 font-medium">
                                    {item.unit}
                                  </span>
                                </div>
                              </td>
                              <td className="py-6 px-6">
                                <div className="flex flex-col items-end gap-1">
                                  <div className="text-sm text-gray-700 font-medium">
                                    {item.weightKg != null ? `${item.weightKg} كجم` : "—"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.dimensions || "—"}
                                  </div>
                                </div>
                              </td>
                              <td className="py-6 px-6">
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(
                                    item.status
                                  )} border-2 font-bold px-3 py-1 shadow-sm`}
                                >
                                  {item.status}
                                </Badge>
                              </td>
                              <td className="py-6 px-6">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(item)}
                                    className="h-10 w-10 p-0 text-[#0ea5e9] hover:text-[#1e3a8a] hover:bg-gradient-to-r hover:from-[#0ea5e9]/10 hover:to-[#1e3a8a]/10 transition-all duration-300 rounded-lg"
                                    title="تعديل"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewDetails(item)}
                                    className="h-10 w-10 p-0 text-[#2563eb] hover:text-[#1e3a8a] hover:bg-gradient-to-r hover:from-[#2563eb]/10 hover:to-[#1e3a8a]/10 transition-all duration-300 rounded-lg"
                                    title="عرض التفاصيل"
                                  >
                                    <Eye className="h-5 w-5" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-10 w-10 p-0 text-gray-600 hover:text-[#1e3a8a] hover:bg-gradient-to-r hover:from-gray-500/10 hover:to-[#1e3a8a]/10 transition-all duration-300 rounded-lg"
                                        title="المزيد"
                                      >
                                        <MoreVertical className="h-5 w-5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-white border border-gray-200 shadow-xl rounded-lg z-50">
                                      <DropdownMenuItem
                                        onClick={() => handleDuplicate(item)}
                                        className="hover:bg-blue-50"
                                      >
                                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                                        نسخ الخامه او المنتج
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handlePrintReport(item)
                                        }
                                        className="hover:bg-green-50"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        طباعة تقرير
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleActivityLog(item)
                                        }
                                        className="hover:bg-purple-50"
                                      >
                                        <Activity className="h-4 w-4 mr-2" />
                                        سجل الحركات
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleAdvancedSettings(item)
                                        }
                                        className="hover:bg-orange-50"
                                      >
                                        <Settings className="h-4 w-4 mr-2" />
                                        إعدادات متقدمة
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(item)}
                                        className="text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        حذف الخامه او المنتج
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {filteredProducts.length > 0 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        عرض {paginatedProducts.length} من {filteredProducts.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          السابق
                        </Button>
                        <span className="text-sm text-gray-700">
                          الصفحة {currentPage} من {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          التالي
                        </Button>
                      </div>
                    </div>
                  )}

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">
                        لا توجد خامات ومنتجات لعرضها
                      </p>
                      <p className="text-sm text-gray-500">
                        قم بإضافة فستان جديد أو تعديل الفلاتر
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Item Tab */}
          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingItem ? "تعديل المنتج" : "إضافة منتج جديد"}
                </CardTitle>
                <CardDescription>
                  {editingItem ? "تعديل تفاصيل المنتج" : "أدخل تفاصيل المنتج الجديد"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                      <ProductForm
                  editingProduct={editingProductForForm as any}
                        onSave={() => {
                    toast({ title: editingItem ? "تم حفظ التعديلات" : "تم حفظ الخامه او المنتج" });
                          setEditingItem(null);
                          setActiveTab("list");
                        }}
                        onCancel={() => {
                          setEditingItem(null);
                          setActiveTab("list");
                        }}
                      />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity-log" className="space-y-6">
            <ActivityLogComponent />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* إجمالي الخامات ومنتجات */}
              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-950/30 dark:to-blue-900/30 overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 opacity-0 group-hover:opacity-15 transition-opacity duration-700"></div>
                <div className="absolute top-3 right-3 w-3 h-3 bg-blue-400/70 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 bg-blue-300/50 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-1200"></div>

                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-lg group-hover:shadow-xl">
                      <Package className="h-8 w-8 text-blue-600 group-hover:animate-bounce" />
                    </div>
                    <div className="text-left">
                      <p className="text-4xl font-black text-blue-600 group-hover:scale-125 transition-transform duration-500 mb-1">
                        {items.filter((i) => i.type === "منتج").length}
                      </p>
                      <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-blue-700/90 group-hover:text-blue-800 transition-colors duration-300">
                    إجمالي الخامات ومنتجات
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center rounded-t-lg"></div>
                </CardContent>
              </Card>

              {/* الخامات ومنتجات النشطة */}
              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-emerald-950/30 dark:to-emerald-900/30 overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-15 transition-opacity duration-700"></div>
                <div className="absolute top-3 right-3 w-3 h-3 bg-emerald-400/70 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-lg group-hover:shadow-xl">
                      <CheckCircle className="h-8 w-8 text-emerald-600 group-hover:animate-bounce" />
                    </div>
                    <div className="text-left">
                      <p className="text-4xl font-black text-emerald-600 group-hover:scale-125 transition-transform duration-500 mb-1">
                        {items.filter((i) => i.type === "منتج" && i.status === "نشط").length}
                      </p>
                      <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-700/90 group-hover:text-emerald-800 transition-colors duration-300">
                    الخامات ومنتجات النشطة
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center rounded-t-lg"></div>
                </CardContent>
              </Card>

              {/* إجمالي قيمة الخامات ومنتجات */}
              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30 overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 opacity-0 group-hover:opacity-15 transition-opacity duration-700"></div>
                <div className="absolute top-3 right-3 w-3 h-3 bg-amber-400/70 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-lg group-hover:shadow-xl">
                      <DollarSign className="h-8 w-8 text-amber-600 group-hover:animate-bounce" />
                    </div>
                    <div className="text-left">
                      <p className="text-3xl font-black text-amber-600 group-hover:scale-125 transition-transform duration-500 mb-1">
                        {items
                          .filter((i) => i.type === "منتج")
                          .reduce((total, item) => total + (item.price || 0), 0)
                          .toLocaleString()}
                      </p>
                      <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-amber-700/90 group-hover:text-amber-800 transition-colors duration-300">
                    إجمالي قيمة الخامات ومنتجات (جنية مصري)
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center rounded-t-lg"></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
        </Tabs>

        {/* View Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                تفاصيل الصنف
              </DialogTitle>
            </DialogHeader>

            {viewingItem && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      الاسم العربي
                    </Label>
                    <p className="font-medium text-lg">{viewingItem.nameAr}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      الاسم الإنجليزي
                    </Label>
                    <p className="text-gray-700">{viewingItem.nameEn}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      الكود
                    </Label>
                    <p className="font-mono text-sm">{viewingItem.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      الأسعار
                    </Label>
                    <div className="space-y-1">
                      <p className="font-bold text-base text-emerald-600">
                        الإيجار: {viewingItem.rentalPrice ?? 0} جنية مصري
                      </p>
                      <p className="font-bold text-base text-blue-600">
                        سعر الخامه او المنتج: {viewingItem.price ?? 0} جنية مصري
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">المقاس</Label>
                    <p className="text-gray-700">{viewingItem.size || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الوزن</Label>
                    <p className="text-gray-700">{viewingItem.weightKg != null ? `${viewingItem.weightKg} كجم` : "—"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الأبعاد</Label>
                    <p className="text-gray-700">{viewingItem.dimensions || "—"}</p>
                  </div>
                </div>

                {viewingItem.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      الوصف
                    </Label>
                    <p className="text-gray-700 mt-1">
                      {viewingItem.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Activity Log Dialog */}
        <Dialog
          open={isActivityLogDialogOpen}
          onOpenChange={setIsActivityLogDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                سجل الحركات - {selectedItemForLog?.nameAr}
              </DialogTitle>
            </DialogHeader>

            {selectedItemForLog && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">كود الصنف:</span>{" "}
                      {selectedItemForLog.code}
                    </div>
                    <div>
                      <span className="font-medium">اسم المنتج:</span>{" "}
                      {selectedItemForLog.nameAr}
                    </div>
                    <div>
                      <span className="font-medium">إجمالي المبيعات:</span>{" "}
                      1,250 جنية مصري
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[
                    {
                      orderId: "ORD-2024-001",
                      customerName: "أحمد محمد السلمي",
                      customerPhone: "966501234567",
                      plateNumber: "أ ب ج 1234",
                      amount: 40,
                      paymentMethod: "نقدي",
                      technician: "عبدالله أحمد",
                      branch: "الفرع الرئيسي",
                      date: "2024-08-03",
                      time: "14:30",
                      status: "مكتملة",
                    },
                    {
                      orderId: "ORD-2024-002",
                      customerName: "سارة عبدالله",
                      customerPhone: "966507654321",
                      plateNumber: "هـ و ز 5678",
                      amount: 40,
                      paymentMethod: "بطاقة ائتمان",
                      technician: "محمد علي",
                      branch: "فرع الرياض",
                      date: "2024-08-03",
                      time: "13:15",
                      status: "مكتملة",
                    },
                    {
                      orderId: "ORD-2024-003",
                      customerName: "عبدالرحمن حسن",
                      customerPhone: "966509876543",
                      plateNumber: "ر س ت 9012",
                      amount: 40,
                      paymentMethod: "تحويل بنكي",
                      technician: "خالد سعد",
                      branch: "فرع جدة",
                      date: "2024-08-02",
                      time: "16:45",
                      status: "مكتملة",
                    },
                    {
                      orderId: "ORD-2024-004",
                      customerName: "فاطمة محمد",
                      customerPhone: "966502468135",
                      plateNumber: "ن ص ع 3456",
                      amount: 40,
                      paymentMethod: "نقدي",
                      technician: "أحمد يوسف",
                      branch: "الفرع الرئيسي",
                      date: "2024-08-02",
                      time: "11:20",
                      status: "مكتملة",
                    },
                  ].map((transaction, index) => (
                    <div
                      key={index}
                      className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-lg text-gray-900">
                              #{transaction.orderId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.date} - {transaction.time}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-2xl font-bold text-green-600">
                              {transaction.amount} جنية مصري
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.paymentMethod}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">
                              المريض:
                            </span>
                            <div className="text-gray-900">
                              {transaction.customerName}
                            </div>
                            <div className="text-gray-500">
                              {transaction.customerPhone}
                            </div>
                          </div>

                          <div>
                            <span className="font-medium text-gray-600">
                              السيارة:
                            </span>
                            <div className="text-gray-900 font-mono">
                              {transaction.plateNumber}
                            </div>
                            <span className="font-medium text-gray-600">
                              الفني:
                            </span>
                            <div className="text-gray-900">
                              {transaction.technician}
                            </div>
                          </div>

                          <div>
                            <span className="font-medium text-gray-600">
                              الفرع:
                            </span>
                            <div className="text-gray-900">
                              {transaction.branch}
                            </div>
                            <div className="mt-1">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.status === "مكتملة"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">4</div>
                      <div className="text-sm text-gray-600">
                        إجمالي العمليات
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        160 جنية مصري
                      </div>
                      <div className="text-sm text-gray-600">إجمالي القيمة</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        40 جنية مصري
                      </div>
                      <div className="text-sm text-gray-600">متوسط القيمة</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        2
                      </div>
                      <div className="text-sm text-gray-600">عدد الأيام</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                تأكيد حذف الصنف
              </DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف هذا الصنف؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                حذف الصنف
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Items;
