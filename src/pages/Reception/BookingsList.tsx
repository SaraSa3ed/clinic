import { useState } from "react";
import { List, Calendar, Activity, BarChart3, Loader2, RefreshCw, MoreVertical, Edit, Printer, FileDown, Trash2, CheckCircle, Clock as ClockIcon, Play, XCircle, Plus, Dot } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useListAppointmentsQuery, useUpdateAppointmentMutation, useDeleteAppointmentMutation } from "@/services/dentalAppointmentApi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function BookingsList() {
  const { data, isLoading, isError, refetch } = useListAppointmentsQuery();
  const appointments = (data as any)?.data ?? [];
  const [updateAppointment] = useUpdateAppointmentMutation();
  const [deleteAppointment] = useDeleteAppointmentMutation();
  const navigate = useNavigate();

  // حالة فلترة الحالة
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // حالة البحث الحر
  const [searchQuery, setSearchQuery] = useState<string>("");
  // فلترة حسب مواعيد الغد
  const [dueFilter, setDueFilter] = useState<"all" | "dayofitTomorrow" | "endTomorrow">("all");

  const [editOpen, setEditOpen] = useState(false as any);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    product_id: "",
    product_name: "",
    size: "",
    color: "",
    start_datetime: "",
    dayofit_datetime: "",
    end_datetime: "",
    rental_price: "",
    selling_price: "",
    payment_amount: "",
    discount_amount: "",
    remaining_amount: "",
    status: "pending",
    notes: "",
  });

  const formatDT = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("ar-EG-u-ca-gregory", { dateStyle: "short", timeStyle: "short" });
    } catch {
      return iso;
    }
  };

  const formatCurrency = (v?: number) => `${Number(v || 0).toLocaleString()} ج.م`;

  const stats = useMemo(() => ({
    total: appointments.length,
    confirmed: appointments.filter((b: any) => b.status === 'confirmed').length,
    pending: appointments.filter((b: any) => b.status === 'pending').length,
    inProgress: appointments.filter((b: any) => b.status === 'in-progress').length,
    completed: appointments.filter((b: any) => b.status === 'completed').length,
    cancelled: appointments.filter((b: any) => b.status === 'cancelled').length,
  }), [appointments]);

  // التحقق إن كان التاريخ هو غداً بالنسبة لتاريخ اليوم (محلياً بدون وقت)
  const isTomorrow = (iso?: string) => {
    if (!iso) return false;
    const today = new Date();
    const target = new Date(iso);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffMs = startOfTarget.getTime() - startOfToday.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    return diffMs === oneDay;
  };

  const tomorrowCounts = useMemo(() => ({
    dayofit: appointments.filter((b: any) => isTomorrow(b.dayofit_datetime)).length,
    end: appointments.filter((b: any) => isTomorrow(b.end_datetime)).length,
  }), [appointments]);

  // قائمة الحجوزات بعد الفلترة
  const filteredBookings = useMemo(() => {
    // فلترة حسب التبويب الزمني
    const byDue = dueFilter === 'all'
      ? appointments
      : appointments.filter((b: any) => dueFilter === 'dayofitTomorrow' ? isTomorrow(b.dayofit_datetime) : isTomorrow(b.end_datetime));

    // فلترة حسب الحالة
    const byStatus = statusFilter === 'all' ? byDue : byDue.filter((b: any) => b.status === statusFilter);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter((b: any) => {
      const productId = String(b.product?.product_id ?? b.product_id ?? '').toLowerCase();
      const bookingId = String(b.booking_id ?? '').toLowerCase();
      const productNameAr = String(b.product?.name_ar ?? b.product_name ?? '').toLowerCase();
      const productNameEn = String(b.product?.name_en ?? '').toLowerCase();
      const customerName = String(b.customer_name ?? '').toLowerCase();
      return (
        productId.includes(q) ||
        bookingId.includes(q) ||
        productNameAr.includes(q) ||
        productNameEn.includes(q) ||
        customerName.includes(q)
      );
    });
  }, [appointments, statusFilter, searchQuery, dueFilter]);

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string }> = {
      scheduled: { label: 'مجدول', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
      confirmed: { label: 'مؤكد', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      pending: { label: 'قيد الانتظار', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
      'in-progress': { label: 'جاري', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
      completed: { label: 'مكتمل', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
      cancelled: { label: 'ملغي', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
      'no-show': { label: 'لم يحضر', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    const cfg = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700 border-gray-200' };
    return <Badge variant="outline" className={cfg.cls}>{cfg.label}</Badge>;
  };

  const openEdit = (b: any) => {
    setSelected(b);
    setForm({
      customer_name: b.customer_name || "",
      customer_phone: b.customer_phone || "",
      product_id: (b.product?.product_id ?? b.product_id ?? "").toString(),
      product_name: b.product_name || "",
      size: b.size || "",
      color: b.color || "",
      start_datetime: b.start_datetime ? new Date(b.start_datetime).toISOString().slice(0,16) : "",
      dayofit_datetime: b.dayofit_datetime ? new Date(b.dayofit_datetime).toISOString().slice(0,16) : "",
      end_datetime: b.end_datetime ? new Date(b.end_datetime).toISOString().slice(0,16) : "",
      rental_price: b.rental_price ? b.rental_price.toString() : "",
      selling_price: b.selling_price ? b.selling_price.toString() : "",
      payment_amount: b.payment_amount ? b.payment_amount.toString() : "",
      discount_amount: b.discount_amount ? b.discount_amount.toString() : "",
      remaining_amount: b.remaining_amount ? b.remaining_amount.toString() : "",
      status: b.status || "pending",
      notes: b.notes || "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    await updateAppointment({ id: selected.appointment_id || selected.booking_id, body: {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      product_id: form.product_id ? (isNaN(Number(form.product_id)) ? form.product_id : Number(form.product_id)) : null,
      product_name: form.product_name || null,
      size: form.size || null,
      color: form.color || null,
      start_datetime: form.start_datetime ? new Date(form.start_datetime).toISOString() : null,
      dayofit_datetime: form.dayofit_datetime ? new Date(form.dayofit_datetime).toISOString() : null,
      end_datetime: form.end_datetime ? new Date(form.end_datetime).toISOString() : null,
      rental_price: form.rental_price ? parseFloat(form.rental_price) : null,
      selling_price: form.selling_price ? parseFloat(form.selling_price) : null,
      payment_amount: form.payment_amount ? parseFloat(form.payment_amount) : null,
      discount_amount: form.discount_amount ? parseFloat(form.discount_amount) : null,
      remaining_amount: form.remaining_amount ? parseFloat(form.remaining_amount) : null,
      status: form.status,
      notes: form.notes || null,
    }}).unwrap();
    setEditOpen(false);
    setSelected(null);
    await refetch();
  };

  const changeStatus = async (b: any, status: string) => {
    await updateAppointment({ id: b.appointment_id || b.booking_id, body: { status } }).unwrap();
    await refetch();
  };

  const removeBooking = async (b: any) => {
    await deleteAppointment(b.appointment_id || b.booking_id).unwrap();
    await refetch();
  };

  const printBooking = (b: any, detailed = false) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const start = formatDT(b.start_datetime);
    const end = formatDT(b.end_datetime);
    const dayofit = formatDT(b.dayofit_datetime);
    const html = `
      <html dir="rtl">
        <head>
          <title>موعد أسنان - ${b.appointment_id || b.booking_id}</title>
          <style>
            body{font-family:Arial, sans-serif; padding:20px}
            .h{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:12px}
            .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
            .sec{margin-top:10px}
            .lbl{color:#555;font-size:12px}
            .val{font-weight:bold}
            table{width:100%;border-collapse:collapse;margin-top:12px}
            th,td{border:1px solid #eee;padding:8px;text-align:center}
            th{background:#f7f7f7}
          </style>
        </head>
        <body>
          <div class="h">
            <h2>تفاصيل موعد الأسنان</h2>
            <div>رقم الموعد: <strong>${b.appointment_id || b.booking_id}</strong></div>
          </div>
          <div class="grid">
            <div class="sec"><div class="lbl">المريض</div><div class="val">${b.patient_name || b.customer_name} (${b.patient_phone || b.customer_phone || ''})</div></div>
            <div class="sec"><div class="lbl">الحالة</div><div class="val">${b.status}</div></div>
            <div class="sec"><div class="lbl">الطبيب</div><div class="val">${b.doctor_name || 'غير محدد'}</div></div>
            <div class="sec"><div class="lbl">نوع العلاج</div><div class="val">${b.treatment_type || '—'}</div></div>
            <div class="sec"><div class="lbl">اسم العلاج</div><div class="val">${b.treatment_name || '—'}</div></div>
            <div class="sec"><div class="lbl">رقم السن</div><div class="val">${b.tooth_number || '—'}</div></div>
            <div class="sec"><div class="lbl">موعد الزيارة</div><div class="val">${start}</div></div>
            <div class="sec"><div class="lbl">تاريخ الجلسة</div><div class="val">${dayofit}</div></div>
            <div class="sec"><div class="lbl">الموعد القادم</div><div class="val">${end}</div></div>
            <div class="sec"><div class="lbl">قيمة الكشف</div><div class="val">${b.consultation_fee ?? b.rental_price ?? 0} ج.م</div></div>
            <div class="sec"><div class="lbl">المدفوع</div><div class="val">${b.payment_amount ?? 0} ج.م</div></div>
            <div class="sec"><div class="lbl">الخصم</div><div class="val">${b.discount_amount ?? 0} ج.م</div></div>
            <div class="sec"><div class="lbl">المتبقي</div><div class="val">${b.remaining_amount ?? 0} ج.م</div></div>
          </div>
          ${detailed ? `<table><thead><tr><th>حقل</th><th>قيمة</th></tr></thead><tbody>
            <tr><td>ملاحظات</td><td>${b.notes || ''}</td></tr>
            </tbody></table>` : ''}
          <script>window.print(); setTimeout(()=>window.close(), 300);</script>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const exportCSV = (rows: any[]) => {
    const header = ['رقم الموعد','المريض','الجوال','الطبيب','نوع العلاج','اسم العلاج','رقم السن','موعد الزيارة','تاريخ الجلسة','الموعد القادم','قيمة الكشف','المدفوع','الخصم','المتبقي','الحالة'];
    const dataRows = rows.map(b => [
      b.appointment_id || b.booking_id,
      b.patient_name || b.customer_name,
      b.patient_phone || b.customer_phone || '',
      b.doctor_name || 'غير محدد',
      b.treatment_type || '',
      b.treatment_name || '',
      b.tooth_number || '',
      formatDT(b.appointment_datetime || b.start_datetime),
      formatDT(b.visit_date || b.dayofit_datetime),
      formatDT(b.next_appointment || b.end_datetime),
      (b.consultation_fee ?? b.rental_price ?? 0),
      b.payment_amount || 0,
      b.discount_amount || 0,
      b.remaining_amount || 0,
      b.status,
    ]);
    const csv = [header, ...dataRows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `dental_appointments_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border shadow-lg bg-gradient-to-r from-fuchsia-50 via-primary/10 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-full">
              <List className="h-6 w-6 text-primary" />
              <Activity className="h-5 w-5 text-primary/70" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                إدارة مواعيد عيادة الأسنان
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                نظام شامل لإدارة ومتابعة جميع مواعيد المرضى مع إمكانيات البحث والتصفية المتقدمة
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className="bg-white/70 backdrop-blur border-slate-200 text-slate-700">
                  إجمالي: {stats.total}
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">مؤكدة: {stats.confirmed}</Badge>
                <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">انتظار: {stats.pending}</Badge>
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">تنفيذ: {stats.inProgress}</Badge>
                <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700">مكتملة: {stats.completed}</Badge>
                <Badge variant="outline" className="bg-rose-50 border-rose-200 text-rose-700">ملغية: {stats.cancelled}</Badge>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="w-4 h-4" /> تحديث
              </Button>
              <Button onClick={() => navigate('/reception/create-booking')} className="gap-2">
                <Plus className="w-4 h-4" /> موعد جديد
              </Button>
            </div>
          </div>
        </div>

        {/* جدول مواعيد الأسنان */}
        <div className="rounded-2xl border bg-card shadow overflow-hidden">
          {/* شريط فلاتر الحالات */}
          <div className="p-4 border-b bg-muted/30 flex flex-wrap items-center gap-2">
            {/* تبويبات الغد: تسليم/استلام */}
            <Button
              variant={dueFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setDueFilter('all')}
              className="gap-2"
            >
              الكل (زمنياً)
            </Button>
            <Button
              variant={dueFilter === 'dayofitTomorrow' ? 'default' : 'outline'}
              onClick={() => setDueFilter('dayofitTomorrow')}
              className="gap-2"
            >
              مواعيد الغد
              <Badge variant="outline" className="ml-1">{tomorrowCounts.dayofit}</Badge>
            </Button>
            <Button
              variant={dueFilter === 'endTomorrow' ? 'default' : 'outline'}
              onClick={() => setDueFilter('endTomorrow')}
              className="gap-2"
            >
              جلسات الغد
              <Badge variant="outline" className="ml-1">{tomorrowCounts.end}</Badge>
            </Button>

            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className="gap-2"
            >
              الكل
              <Badge variant="outline" className="ml-1">{stats.total}</Badge>
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
              className="gap-2"
            >
              انتظار
              <Badge variant="outline" className="ml-1">{stats.pending}</Badge>
            </Button>
            <Button
              variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('confirmed')}
              className="gap-2"
            >
              مؤكدة
              <Badge variant="outline" className="ml-1">{stats.confirmed}</Badge>
            </Button>
            <Button
              variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('in-progress')}
              className="gap-2"
            >
              تنفيذ
              <Badge variant="outline" className="ml-1">{stats.inProgress}</Badge>
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              className="gap-2"
            >
              مكتملة
              <Badge variant="outline" className="ml-1">{stats.completed}</Badge>
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('cancelled')}
              className="gap-2"
            >
              ملغية
              <Badge variant="outline" className="ml-1">{stats.cancelled}</Badge>
            </Button>
            {/* خانة البحث */}
            <div className="ml-auto min-w-[220px]">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الطبيب أو رقم الموعد"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري تحميل المواعيد...
            </div>
          ) : isError ? (
            <div className="p-10 text-center text-destructive">حدث خطأ أثناء جلب البيانات</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              لا توجد مواعيد مطابقة للفلتر الحالي
            </div>
          ) : (
            <div className="overflow-x-auto relative">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="text-center text-slate-600">رقم الموعد</TableHead>
                    <TableHead className="text-center text-slate-600">المريض</TableHead>
                    <TableHead className="text-center text-slate-600">الطبيب</TableHead>
                    <TableHead className="text-center text-slate-600">نوع العلاج</TableHead>
                    <TableHead className="text-center text-slate-600">رقم السن</TableHead>
                    <TableHead className="text-center text-slate-600">موعد الزيارة</TableHead>
                    <TableHead className="text-center text-slate-600">تاريخ الجلسة</TableHead>
                    <TableHead className="text-center text-slate-600">الموعد القادم</TableHead>
                    <TableHead className="text-center text-slate-600">قيمة الكشف</TableHead>
                    <TableHead className="text-center text-slate-600">المدفوع</TableHead>
                    <TableHead className="text-center text-slate-600">الخصم</TableHead>
                    <TableHead className="text-center text-slate-600">المتبقي</TableHead>
                    <TableHead className="text-center text-slate-600">الحالة</TableHead>
                    <TableHead className="text-center text-slate-600">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((b: any, idx: number) => (
                    <TableRow key={b.appointment_id || b.booking_id} className="even:bg-muted/30 hover:bg-muted/60 transition-colors">
                      <TableCell className="text-center font-mono text-sm">{b.appointment_id || b.booking_id}</TableCell>
                      <TableCell className="text-center">
                        {b.patient_name || b.customer_name}
                        <div className="text-xs text-muted-foreground">{b.patient_phone || b.customer_phone}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center gap-1">
                          <span className="font-mono text-sm bg-primary/10 px-2 py-1 rounded text-primary">
                            {b.doctor_name || "غير محدد"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {b.treatment_type || b.treatment_name || "—"}
                          </div>
                          {b.treatment_name && b.treatment_type !== b.treatment_name && (
                            <div className="text-xs text-muted-foreground italic">
                              {b.treatment_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{b.tooth_number || "—"}</TableCell>
                      <TableCell className="text-center">{formatDT(b.appointment_datetime || b.start_datetime)}</TableCell>
                      <TableCell className="text-center">{formatDT(b.visit_date || b.dayofit_datetime)}</TableCell>
                      <TableCell className="text-center">{formatDT(b.next_appointment || b.end_datetime)}</TableCell>
                      <TableCell className="text-center font-semibold text-emerald-700">
                        {formatCurrency(b.consultation_fee || b.rental_price || 0)}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-blue-700">
                        {formatCurrency(b.payment_amount ?? 0)}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-blue-700">
                        {formatCurrency(b.discount_amount ?? 0)}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-orange-700">
                        {formatCurrency(b.remaining_amount ?? 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white shadow-xl rounded-xl">
                            <DropdownMenuItem onClick={() => openEdit(b)} className="gap-2">
                              <Edit className="w-4 h-4" /> تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeStatus(b,'scheduled')} className="gap-2">
                              <ClockIcon className="w-4 h-4" /> تعيين كـ مجدول
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeStatus(b,'confirmed')} className="gap-2">
                              <CheckCircle className="w-4 h-4" /> تأكيد الموعد
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeStatus(b,'in-progress')} className="gap-2">
                              <Play className="w-4 h-4" /> بدء الجلسة
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeStatus(b,'completed')} className="gap-2">
                              <CheckCircle className="w-4 h-4" /> إنهاء الجلسة
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeStatus(b,'cancelled')} className="gap-2">
                              <XCircle className="w-4 h-4" /> إلغاء الموعد
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => printBooking(b,false)} className="gap-2">
                              <Printer className="w-4 h-4" /> طباعة مختصرة
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => printBooking(b,true)} className="gap-2">
                              <Printer className="w-4 h-4" /> طباعة تفصيلية
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportCSV([b])} className="gap-2">
                              <FileDown className="w-4 h-4" /> تصدير CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeBooking(b)} className="gap-2 text-red-600">
                              <Trash2 className="w-4 h-4" /> حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                تعديل بيانات الموعد
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">اسم المريض</Label>
                  <Input
                    id="customer_name"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="أدخل اسم المريض"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">رقم الجوال</Label>
                  <Input
                    id="customer_phone"
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    placeholder="أدخل رقم الجوال"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor_name">اسم الطبيب</Label>
                  <Input
                    id="doctor_name"
                    value={selected?.doctor_name || ""}
                    disabled
                    className="bg-muted"
                    placeholder="اسم الطبيب المعالج"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatment_type">نوع العلاج</Label>
                  <Input
                    id="treatment_type"
                    value={selected?.treatment_type || ""}
                    disabled
                    className="bg-muted"
                    placeholder="نوع العلاج"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatment_name">اسم العلاج</Label>
                  <Input
                    id="treatment_name"
                    value={selected?.treatment_name || ""}
                    disabled
                    className="bg-muted"
                    placeholder="اسم العلاج"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tooth_number">رقم السن</Label>
                  <Input
                    id="tooth_number"
                    value={selected?.tooth_number || ""}
                    disabled
                    className="bg-muted"
                    placeholder="رقم السن المعالج"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultation_fee">قيمة الكشف (ج.م)</Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    step="0.01"
                    value={form.rental_price}
                    onChange={(e) => setForm({ ...form, rental_price: e.target.value })}
                    placeholder="أدخل قيمة الكشف"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatment_cost">تكلفة العلاج (ج.م)</Label>
                  <Input
                    id="treatment_cost"
                    type="number"
                    step="0.01"
                    value={form.selling_price}
                    onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                    placeholder="أدخل تكلفة العلاج"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_amount">المبلغ المدفوع (ج.م)</Label>
                  <Input
                    id="payment_amount"
                    type="number"
                    step="0.01"
                    value={form.payment_amount}
                    onChange={(e) => setForm({ ...form, payment_amount: e.target.value })}
                    placeholder="أدخل المبلغ المدفوع"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_amount">الخصم (ج.م)</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    value={form.discount_amount}
                    onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                    placeholder="أدخل الخصم"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remaining_amount">المبلغ المتبقي (ج.م)</Label>
                  <Input
                    id="remaining_amount"
                    type="number"
                    step="0.01"
                    value={form.remaining_amount}
                    onChange={(e) => setForm({ ...form, remaining_amount: e.target.value })}
                    placeholder="أدخل المبلغ المتبقي"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_datetime">موعد الزيارة</Label>
                  <Input
                    id="start_datetime"
                    type="datetime-local"
                    value={form.start_datetime}
                    onChange={(e) => setForm({ ...form, start_datetime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayofit_datetime">تاريخ الجلسة</Label>
                  <Input
                    id="dayofit_datetime"
                    type="datetime-local"
                    value={form.dayofit_datetime}
                    onChange={(e) => setForm({ ...form, dayofit_datetime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_datetime">الموعد القادم</Label>
                  <Input
                    id="end_datetime"
                    type="datetime-local"
                    value={form.end_datetime}
                    onChange={(e) => setForm({ ...form, end_datetime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="scheduled">مجدول</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="in-progress">جاري</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                    <option value="no-show">لم يحضر</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="أدخل أي ملاحظات إضافية"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  إلغاء
                </Button>
                <Button onClick={saveEdit} className="bg-primary hover:bg-primary/90">
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}