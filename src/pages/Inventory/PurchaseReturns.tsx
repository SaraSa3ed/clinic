import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedStatsCard } from "@/components/ui/enhanced-stats-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Package, Search, Calendar, DollarSign, CheckCircle, Clock, 
  AlertCircle, Upload, Download, Edit, Eye, ArrowLeft, Building2,
  Camera, Mail, Phone, FileText, Filter, Printer, Star, TrendingUp,
  BarChart3, Bell, Shield, Zap, RefreshCw, X, Check, AlertTriangle,
  Receipt, Banknote, Calculator, FileCheck, Users, Settings, Undo2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useListPurchaseReturnsQuery, useCreatePurchaseReturnMutation, useUpdatePurchaseReturnMutation } from "@/services/purchaseReturnsApi";
import { useListPurchaseOrdersQuery } from "@/services/purchaseOrdersApi";
import { useListGoodsReceiptsQuery } from "@/services/goodsReceiptApi";
import { useBranch } from '@/contexts/BranchContext';
import { PurchaseReturn } from "@/types/purchaseReturn";

const PurchaseReturns = () => {
  const { toast } = useToast();
  const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:5011";
  const { selectedBranch } = useBranch();
  const { data: returnsData, refetch: refetchReturns, error: returnsError } = useListPurchaseReturnsQuery();
  const { data: poData, error: poError } = useListPurchaseOrdersQuery();
  const { data: grnData, error: grnError } = useListGoodsReceiptsQuery();
  const [createPurchaseReturn] = useCreatePurchaseReturnMutation();
  const [updatePurchaseReturn] = useUpdatePurchaseReturnMutation();
  // معالجة بيانات المرتجعات من API
  const existingReturns = (() => {
    if (!returnsData) {
      console.log("[PurchaseReturns] No returns data available");
      return [];
    }
    
    console.log("[PurchaseReturns] Processing returns data:", returnsData);
    
    // إذا كانت البيانات من supplier-invoices API
    if (returnsData?.data && Array.isArray(returnsData.data)) {
      console.log("[PurchaseReturns] Processing supplier-invoices data");
      return returnsData.data.map((invoice: any) => ({
        id: invoice.id,
        returnNumber: invoice.invoiceNumber,
        return_number: invoice.invoiceNumber,
        supplier: invoice.supplier?.name_ar || invoice.supplier?.name || 'مورد غير محدد',
        poNumber: invoice.referenceNumber,
        po_number: invoice.referenceNumber,
        returnDate: invoice.invoiceDate,
        return_date: invoice.invoiceDate,
        totalValue: invoice.totalAmount,
        total_value: invoice.totalAmount,
        status: invoice.status === 'مسودة' ? 'بانتظار الموافقة' : invoice.status,
        notes: invoice.notes,
        branchId: invoice.branchId,
        branchName: invoice.branchName || 'الفرع الرئيسي',
        items: [], // سيتم ملؤها لاحقاً
        attachments: invoice.attachments || []
      }));
    }
    
    // إذا كانت البيانات مباشرة
    if (Array.isArray(returnsData)) {
      console.log("[PurchaseReturns] Processing direct array data");
      return returnsData;
    }
    
    console.log("[PurchaseReturns] No valid data structure found");
    return [];
  })();
  
  // State for financial settlements
  const [financialSettlements, setFinancialSettlements] = useState<any[]>([]);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(false);
  
  // معالجة بيانات أوامر الشراء من API
  const purchaseOrders = (() => {
    if (!poData) {
      console.log("[PurchaseReturns] No purchase orders data available");
      return [];
    }
    
    console.log("[PurchaseReturns] Processing purchase orders data:", poData);
    
    // إذا كانت البيانات من supplier-invoices API
    if (poData?.data && Array.isArray(poData.data)) {
      console.log("[PurchaseReturns] Processing supplier-invoices PO data");
      return poData.data.map((invoice: any) => ({
        id: invoice.id,
        poNumber: invoice.invoiceNumber,
        po_number: invoice.invoiceNumber,
        supplier: invoice.supplier,
        supplierId: invoice.supplier_id,
        orderDate: invoice.invoiceDate,
        order_date: invoice.invoiceDate,
        totalAmount: invoice.totalAmount,
        total_amount: invoice.totalAmount,
        status: invoice.status,
        notes: invoice.notes,
        branchId: invoice.branchId,
        branchName: invoice.branchName || 'الفرع الرئيسي',
        referenceNumber: invoice.referenceNumber,
        referenceType: invoice.referenceType
      }));
    }
    
    // إذا كانت البيانات مباشرة
    if (Array.isArray(poData)) {
      console.log("[PurchaseReturns] Processing direct PO array data");
      return poData;
    }
    
    console.log("[PurchaseReturns] No valid PO data structure found");
    return [];
  })();
  const goodsReceipts: any[] = Array.isArray((grnData as any)?.data) ? (grnData as any).data : (Array.isArray(grnData as any) ? (grnData as any) : []);
  const [purchaseReturn, setPurchaseReturn] = useState({
    returnNumber: `PR-${new Date().getFullYear()}-${String(existingReturns.length + 1).padStart(3, '0')}`,
    returnDate: new Date().toISOString().split('T')[0],
    poNumber: "",
    supplier: "",
    department: "",
    status: "بانتظار الموافقة" as const,
    notes: "",
    approver: "",
    supplierReceiptNumber: "",
    branchId: selectedBranch?.id || "",
    branchName: selectedBranch?.name || "",
    items: [
      { 
        id: 1, 
        name: "", 
        returnedQty: "", 
        unit: "", 
        batchNumber: "", 
        condition: "", 
        reason: "", 
        notes: "", 
        maxQty: "",
        price: 0,
        total: 0
      }
    ],
    attachments: []
  });
  useEffect(() => {
    try {
      const poId = String(purchaseReturn.poNumber || "");
      const filtered = (Array.isArray(goodsReceipts) ? goodsReceipts : []).filter((grn: any) => {
        const direct = String(grn.purchaseOrderId || grn.purchase_order_id || "");
        const assoc = grn.purchaseOrder && String(grn.purchaseOrder.id);
        return poId && (direct === poId || assoc === poId);
      });
      console.log("[PurchaseReturns] GRN raw list:", goodsReceipts);
      console.log("[PurchaseReturns] Selected PO:", purchaseReturn.poNumber);
      console.log("[PurchaseReturns] GRN filtered list:", filtered);
    } catch (e) {
      console.log("[PurchaseReturns] GRN log error:", e);
    }
  }, [goodsReceipts, purchaseReturn.poNumber]);
  const getReturnsStats = () => {
    const totalReturns = existingReturns.length;
    const pendingReturns = existingReturns.filter((r: any) => r.status === "بانتظار الموافقة").length;
    const approvedReturns = existingReturns.filter((r: any) => r.status === "معتمد" || r.status === "مكتمل").length;
    const totalValue = existingReturns.reduce((sum: number, r: any) => sum + Number(r.totalValue || 0), 0);
    return { totalReturns, pendingReturns, approvedReturns, totalValue };
  };
  
  const [activeTab, setActiveTab] = useState("new-return");
  useEffect(() => { document.title = "مرتجع المشتريات | إدارة المخزون"; }, []);
  
  // دالة لجلب بيانات التسوية المالية
  const fetchFinancialSettlements = async () => {
    try {
      setIsLoadingSettlements(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/supplier-invoices?status=معتمد&referenceType=purchase_return`);
      if (res.ok) {
        const data = await res.json();
        let returns = [];
        if (Array.isArray(data)) {
          returns = data;
        } else if (data?.data) {
          returns = Array.isArray(data.data) ? data.data : [];
        }
        
        // تحويل المرتجعات المعتمدة إلى تسويات مالية
        const settlements = returns
          .filter((ret: any) => ret.status === 'معتمد' || ret.approvalStatus === 'معتمد')
          .map((ret: any) => ({
            id: ret.id,
            returnNumber: ret.invoiceNumber || `RT-${ret.id}`,
            supplier: getSupplierDisplayName(ret.supplier),
            returnValue: ret.totalAmount || 0,
            creditNoteNumber: `CN-${ret.id}`,
            settlementDate: ret.invoiceDate || null,
            paymentMethod: ret.paymentMethod || 'خصم من فاتورة مستقبلية',
            status: ret.approvalStatus === 'معتمد' ? 'مكتمل' : 'بانتظار التسوية',
            returnData: ret
          }));
        
        setFinancialSettlements(settlements);
      } else {
        console.error('Failed to fetch financial settlements:', res.status);
        toast({ title: "خطأ", description: "فشل في جلب بيانات التسوية المالية", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error fetching financial settlements:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء جلب بيانات التسوية المالية", variant: "destructive" });
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  // جلب بيانات التسوية المالية عند تحميل الصفحة
  useEffect(() => {
    fetchFinancialSettlements();
  }, []);

  // إضافة console.log لمراقبة البيانات
  useEffect(() => {
    console.log("[PurchaseReturns] Returns Data:", returnsData);
    console.log("[PurchaseReturns] Existing Returns:", existingReturns);
    console.log("[PurchaseReturns] Purchase Orders Data:", poData);
    console.log("[PurchaseReturns] Purchase Orders Processed:", purchaseOrders);
    console.log("[PurchaseReturns] PO Count:", purchaseOrders?.length || 0);
    console.log("[PurchaseReturns] Goods Receipts Data:", goodsReceipts);
    console.log("[PurchaseReturns] GRN Count:", goodsReceipts?.length || 0);
    
    // إضافة console.log للأخطاء
    if (returnsError) console.error("[PurchaseReturns] Returns Error:", returnsError);
    if (poError) console.error("[PurchaseReturns] Purchase Orders Error:", poError);
    if (grnError) console.error("[PurchaseReturns] Goods Receipts Error:", grnError);
  }, [returnsData, returnsError, existingReturns, poData, poError, purchaseOrders, grnData, grnError, goodsReceipts]);
  
  const stats = getReturnsStats();

  // دالة مساعدة لاستخراج اسم المورد من البيانات
  const getSupplierDisplayName = (supplier: any): string => {
    if (typeof supplier === 'string') {
      return supplier;
    } else if (supplier && typeof supplier === 'object') {
      return supplier.name_ar || supplier.name_en || supplier.name || supplier.supplier_name || 'مورد غير محدد';
    }
    return 'مورد غير محدد';
  };

  // Dialog states and actions for settlements
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [previewSettlement, setPreviewSettlement] = useState<null | (typeof financialSettlements[number])>(null); // settlement preview
  const [newCredit, setNewCredit] = useState({
    returnNumber: "",
    creditNoteNumber: `CN-${new Date().getFullYear()}-${String(financialSettlements.length + 1).padStart(3, '0')}`,
    paymentMethod: "خصم من فاتورة مستقبلية",
    returnValue: 0,
  });

  const handleOpenCreditDialog = () => setShowCreditDialog(true);
  const handleCloseCreditDialog = () => setShowCreditDialog(false);

  const handleDownloadCreditNote = (settlement: typeof financialSettlements[number]) => {
    const rows = [
      ["رقم المرتجع","المورد","قيمة المرتجع","رقم إشعار الائتمان","تاريخ التسوية","طريقة التسوية","الحالة"],
      [settlement.returnNumber, settlement.supplier, `${settlement.returnValue} ج.م`, settlement.creditNoteNumber || "-", settlement.settlementDate || "-", settlement.paymentMethod, settlement.status]
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `credit_note_${settlement.creditNoteNumber || settlement.returnNumber}.csv`;
    link.click();
  };

  const handlePrintCreditNote = (settlement: typeof financialSettlements[number]) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>إشعار ائتمان</title><style>body{font-family: system-ui; padding:24px} h1{margin-bottom:12px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ddd;padding:8px;text-align:right}</style></head><body><h1>إشعار ائتمان</h1><table><tr><th>رقم المرتجع</th><td>${settlement.returnNumber}</td></tr><tr><th>المورد</th><td>${settlement.supplier}</td></tr><tr><th>القيمة</th><td>${settlement.returnValue} ج.م</td></tr><tr><th>رقم الإشعار</th><td>${settlement.creditNoteNumber || '-'}</td></tr><tr><th>التاريخ</th><td>${settlement.settlementDate || '-'}</td></tr><tr><th>الطريقة</th><td>${settlement.paymentMethod}</td></tr></table></body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const handleCreateCreditNote = () => {
    if (!newCredit.returnNumber) {
      toast({ title: "يرجى اختيار رقم المرتجع", variant: "destructive" });
      return;
    }
    
    // البحث عن المرتجع المختار
    const selectedReturn = existingReturns.find((ret: any) => String(ret.returnNumber || ret.return_number) === newCredit.returnNumber);
    
    if (selectedReturn) {
      // إنشاء تسوية مالية جديدة
      const newSettlement = {
        id: Date.now(), // ID مؤقت
        returnNumber: newCredit.returnNumber,
        supplier: getSupplierDisplayName(selectedReturn.supplier),
        returnValue: newCredit.returnValue,
        creditNoteNumber: newCredit.creditNoteNumber,
        settlementDate: new Date().toISOString().split('T')[0],
        paymentMethod: newCredit.paymentMethod,
        status: 'مكتمل',
        returnData: selectedReturn
      };
      
      // إضافة التسوية الجديدة إلى القائمة
      setFinancialSettlements(prev => [...prev, newSettlement]);
      
      // تحديث رقم إشعار الائتمان التالي
      setNewCredit(prev => ({
        ...prev,
        creditNoteNumber: `CN-${new Date().getFullYear()}-${String(financialSettlements.length + 2).padStart(3, '0')}`,
        returnNumber: "",
        returnValue: 0
      }));
      
      toast({ title: 'تم إنشاء إشعار الائتمان', description: `تم إنشاء ${newCredit.creditNoteNumber} بنجاح` });
    } else {
      toast({ title: "خطأ", description: "لم يتم العثور على المرتجع المختار", variant: "destructive" });
      return;
    }
    
    setShowCreditDialog(false);
  };

  // Return list actions
  const [showReturnPreview, setShowReturnPreview] = useState<string | number | null>(null);
  const handleDownloadReturn = (ret: PurchaseReturn) => {
    const rows = [
      ["رقم المرتجع","المورد","أمر الشراء","التاريخ","عدد الأصناف","القيمة","الحالة"],
      [ret.returnNumber, ret.supplier, ret.poNumber, ret.returnDate, String(ret.totalItems ?? ret.items?.length ?? 0), `${ret.totalValue ?? 0} ج.م`, ret.status]
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `purchase_return_${ret.returnNumber}.csv`;
    link.click();
  };

  const handlePrintReturn = (ret: PurchaseReturn) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>مرتجع مشتريات</title><style>body{font-family: system-ui; padding:24px} h1{margin-bottom:12px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ddd;padding:8px;text-align:right}</style></head><body><h1>مرتجع مشتريات</h1><table><tr><th>رقم المرتجع</th><td>${ret.returnNumber}</td></tr><tr><th>المورد</th><td>${ret.supplier}</td></tr><tr><th>أمر الشراء</th><td>${ret.poNumber}</td></tr><tr><th>التاريخ</th><td>${ret.returnDate}</td></tr><tr><th>عدد الأصناف</th><td>${ret.totalItems ?? ret.items?.length ?? 0}</td></tr><tr><th>القيمة</th><td>${ret.totalValue ?? 0} ج.م</td></tr><tr><th>الحالة</th><td>${ret.status}</td></tr></table></body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };


  const addItem = () => {
    setPurchaseReturn({
      ...purchaseReturn,
      items: [...purchaseReturn.items, { 
        id: Date.now(), 
        name: "", 
        returnedQty: "", 
        unit: "", 
        batchNumber: "",
        condition: "",
        reason: "",
        notes: "",
        maxQty: "",
        price: 0,
        total: 0
      }]
    });
  };

  const removeItem = (id: number) => {
    setPurchaseReturn({
      ...purchaseReturn,
      items: purchaseReturn.items.filter(item => item.id !== id)
    });
  };

  const updateItem = (id: number, field: string, value: string) => {
    setPurchaseReturn({
      ...purchaseReturn,
      items: purchaseReturn.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // حساب الكمية المرتجعة تلقائياً
          if (field === 'returnedQty') {
            const returnedQty = Number(value) || 0;
            const maxQty = Number(item.maxQty) || 0;
            
            // التحقق من أن الكمية المرتجعة لا تتجاوز الحد الأقصى
            if (returnedQty > maxQty) {
              toast({ 
                title: "تنبيه", 
                description: `الكمية المرتجعة (${returnedQty}) تتجاوز الكمية المتاحة (${maxQty})`, 
                variant: "destructive" 
              });
            }
            
            // حساب السعر الإجمالي
            const price = Number(item.price) || 0;
            updatedItem.total = returnedQty * price;
          }
          
          return updatedItem;
        }
        return item;
      })
    });
  };

  const handleSaveReturn = async () => {
    const totalItems = (Array.isArray(purchaseReturn.items) ? purchaseReturn.items : []).filter((item) => item.name).length;
    const totalValue = (Array.isArray(purchaseReturn.items) ? purchaseReturn.items : []).reduce((sum, item) => {
      const qty = typeof item.returnedQty === 'string' ? parseInt(item.returnedQty as any) || 0 : (item.returnedQty as any) || 0;
      const price = Number((item as any).price || 0);
      return sum + (qty * price);
    }, 0);
    
    // الحصول على supplierId من أمر الشراء
    let supplierId = null;
    if (purchaseReturn.poNumber) {
      const po = (Array.isArray(purchaseOrders) ? purchaseOrders : []).find((p: any) => String(p.id) === String(purchaseReturn.poNumber));
      if (po) {
        supplierId = getSupplierId(po);
      }
    }
    
    const body: any = {
      // استخدام بنية supplier-invoices API
      invoiceNumber: purchaseReturn.returnNumber,
      invoiceDate: purchaseReturn.returnDate,
      supplier_id: supplierId,
      referenceNumber: purchaseReturn.poNumber,
      referenceType: 'purchase_return',
      status: purchaseReturn.status === 'بانتظار الموافقة' ? 'مسودة' : purchaseReturn.status,
      notes: purchaseReturn.notes,
      branchId: purchaseReturn.branchId,
      totalAmount: totalValue,
      subtotal: totalValue,
      taxAmount: 0,
      discountAmount: 0,
      shippingAmount: 0,
      remainingAmount: totalValue,
      paidAmount: 0,
      currency: 'EGP',
      exchangeRate: 1.0,
      paymentMethod: 'نقد',
      approvalStatus: 'في_انتظار',
      // إضافة بيانات الأصناف كملاحظات أو في حقل منفصل
      internalNotes: JSON.stringify({
        items: (purchaseReturn.items || []).map((it) => ({
          name: it.name,
          itemCode: (it as any).itemCode || null,
          returnedQty: Number(it.returnedQty || 0),
          unit: it.unit || null,
          batchNumber: it.batchNumber || null,
          condition: it.condition || null,
          reason: it.reason || null,
          price: Number((it as any).price || 0),
          total: Number((it as any).total || 0),
          notes: it.notes || null,
        })),
        totalItems,
        department: purchaseReturn.department
      })
    };
    
    console.log("Sending purchase return data:", body);
    
    try {
      const result = await createPurchaseReturn(body).unwrap();
      console.log("Purchase return created successfully:", result);
      await refetchReturns();
      toast({ title: "تم حفظ المرتجع", description: "تم إنشاء المرتجع بنجاح" });
    } catch (e: any) {
      console.error("Error creating purchase return:", e);
      toast({ 
        title: "فشل حفظ المرتجع", 
        description: String(e?.data?.message || e?.error?.message || e?.message || e), 
        variant: "destructive" 
      });
    }
  };

  const handleSubmitForApproval = () => {
    handleSaveReturn();
    toast({
      title: "تم إرسال طلب الموافقة",
      description: "تم إرسال طلب المرتجع للموافقة",
    });
  };

  const handleApproveReturn = async (returnId: string | number) => {
    try {
      await updatePurchaseReturn({ id: returnId, status: "معتمد" } as any).unwrap();
      await refetchReturns();
      toast({ title: "تم اعتماد المرتجع" });
    } catch (e) {
      toast({ title: "فشل الاعتماد", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "بانتظار الموافقة": "secondary",
      "معتمد": "default",
      "مرفوض": "destructive",
      "مكتمل": "default",
      "تحت التسوية المالية": "default",
      "مسوى": "default"
    };

    const icons = {
      "بانتظار الموافقة": <Clock className="w-3 h-3 mr-1" />,
      "معتمد": <CheckCircle className="w-3 h-3 mr-1" />,
      "مرفوض": <X className="w-3 h-3 mr-1" />,
      "مكتمل": <CheckCircle className="w-3 h-3 mr-1" />,
      "تحت التسوية المالية": <DollarSign className="w-3 h-3 mr-1" />,
      "مسوى": <CheckCircle className="w-3 h-3 mr-1" />
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as "default" | "destructive" | "secondary"}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const getReasonBadge = (reason: string) => {
    const colors = {
      "عيب في التصنيع": "bg-red-100 text-red-800",
      "كمية زائدة": "bg-blue-100 text-blue-800",
      "عدم مطابقة المواصفات": "bg-orange-100 text-orange-800",
      "تلف أثناء النقل": "bg-yellow-100 text-yellow-800",
      "انتهاء صلاحية": "bg-purple-100 text-purple-800"
    };

    return (
      <Badge className={colors[reason as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {reason}
      </Badge>
    );
  };

  // دالة مساعدة لاستخراج ID المورد من بيانات أمر الشراء
  const getSupplierId = (po: any): number | null => {
    console.log("Getting supplier ID for PO:", po?.id || "unknown");
    
    // طرق مختلفة للوصول لـ ID المورد
    const possibleIds = [
      po?.supplier?.id,
      po?.supplier?.supplier_id,
      po?.supplierId,
      po?.supplier_id,
    ];
    
    // البحث عن أول قيمة صحيحة
    for (const id of possibleIds) {
      if (id && typeof id === 'number' && id > 0) {
        console.log("Found supplier ID:", id);
        return id;
      }
      // محاولة تحويل string إلى number
      if (id && typeof id === 'string' && !isNaN(Number(id))) {
        const numId = Number(id);
        if (numId > 0) {
          console.log("Found supplier ID (converted):", numId);
          return numId;
        }
      }
    }
    
    console.log("No supplier ID found for PO:", po?.id);
    return null;
  };

  // دالة مساعدة لاستخراج اسم المورد من بيانات أمر الشراء
  const getSupplierName = (po: any): string => {
    console.log("Getting supplier name for PO:", po?.id || "unknown");
    
    // طرق مختلفة للوصول لاسم المورد
    const possiblePaths = [
      // من كائن supplier
      po?.supplier?.name_ar,
      po?.supplier?.name_en, 
      po?.supplier?.name,
      po?.supplier?.supplier_name,
      po?.supplier?.company_name,
      
      // من الحقول المباشرة
      po?.supplier_name,
      po?.supplierName,
      po?.supplierNameAr,
      po?.supplierNameEn,
      
      // من البيانات المدمجة
      po?.supplierData?.name_ar,
      po?.supplierData?.name_en,
      po?.supplierData?.name,
    ];
    
    // البحث عن أول قيمة صحيحة
    for (const path of possiblePaths) {
      if (path && typeof path === 'string' && path.trim()) {
        console.log("Found supplier name:", path);
        return path.trim();
      }
    }
    
    console.log("No supplier name found for PO:", po?.id);
    return "مورد غير محدد";
  };

  return (
    <div className="space-y-6">
      <div className="relative animate-fade-in">
        <Card className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border shadow-lg">
          <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">مرتجع المشتريات</CardTitle>
              <CardDescription>إدارة مرتجعات المشتريات والتسوية المالية مع الموردين</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <EnhancedStatsCard
              title="إجمالي المرتجعات"
              value={stats.totalReturns}
              icon={Undo2}
              color="blue"
              index={0}
            />
            <EnhancedStatsCard
              title="بانتظار الموافقة"
              value={stats.pendingReturns}
              icon={Clock}
              color="orange"
              index={1}
            />
            <EnhancedStatsCard
              title="معتمدة/مكتملة"
              value={stats.approvedReturns}
              icon={CheckCircle}
              color="green"
              index={2}
            />
            <EnhancedStatsCard
              title="القيمة الإجمالية"
              value={`${stats.totalValue.toLocaleString()} ج.م`}
              icon={DollarSign}
              color="purple"
              index={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Return Preview Dialog */}
      <Dialog open={!!showReturnPreview} onOpenChange={() => setShowReturnPreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>معاينة المرتجع</DialogTitle>
            <DialogDescription>تفاصيل كاملة لفاتورة المرتجع</DialogDescription>
          </DialogHeader>
          {showReturnPreview && (() => {
            const ret = existingReturns.find((r: any) => r.id === showReturnPreview);
            if (!ret) return null;
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">رقم المرتجع</div>
                    <div className="text-lg font-bold">{ret.returnNumber || ret.return_number}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">المورد</div>
                    <div className="text-lg font-bold">{ret.supplier || 'غير محدد'}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">التاريخ</div>
                    <div className="text-lg font-bold">{ret.returnDate || ret.return_date}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">القيمة</div>
                    <div className="text-lg font-bold">{ret.totalValue || ret.total_value || 0} ج.م</div>
                  </div>
                </div>

                {ret.items && ret.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">الأصناف المرتجعة</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>اسم الصنف</TableHead>
                            <TableHead>الكمية المرتجعة</TableHead>
                            <TableHead>الوحدة</TableHead>
                            <TableHead>السعر</TableHead>
                            <TableHead>المجموع</TableHead>
                            <TableHead>السبب</TableHead>
                            <TableHead>الحالة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ret.items.map((item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{item.name || 'غير محدد'}</TableCell>
                              <TableCell>{item.returnedQty || item.returned_qty || 0}</TableCell>
                              <TableCell>{item.unit || 'قطعة'}</TableCell>
                              <TableCell>{item.price || 0} ج.م</TableCell>
                              <TableCell>{item.total || 0} ج.م</TableCell>
                              <TableCell>{item.reason || 'غير محدد'}</TableCell>
                              <TableCell>{item.condition || 'غير محدد'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {ret.notes && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">ملاحظات</h4>
                    <p className="text-sm text-gray-700">{ret.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnPreview(null)}>
              إغلاق
            </Button>
            {showReturnPreview && (() => {
              const ret = existingReturns.find((r: any) => r.id === showReturnPreview);
              return (
                <>
                  <Button variant="outline" onClick={() => handleDownloadReturn(ret)}>
                    <Download className="w-4 h-4 mr-2" />
                    تحميل
                  </Button>
                  <Button onClick={() => handlePrintReturn(ret)}>
                    <Printer className="w-4 h-4 mr-2" />
                    طباعة
                  </Button>
                </>
              );
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credit Note Dialog */}
      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء إشعار ائتمان</DialogTitle>
            <DialogDescription>إنشاء إشعار ائتمان للمرتجع المعتمد</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اختيار المرتجع</Label>
              <Select 
                value={newCredit.returnNumber} 
                onValueChange={(value) => {
                  const selectedReturn = existingReturns.find((ret: any) => String(ret.returnNumber || ret.return_number) === value);
                  setNewCredit(prev => ({
                    ...prev,
                    returnNumber: value,
                    returnValue: selectedReturn?.totalValue || selectedReturn?.total_value || 0
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المرتجع" />
                </SelectTrigger>
                <SelectContent>
                  {existingReturns
                    .filter((ret: any) => ret.status === 'معتمد')
                    .map((ret: any) => (
                      <SelectItem key={ret.id} value={String(ret.returnNumber || ret.return_number)}>
                        <div className="flex items-center justify-between w-full">
                          <span>{ret.returnNumber || ret.return_number}</span>
                          <span className="text-sm text-muted-foreground mr-2">
                            {ret.supplier} - {ret.totalValue || ret.total_value || 0} ج.م
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>رقم إشعار الائتمان</Label>
                <Input 
                  value={newCredit.creditNoteNumber} 
                  onChange={(e) => setNewCredit(prev => ({ ...prev, creditNoteNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label>قيمة المرتجع</Label>
                <Input 
                  type="number"
                  value={newCredit.returnValue} 
                  onChange={(e) => setNewCredit(prev => ({ ...prev, returnValue: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>طريقة التسوية</Label>
              <Select 
                value={newCredit.paymentMethod} 
                onValueChange={(value) => setNewCredit(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="خصم من فاتورة مستقبلية">خصم من فاتورة مستقبلية</SelectItem>
                  <SelectItem value="استرداد نقدي">استرداد نقدي</SelectItem>
                  <SelectItem value="استبدال بمنتجات أخرى">استبدال بمنتجات أخرى</SelectItem>
                  <SelectItem value="خصم من رصيد المورد">خصم من رصيد المورد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreditDialog}>
              إلغاء
            </Button>
            <Button onClick={handleCreateCreditNote} className="bg-green-600 hover:bg-green-700">
              <Receipt className="w-4 h-4 mr-2" />
              إنشاء الإشعار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Tabs Section */}
      <Card className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border shadow-lg">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new-return">
                <Package className="w-4 h-4 mr-2" />
                مرتجع جديد
              </TabsTrigger>
              <TabsTrigger value="returns-list">
                <FileText className="w-4 h-4 mr-2" />
                قائمة المرتجعات
              </TabsTrigger>
              <TabsTrigger value="financial-settlements">
                <DollarSign className="w-4 h-4 mr-2" />
                التسوية المالية
              </TabsTrigger>
            </TabsList>

              <TabsContent value="new-return" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>إنشاء مرتجع مشتريات جديد</CardTitle>
                    <CardDescription>إدخال بيانات المرتجع والأصناف المرتجعة</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>رقم المرتجع</Label>
                          <Input value={purchaseReturn.returnNumber} readOnly />
                        </div>
                        <div>
                          <Label>تاريخ المرتجع</Label>
                          <Input 
                            type="date" 
                            value={purchaseReturn.returnDate}
                            onChange={(e) => setPurchaseReturn(prev => ({ ...prev, returnDate: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>أمر الشراء</Label>
                          <Select 
                            value={purchaseReturn.poNumber} 
                            onValueChange={(value) => {
                              const po = purchaseOrders.find((p: any) => String(p.id) === value);
                              setPurchaseReturn(prev => ({
                                ...prev,
                                poNumber: value,
                                supplier: po ? getSupplierName(po) : ""
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر أمر الشراء" />
                            </SelectTrigger>
                            <SelectContent>
                              {purchaseOrders && purchaseOrders.length > 0 ? (
                                purchaseOrders.map((po: any) => (
                                  <SelectItem key={po.id} value={String(po.id)}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{po.poNumber || po.po_number || `PO-${po.id}`}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {getSupplierName(po)} - {po.totalAmount || 0} ج.م
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-4 text-center text-muted-foreground">
                                  لا توجد أوامر شراء متاحة
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>المورد</Label>
                          <Input value={purchaseReturn.supplier} readOnly />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>القسم</Label>
                          <Input 
                            value={purchaseReturn.department}
                            onChange={(e) => setPurchaseReturn(prev => ({ ...prev, department: e.target.value }))}
                            placeholder="أدخل القسم"
                          />
                        </div>
                        <div>
                          <Label>الحالة</Label>
                          <Select 
                            value={purchaseReturn.status} 
                            onValueChange={(value) => setPurchaseReturn(prev => ({ ...prev, status: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="بانتظار الموافقة">بانتظار الموافقة</SelectItem>
                              <SelectItem value="معتمد">معتمد</SelectItem>
                              <SelectItem value="مرفوض">مرفوض</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>ملاحظات</Label>
                      <Textarea 
                        value={purchaseReturn.notes}
                        onChange={(e) => setPurchaseReturn(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="أدخل أي ملاحظات إضافية"
                        rows={3}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">الأصناف المرتجعة</h3>
                        <Button onClick={addItem} size="sm">
                          <Package className="w-4 h-4 mr-2" />
                          إضافة صنف
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {purchaseReturn.items.map((item, index) => (
                          <Card key={item.id} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <Label>اسم الصنف</Label>
                                <Input 
                                  value={item.name}
                                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                  placeholder="اسم الصنف"
                                />
                              </div>
                              <div>
                                <Label>الكمية المرتجعة</Label>
                                <Input 
                                  type="number"
                                  value={item.returnedQty}
                                  onChange={(e) => updateItem(item.id, 'returnedQty', e.target.value)}
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label>الوحدة</Label>
                                <Input 
                                  value={item.unit}
                                  onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                  placeholder="قطعة"
                                />
                              </div>
                              <div>
                                <Label>السعر</Label>
                                <Input 
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label>رقم الدفعة</Label>
                                <Input 
                                  value={item.batchNumber}
                                  onChange={(e) => updateItem(item.id, 'batchNumber', e.target.value)}
                                  placeholder="رقم الدفعة"
                                />
                              </div>
                              <div>
                                <Label>الحالة</Label>
                                <Select 
                                  value={item.condition} 
                                  onValueChange={(value) => updateItem(item.id, 'condition', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر الحالة" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="جيد">جيد</SelectItem>
                                    <SelectItem value="تالف">تالف</SelectItem>
                                    <SelectItem value="منتهي الصلاحية">منتهي الصلاحية</SelectItem>
                                    <SelectItem value="غير مطابق">غير مطابق</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>سبب المرتجع</Label>
                                <Select 
                                  value={item.reason} 
                                  onValueChange={(value) => updateItem(item.id, 'reason', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر السبب" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="عيب في التصنيع">عيب في التصنيع</SelectItem>
                                    <SelectItem value="كمية زائدة">كمية زائدة</SelectItem>
                                    <SelectItem value="عدم مطابقة المواصفات">عدم مطابقة المواصفات</SelectItem>
                                    <SelectItem value="تلف أثناء النقل">تلف أثناء النقل</SelectItem>
                                    <SelectItem value="انتهاء صلاحية">انتهاء صلاحية</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-end">
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => removeItem(item.id)}
                                  disabled={purchaseReturn.items.length === 1}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Label>ملاحظات الصنف</Label>
                              <Textarea 
                                value={item.notes}
                                onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                                placeholder="ملاحظات إضافية للصنف"
                                rows={2}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setPurchaseReturn({
                        returnNumber: `PR-${new Date().getFullYear()}-${String(existingReturns.length + 1).padStart(3, '0')}`,
                        returnDate: new Date().toISOString().split('T')[0],
                        poNumber: "",
                        supplier: "",
                        department: "",
                        status: "بانتظار الموافقة" as const,
                        notes: "",
                        approver: "",
                        supplierReceiptNumber: "",
                        branchId: selectedBranch?.id || "",
                        branchName: selectedBranch?.name || "",
                        items: [{ id: 1, name: "", returnedQty: "", unit: "", batchNumber: "", condition: "", reason: "", notes: "", maxQty: "", price: 0, total: 0 }],
                        attachments: []
                      })}>
                        إعادة تعيين
                      </Button>
                      <Button onClick={handleSaveReturn}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        حفظ المرتجع
                      </Button>
                      <Button onClick={handleSubmitForApproval} className="bg-blue-600 hover:bg-blue-700">
                        <Upload className="w-4 h-4 mr-2" />
                        إرسال للموافقة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="returns-list" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>قائمة المرتجعات</CardTitle>
                    <CardDescription>عرض وإدارة جميع مرتجعات المشتريات</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <Input placeholder="البحث في المرتجعات..." className="max-w-sm" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            فلترة
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            تصدير
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>رقم المرتجع</TableHead>
                              <TableHead>المورد</TableHead>
                              <TableHead>أمر الشراء</TableHead>
                              <TableHead>التاريخ</TableHead>
                              <TableHead>القيمة</TableHead>
                              <TableHead>الحالة</TableHead>
                              <TableHead>الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {existingReturns.map((ret: any) => (
                              <TableRow key={ret.id}>
                                <TableCell className="font-medium">
                                  {ret.returnNumber || ret.return_number}
                                </TableCell>
                                <TableCell>{getSupplierDisplayName(ret.supplier)}</TableCell>
                                <TableCell>{ret.poNumber || ret.po_number || '-'}</TableCell>
                                <TableCell>{ret.returnDate || ret.return_date}</TableCell>
                                <TableCell>{ret.totalValue || ret.total_value || 0} ج.م</TableCell>
                                <TableCell>{getStatusBadge(ret.status)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setShowReturnPreview(ret.id)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleDownloadReturn(ret)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handlePrintReturn(ret)}
                                    >
                                      <Printer className="w-4 h-4" />
                                    </Button>
                                    {ret.status === "بانتظار الموافقة" && (
                                      <Button 
                                        size="sm"
                                        onClick={() => handleApproveReturn(ret.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial-settlements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>التسوية المالية</CardTitle>
                        <CardDescription>إدارة التسويات المالية مع الموردين للمرتجعات المعتمدة</CardDescription>
                      </div>
                      <Button onClick={handleOpenCreditDialog} className="bg-green-600 hover:bg-green-700">
                        <Receipt className="w-4 h-4 mr-2" />
                        إنشاء إشعار ائتمان
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <Input placeholder="البحث في التسويات..." className="max-w-sm" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            فلترة
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            تصدير
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>رقم المرتجع</TableHead>
                              <TableHead>المورد</TableHead>
                              <TableHead>قيمة المرتجع</TableHead>
                              <TableHead>رقم إشعار الائتمان</TableHead>
                              <TableHead>تاريخ التسوية</TableHead>
                              <TableHead>طريقة التسوية</TableHead>
                              <TableHead>الحالة</TableHead>
                              <TableHead>الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {financialSettlements.map((settlement) => (
                              <TableRow key={settlement.id}>
                                <TableCell className="font-medium">
                                  {settlement.returnNumber}
                                </TableCell>
                                <TableCell>{settlement.supplier}</TableCell>
                                <TableCell>{settlement.returnValue} ج.م</TableCell>
                                <TableCell>{settlement.creditNoteNumber}</TableCell>
                                <TableCell>{settlement.settlementDate || '-'}</TableCell>
                                <TableCell>{settlement.paymentMethod}</TableCell>
                                <TableCell>
                                  <Badge variant={settlement.status === 'مكتمل' ? 'default' : 'secondary'}>
                                    {settlement.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setPreviewSettlement(settlement)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleDownloadCreditNote(settlement)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handlePrintCreditNote(settlement)}
                                    >
                                      <Printer className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default PurchaseReturns;