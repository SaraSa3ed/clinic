import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  BarChart3,
  Activity,
  DollarSign,
  Users,
  Target,
  Zap,
  Brain,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  ShoppingCart,
  Truck,
  Warehouse,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  AlertCircle,
  Timer,
  Star,
  Award,
  CheckCircle,
  XCircle,
  MinusCircle,
  Loader2
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Area,
  ComposedChart
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// API Hooks
import { useGetAllInventoryQuery } from "@/services/inventoryApi";
import { useGetAllWarehousesQuery } from "@/services/warehouseApi";
import { useGetAllProductsQuery } from "@/services/productApi";

interface Branch {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  manager: string;
}

interface CriticalItem {
  id: string;
  name: string;
  branch: string;
  currentStock: number;
  minStock: number;
  daysLeft: number;
  severity: 'critical' | 'warning' | 'urgent';
  autoOrderSuggestion: boolean;
  suggestedQuantity?: number;
}

interface StagnantItem {
  id: string;
  name: string;
  branch: string;
  lastMovement: string;
  daysStagnant: number;
  value: number;
  turnoverRate: number;
  aiRecommendation: string;
}

interface InventoryStatistics {
  totalItems: number;
  totalValue: number;
  totalCategories: number;
  turnoverRate: number;
  accuracyRate: number;
  reorderPoint: number;
  stockMovements: number;
}

interface CategoryStats {
  name: string;
  items: number;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export default function AdvancedInventoryDashboard() {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  // API Queries
  const { 
    data: inventoryData, 
    isLoading: inventoryLoading, 
    error: inventoryError,
    refetch: refetchInventory 
  } = useGetAllInventoryQuery();

  const { 
    data: warehousesData, 
    isLoading: warehousesLoading 
  } = useGetAllWarehousesQuery();

  const { 
    data: productsData, 
    isLoading: productsLoading 
  } = useGetAllProductsQuery();



  // Process real data
  const inventoryItems = inventoryData?.data?.inventory || [];
  const warehouses = warehousesData?.data?.warehouses || [];
  const products = productsData?.data?.products || [];


  // Calculate real statistics
  const inventoryStatistics: InventoryStatistics = React.useMemo(() => {
    if (!inventoryItems.length) return {
      totalItems: 0,
      totalValue: 0,
      totalCategories: 0,
      turnoverRate: 0,
    accuracyRate: 94.5,
      reorderPoint: 0,
      stockMovements: 0
    };

    const totalItems = inventoryItems.length;
    const totalValue = inventoryItems.reduce((sum, item) => {
      const product = products.find(p => p.product_id === item.product_id);
      return sum + (product?.unit_price || 0) * item.current_stock;
    }, 0);

    const totalCategories = new Set(inventoryItems.map((item: any) => {
      const product = products.find((p: any) => p.product_id === item.product_id);
      return product?.category_name || 'غير محدد';
    })).size;

    const lowStockItems = inventoryItems.filter(item => 
      item.current_stock <= item.reorder_point
    ).length;

    const reorderPoint = lowStockItems;

    return {
      totalItems,
      totalValue,
      totalCategories,
      turnoverRate: 3.2, // This would need to be calculated from movement logs
      accuracyRate: 94.5,
      reorderPoint,
      stockMovements: 456 // This would need to be fetched from movement logs
    };
  }, [inventoryItems, products]);

  // Calculate category statistics
  const categoryStats: CategoryStats[] = React.useMemo(() => {
    if (!inventoryItems.length) {
      // Return default categories if no inventory data
      return [
        { name: "قطع غيار", items: 0, value: 0, percentage: 0, trend: "up" },
        { name: "زيوت ومحركات", items: 0, value: 0, percentage: 0, trend: "up" },
        { name: "صابون ومنظفات", items: 0, value: 0, percentage: 0, trend: "up" },
        { name: "أدوات وقطع غيار", items: 0, value: 0, percentage: 0, trend: "stable" },
        { name: "مستلزمات أخرى", items: 0, value: 0, percentage: 0, trend: "up" }
      ];
    }

    const categoryMap = new Map();
    
    inventoryItems.forEach((item: any) => {
      const product = products.find((p: any) => p.product_id === item.product_id);
      if (product) {
        const categoryName = product.category_name || 'غير محدد';
        
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            name: categoryName,
            items: 0,
            value: 0,
            count: 0
          });
        }
        
        const categoryData = categoryMap.get(categoryName);
        categoryData.items += 1;
        categoryData.value += (product.unit_price || 0) * item.current_stock;
        categoryData.count += 1;
      }
    });

    // If no categories found, return default ones
    if (categoryMap.size === 0) {
      return [
        { name: "قطع غيار", items: 0, value: 0, percentage: 0, trend: "up" },
        { name: "زيوت ومحركات", items: 0, value: 0, percentage: 0, trend: "up" },
        { name: "صابون ومنظفات", items: 0, value: 0, percentage: 0, trend: "up" },
        { name: "أدوات وقطع غيار", items: 0, value: 0, percentage: 0, trend: "stable" },
        { name: "مستلزمات أخرى", items: 0, value: 0, percentage: 0, trend: "up" }
      ];
    }

    const totalValue = Array.from(categoryMap.values()).reduce((sum: any, cat: any) => sum + cat.value, 0);
    
    return Array.from(categoryMap.values())
      .map((cat: any) => ({
        name: cat.name,
        items: cat.items,
        value: cat.value,
        percentage: totalValue > 0 ? Math.round((cat.value / totalValue) * 100) : 0,
        trend: 'up' as const // This would need to be calculated from historical data
      }))
      .sort((a, b) => b.value - a.value);
  }, [inventoryItems, products]);

  // Calculate critical items
  const criticalItems: CriticalItem[] = React.useMemo(() => {
    if (!inventoryItems.length) return [];

    return inventoryItems
      .filter((item: any) => item.current_stock <= item.reorder_point)
      .map((item: any) => {
        const product = products.find((p: any) => p.product_id === item.product_id);
        const warehouse = warehouses.find((w: any) => w.warehouse_id === item.warehouse_id);
        
        const daysLeft = Math.ceil(item.current_stock / (item.current_stock > 0 ? 1 : 1));
        const severity = item.current_stock === 0 ? 'critical' : 
                        item.current_stock <= item.min_stock ? 'urgent' : 'warning';
        
        return {
          id: item.inventory_id?.toString() || '',
          name: product?.product_name || 'صنف غير محدد',
          branch: warehouse?.warehouse_name || 'مخزن غير محدد',
          currentStock: item.current_stock,
          minStock: item.min_stock,
          daysLeft,
          severity,
          autoOrderSuggestion: true,
          suggestedQuantity: Math.max(item.max_stock - item.current_stock, item.reorder_point)
        };
      })
      .sort((a, b) => {
        const severityOrder = { critical: 3, urgent: 2, warning: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
  }, [inventoryItems, products, warehouses]);

  // Calculate stagnant items (items with low movement)
  const stagnantItems: StagnantItem[] = React.useMemo(() => {
    if (!inventoryItems.length) return [];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    return inventoryItems
      .filter(item => {
        const lastUpdated = new Date(item.last_updated);
        return lastUpdated < thirtyDaysAgo && item.current_stock > 0;
      })
      .map(item => {
        const product = products.find(p => p.product_id === item.product_id);
        const warehouse = warehouses.find(w => w.warehouse_id === item.warehouse_id);
        const lastUpdated = new Date(item.last_updated);
        const daysStagnant = Math.floor((now.getTime() - lastUpdated.getTime()) / (24 * 60 * 60 * 1000));
        
        return {
          id: item.inventory_id?.toString() || '',
          name: product?.product_name || 'صنف غير محدد',
          branch: warehouse?.warehouse_name || 'مخزن غير محدد',
          lastMovement: item.last_updated,
          daysStagnant,
          value: (product?.unit_price || 0) * item.current_stock,
          turnoverRate: 0.1,
          aiRecommendation: daysStagnant > 60 ? 
            "تخفيض السعر بنسبة 20% أو نقل للفرع الرئيسي" :
            "مراجعة استراتيجية التسويق أو إعادة توزيع المخزون"
        };
      })
      .sort((a, b) => b.daysStagnant - a.daysStagnant)
      .slice(0, 10); // Top 10 stagnant items
  }, [inventoryItems, products, warehouses]);

  // Monthly trends data (this would need to be fetched from movement logs)
  const monthlyTrends = [
    { month: 'يناير', inbound: 2400, outbound: 2100, net: 300 },
    { month: 'فبراير', inbound: 2600, outbound: 2300, net: 300 },
    { month: 'مارس', inbound: 2200, outbound: 2500, net: -300 },
    { month: 'أبريل', inbound: 2800, outbound: 2200, net: 600 },
    { month: 'مايو', inbound: 3200, outbound: 2800, net: 400 },
    { month: 'يونيو', inbound: 2900, outbound: 3100, net: -200 }
  ];

  // Branch performance data
  const branchPerformanceData = warehouses.map(warehouse => ({
    branch: warehouse.warehouse_name,
    efficiency: Math.floor(Math.random() * 20) + 80, // This would need real data
    accuracy: Math.floor(Math.random() * 10) + 85, // This would need real data
    turnover: (Math.random() * 2 + 2).toFixed(1), // This would need real data
    cost: Math.floor(Math.random() * 50000) + 50000 // This would need real data
  }));

  // Loading states
  const isLoading = inventoryLoading || warehousesLoading || productsLoading;

  // Error handling
  useEffect(() => {
    if (inventoryError) {
      console.error('Inventory API Error:', inventoryError);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "فشل في تحميل بيانات المخزون",
        variant: "destructive"
      });
    }
  }, [inventoryError, toast]);

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'inventory':
          console.log('📦 Navigating to inventory items page');
          navigate('/items');
          toast({ title: "إدارة الأصناف", description: "تم الانتقال إلى صفحة إدارة الأصناف" });
          break;
        case 'movement-log':
          console.log('📋 Navigating to movement log page');
          navigate('/inventory/movement-log');
          toast({ title: "سجل الحركات", description: "تم الانتقال إلى سجل الحركات المخزنية" });
          break;
        case 'purchase-order':
          console.log('🛒 Navigating to purchase orders page');
          navigate('/inventory/purchase-orders');
          toast({ title: "أوامر الشراء", description: "تم الانتقال إلى صفحة أوامر الشراء" });
          break;
        case 'transfer':
          console.log('🔄 Navigating to transactions page');
          navigate('/inventory-transactions');
          toast({ title: "معاملات المخزون", description: "تم الانتقال إلى صفحة معاملات المخزون" });
          break;
        case 'adjustment':
          console.log('⚖️ Navigating to transactions page for adjustment');
          navigate('/inventory-transactions');
          toast({ title: "تسوية المخزون", description: "تم الانتقال إلى صفحة تسوية المخزون" });
          break;
        case 'suppliers':
          console.log('🚚 Navigating to suppliers page');
          navigate('/suppliers');
          toast({ title: "إدارة الموردين", description: "تم الانتقال إلى صفحة إدارة الموردين" });
          break;
        case 'alerts':
          console.log('🚨 Showing alerts in current page');
          toast({ 
            title: "التنبيهات النشطة", 
            description: `${criticalItems.length} تنبيه حرج، ${stagnantItems.length} صنف راكد` 
          });
          const alertTab = document.querySelector('[value="critical"]') as HTMLElement;
          alertTab?.click();
          break;
        case 'export':
          console.log('📤 Exporting data');
          const exportData = {
            totalItems: inventoryStatistics.totalItems,
            totalValue: inventoryStatistics.totalValue,
            branch: selectedBranch,
            warehouse: selectedWarehouse,
            date: new Date().toISOString(),
            criticalItems: criticalItems.length,
            stagnantItems: stagnantItems.length
          };
          
          const dataStr = JSON.stringify(exportData, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = `inventory-data-${new Date().toISOString().split('T')[0]}.json`;
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
          
          toast({ title: "تم التصدير", description: "تم تصدير بيانات المخزون بنجاح" });
          break;
        case 'warehouses':
          console.log('🏢 Navigating to warehouses page');
          navigate('/inventory/warehouses');
          toast({ title: "إدارة المخازن", description: "تم الانتقال إلى صفحة إدارة المخازن" });
          break;
        default:
          console.log(`❌ Unknown action: ${action}`);
          toast({ 
            title: "إجراء غير محدد", 
            description: "الإجراء المحدد غير متوفر حالياً", 
            variant: "destructive" 
          });
      }
    } catch (error) {
      console.error(`❌ Error in handleQuickAction for ${action}:`, error);
      toast({ 
        title: "خطأ في التنفيذ", 
        description: "حدث خطأ أثناء تنفيذ الإجراء", 
        variant: "destructive" 
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Loading component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">جاري تحميل بيانات المخزون...</h2>
            <p className="text-gray-500 mt-2">يرجى الانتظار قليلاً</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 text-gray-900">
              <Brain className="h-10 w-10 text-primary animate-pulse" />
              لوحة التحكم الذكية للمخزون
            </h1>
            <p className="text-gray-600 mt-2">إدارة متقدمة مدعومة بالذكاء الاصطناعي عبر جميع الفروع</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-48 bg-white shadow-md border-gray-200 hover:border-primary">
              <SelectValue placeholder="اختر المخزن" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المخازن</SelectItem>
              {warehouses.map(warehouse => (
                <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                  {warehouse.warehouse_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white shadow-md hover:shadow-lg"
            onClick={() => {
              refetchInventory();
              toast({ title: "تم التحديث", description: "تم تحديث بيانات المخزون بنجاح" });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white shadow-md hover:shadow-lg"
            onClick={() => {
              // فتح إعدادات النظام
              toast({ title: "الإعدادات", description: "سيتم إضافة صفحة الإعدادات قريباً" });
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            إعدادات
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 bg-white/90 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            الإجراءات السريعة
          </CardTitle>
          <CardDescription>اختصارات للوصول السريع للوظائف الأساسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
            {[
              { id: 'inventory', label: 'إدارة الأصناف', icon: Package, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
              { id: 'movement-log', label: 'سجل الحركات', icon: Activity, gradient: 'from-green-500 to-green-600', shadow: 'shadow-green-500/25' },
              { id: 'purchase-order', label: 'أوامر الشراء', icon: ShoppingCart, gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/25' },
              { id: 'transfer', label: 'النقل والتحويل', icon: Truck, gradient: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/25' },
              { id: 'adjustment', label: 'تسوية المخزون', icon: Target, gradient: 'from-red-500 to-red-600', shadow: 'shadow-red-500/25' },
              { id: 'suppliers', label: 'الموردين', icon: Users, gradient: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/25' },
              { id: 'alerts', label: 'التنبيهات', icon: AlertTriangle, gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/25' },
              { id: 'export', label: 'تصدير البيانات', icon: Download, gradient: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/25' },
              { id: 'warehouses', label: 'إدارة المخازن', icon: Warehouse, gradient: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/25' }
            ].map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="lg"
                onClick={() => handleQuickAction(action.id)}
                className={`h-20 flex flex-col items-center gap-2 p-4 bg-gradient-to-br ${action.gradient} text-white border-0 hover:scale-105 transition-all duration-300 ${action.shadow} hover:shadow-lg group`}
              >
                <action.icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-8">
        <div className="sticky top-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-9 h-16 p-2 bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-inner">
            <TabsTrigger 
              value="overview" 
              className="group relative flex items-center gap-3 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950 dark:hover:to-indigo-950 transition-all duration-300 rounded-lg border-0 font-medium text-sm"
            >
              <BarChart3 className="h-5 w-5 group-data-[state=active]:animate-pulse transition-transform group-hover:scale-110 duration-300" />
              <span className="hidden md:inline">نظرة عامة</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="items" 
              className="group relative flex items-center gap-3 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950 dark:hover:to-teal-950 transition-all duration-300 rounded-lg border-0 font-medium text-sm"
            >
              <Package className="h-5 w-5 group-data-[state=active]:animate-pulse transition-transform group-hover:scale-110 duration-300" />
              <span className="hidden md:inline">الأصناف</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="critical" 
              className="group relative flex items-center gap-3 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/30 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-950 dark:hover:to-rose-950 transition-all duration-300 rounded-lg border-0 font-medium text-sm"
            >
              <AlertTriangle className="h-5 w-5 group-data-[state=active]:animate-pulse transition-transform group-hover:scale-110 duration-300" />
              <span className="hidden md:inline">أصناف حرجة</span>
              <Badge className="ml-1 bg-red-100 text-red-600 text-xs px-2 py-0.5 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                {criticalItems.length}
              </Badge>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="stagnant" 
              className="group relative flex items-center gap-3 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950 dark:hover:to-orange-950 transition-all duration-300 rounded-lg border-0 font-medium text-sm"
            >
              <Timer className="h-5 w-5 group-data-[state=active]:animate-pulse transition-transform group-hover:scale-110 duration-300" />
              <span className="hidden md:inline">أصناف راكدة</span>
              <Badge className="ml-1 bg-amber-100 text-amber-600 text-xs px-2 py-0.5 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                {stagnantItems.length}
              </Badge>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="movements" 
              className="group relative flex items-center gap-3 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-950 dark:hover:to-violet-950 transition-all duration-300 rounded-lg border-0 font-medium text-sm"
            >
              <Activity className="h-5 w-5 group-data-[state=active]:animate-pulse transition-transform group-hover:scale-110 duration-300" />
              <span className="hidden md:inline">الحركات</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="analysis" 
              className="group relative flex items-center gap-3 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/30 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-950 dark:hover:to-blue-950 transition-all duration-300 rounded-lg border-0 font-medium text-sm"
            >
              <Target className="h-5 w-5 group-data-[state=active]:animate-pulse transition-transform group-hover:scale-110 duration-300" />
              <span className="hidden md:inline">التحليل</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="branches" 
              className="group relative flex items-center gap-3 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950 dark:hover:to-purple-950 transition-all duration-300 rounded-lg border-0 font-medium text-sm"
            >
              <Building className="h-5 w-5 group-data-[state=active]:animate-pulse transition-transform group-hover:scale-110 duration-300" />
              <span className="hidden md:inline">مقارنة الفروع</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="predictions" 
              className="group relative flex items-center gap-3 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/30 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-950 dark:hover:to-rose-950 transition-all duration-300 rounded-lg border-0 font-medium text-sm"
            >
              <Brain className="h-5 w-5 group-data-[state=active]:animate-pulse transition-transform group-hover:scale-110 duration-300" />
              <span className="hidden md:inline">التنبؤات</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="smart" 
              className="group relative flex items-center gap-3 py-4 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-950 dark:hover:to-purple-950 transition-all duration-300 rounded-lg border-0 font-medium text-sm"
            >
              <Zap className="h-5 w-5 group-data-[state=active]:animate-pulse transition-transform group-hover:scale-110 duration-300" />
              <span className="hidden md:inline">ذكي</span>
              <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-300"></div>
            </TabsTrigger>
          </TabsList>
          
          {/* Navigation Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            <div className="flex gap-2">
              {Array.from({ length: 9 }).map((_, index) => (
                <div 
                  key={index}
                  className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 animate-fade-in">
          {/* Main KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Items */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-50 dark:from-blue-950 dark:via-blue-900/50 dark:to-indigo-950 border-blue-200 hover:border-blue-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <div>
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">إجمالي الأصناف</CardTitle>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                    {inventoryStatistics.totalItems.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-600 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                    في {inventoryStatistics.totalCategories} فئات
                  </span>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15 هذا الأسبوع
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Value */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 via-green-100/50 to-teal-50 dark:from-emerald-950 dark:via-green-900/50 dark:to-teal-950 border-emerald-200 hover:border-emerald-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <div>
                  <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">قيمة المخزون</CardTitle>
                  <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-2">
                    {(inventoryStatistics.totalValue / 1000000).toFixed(1)}م ج.م
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-600 bg-emerald-100 dark:bg-emerald-900 px-2 py-1 rounded-full">
                    متوسط: {inventoryStatistics.totalItems > 0 ? Math.round(inventoryStatistics.totalValue / inventoryStatistics.totalItems).toLocaleString() : 0} ج.م
                  </span>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Turnover Rate */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-orange-100/50 to-yellow-50 dark:from-amber-950 dark:via-orange-900/50 dark:to-yellow-950 border-amber-200 hover:border-amber-300">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <div>
                  <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">معدل الدوران</CardTitle>
                  <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-2">
                    {inventoryStatistics.turnoverRate}x
                  </div>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="h-6 w-6 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-600 bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded-full">
                    ممتاز
                  </span>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0.2 من الشهر الماضي
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accuracy Rate */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-violet-100/50 to-fuchsia-50 dark:from-purple-950 dark:via-violet-900/50 dark:to-fuchsia-950 border-purple-200 hover:border-purple-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <div>
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">دقة الجرد</CardTitle>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                    {inventoryStatistics.accuracyRate}%
                  </div>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-purple-600 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                    ممتاز
                  </span>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +1.5% تحسن
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories Overview */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 border shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <PieChart className="h-5 w-5 text-primary" />
                      </div>
                      إحصائيات التصنيفات
                    </CardTitle>
                    <CardDescription className="mt-2">توزيع الأصناف والقيم حسب التصنيف</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {categoryStats.length} فئات
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryStats.map((category, index) => (
                    <div key={index} className="group p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-emerald-500' :
                            index === 2 ? 'bg-amber-500' :
                            index === 3 ? 'bg-rose-500' :
                            'bg-purple-500'
                          }`}></div>
                          <div>
                            <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                              {category.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{category.items} صنف</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-lg">{category.value.toLocaleString()} ج.م</div>
                            <div className="text-sm text-muted-foreground">{category.percentage}% من الإجمالي</div>
                          </div>
                          <Badge variant={category.trend === 'up' ? 'default' : category.trend === 'down' ? 'destructive' : 'secondary'} 
                                 className="px-3 py-1">
                            {category.trend === 'up' ? (
                              <><TrendingUp className="h-3 w-3 mr-1" />ارتفاع</>
                            ) : category.trend === 'down' ? (
                              <><TrendingDown className="h-3 w-3 mr-1" />انخفاض</>
                            ) : (
                              <><MinusCircle className="h-3 w-3 mr-1" />ثابت</>
                            )}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>نسبة المساهمة</span>
                          <span>{category.percentage}%</span>
                        </div>
                        <Progress 
                          value={category.percentage} 
                          className={`h-2 ${
                            index === 0 ? 'bg-blue-100 dark:bg-blue-900' :
                            index === 1 ? 'bg-emerald-100 dark:bg-emerald-900' :
                            index === 2 ? 'bg-amber-100 dark:bg-amber-900' :
                            index === 3 ? 'bg-rose-100 dark:bg-rose-900' :
                            'bg-purple-100 dark:bg-purple-900'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  رؤى سريعة
                </CardTitle>
                <CardDescription>تحليلات ذكية للمخزون</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200 text-sm">أداء ممتاز</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    معدل دوران المخزون يفوق المعدل المطلوب بنسبة 15%
                  </p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">تحذير</span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {criticalItems.length} صنف يحتاج إعادة طلب فوري
                  </p>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200 text-sm">توصية</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    فئة "قطع الغيار" تحقق أعلى معدل ربحية هذا الشهر
                  </p>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-800 dark:text-purple-200 text-sm">اتجاه إيجابي</span>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    نمو مستمر في قيمة المخزون بمعدل 5.2% شهرياً
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <LineChart className="h-5 w-5 text-primary" />
                    </div>
                    أداء المخزون الشهري
                  </CardTitle>
                  <CardDescription className="mt-2">تتبع الحركات والأداء خلال الأشهر الماضية</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="6months">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">3 أشهر</SelectItem>
                      <SelectItem value="6months">6 أشهر</SelectItem>
                      <SelectItem value="12months">12 شهر</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    تصدير
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    fill="url(#inboundGradient)"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="وارد"
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    fill="url(#outboundGradient)"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="صادر"
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="صافي الحركة"
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Critical Items Tab */}
        <TabsContent value="critical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                الأصناف الحرجة
                <Badge variant="destructive">{criticalItems.length}</Badge>
              </CardTitle>
              <CardDescription>
                أصناف تحتاج إلى اهتمام فوري
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p>لا توجد أصناف حرجة حالياً</p>
                    <p className="text-sm">جميع الأصناف في المستوى المطلوب</p>
                  </div>
                ) : (
                  criticalItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-red-900">{item.name}</h4>
                      <Badge className={getSeverityColor(item.severity)}>
                        {item.severity === 'critical' ? 'حرج' : item.severity === 'urgent' ? 'عاجل' : 'تحذير'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">المخزون الحالي:</span>
                        <div className="font-bold text-red-700">{item.currentStock}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">الحد الأدنى:</span>
                        <div className="font-bold">{item.minStock}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">الأيام المتبقية:</span>
                        <div className="font-bold text-red-700">{item.daysLeft} أيام</div>
                      </div>
                      <div>
                          <span className="text-gray-600">المخزن:</span>
                        <div className="font-bold">{item.branch}</div>
                      </div>
                    </div>
                    {item.autoOrderSuggestion && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">اقتراح الذكاء الاصطناعي</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          يُنصح بطلب {item.suggestedQuantity} وحدة لتجنب النفاد
                        </p>
                        <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          طلب تلقائي
                        </Button>
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stagnant Items Tab */}
        <TabsContent value="stagnant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-orange-500" />
                الأصناف الراكدة
                <Badge variant="secondary">{stagnantItems.length}</Badge>
              </CardTitle>
              <CardDescription>
                أصناف بطيئة الحركة تحتاج لمراجعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stagnantItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p>لا توجد أصناف راكدة حالياً</p>
                    <p className="text-sm">جميع الأصناف تتحرك بشكل جيد</p>
                  </div>
                ) : (
                  stagnantItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-orange-900">{item.name}</h4>
                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                        راكد {item.daysStagnant} يوم
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">آخر حركة:</span>
                          <div className="font-medium">{new Date(item.lastMovement).toLocaleDateString('ar-SA')}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">القيمة:</span>
                        <div className="font-bold text-orange-600">{item.value.toLocaleString()} ج.م</div>
                      </div>
                      <div>
                        <span className="text-gray-600">معدل الدوران:</span>
                        <div className="font-medium">{item.turnoverRate}</div>
                      </div>
                      <div>
                          <span className="text-gray-600">المخزن:</span>
                        <div className="font-medium">{item.branch}</div>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                      <span className="text-blue-800 text-sm">
                        🤖 توصية الذكاء الاصطناعي: {item.aiRecommendation}
                      </span>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة أداء المخازن</CardTitle>
              <CardDescription>مؤشرات الأداء الرئيسية لكل مخزن</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {branchPerformanceData.map((branch, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">{branch.branch}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>الكفاءة</span>
                        <span className="font-bold">{branch.efficiency}%</span>
                      </div>
                      <Progress value={branch.efficiency} className="h-2" />
                      <div className="flex justify-between">
                        <span>الدقة</span>
                        <span className="font-bold">{branch.accuracy}%</span>
                      </div>
                      <Progress value={branch.accuracy} className="h-2" />
                      <div className="flex justify-between">
                        <span>معدل الدوران</span>
                        <span className="font-bold">{branch.turnover}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>التكلفة الشهرية</span>
                        <span className="font-bold">{branch.cost?.toLocaleString ? branch.cost.toLocaleString() : branch.cost} ج.م</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Tab */}
        <TabsContent value="smart" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  إجراءات ذكية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    طلب تلقائي للأصناف الحرجة
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    إعادة توزيع المخزون
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    تحسين نقاط الطلب
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  أفضل الممارسات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    دقة الجرد أعلى من 94%
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    معدل دوران صحي
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    تحسين إدارة الأصناف الراكدة
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  درجة الأداء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">A+</div>
                  <div className="text-sm text-gray-600">أداء ممتاز</div>
                  <Progress value={94} className="mt-3" />
                  <div className="text-xs text-gray-500 mt-1">94% من الحد الأقصى</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
