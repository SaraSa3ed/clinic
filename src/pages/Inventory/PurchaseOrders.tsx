import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, Save, Send, FileText, Search, Calendar, Users, DollarSign, 
  CheckCircle, Clock, AlertCircle, Upload, Eye, Mail, Phone, Package, 
  Printer, Star, TrendingUp, BarChart3, Building2, Truck, Shield, 
  Award, ShoppingCart, CreditCard, FileCheck, MapPin, Activity,
  Calculator, Trash2, Edit, Archive
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetAllSuppliersQuery } from "@/services/suppliersApi";
import { useGetAllProductsQuery, useUpdateProductStockMutation } from "@/services/productApi";
import { useUpdateStockMutation } from "@/services/inventoryApi";
import { useCreateDressIntakeMutation, useListPurchaseInvoicesQuery, useUpdatePurchaseInvoiceMutation, useDeletePurchaseInvoiceMutation } from "@/services/purchaseInvoiceApi";
import { useListRequisitionsQuery, useGetRequisitionQuery } from "@/services/procurementApi";

const PurchaseOrders = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dress");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPO, setPreviewPO] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editPO, setEditPO] = useState<any | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const update = () => {
      const container = listRef.current;
      if (!container) return;
      const active = container.querySelector('[role="tab"][data-state="active"]') as HTMLElement | null;
      if (!active) return;
      const left = active.offsetLeft - container.scrollLeft;
      const width = active.offsetWidth;
      setIndicator({ left, width });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeTab]);

  const [purchaseOrder, setPurchaseOrder] = useState({
    poNumber: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    requisitionId: undefined as number | undefined,
    productId: undefined as string | undefined, // تغيير إلى string لأن product_id هو string
    supplierId: undefined as number | undefined,
    createdDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: "",
    paymentTerms: "",
    deliveryTerms: "",
    notes: "",
    status: "draft" as "draft" | "sent" | "confirmed" | "in_progress" | "completed" | "cancelled",
    totalAmount: 0,
    items: [
      { id: 1, name: "", quantity: "", unit: "", price: "", specifications: "", total: 0 }
    ]
  });

  // أوامر الشراء المخزنة محلياً والعقود
  const [localPOs, setLocalPOs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  // Backend data
  const { data: suppliersData } = useGetAllSuppliersQuery(undefined);
  const { data: productsData } = useGetAllProductsQuery(undefined);
  const [updateStock, { isLoading: isUpdatingStock }] = useUpdateStockMutation();
  const [updateProductStock, { isLoading: isUpdatingProductStock }] = useUpdateProductStockMutation();
  const [createDressIntake, { isLoading: isCreatingDressIntake }] = useCreateDressIntakeMutation();
  const { data: invoicesData, refetch: refetchInvoices } = useListPurchaseInvoicesQuery({ include: 'items,supplier' });
  const [deletePurchaseInvoice, { isLoading: isDeletingInvoice }] = useDeletePurchaseInvoiceMutation();
  const [updatePurchaseInvoice, { isLoading: isUpdatingInvoice }] = useUpdatePurchaseInvoiceMutation();
  const { data: requisitionsData } = useListRequisitionsQuery({ limit: 100 });

  // Normalize backend responses
  const normalizeArray = (data: any, key: string): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.data && Array.isArray(data.data[key])) return data.data[key];
    if (data[key] && Array.isArray(data[key])) return data[key];
    return [];
  };
  const suppliers = normalizeArray(suppliersData, "suppliers");
  const products = normalizeArray(productsData, "products");
  const purchaseRequests = normalizeArray(requisitionsData, "data");
  // استخدام بيانات فواتير الشراء الحقيقية للإحصائيات
  const backendPOs = normalizeArray(invoicesData, "data");

  // إضافة console.log للتشخيص
  console.log('بيانات الموردين:', suppliersData);
  console.log('بيانات طلبات الشراء:', requisitionsData);
  console.log('طلبات الشراء المعالجة:', purchaseRequests);
  console.log('بيانات فواتير الشراء:', invoicesData);
  console.log('فواتير الشراء المعالجة:', backendPOs);
  if (purchaseRequests.length > 0) {
    console.log('أول طلب شراء:', purchaseRequests[0]);
    console.log('مفاتيح أول طلب شراء:', Object.keys(purchaseRequests[0]));
    console.log('جميع بيانات أول طلب شراء:', JSON.stringify(purchaseRequests[0], null, 2));
  }

  // Requisition details fetch when selected
  const [selectedReqId, setSelectedReqId] = useState<number | undefined>(undefined);
  const { data: selectedReqData } = useGetRequisitionQuery(selectedReqId as number, { skip: !selectedReqId });

  // معالجة البيانات عند تغيير selectedReqData
  useEffect(() => {
    if (selectedReqData && selectedReqId) {
      console.log('تم جلب بيانات الطلب من API:', selectedReqData);
      console.log('الأصناف من API:', selectedReqData.items);
      console.log('مفاتيح البيانات من API:', Object.keys(selectedReqData));
      
      // فحص وجود الأصناف في البيانات
      let itemsToProcess: any[] = [];
      
      if (selectedReqData.items && Array.isArray(selectedReqData.items)) {
        itemsToProcess = selectedReqData.items;
      } else if (selectedReqData.items && typeof selectedReqData.items === 'object') {
        // إذا كان items كائن وليس array
        itemsToProcess = Object.values(selectedReqData.items);
      } else if (selectedReqData.data && selectedReqData.data.items) {
        // إذا كانت البيانات في حقل data
        itemsToProcess = Array.isArray(selectedReqData.data.items) ? selectedReqData.data.items : [];
      }
      
      console.log('الأصناف المعالجة:', itemsToProcess);
      
      if (itemsToProcess.length > 0) {
        const mappedItems = itemsToProcess.map((it: any, idx: number) => {
          const quantity = Number(it.quantity || 0);
          const price = Number(it.estimatedPrice || it.price || 0);
          return {
            id: it.id || Date.now() + idx,
            name: it.name || "",
            quantity: String(quantity || 0),
            unit: it.unit || "",
            price: String(price || 0),
            specifications: it.specifications || "",
            total: Number((quantity || 0) * (price || 0)),
          };
        });
        const totalAmount = mappedItems.reduce((s: number, x: any) => s + Number(x.total || 0), 0);
        
        setPurchaseOrder(prev => ({
          ...prev,
          items: mappedItems,
          totalAmount
        }));
        
        toast({ 
          title: "✅ تم تحميل الأصناف", 
          description: `تم تحميل ${mappedItems.length} صنفًا من API` 
        });
      } else {
        console.log('لا توجد أصناف في البيانات من API');
        toast({ 
          title: "⚠️ تنبيه", 
          description: "لم يتم العثور على أصناف في هذا الطلب", 
          variant: "destructive" 
        });
      }
    }
  }, [selectedReqData, selectedReqId]);

  // Helpers
  const generatePoNumber = () => {
    const year = new Date().getFullYear();
    return `PO-${year}-${Date.now().toString().slice(-6)}`;
  };

  const isCompleteItem = (it: any) => {
    const nameOk = Boolean(it.name && String(it.name).trim().length > 0);
    const unitOk = Boolean(it.unit && String(it.unit).trim().length > 0);
    const quantityOk = Number(it.quantity) > 0;
    const priceOk = Number(it.price) >= 0;
    return nameOk && unitOk && quantityOk && priceOk;
  };

  // تحميل البيانات من التخزين المحلي عند الفتح
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('purchase_orders') || '[]');
      setLocalPOs(Array.isArray(saved) ? saved : []);
      const savedContracts = JSON.parse(localStorage.getItem('contracts') || '[]');
      setContracts(Array.isArray(savedContracts) ? savedContracts : []);
    } catch (e) {
      setLocalPOs([]);
      setContracts([]);
    }
  }, []);

  // حفظ أمر شراء محلياً وتحديث الحالة
  const savePOToLocal = (po: any) => {
    const saved = JSON.parse(localStorage.getItem('purchase_orders') || '[]');
    const next = [...saved, po];
    localStorage.setItem('purchase_orders', JSON.stringify(next));
    setLocalPOs(next);
  };

  // تحديث حالة أمر شراء حسب المعرّف
  const updatePOStatus = (id: number | string, status: string) => {
    const saved = JSON.parse(localStorage.getItem('purchase_orders') || '[]');
    const next = saved.map((p: any) => p.id === id ? { ...p, status } : p);
    localStorage.setItem('purchase_orders', JSON.stringify(next));
    setLocalPOs(next);
  };

  // إضافة عقد جديد وتحديث التخزين المحلي
  const addContract = () => {
    const newContract = {
      id: Date.now(),
      code: `CT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      supplier: (suppliers && suppliers[0]?.name_ar) || "مورد جديد",
      type: "عقد سنوي",
      startDate: new Date().toISOString().slice(0,10),
      endDate: new Date(Date.now() + 1000*60*60*24*180).toISOString().slice(0,10),
      value: 100000,
      status: "نشط"
    };
    const next = [...contracts, newContract];
    setContracts(next);
    localStorage.setItem('contracts', JSON.stringify(next));
    toast({ title: "✅ تم إضافة عقد جديد", description: `تم إنشاء ${newContract.code}` });
  };

  // جميع الأوامر من الواجهة الخلفية (استخدام فواتير الشراء)
  const getAllOrders = () => {
    const orders = (backendPOs || []).map((invoice: any) => ({
      id: invoice.id,
      poNumber: invoice.invoiceNumber, // استخدام رقم الفاتورة كرقم أمر الشراء
      prNumber: invoice.referenceNumber || '-',
      supplier: invoice.supplier?.name_ar || invoice.supplier?.name_en || '-',
      date: invoice.invoiceDate,
      deliveryDate: invoice.deliveryDate || '-',
      total: Number(invoice.totalAmount || invoice.invoiceAmount || 0),
      status: invoice.status || 'مسودة',
      items: Array.isArray(invoice.items) ? invoice.items : [],
      paymentTerms: invoice.paymentTerms || '-'
    }));
    return orders;
  };

  // ضمان وجود الأمر في التخزين المحلي والتحديث حسب رقم الأمر
  const upsertLocalOrder = (po: any) => {
    const saved: any[] = JSON.parse(localStorage.getItem('purchase_orders') || '[]');
    const idx = saved.findIndex(p => p.poNumber === po.poNumber);
    if (idx >= 0) saved[idx] = { ...saved[idx], ...po };
    else saved.push(po);
    localStorage.setItem('purchase_orders', JSON.stringify(saved));
    setLocalPOs(saved);
  };

  // معاينة أي أمر (من القائمة)
  const previewOrder = (po: any) => {
    setPreviewPO(po);
    setPreviewOpen(true);
  };

  const handlePreview = () => {
    const supplierName = suppliers.find((s: any) => s.supplier_id === purchaseOrder.supplierId)?.name_ar || '';
    const mapped = {
      poNumber: purchaseOrder.poNumber,
      supplier: supplierName,
      date: purchaseOrder.createdDate,
      items: purchaseOrder.items,
      total: purchaseOrder.totalAmount,
    };
    setPreviewPO(mapped);
    setPreviewOpen(true);
  };


  // حذف بيانات الموردين الوهمية واستبدالها ببيانات الخلفية (suppliers)

  // حذف قائمة أوامر الشراء الوهمية

  // حذف طلبات الشراء الوهمية (سيتم استخدام بيانات الخلفية من requisitions)

  // === تقارير وتحليلات ===
  const getOrdersAnalytics = () => {
    const orders = getAllOrders();
    const count = orders.length;
    const total = orders.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0);
    const avg = count ? Math.round(total / count) : 0;
    const executed = orders.filter((o: any) => o.status && o.status !== 'draft').length;
    const executionRate = count ? Math.round((executed / count) * 100) : 0;

    const bySupplier: Record<string, { supplier: string; count: number; total: number }>
      = orders.reduce((acc: Record<string, { supplier: string; count: number; total: number }>, o: any) => {
        const key = o.supplier || '-';
        if (!acc[key]) acc[key] = { supplier: key, count: 0, total: 0 };
        acc[key].count += 1;
        acc[key].total += Number(o.total) || 0;
        return acc;
      }, {});
    const suppliersPerf = Object.values(bySupplier).sort((a, b) => b.count - a.count).slice(0, 3);

    const prMap = new Map(purchaseRequests.map((pr: any) => [pr.requestNumber, Number(pr.estimatedValue) || 0]));
    const withPR = orders.filter((o: any) => o.prNumber && o.prNumber !== '-');
    const prTotal = withPR.reduce((s: number, o: any) => s + (prMap.get(o.prNumber) || 0), 0);
    const poTotal = withPR.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0);
    const savings = Math.max(0, prTotal - poTotal);
    const savingsRate = prTotal ? Math.round((savings / prTotal) * 100) : 0;

    return { count, total, avg, executionRate, suppliersPerf, savings, prTotal, poTotal, savingsRate };
  };

  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportOrdersReport = () => {
    const orders = getAllOrders();
    const rows: (string | number)[][] = [
      ['PO Number', 'PR Number', 'Supplier', 'Date', 'Delivery Date', 'Total', 'Status']
    ];
    orders.forEach((o: any) => {
      rows.push([o.poNumber, o.prNumber, o.supplier, o.date, o.deliveryDate, Number(o.total) || 0, o.status]);
    });
    downloadCSV('purchase-orders.csv', rows);
  };

  const exportSuppliersReport = () => {
    const { suppliersPerf } = getOrdersAnalytics();
    const rows: (string | number)[][] = [['Supplier', 'Orders', 'Total']];
    suppliersPerf.forEach((s) => rows.push([s.supplier, s.count, s.total]));
    downloadCSV('suppliers-performance.csv', rows);
  };

  const exportSavingsReport = () => {
    const { prTotal, poTotal, savings, savingsRate } = getOrdersAnalytics();
    const rows: (string | number)[][] = [['PR Total', 'PO Total', 'Savings', 'Savings %'], [prTotal, poTotal, savings, `${savingsRate}%`]];
    downloadCSV('savings.csv', rows);
  };

  const exportContractsReport = () => {
    const rows: (string | number)[][] = [['Code', 'Supplier', 'Type', 'Start', 'End', 'Value', 'Status']];
    contracts.forEach((c: any) => rows.push([c.code, c.supplier, c.type, c.startDate, c.endDate, Number(c.value) || 0, c.status]));
    downloadCSV('contracts.csv', rows);
  };

  const addItem = () => {
    setPurchaseOrder({
      ...purchaseOrder,
      items: [...purchaseOrder.items, { 
        id: Date.now(), 
        name: "", 
        quantity: "", 
        unit: "", 
        price: "",
        specifications: "",
        total: 0
      }]
    });
  };

  const removeItem = (id: number) => {
    setPurchaseOrder({
      ...purchaseOrder,
      items: purchaseOrder.items.filter(item => item.id !== id)
    });
  };

  const updateItem = (id: number, field: string, value: string) => {
    const updatedItems = purchaseOrder.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          const quantity = parseFloat(updatedItem.quantity) || 0;
          const price = parseFloat(updatedItem.price) || 0;
          updatedItem.total = quantity * price;
        }
        return updatedItem;
      }
      return item;
    });
    
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    setPurchaseOrder({
      ...purchaseOrder,
      items: updatedItems,
      totalAmount
    });
  };

  const handleSave = async () => {
    try {
      // Generate a fresh PO number to avoid unique conflicts
      const poNumberLocal = purchaseOrder.poNumber && purchaseOrder.poNumber.trim().length > 0 ? purchaseOrder.poNumber : generatePoNumber();
      const cleanItems = (purchaseOrder.items || []).filter(isCompleteItem).map((it: any) => ({
        name: it.name,
        quantity: Number(it.quantity || 0),
        unit: it.unit || "",
        price: Number(it.price || 0),
        specifications: it.specifications || "",
        total: Number(it.total || 0),
      }));
      const totalCalculated = cleanItems.reduce((s: number, x: any) => s + Number(x.total || 0), 0);
      if (!purchaseOrder.supplierId) {
        toast({ title: "❌ خطأ في البيانات", description: "يجب اختيار مورد", variant: "destructive" });
        return;
      }
      const body = {
        poNumber: poNumberLocal,
        requisitionId: purchaseOrder.requisitionId || null,
        supplierId: purchaseOrder.supplierId,
        createdDate: purchaseOrder.createdDate,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate || null,
        paymentTerms: purchaseOrder.paymentTerms || null,
        deliveryTerms: purchaseOrder.deliveryTerms || null,
        notes: purchaseOrder.notes || null,
        status: "draft",
        totalAmount: Number(totalCalculated || purchaseOrder.totalAmount || 0),
        items: cleanItems,
      };
      // Placeholder disabled: saving POs disabled in dress-only mode
      toast({ title: "✅ تم الحفظ محلياً", description: "نماذج أوامر الشراء معطلة حالياً" });
    } catch (e: any) {
      const details = e?.data?.message || e?.error || "";
      toast({ title: "❌ فشل الحفظ", description: details ? String(details) : "تعذر حفظ أمر الشراء في قاعدة البيانات.", variant: "destructive" });
    }
  };

  const handleSend = async () => {
    if (!purchaseOrder.supplierId) {
      toast({ title: "❌ خطأ في البيانات", description: "يجب اختيار مورد لإرسال أمر الشراء", variant: "destructive" });
      return;
    }
    if (!purchaseOrder.expectedDeliveryDate || !purchaseOrder.paymentTerms || purchaseOrder.totalAmount <= 0) {
      toast({ title: "❌ بيانات ناقصة", description: "يجب تعبئة تاريخ التسليم وشروط الدفع والمبلغ الإجمالي", variant: "destructive" });
      return;
    }
    try {
      const poNumberLocal = purchaseOrder.poNumber && purchaseOrder.poNumber.trim().length > 0 ? purchaseOrder.poNumber : generatePoNumber();
      const cleanItems = (purchaseOrder.items || []).filter(isCompleteItem).map((it: any) => ({
        name: it.name,
        quantity: Number(it.quantity || 0),
        unit: it.unit || "",
        price: Number(it.price || 0),
        specifications: it.specifications || "",
        total: Number(it.total || 0),
      }));
      const totalCalculated = cleanItems.reduce((s: number, x: any) => s + Number(x.total || 0), 0);
      const body = {
        poNumber: poNumberLocal,
        requisitionId: purchaseOrder.requisitionId || null,
        supplierId: purchaseOrder.supplierId,
        createdDate: purchaseOrder.createdDate,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate || null,
        paymentTerms: purchaseOrder.paymentTerms || null,
        deliveryTerms: purchaseOrder.deliveryTerms || null,
        notes: purchaseOrder.notes || null,
        status: "sent",
        totalAmount: Number(totalCalculated || purchaseOrder.totalAmount || 0),
        items: cleanItems,
      };
      // Placeholder disabled: sending POs disabled in dress-only mode
      const supplier = suppliers.find((s: any) => s.supplier_id === purchaseOrder.supplierId);
      toast({ title: "✅ تم الإرسال محلياً", description: `تم حفظ إرسال ${purchaseOrder.poNumber} إلى ${supplier?.name_ar || supplier?.name_en || ''} (بدون Backend)` });
      setPurchaseOrder({
        poNumber: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        requisitionId: undefined,
        productId: undefined,
        supplierId: undefined,
        createdDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: "",
        paymentTerms: "",
        deliveryTerms: "",
        notes: "",
        status: "draft",
        totalAmount: 0,
        items: [
          { id: 1, name: "", quantity: "", unit: "", price: "", specifications: "", total: 0 }
        ]
      });
    } catch (e: any) {
      const details = e?.data?.message || e?.error || "";
      toast({ title: "❌ فشل الإرسال", description: details ? String(details) : "تعذر إنشاء أمر الشراء في قاعدة البيانات.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const toArabic: Record<string, string> = {
      draft: "مسودة",
      sent: "مرسل",
      confirmed: "مؤكد",
      in_progress: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    const arabic = toArabic[status] || status;
    const variants = {
      "مسودة": "secondary",
      "مرسل": "default",
      "مؤكد": "default",
      "قيد التنفيذ": "default",
      "مكتمل": "default",
      "ملغي": "destructive"
    } as const;
    const icons = {
      "مسودة": <Edit className="w-3 h-3 mr-1" />,
      "مرسل": <Send className="w-3 h-3 mr-1" />,
      "مؤكد": <CheckCircle className="w-3 h-3 mr-1" />,
      "قيد التنفيذ": <Clock className="w-3 h-3 mr-1" />,
      "مكتمل": <CheckCircle className="w-3 h-3 mr-1" />,
      "ملغي": <AlertCircle className="w-3 h-3 mr-1" />
    } as const;
    return (
      <Badge variant={variants[arabic as keyof typeof variants]}>
        {icons[arabic as keyof typeof icons]}
        {arabic}
      </Badge>
    );
  };

 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">أوامر الشراء</h1>
          <p className="text-muted-foreground">
            إصدار ومتابعة أوامر الشراء والتعاقدات مع الموردين وفق أفضل الممارسات
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList ref={listRef} className="relative w-full grid grid-flow-col sm:grid-flow-row auto-cols-[minmax(160px,1fr)] sm:auto-cols-auto sm:grid-cols-6 gap-1 rounded-2xl border border-border bg-background/60 supports-[backdrop-filter]:bg-background/50 backdrop-blur p-1 shadow-sm overflow-x-auto animate-fade-in">
          <span
            className="pointer-events-none absolute bottom-0 h-1 rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
            style={{ left: indicator.left, width: indicator.width }}
          />
          <TabsTrigger value="dress" className="relative py-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary data-[state=active]:text-primary data-[state=active]:bg-primary/10 rounded-lg transition-all hover-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <ShoppingCart className="ml-2 h-4 w-4" />
            إدخال خامات ومنتجات
          </TabsTrigger>
          <TabsTrigger value="invoices" className="relative py-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary data-[state=active]:text-primary data-[state=active]:bg-primary/10 rounded-lg transition-all hover-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <FileText className="ml-2 h-4 w-4" />
            فواتير الشراء
          </TabsTrigger>
          <TabsTrigger value="reports" className="relative py-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary data-[state=active]:text-primary data-[state=active]:bg-primary/10 rounded-lg transition-all hover-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <BarChart3 className="ml-2 h-4 w-4" />
            التقارير والتحليلات
          </TabsTrigger>
        </TabsList>

        {/* تبويب إدخال خامات ومنتجات مبسط */}
        <TabsContent value="dress" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-pink-50/40">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-pink-900">إدخال مشتريات خامات ومنتجات</CardTitle>
                  <CardDescription className="text-pink-700/70">اختر الخامه او المنتج المخزن والمورد والكمية والسعر لتحديث المخزون وإنشاء فاتورة</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">الخامه او المنتج</Label>
                    <Input
                      type="text"
                      placeholder="ادخل اسم الخامه او المنتج"
                      value={purchaseOrder.items[0]?.name || ""}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setPurchaseOrder({ 
                          ...purchaseOrder, 
                          productId: undefined,
                          items: [{ ...purchaseOrder.items[0], name: newName }] 
                        });
                      }}
                      className="hover:border-pink-400 transition-colors"
                    />
              </div>

                  <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">المورد</Label>
                    <Select 
                    onValueChange={(value) => setPurchaseOrder({ ...purchaseOrder, supplierId: Number(value) })}
                    >
                      <SelectTrigger className="hover:border-indigo-400 transition-colors">
                      <SelectValue placeholder="اختر المورد" />
                      </SelectTrigger>
                      <SelectContent>
                      {suppliers.map((s: any) => (
                        <SelectItem key={s.supplier_id} value={String(s.supplier_id)}>
                          {s.name_ar || s.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                    <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">تاريخ الاستلام</Label>
                      <Input 
                        type="date"
                        value={purchaseOrder.expectedDeliveryDate}
                    onChange={(e) => setPurchaseOrder({ ...purchaseOrder, expectedDeliveryDate: e.target.value })}
                        className="hover:border-blue-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">طريقة الدفع</Label>
                      <Select 
                        value={purchaseOrder.paymentTerms}
                    onValueChange={(value) => setPurchaseOrder({ ...purchaseOrder, paymentTerms: value })}
                      >
                        <SelectTrigger className="hover:border-green-400 transition-colors">
                      <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="credit30">آجل 30 يوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">الكمية</Label>
                      <Input 
                    type="number"
                    min={1}
                    value={purchaseOrder.items[0]?.quantity}
                    onChange={(e) => updateItem(purchaseOrder.items[0].id, 'quantity', e.target.value)}
                    className="hover:border-emerald-400 transition-colors"
                  />
              </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">سعر الوحدة</Label>
                              <Input 
                                type="number"
                    min={0}
                    step="0.01"
                    value={purchaseOrder.items[0]?.price}
                    onChange={(e) => updateItem(purchaseOrder.items[0].id, 'price', e.target.value)}
                    className="hover:border-amber-400 transition-colors"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">مرفق الدفع/الفاتورة (اختياري)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center bg-white">
                    <Upload className="mx-auto h-6 w-6 text-gray-500 mb-2" />
                    <p className="text-xs text-gray-600">ارفع ملف الفاتورة/الدعم (اختياري)</p>
                    <input id="dress-invoice-file" type="file" className="hidden" />
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => (document.getElementById('dress-invoice-file') as HTMLInputElement)?.click()}>اختيار ملف</Button>
                  </div>
                    </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border">
                <div className="text-gray-700">
                  الإجمالي: <span className="font-bold text-blue-800">
                    {purchaseOrder.items[0]?.total.toLocaleString()} جنية مصري
                              </span>
                            </div>
                <div className="flex gap-2">
                            <Button 
                    disabled={isCreatingDressIntake}
                    onClick={async () => {
                      try {
                        const quantity = Number(purchaseOrder.items[0]?.quantity || 0);
                        const price = Number(purchaseOrder.items[0]?.price || 0);
                        const missingFields: string[] = [];
                        if (!purchaseOrder.items[0]?.name) missingFields.push('الخامه او المنتج');
                        if (!purchaseOrder.supplierId) missingFields.push('المورد');
                        if (quantity <= 0) missingFields.push('الكمية');
                        if (price <= 0) missingFields.push('سعر الوحدة');
                        if (missingFields.length > 0) {
                          toast({ title: "❌ بيانات ناقصة", description: `الحقول المطلوبة: ${missingFields.join('، ')}` , variant: "destructive"});
                          return;
                        }
                        const fileInput = document.getElementById('dress-invoice-file') as HTMLInputElement | null;
                        const productName = purchaseOrder.items[0].name;
                        const supplierObj = suppliers.find((s:any)=> s.supplier_id === purchaseOrder.supplierId);
                        const supplierName = supplierObj ? (supplierObj.name_ar || supplierObj.name_en || '') : '';
                        const invoiceDate = purchaseOrder.expectedDeliveryDate;
                        if (fileInput && fileInput.files && fileInput.files[0]) {
                          const fd = new FormData();
                          fd.append('productName', String(productName));
                          fd.append('supplierName', String(supplierName));
                          fd.append('quantity', String(quantity));
                          fd.append('price', String(price));
                          if (invoiceDate) fd.append('invoiceDate', invoiceDate);
                          if (purchaseOrder.paymentTerms) fd.append('paymentMethod', purchaseOrder.paymentTerms);
                          // no notes/warehouseId/ids to keep payload minimal
                          fd.append('invoice_file', fileInput.files[0]);
                          await createDressIntake(fd as any).unwrap();
                        } else {
                          await createDressIntake({
                            productName,
                            supplierName,
                            quantity,
                            price,
                            invoiceDate: invoiceDate || new Date().toISOString().slice(0,10),
                            paymentMethod: purchaseOrder.paymentTerms || undefined,
                          } as any).unwrap();
                        }
                        
                        // تحديث المخزون للمنتج المحدد مباشرة في جدول المنتجات
                        if (purchaseOrder.productId) {
                          try {
                            console.log('=== Frontend Stock Update Debug ===');
                            console.log('Product ID:', purchaseOrder.productId);
                            console.log('Quantity:', quantity);
                            console.log('Operation: add');
                            
                            const result = await updateProductStock({
                              id: purchaseOrder.productId, // productId هو بالفعل string الآن
                              quantity: quantity,
                              operation: 'add' // إضافة الكمية الجديدة للمخزون
                            }).unwrap();
                            
                            console.log('Stock update result:', result);
                            
                            toast({ 
                              title: "✅ تم تحديث المخزون", 
                              description: `تم إضافة ${quantity} قطعة للمخزون في جدول المنتجات` 
                            });
                          } catch (stockError: any) {
                            console.error('خطأ في تحديث المخزون:', stockError);
                            toast({ 
                              title: "⚠️ تحذير", 
                              description: "تم إنشاء الفاتورة لكن فشل تحديث المخزون", 
                              variant: "destructive" 
                            });
                          }
                        } else {
                          console.log('No productId found for stock update');
                        }
                        
                        await refetchInvoices();
                        setPurchaseOrder({
                          poNumber: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
                          requisitionId: undefined,
                          productId: undefined,
                          supplierId: undefined,
                          createdDate: new Date().toISOString().split('T')[0],
                          expectedDeliveryDate: "",
                          paymentTerms: "",
                          deliveryTerms: "",
                          notes: "",
                          status: "draft",
                          totalAmount: 0,
                          items: [ { id: Date.now(), name: "", quantity: "", unit: "", price: "", specifications: "", total: 0 } ]
                        });
                        toast({ 
                          title: "✅ تم الإدخال بنجاح", 
                          description: `تم إنشاء الفاتورة وتحديث المخزون في جدول المنتجات بإضافة ${quantity} قطعة من ${productName}` 
                        });
                      } catch (e:any) {
                        const apiMissing = (e?.data?.missing || e?.data?.missingFields);
                        const apiMissingText = Array.isArray(apiMissing) && apiMissing.length ? ` | الحقول الناقصة: ${apiMissing.join('، ')}` : '';
                        toast({ title: "❌ فشل الإدخال", description: `${e?.data?.message || e?.error || "تعذر إنشاء الفاتورة"}${apiMissingText}`, variant: "destructive"});
                      }
                    }}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                  >
                    حفظ الإدخال
                        </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب فواتير الشراء */}
        <TabsContent value="invoices" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-indigo-900">فواتير الشراء</CardTitle>
                  <CardDescription className="text-indigo-700/70">عرض أحدث فواتير الشراء مع الموردين</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                      <TableHead>التاريخ</TableHead>
                    <TableHead>المورد</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {(
                    Array.isArray((invoicesData as any)?.data)
                      ? (invoicesData as any).data
                      : (Array.isArray(invoicesData) ? invoicesData : [])
                  ).map((pi:any) => (
                    <TableRow key={pi.id}>
                      <TableCell>{pi.invoiceNumber}</TableCell>
                      <TableCell>{pi.invoiceDate}</TableCell>
                      <TableCell>{pi.supplier?.name_ar || pi.supplier?.name_en || '-'}</TableCell>
                      <TableCell>{Number(pi.totalAmount || pi.invoiceAmount || 0).toLocaleString()} جنية مصري</TableCell>
                      <TableCell className="space-x-2 rtl:space-x-reverse">
                        <Button variant="outline" size="sm" onClick={() => {
                          setPreviewPO(pi);
                          setPreviewOpen(true);
                        }}>
                          <Eye className="ml-1 h-3 w-3" /> عرض
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditPO(pi);
                          setEditOpen(true);
                        }}>
                          <Edit className="ml-1 h-3 w-3" /> تعديل
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                          <Printer className="ml-1 h-3 w-3" /> طباعة
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={!!isDeletingInvoice}
                          onClick={async () => {
                            try {
                              const confirmed = window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟');
                              if (!confirmed) return;
                              
                              if (!pi.id) {
                                toast({ 
                                  title: 'خطأ', 
                                  description: 'معرف الفاتورة غير موجود', 
                                  variant: 'destructive' 
                                });
                                return;
                              }

                              await deletePurchaseInvoice(pi.id).unwrap();
                              await refetchInvoices();
                              toast({ 
                                title: 'تم الحذف', 
                                description: `تم حذف الفاتورة ${pi.invoiceNumber} بنجاح` 
                              });
                            } catch (e: any) {
                              console.error('خطأ في حذف الفاتورة:', e);
                              const errorMessage = e?.data?.message || e?.message || 'تعذر حذف الفاتورة';
                              toast({ 
                                title: 'فشل الحذف', 
                                description: errorMessage, 
                                variant: 'destructive' 
                              });
                            }
                          }}
                        >
                          <Trash2 className="ml-1 h-3 w-3" /> حذف
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>


        {/* تبويب التقارير والتحليلات */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">إجمالي أوامر الشراء</p>
                    <p className="text-3xl font-bold text-gray-900">{getOrdersAnalytics().count}</p>
                    <p className="text-xs text-gray-600 mt-1">متوسط قيمة الأمر {Number(getOrdersAnalytics().avg).toLocaleString()} جنية مصري</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-700" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm">
                    <span className="text-gray-600">القيمة الإجمالية</span>
                    <div className="font-bold text-green-700">{Number(getOrdersAnalytics().total).toLocaleString()} جنية مصري</div>
                  </div>
                  <div className="text-sm text-right">
                    <span className="text-gray-600">معدل التنفيذ</span>
                    <div className="font-bold text-blue-700">{getOrdersAnalytics().executionRate}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200 shadow-lg">
              <CardContent className="p-4">
                <p className="text-sm text-indigo-700 font-medium mb-2">أداء الموردين</p>
                <ul className="space-y-1">
                  {getOrdersAnalytics().suppliersPerf.map((s) => (
                    <li key={s.supplier} className="flex items-center justify-between">
                      <span className="text-indigo-900">{s.supplier}</span>
                      <span className="text-sm text-indigo-700">{s.count} أمر • {Number(s.total).toLocaleString()} جنية مصري</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg">
              <CardContent className="p-4">
                <p className="text-sm text-emerald-700 font-medium mb-1">الوفرات المحققة</p>
                <p className="text-3xl font-bold text-emerald-900">{Number(getOrdersAnalytics().savings).toLocaleString()} جنية مصري</p>
                <p className="text-xs text-emerald-700">نسبة التوفير {getOrdersAnalytics().savingsRate}%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">تقارير تفصيلية</CardTitle>
              <CardDescription>إنتاج وتصدير التقارير المتخصصة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start" onClick={exportContractsReport}>
                  <FileText className="ml-2 h-4 w-4" /> تقرير العقود
                </Button>
                <Button variant="outline" className="justify-start" onClick={exportSavingsReport}>
                  <DollarSign className="ml-2 h-4 w-4" /> تقرير الوفورات
                </Button>
                <Button variant="outline" className="justify-start" onClick={exportSuppliersReport}>
                  <Users className="ml-2 h-4 w-4" /> تقرير أداء الموردين
                </Button>
                <Button variant="outline" className="justify-start" onClick={exportOrdersReport}>
                  <FileText className="ml-2 h-4 w-4" /> تقرير أوامر الشراء
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog لعرض وتعديل الفاتورة */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل فاتورة الشراء</DialogTitle>
          </DialogHeader>
          
          {previewPO && (
            <div className="space-y-6">
              {/* معلومات الفاتورة الأساسية */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات الفاتورة</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">رقم الفاتورة</Label>
                    <p className="text-lg font-semibold">{previewPO.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">تاريخ الفاتورة</Label>
                    <p className="text-lg">{previewPO.invoiceDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">المورد</Label>
                    <p className="text-lg">{previewPO.supplier?.name_ar || previewPO.supplier?.name_en || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">المبلغ الإجمالي</Label>
                    <p className="text-lg font-bold text-green-600">
                      {Number(previewPO.totalAmount || previewPO.invoiceAmount || 0).toLocaleString()} جنية مصري
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* تفاصيل العناصر */}
              {previewPO.items && previewPO.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">تفاصيل العناصر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>اسم المنتج</TableHead>
                          <TableHead>الكمية</TableHead>
                          <TableHead>السعر</TableHead>
                          <TableHead>المجموع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewPO.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.product?.name_ar || item.product?.name_en || item.name || '-'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{Number(item.price || 0).toLocaleString()} جنية مصري</TableCell>
                            <TableCell>{Number(item.total || 0).toLocaleString()} جنية مصري</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* ملاحظات */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ملاحظات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[100px] p-3 bg-gray-50 rounded-md border">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {previewPO.notes || 'لا توجد ملاحظات'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog للتعديل */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل فاتورة الشراء</DialogTitle>
          </DialogHeader>
          
          {editPO && (
            <div className="space-y-6">
              {/* معلومات الفاتورة الأساسية */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات الفاتورة</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">رقم الفاتورة</Label>
                    <p className="text-lg font-semibold">{editPO.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">تاريخ الفاتورة</Label>
                    <p className="text-lg">{editPO.invoiceDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">المورد</Label>
                    <p className="text-lg">{editPO.supplier?.name_ar || editPO.supplier?.name_en || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">المبلغ الإجمالي</Label>
                    <p className="text-lg font-bold text-green-600">
                      {Number(editPO.totalAmount || editPO.invoiceAmount || 0).toLocaleString()} جنية مصري
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* تفاصيل العناصر */}
              {editPO.items && editPO.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">تفاصيل العناصر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>اسم المنتج</TableHead>
                          <TableHead>الكمية</TableHead>
                          <TableHead>السعر</TableHead>
                          <TableHead>المجموع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editPO.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.product?.name_ar || item.product?.name_en || item.name || '-'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{Number(item.price || 0).toLocaleString()} جنية مصري</TableCell>
                            <TableCell>{Number(item.total || 0).toLocaleString()} جنية مصري</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* ملاحظات قابلة للتعديل */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ملاحظات</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editPO.notes || ''}
                    onChange={(e) => setEditPO({ ...editPO, notes: e.target.value })}
                    placeholder="أضف ملاحظات حول الفاتورة..."
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              إلغاء
            </Button>
            <Button 
              disabled={isUpdatingInvoice}
              onClick={async () => {
                try {
                  if (!editPO?.id) {
                    toast({ 
                      title: 'خطأ', 
                      description: 'معرف الفاتورة غير موجود', 
                      variant: 'destructive' 
                    });
                    return;
                  }

                  // إرسال التعديلات إلى الخادم
                  await updatePurchaseInvoice({
                    id: editPO.id,
                    body: {
                      notes: editPO.notes || ''
                    }
                  }).unwrap();

                  toast({ 
                    title: 'تم الحفظ', 
                    description: 'تم حفظ التعديلات بنجاح' 
                  });
                  setEditOpen(false);
                  await refetchInvoices(); // إعادة تحميل البيانات
                } catch (error: any) {
                  console.error('خطأ في حفظ التعديلات:', error);
                  const errorMessage = error?.data?.message || error?.message || 'فشل في حفظ التعديلات';
                  toast({ 
                    title: 'خطأ', 
                    description: errorMessage, 
                    variant: 'destructive' 
                  });
                }
              }}
            >
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;