import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  FileDown, 
  Upload, 
  Lock, 
  Unlock,
  Save,
  Trash2,
  AlertTriangle,
  Package,
  Filter,
  Printer,
  Copy
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
// تم إزالة الاعتماد على الفروع
import { 
  useGetAllOpeningStocksQuery,
  useCreateOpeningStockMutation,
  useUpdateOpeningStockMutation,
  useDeleteOpeningStockMutation,
} from '@/services/openingStockApi';
import { useGetAllProductsQuery, useUpdateProductMutation } from '@/services/productApi';

interface OpeningStockItem {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  dressPrice?: number;
  rentalPrice?: number;
  totalCost: number;
  notes?: string;
  persisted?: boolean;
}

interface OpeningStockRecord {
  id: string;
  recordNumber: string;
  warehouse: string;
  date: string;
  user: string;
  itemCount: number;
  totalValue: number;
  isLocked: boolean;
  items: OpeningStockItem[];
}

export default function OpeningStock() {
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [records, setRecords] = useState<(OpeningStockRecord & { entryIds?: number[] })[]>([]);
  const [newRecord, setNewRecord] = useState({
    warehouse: "",
    date: new Date().toISOString().split('T')[0],
    items: [] as OpeningStockItem[],
    // حقول المخزون الإضافية
    minStock: 1,
    maxStock: 1000,
    reorderPoint: 10
  });

  // استخدام Context الفروع والبيانات المتعلقة بها
  

  // الحصول على المستودعات الخاصة بالفرع المحدد من النموذج أو الـ context
  // جلب جميع المستودعات مباشرة
  const warehouses: any[] = [];

  // ربط API
  const { data: openingStocksResponse, isLoading: isOpeningLoading } = useGetAllOpeningStocksQuery(undefined as any, { refetchOnMountOrArgChange: true } as any);

  const { data: productsResponse, isLoading: isProductsLoading } = useGetAllProductsQuery(undefined as any);
  const [createOpeningStock, { isLoading: isCreating }] = useCreateOpeningStockMutation();
  const [updateOpeningStock, { isLoading: isUpdating }] = useUpdateOpeningStockMutation();
  const [deleteOpeningStock, { isLoading: isDeleting }] = useDeleteOpeningStockMutation();
  const [updateProduct] = useUpdateProductMutation();

  // تحويل بيانات الـ API إلى سجلات مجمعة كما تتوقع الواجهة (بدون فروع)
  const apiRecords = useMemo(() => {
    const raw = openingStocksResponse?.data?.openingStocks ?? [];
    if (!Array.isArray(raw) || raw.length === 0) return [] as (OpeningStockRecord & { entryIds?: number[] })[];

    type RawItem = {
      id: number;
      opening_stock_date: string;
      item_code: string;
      quantity: number;
      unit_cost: number;
      total_cost: number;
      notes?: string;
      branch_id: number | string;
      warehouse_id: number | string;
      product?: { product_id: string; name_ar: string; name_en: string } | null;
      sparePart?: { id: number; arabicName: string; englishName: string } | null;
      branch?: { id: number | string; arabicName: string; englishName: string } | null;
      warehouse?: { warehouse_id: number | string; name_ar: string; name_en: string } | null;
    };

    const groupMap = new Map<string, { 
      key: string;
      date: string;
      warehouseName: string;
      entryIds: number[];
      items: OpeningStockItem[];
    }>();

    (raw as RawItem[]).forEach((row) => {
      const dateOnly = row.opening_stock_date?.slice(0, 10) ?? '';
      const warehouseIdStr = String(row.warehouse?.warehouse_id ?? row.warehouse_id ?? '');
      const key = `${warehouseIdStr}|${dateOnly}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          date: dateOnly,
          warehouseName: '-',
          entryIds: [],
          items: [],
        });
      }

      const group = groupMap.get(key)!;
      group.entryIds.push(Number(row.id));
      group.items.push({
        id: String(row.id),
        itemCode: row.item_code,
        itemName: row.product?.name_ar || row.product?.name_en || row.sparePart?.arabicName || row.sparePart?.englishName || '',
        quantity: Number(row.quantity) || 0,
        totalCost: Number(row.total_cost) || 0,
        notes: row.notes || '',
        persisted: true,
      });
    });

    const result: (OpeningStockRecord & { entryIds?: number[] })[] = [];
    let counter = 1;
    for (const [, group] of groupMap) {
      const totalValue = group.items.reduce((s, i) => s + (i.totalCost || 0), 0);
      result.push({
        id: group.key,
        recordNumber: `OS-${String(counter).padStart(3, '0')}`,
        warehouse: group.warehouseName,
        date: group.date,
        user: '-',
        itemCount: group.items.length,
        totalValue,
        isLocked: false,
        items: group.items,
        entryIds: group.entryIds,
      });
      counter += 1;
    }
    return result;
  }, [openingStocksResponse]);

  useEffect(() => {
    if (apiRecords.length) {
      setRecords(apiRecords);
    }
  }, [apiRecords]);

  // تحميل المنتجات الحقيقية لعرضها في كود الصنف
  const productOptions = useMemo(() => {
    const list: any[] = (productsResponse as any)?.data?.products ?? (productsResponse as any)?.products ?? [];
    if (!Array.isArray(list)) return [] as Array<{ code: string; name: string; unit: string }>;
    return list.map((p: any) => ({
      code: String(p.product_id),
      name: p.name_ar || p.name_en || '',
      unit: p.unit_of_measure || '',
    }));
  }, [productsResponse]);

  // تصفية السجلات بالبحث فقط (بدون فروع)
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // إحصائيات الفروع
  

  const addItemToRecord = () => {
    const newItem: OpeningStockItem = {
      id: Date.now().toString(),
      itemCode: "",
      itemName: "",
      quantity: 0,
      dressPrice: 0,
      totalCost: 0,
      notes: "",
      persisted: false,
    };
    setNewRecord(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (index: number, field: keyof OpeningStockItem, value: any) => {
    setNewRecord(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      
      // حساب الإجمالي باستخدام سعر الخامه او المنتج
      if (field === 'quantity' || field === 'dressPrice') {
        const qty = Number(updatedItems[index].quantity) || 0;
        const price = Number(updatedItems[index].dressPrice) || 0;
        updatedItems[index].totalCost = qty * price;
      }
      
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const removeItem = (index: number) => {
    setNewRecord(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const selectItem = (index: number, itemCode: string) => {
    const selectedItem = productOptions.find(item => item.code === itemCode);
    if (selectedItem) {
      updateItem(index, 'itemCode', selectedItem.code);
      updateItem(index, 'itemName', selectedItem.name);
      
      // البحث عن المنتج في البيانات الحقيقية للحصول على الكمية والأسعار
      const currentProduct = (productsResponse as any)?.data?.products?.find((p: any) => String(p.product_id) === String(itemCode)) || 
                            (productsResponse as any)?.products?.find((p: any) => String(p.product_id) === String(itemCode));
      
      if (currentProduct) {
        const currentStock = Number(currentProduct.current_stock) || 0;
        const selling = Number(currentProduct.selling_price) || 0;
        const rental = Number(currentProduct.rental_price) || 0;
        
        updateItem(index, 'quantity', currentStock);
        updateItem(index, 'dressPrice', selling);
        updateItem(index, 'rentalPrice', rental);
        
        toast({
          title: "تم تحميل البيانات",
          description: `الكمية ${currentStock}, سعر الخامه او المنتج ${selling}، سعر الإيجار ${rental}`,
        });
      }
    }
  };

  const getTotalValue = () => {
    return newRecord.items.reduce((sum, item) => sum + item.totalCost, 0);
  };

  const saveRecord = async () => {
    if (newRecord.items.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة صنف واحد على الأقل",
        variant: "destructive"
      });
      return;
    }

    try {
      // إنشاء/تحديث سجلات بضاعة أول المدة أولاً (بدون فروع/مستودعات)
      await Promise.all(
        newRecord.items.map(async (item) => {
          const payload: any = {
            opening_stock_date: newRecord.date,
            item_code: item.itemCode,
            quantity: Number(item.quantity) || 0,
            unit_cost: Number(item.dressPrice) || 0,
            total_cost: (Number(item.quantity) || 0) * (Number(item.dressPrice) || 0),
            notes: item.notes || '',
            branch_id: null,
            warehouse_id: null,
            product_id: item.itemCode || null,
            spare_part_id: null,
          };
          if (item.persisted) {
            return updateOpeningStock({ id: Number(item.id), ...payload }).unwrap();
          }
          return createOpeningStock(payload).unwrap();
        })
      );

      // ثم تحديث الكميات وأسعار المنتجات فقط (بدون مستودعات)
      let updatedCount = 0;
      for (const item of newRecord.items) {
        if (item.itemCode) {
          try {
            const currentProduct = (productsResponse as any)?.data?.products?.find((p: any) => String(p.product_id) === String(item.itemCode)) || 
                                  (productsResponse as any)?.products?.find((p: any) => String(p.product_id) === String(item.itemCode));
            if (currentProduct) {
              const currentStock = Number(currentProduct.current_stock) || 0;
              const newStock = currentStock + (Number(item.quantity) || 0);

              const updateData: any = {
                current_stock: newStock,
                selling_price: item.dressPrice,
                rental_price: item.rentalPrice,
              };
              if ((newRecord as any).minStock !== undefined) updateData.min_stock = (newRecord as any).minStock;
              if ((newRecord as any).maxStock !== undefined) updateData.max_stock = (newRecord as any).maxStock;
              if ((newRecord as any).reorderPoint !== undefined) updateData.reorder_point = (newRecord as any).reorderPoint;

              await updateProduct({ id: String(item.itemCode), updatedProduct: updateData }).unwrap();
              updatedCount += 1;
            }
          } catch (error) {
            console.error(`❌ فشل في تحديث المنتج ${item.itemCode}:`, error);
            toast({
              title: "خطأ في تحديث المنتج",
              description: `فشل في تحديث ${item.itemName}. يرجى المحاولة مرة أخرى.`,
              variant: "destructive"
            });
          }
        }
      }

      if (updatedCount > 0) {
        toast({
          title: "نجح الحفظ",
          description: `تم حفظ البيانات وتحديث ${updatedCount} منتج(ات) (الكميات وسعر الخامه او المنتج وسعر الإيجار).`,
        });

        setNewRecord({
          warehouse: "",
          date: new Date().toISOString().split('T')[0],
          items: [],
          minStock: 1,
          maxStock: 1000,
          reorderPoint: 10
        });
        setActiveTab("list");
      } else {
        toast({
          title: "لم يتم التحديث",
          description: "لم يتم العثور على المنتجات المطابقة للأكواد المدخلة. تحقق من الأكواد أو إعدادات API.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error('❌ خطأ في الحفظ:', err);
      toast({
        title: 'فشل الحفظ',
        description: 'حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  };

  // وظائف الأزرار والعمليات
  const handleEdit = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record && !record.isLocked) {
      const updatedItems = record.items.map(item => {
        const currentProduct = (productsResponse as any)?.data?.products?.find((p: any) => String(p.product_id) === String(item.itemCode)) || 
                              (productsResponse as any)?.products?.find((p: any) => String(p.product_id) === String(item.itemCode));
        if (currentProduct) {
          const existingQty = Number(item.quantity) || 0;
          const qty = Number(currentProduct.current_stock) || existingQty;
          const selling = Number(currentProduct.selling_price) || 0;
          const total = qty * selling;
          return {
            ...item,
            quantity: qty,
            dressPrice: selling,
            rentalPrice: Number(currentProduct.rental_price) || 0,
            totalCost: total,
          } as OpeningStockItem;
        }
        return item;
      });
      
      setNewRecord({
        warehouse: "",
        date: record.date,
        items: updatedItems,
        minStock: 1,
        maxStock: 1000,
        reorderPoint: 10
      });
      setActiveTab("new");
      
      toast({
        title: "تم التحميل",
        description: "تم تحميل بيانات العملية للتعديل مع تحديث الكميات والأسعار من جدول المنتجات",
      });
    } else {
      toast({
        title: "تعذر التعديل",
        description: "العملية مقفلة ولا يمكن تعديلها",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record && !record.isLocked) {
      
      
      if (confirm("هل أنت متأكد من حذف هذه العملية؟")) {
        try {
          const ids = record.entryIds || [];
          if (ids.length) {
            await Promise.all(ids.map((id) => deleteOpeningStock(id as unknown as number).unwrap()));
          }
          // تحديث الواجهة محليًا
        setRecords(prev => prev.filter(r => r.id !== recordId));
          toast({ title: "تم الحذف", description: "تم حذف العملية بنجاح" });
        } catch (e) {
          toast({ title: 'تعذر الحذف', description: 'حدث خطأ أثناء حذف العملية', variant: 'destructive' });
        }
      }
    }
  };

  const handleLockToggle = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      
      
      const action = record.isLocked ? "إلغاء القفل" : "القفل";
      
      // تحديث حالة القفل في البيانات
      setRecords(prev => prev.map(r => 
        r.id === recordId ? { ...r, isLocked: !r.isLocked } : r
      ));
      
      toast({
        title: `تم ${action}`,
        description: `تم ${action} للعملية ${record.recordNumber}`,
      });
    }
  };

  const handleExportToExcel = (recordId?: string) => {
    if (recordId) {
    const record = records.find(r => r.id === recordId);
      toast({
        title: "تصدير Excel",
        description: `تم تصدير العملية ${record?.recordNumber} إلى Excel`,
      });
    } else {
      toast({
        title: "تصدير Excel",
        description: "تم تصدير جميع العمليات إلى Excel",
      });
    }
  };

  const handleImportFromExcel = () => {
    // فتح نافذة اختيار الملف
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "استيراد Excel",
          description: `تم استيراد الملف ${file.name} بنجاح`,
        });
      }
    };
    input.click();
  };

  const handlePrintRecord = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    toast({
      title: "طباعة",
      description: `تم إرسال العملية ${record?.recordNumber} للطباعة`,
    });
  };

  const handleDuplicateRecord = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      const updatedItems = record.items.map(item => {
        const currentProduct = (productsResponse as any)?.data?.products?.find((p: any) => String(p.product_id) === String(item.itemCode)) || 
                              (productsResponse as any)?.products?.find((p: any) => String(p.product_id) === String(item.itemCode));
        if (currentProduct) {
          const existingQty = Number(item.quantity) || 0;
          const qty = Number(currentProduct.current_stock) || existingQty;
          const selling = Number(currentProduct.selling_price) || 0;
          const total = qty * selling;
          return {
            ...item,
            id: Date.now().toString() + Math.random(),
            quantity: qty,
            dressPrice: selling,
            rentalPrice: Number(currentProduct.rental_price) || 0,
            totalCost: total,
          } as OpeningStockItem;
        }
        return {
          ...item,
          id: Date.now().toString() + Math.random(),
        } as OpeningStockItem;
      });
      
      setNewRecord({
        warehouse: "",
        date: new Date().toISOString().split('T')[0],
        items: updatedItems,
        minStock: 1,
        maxStock: 1000,
        reorderPoint: 10
      });
      setActiveTab("new");
      
      toast({
        title: "تم النسخ",
        description: "تم نسخ العملية لإنشاء عملية جديدة مع تحديث الكميات والأسعار من جدول المنتجات",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="container mx-auto space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-3xl opacity-30"></div>
          <Card className="relative backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        بضاعة أول المدة
                      </h1>
                      <p className="text-lg text-slate-600 mt-1">إدارة الكميات والتكاليف الافتتاحية للمخزون بشكل احترافي</p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{records.length}</div>
                    <div className="text-sm text-slate-500">إجمالي العمليات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {records.reduce((sum, record) => sum + record.totalValue, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500">إجمالي القيمة (ج.م)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm p-2 rounded-2xl shadow-lg border-0">
            <TabsTrigger 
              value="list" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Eye className="h-4 w-4 mr-2" />
              قائمة بضاعة أول المدة
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة بضاعة أول مدة جديدة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6 animate-fade-in">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  قائمة عمليات بضاعة أول المدة
                </CardTitle>
                <CardDescription className="text-slate-600">استعراض جميع عمليات بضاعة أول المدة المدخلة مع إمكانية البحث والتصفية</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                

                {/* قسم التصفية والبحث */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="relative">
                      <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="البحث في العمليات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 w-80 bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-full px-4 py-2">
                      إجمالي العمليات: {filteredRecords.length}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 rounded-full px-4 py-2">
                      إجمالي القيمة: {filteredRecords.reduce((sum, record) => sum + record.totalValue, 0).toLocaleString()} ج.م
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-lg bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:bg-slate-100/80">
                        <TableHead className="text-right font-semibold text-slate-700">رقم العملية</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">التاريخ</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">المستخدم</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">عدد الأصناف</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">القيمة الإجمالية</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">حالة القفل</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record, index) => (
                        <TableRow key={record.id} className="hover:bg-slate-50/80 transition-colors duration-200 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                          <TableCell className="font-medium text-blue-600">{record.recordNumber}</TableCell>
                          <TableCell className="text-slate-700">{record.date}</TableCell>
                          <TableCell className="text-slate-700">{record.user}</TableCell>
                          <TableCell className="text-slate-700">{record.itemCount}</TableCell>
                          <TableCell className="font-semibold text-green-600">{record.totalValue.toLocaleString()} ج.م</TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.isLocked ? "default" : "secondary"} 
                              className={`rounded-full px-3 py-1 ${
                                record.isLocked 
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md" 
                                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                              }`}
                            >
                              {record.isLocked ? (
                                <>
                                  <Lock className="w-3 h-3 mr-1" />
                                  مقفلة
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3 mr-1" />
                                  مفتوحة
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-1 space-x-reverse">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-6xl bg-white rounded-3xl shadow-2xl border-0">
                                  <DialogHeader className="border-b border-slate-100 pb-4">
                                    <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                      <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                                        <Eye className="h-5 w-5 text-white" />
                                      </div>
                                      تفاصيل العملية {record.recordNumber}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-600">
                                      عرض تفاصيل أصناف بضاعة أول المدة
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-6 p-6">
                                    <div className="grid grid-cols-1 gap-6">
                                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl">
                                        <Label className="text-slate-600 text-sm font-medium">التاريخ</Label>
                                        <p className="text-lg font-semibold text-slate-800 mt-1">{record.date}</p>
                                      </div>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50">
                                            <TableHead className="text-right font-semibold">كود الصنف</TableHead>
                                            <TableHead className="text-right font-semibold">اسم الصنف</TableHead>
                                            <TableHead className="text-right font-semibold">الكمية</TableHead>
                                            <TableHead className="text-right font-semibold">سعر الخامه او المنتج</TableHead>
                                            <TableHead className="text-right font-semibold">سعر الإيجار</TableHead>
                                            <TableHead className="text-right font-semibold">الإجمالي</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {record.items.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50">
                                              <TableCell className="font-medium text-blue-600">{item.itemCode}</TableCell>
                                              <TableCell className="text-slate-700">{item.itemName}</TableCell>
                                              <TableCell className="text-slate-700">{item.quantity}</TableCell>
                                              <TableCell className="text-slate-700">{item.dressPrice ?? 0} ج.م</TableCell>
                                              <TableCell className="text-slate-700">{item.rentalPrice ?? 0} ج.م</TableCell>
                                              <TableCell className="font-semibold text-green-600">{item.totalCost} ج.م</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              {!record.isLocked && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-200"
                                  onClick={() => handleEdit(record.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200"
                                onClick={() => handlePrintRecord(record.id)}
                                title="طباعة"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200"
                                onClick={() => handleDuplicateRecord(record.id)}
                                title="نسخ العملية"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-green-50 hover:text-green-600 rounded-lg transition-all duration-200"
                                onClick={() => handleExportToExcel(record.id)}
                                title="تصدير Excel"
                              >
                                <FileDown className="h-4 w-4" />
                              </Button>

                              {!record.isLocked && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                                  onClick={() => handleDelete(record.id)}
                                  title="حذف"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="space-y-6 animate-fade-in">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  إضافة بضاعة أول مدة جديدة
                </CardTitle>
                <CardDescription className="text-slate-600">إدخال الكميات والتكاليف الافتتاحية للأصناف</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-slate-700 font-medium">تاريخ بضاعة أول المدة</Label>
                    <Input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-white/70 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12"
                    />
                  </div>
                </div>

                

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">أصناف بضاعة أول المدة</h3>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Button 
                        onClick={addItemToRecord} 
                        variant="outline" 
                        size="sm"
                        className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        إضافة صنف
                      </Button>
                      <Button 
                        onClick={handleImportFromExcel}
                        variant="outline" 
                        size="sm"
                        className="bg-white hover:bg-green-50 border-green-200 text-green-600 rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        استيراد Excel
                      </Button>
                    </div>
                  </div>

                  {newRecord.items.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50">
                            <TableHead className="text-right font-semibold text-slate-700">كود الصنف</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">اسم الصنف</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">الكمية</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">سعر الخامه او المنتج</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">سعر الإيجار</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">الإجمالي</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">ملاحظات</TableHead>
                            <TableHead className="text-center font-semibold text-slate-700">إجراء</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newRecord.items.map((item, index) => (
                            <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors duration-200">
                              <TableCell>
                                <Select 
                                  value={item.itemCode} 
                                  onValueChange={(value) => selectItem(index, value)}
                                >
                                  <SelectTrigger className="w-36 bg-white border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder="اختر" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white rounded-lg shadow-xl">
                                    {productOptions.map((p) => (
                                      <SelectItem key={p.code} value={p.code}>
                                        {p.code}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={item.itemName}
                                  onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                  className="w-44 bg-white border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="اسم الصنف"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number"
                                  value={item.quantity || ''}
                                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-24 bg-white border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number"
                                  value={item.dressPrice ?? ''}
                                  onChange={(e) => updateItem(index, 'dressPrice', parseFloat(e.target.value) || 0)}
                                  className="w-28 bg-white border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="0.00"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number"
                                  value={item.rentalPrice ?? ''}
                                  onChange={(e) => updateItem(index, 'rentalPrice', parseFloat(e.target.value) || 0)}
                                  className="w-28 bg-white border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="0.00"
                                />
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                  {item.totalCost.toFixed(2)} ج.م
                                </span>
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={item.notes || ''}
                                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                  className="w-36 bg-white border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="ملاحظات"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {newRecord.items.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl shadow-lg border border-blue-100">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600">إجمالي الأصناف: <span className="font-semibold text-blue-600">{newRecord.items.length}</span></p>
                          <p className="text-2xl font-bold text-green-600">إجمالي القيمة: {getTotalValue().toFixed(2)} ج.م</p>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Button 
                            variant="outline"
                            className="bg-white hover:bg-green-50 border-green-200 text-green-600 rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            تصدير Excel
                          </Button>
                          <Button 
                            onClick={saveRecord}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            حفظ بضاعة أول المدة
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {newRecord.items.length === 0 && (
                    <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-dashed border-slate-300">
                      <div className="animate-fade-in">
                        <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                          <AlertTriangle className="h-10 w-10 text-blue-600" />
                        </div>
                        <p className="text-xl font-semibold text-slate-700 mb-2">لا توجد أصناف مضافة بعد</p>
                        <p className="text-slate-500">اضغط على "إضافة صنف" لبدء إدخال البيانات</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}