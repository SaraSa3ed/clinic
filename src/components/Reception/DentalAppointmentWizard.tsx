import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Save, X, Sparkles, Calendar, Clock, User, Plus, DollarSign, Shield, Receipt, CreditCard, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateAppointmentMutation } from "@/services/dentalAppointmentApi";
import { useGetCustomersQuery } from "@/services/customersApi";
import { Customer } from "@/types/customer";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DentalAppointmentWizard({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [createAppointment, { isLoading: saving }] = useCreateAppointmentMutation();
  const { data: customersResponse, isLoading: loadingCustomers } = useGetCustomersQuery({ limit: 100 });

  const customers = (customersResponse as any)?.data ?? [];

  // حقول الواجهة
  const [treatmentId, setTreatmentId] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    if (!customerSearchTerm.trim()) return customers.slice(0, 10);
    const term = customerSearchTerm.toLowerCase();
    return customers.filter((c: Customer) =>
      (c.name || "").toLowerCase().includes(term) ||
      (c.phone || "").includes(term)
    ).slice(0, 20);
  }, [customers, customerSearchTerm]);

  const [form, setForm] = useState({
    patient_name: "",
    patient_phone: "",
    patient_email: "",
    doctor_id: "",
    doctor_name: "",
    treatment_type: "",
    tooth_number: "",
    appointment_datetime: "",
    visit_date: "",
    next_appointment: "",
    diagnosis: "",
    notes: "",
    status: "confirmed",
    consultation_fee: "",
    treatment_cost: "",
    payment_amount: "",
    discount_amount: "",
    remaining_amount: "",
    payment_method: "cash" as const,
    insurance_company: "",
    insurance_coverage: "",
  });

  useEffect(() => {
    if (!open) {
      setSelectedCustomer(null);
      setForm({
        patient_name: "",
        patient_phone: "",
        patient_email: "",
        doctor_id: "",
        doctor_name: "",
        treatment_type: "",
        tooth_number: "",
        appointment_datetime: "",
        visit_date: "",
        next_appointment: "",
        diagnosis: "",
        notes: "",
        status: "confirmed",
        consultation_fee: "",
        treatment_cost: "",
        payment_amount: "",
        discount_amount: "",
        remaining_amount: "",
        payment_method: "cash",
        insurance_company: "",
        insurance_coverage: "",
      });
      setTreatmentId("");
      setCustomerSearchTerm("");
      setShowCustomerDropdown(false);
    }
  }, [open]);

  // إغلاق قائمة العملاء عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showCustomerDropdown && !target.closest('.customer-dropdown')) {
        setShowCustomerDropdown(false);
      }
    };

    if (showCustomerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomerDropdown]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setForm(prev => ({
      ...prev,
      patient_name: customer.name,
      patient_phone: customer.phone,
      patient_email: customer.email || "",
    }));
    setCustomerSearchTerm(customer.name);
    setShowCustomerDropdown(false);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearchTerm("");
    setForm(prev => ({
      ...prev,
      patient_name: "",
      patient_phone: "",
      patient_email: "",
    }));
  };

  const handleSubmit = async () => {
    if (!form.patient_name || !form.patient_phone || !form.appointment_datetime || !form.visit_date) {
      toast({ 
        title: "بيانات ناقصة", 
        description: "يرجى إدخال الاسم، الجوال، موعد الزيارة، وتاريخ الزيارة", 
        variant: "destructive" 
      });
      return;
    }

    // تحقق من صحة القيم المالية
    const fieldsToValidate = [
      { value: form.consultation_fee, name: "قيمة الكشف" },
      { value: form.treatment_cost, name: "تكلفة العلاج" },
      { value: form.payment_amount, name: "المبلغ المدفوع" },
      { value: form.discount_amount, name: "مبلغ الخصم" },
      { value: form.remaining_amount, name: "المبلغ المتبقي" },
    ];

    for (const field of fieldsToValidate) {
      if (field.value && parseFloat(field.value) < 0) {
        toast({ 
          title: "قيمة غير صحيحة", 
          description: `${field.name} يجب أن يكون أكبر من أو يساوي صفر`, 
          variant: "destructive" 
        });
        return;
      }
    }

    try {
      await createAppointment({
        patient_name: form.patient_name,
        patient_phone: form.patient_phone,
        patient_email: form.patient_email || undefined,
        doctor_id: form.doctor_id || undefined,
        doctor_name: form.doctor_name || undefined,
        treatment_id: treatmentId || undefined,
        treatment_type: form.treatment_type || undefined,
        tooth_number: form.tooth_number || undefined,
        consultation_fee: form.consultation_fee ? parseFloat(form.consultation_fee) : undefined,
        treatment_cost: form.treatment_cost ? parseFloat(form.treatment_cost) : undefined,
        appointment_datetime: new Date(form.appointment_datetime).toISOString(),
        visit_date: new Date(form.visit_date).toISOString(),
        next_appointment: form.next_appointment ? new Date(form.next_appointment).toISOString() : undefined,
        diagnosis: form.diagnosis || undefined,
        notes: form.notes || undefined,
        status: form.status,
        payment_amount: form.payment_amount ? parseFloat(form.payment_amount) : undefined,
        discount_amount: form.discount_amount ? parseFloat(form.discount_amount) : undefined,
        remaining_amount: form.remaining_amount ? parseFloat(form.remaining_amount) : undefined,
        payment_method: form.payment_method,
        insurance_company: form.insurance_company || undefined,
        insurance_coverage: form.insurance_coverage ? parseFloat(form.insurance_coverage) : undefined,
      }).unwrap();

      toast({ title: "تم إنشاء الموعد", description: "تم حفظ موعد الأسنان بنجاح" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "فشل إنشاء الموعد", description: e?.data?.message || "حدث خطأ غير متوقع", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            موعد أسنان جديد
          </DialogTitle>
          <DialogDescription>أدخل بيانات المريض واختر الطبيب والعلاج وحدد موعد الزيارة</DialogDescription>
        </DialogHeader>

        {/* البحث عن المريض */}
        <div className="space-y-2 mb-4">
          <Label className="flex items-center gap-2">
            <User className="w-4 h-4" />
            البحث عن المريض
          </Label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              value={customerSearchTerm} 
              onChange={(e) => {
                setCustomerSearchTerm(e.target.value);
                setShowCustomerDropdown(true);
                if (!e.target.value) {
                  setSelectedCustomer(null);
                  setForm(prev => ({
                    ...prev,
                    patient_name: "",
                    patient_phone: "",
                    patient_email: "",
                  }));
                }
              }} 
              onFocus={() => setShowCustomerDropdown(true)}
              placeholder="اكتب اسم المريض أو رقم الجوال" 
              className="pr-9" 
            />
          </div>
          
          {showCustomerDropdown && (
            <div className="customer-dropdown max-h-40 overflow-y-auto border rounded-lg bg-white shadow-lg z-10">
              {loadingCustomers ? (
                <div className="p-3 text-sm text-slate-500">جاري تحميل المرضى...</div>
              ) : (
                filteredCustomers.map((customer: Customer) => (
                  <div 
                    key={customer.id}
                    className="p-3 border-b cursor-pointer hover:bg-blue-50 flex items-center justify-between"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-slate-500">{customer.phone}</div>
                    </div>
                    <Badge variant="outline">{customer.customerType}</Badge>
                  </div>
                ))
              )}
              {!loadingCustomers && filteredCustomers.length === 0 && customerSearchTerm && (
                <div className="p-3 text-sm text-slate-500 text-center">
                  لا يوجد مريض بهذا الاسم
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2 w-full"
                    onClick={() => {
                      toast({ title: "معلومة", description: "يمكنك إضافة مريض جديد من إدارة المرضى" });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة مريض جديد
                  </Button>
                </div>
              )}
            </div>
          )}

          {selectedCustomer && (
            <div className="p-3 rounded-lg border bg-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-green-800">المريض المحدد: {selectedCustomer.name}</div>
                  <div className="text-xs text-green-600">الجوال: {selectedCustomer.phone}</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleClearCustomer}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* بيانات المريض */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">اسم المريض *</Label>
            <Input 
              value={form.patient_name} 
              onChange={(e) => setForm({ ...form, patient_name: e.target.value })} 
              placeholder="مثال: سارة علي" 
              disabled={!!selectedCustomer}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">الجوال *</Label>
            <Input 
              value={form.patient_phone} 
              onChange={(e) => setForm({ ...form, patient_phone: e.target.value })} 
              placeholder="05xxxxxxxx" 
              disabled={!!selectedCustomer}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">البريد الإلكتروني</Label>
            <Input 
              type="email" 
              value={form.patient_email} 
              onChange={(e) => setForm({ ...form, patient_email: e.target.value })} 
              placeholder="example@email.com" 
              disabled={!!selectedCustomer}
              className="w-full"
            />
          </div>
        </div>

        {/* بيانات الطبيب والعلاج */}
        <div className="border-t pt-3 mt-3">
          <h3 className="text-base font-semibold mb-3 text-gray-800">معلومات العلاج</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">كود الطبيب</Label>
              <Input
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                placeholder="اكتب كود الطبيب"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">اسم الطبيب</Label>
              <Input
                value={form.doctor_name}
                onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
                placeholder="د. أحمد محمد"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">كود العلاج/الخدمة</Label>
              <Input
                value={treatmentId}
                onChange={(e) => setTreatmentId(e.target.value)}
                placeholder="اكتب كود العلاج"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">نوع العلاج</Label>
              <Select value={form.treatment_type} onValueChange={(value) => setForm({ ...form, treatment_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع العلاج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="تنظيف">تنظيف</SelectItem>
                  <SelectItem value="حشو">حشو</SelectItem>
                  <SelectItem value="خلع">خلع</SelectItem>
                  <SelectItem value="تقويم">تقويم</SelectItem>
                  <SelectItem value="زراعة">زراعة</SelectItem>
                  <SelectItem value="تبييض">تبييض</SelectItem>
                  <SelectItem value="علاج عصب">علاج عصب</SelectItem>
                  <SelectItem value="تركيبات">تركيبات</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">رقم السن</Label>
              <Input
                value={form.tooth_number}
                onChange={(e) => setForm({ ...form, tooth_number: e.target.value })}
                placeholder="مثال: 11"
              />
            </div>
          </div>
        </div>

        {/* التواريخ */}
        <div className="border-t pt-3 mt-3">
          <h3 className="text-base font-semibold mb-3 text-gray-800">معلومات المواعيد</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 
                موعد الزيارة *
              </Label>
              <Input 
                type="datetime-local" 
                value={form.appointment_datetime} 
                onChange={(e) => setForm({ ...form, appointment_datetime: e.target.value })} 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> 
                تاريخ الزيارة *
              </Label>
              <Input 
                type="datetime-local" 
                value={form.visit_date} 
                onChange={(e) => setForm({ ...form, visit_date: e.target.value })} 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> 
                الموعد القادم
              </Label>
              <Input 
                type="datetime-local" 
                value={form.next_appointment} 
                onChange={(e) => setForm({ ...form, next_appointment: e.target.value })} 
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* التشخيص والملاحظات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">التشخيص</Label>
            <Textarea 
              value={form.diagnosis} 
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} 
              placeholder="التشخيص الطبي" 
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">ملاحظات</Label>
            <Textarea 
              value={form.notes} 
              onChange={(e) => setForm({ ...form, notes: e.target.value })} 
              placeholder="ملاحظات إضافية" 
              rows={3}
            />
          </div>
        </div>

        {/* الحقول المالية */}
        <div className="border-t pt-3 mt-3">
          <h3 className="text-base font-semibold mb-3 text-gray-800">المعلومات المالية</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                قيمة الكشف
              </Label>
              <Input 
                type="number" 
                value={form.consultation_fee} 
                onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} 
                placeholder="مثال: 100"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                تكلفة العلاج
              </Label>
              <Input 
                type="number" 
                value={form.treatment_cost} 
                onChange={(e) => setForm({ ...form, treatment_cost: e.target.value })} 
                placeholder="مثال: 500"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                المبلغ المدفوع
              </Label>
              <Input 
                type="number" 
                value={form.payment_amount} 
                onChange={(e) => setForm({ ...form, payment_amount: e.target.value })} 
                placeholder="مثال: 300"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                مبلغ الخصم
              </Label>
              <Input 
                type="number" 
                value={form.discount_amount} 
                onChange={(e) => setForm({ ...form, discount_amount: e.target.value })} 
                placeholder="مثال: 50"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                المبلغ المتبقي
              </Label>
              <Input 
                type="number" 
                value={form.remaining_amount} 
                onChange={(e) => setForm({ ...form, remaining_amount: e.target.value })} 
                placeholder="مثال: 200"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">طريقة الدفع</Label>
              <Select value={form.payment_method} onValueChange={(value: any) => setForm({ ...form, payment_method: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                  <SelectItem value="insurance">تأمين</SelectItem>
                  <SelectItem value="installment">تقسيط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">شركة التأمين</Label>
              <Input 
                value={form.insurance_company} 
                onChange={(e) => setForm({ ...form, insurance_company: e.target.value })} 
                placeholder="اسم الشركة"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">نسبة التغطية %</Label>
              <Input 
                type="number" 
                value={form.insurance_coverage} 
                onChange={(e) => setForm({ ...form, insurance_coverage: e.target.value })} 
                placeholder="مثال: 80"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* حالة الموعد */}
        <div className="space-y-2 mb-4">
          <Label className="text-sm font-medium">حالة الموعد</Label>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'scheduled', label: 'مجدول' },
              { value: 'confirmed', label: 'مؤكد' },
              { value: 'in-progress', label: 'جاري' },
              { value: 'completed', label: 'مكتمل' },
              { value: 'cancelled', label: 'ملغي' },
              { value: 'no-show', label: 'لم يحضر' },
            ].map(status => (
              <Button 
                key={status.value}
                type="button" 
                size="sm" 
                variant={form.status === status.value ? 'default' : 'outline'} 
                onClick={() => setForm(prev => ({ ...prev, status: status.value }))}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        {/* ملخص مالي */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200 mb-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            ملخص مالي
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-600">قيمة الكشف</p>
              <p className="text-lg font-bold text-green-600">
                {form.consultation_fee ? `${form.consultation_fee} ج.م` : '0 ج.م'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-600">تكلفة العلاج</p>
              <p className="text-lg font-bold text-blue-600">
                {form.treatment_cost ? `${form.treatment_cost} ج.م` : '0 ج.م'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-600">المبلغ المدفوع</p>
              <p className="text-lg font-bold text-green-600">
                {form.payment_amount ? `${form.payment_amount} ج.م` : '0 ج.م'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-600">المبلغ المتبقي</p>
              <p className="text-lg font-bold text-orange-600">
                {form.remaining_amount ? `${form.remaining_amount} ج.م` : '0 ج.م'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {"تأكيد الموعد"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
