import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, UserPlus, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Customer, CustomerFormData } from '@/types/customer';
import { useCustomerStore } from '@/hooks/useCustomerStore';

interface UnifiedCustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  customer?: Customer;
  onSuccess?: (customer: Customer) => void;
}

export default function UnifiedCustomerForm({
  isOpen, 
  onClose, 
  mode,
  customer,
  onSuccess 
}: UnifiedCustomerFormProps) {
  const { toast } = useToast();
  const { addCustomer, updateCustomer } = useCustomerStore();
  
  // حالة البيانات الأساسية
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    phone2: '',
    notes: '',
    customerType: 'Individual',
    personalPhotoUrl: '',
    nationalIdImageUrl: '',
    nationalIdNumber: '',
    cars: [],
    contacts: [],
    relatedCustomers: []
  });

  // حالة الملفات
  const [personalPhotoFile, setPersonalPhotoFile] = useState<File | null>(null);
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);

  // تهيئة البيانات عند فتح النموذج
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && customer) {
        console.log('Loading customer data for edit:', customer);
      setCustomerData({
          name: customer.name || '',
          phone: customer.phone || '',
          phone2: customer.phone2 || '',
        notes: customer.notes || '',
          customerType: customer.customerType || 'Individual',
          personalPhotoUrl: customer.personalPhotoUrl || '',
          nationalIdImageUrl: customer.nationalIdImageUrl || '',
          nationalIdNumber: customer.nationalIdNumber || '',
          cars: customer.cars || [],
          contacts: customer.contacts || [],
        relatedCustomers: customer.relatedCustomers || []
      });
        console.log('Personal photo URL:', customer.personalPhotoUrl);
        console.log('National ID image URL:', customer.nationalIdImageUrl);
    } else {
        // إعادة تعيين البيانات للوضع الافتراضي
      setCustomerData({
        name: '',
        phone: '',
        phone2: '',
        notes: '',
          customerType: 'Individual',
          personalPhotoUrl: '',
          nationalIdImageUrl: '',
          nationalIdNumber: '',
          cars: [],
          contacts: [],
        relatedCustomers: []
      });
    }
      // إعادة تعيين الملفات
      setPersonalPhotoFile(null);
      setNationalIdFile(null);
    }
  }, [isOpen, mode, customer]);

  // الاستماع لأحداث التحديث
  useEffect(() => {
    const handleCustomerUpdated = (event: CustomEvent) => {
      console.log('Customer update event received:', event.detail);
      if (mode === 'edit' && event.detail && event.detail.id === customer?.id) {
        // تحديث البيانات المحلية
        setCustomerData(prev => ({
          ...prev,
          name: event.detail.name || prev.name,
          phone: event.detail.phone || prev.phone,
          notes: event.detail.notes || prev.notes,
          personalPhotoUrl: event.detail.personalPhotoUrl || prev.personalPhotoUrl,
          nationalIdImageUrl: event.detail.nationalIdImageUrl || prev.nationalIdImageUrl,
        }));
      }
    };

    window.addEventListener('customerUpdated', handleCustomerUpdated as EventListener);
    return () => {
      window.removeEventListener('customerUpdated', handleCustomerUpdated as EventListener);
    };
  }, [mode, customer?.id]);

  const handleSave = async () => {
    // التحقق من البيانات المطلوبة
    const name = customerData.name?.trim();
    const phone = customerData.phone?.trim();
    
    if (!name || !phone) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال الاسم ورقم الجوال على الأقل",
        variant: "destructive"
      });
      return;
    }

    // التحقق من صحة رقم الجوال
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      toast({
        title: "رقم جوال غير صحيح",
        description: "يرجى إدخال رقم جوال صحيح (10-15 رقم)",
        variant: "destructive"
      });
      return;
    }

    // البيانات الأساسية المطلوبة فقط
    const processedData = {
      name: name,
      phone: phone,
      phone2: customerData.phone2?.trim() || '',
      notes: customerData.notes?.trim() || '',
      customerType: 'Individual' as const,
      cars: [],
      contacts: [],
      relatedCustomers: [],
      personalPhotoUrl: customerData.personalPhotoUrl || '',
      nationalIdImageUrl: customerData.nationalIdImageUrl || '',
      nationalIdNumber: customerData.nationalIdNumber || ''
    };

    // إرسال FormData إذا كان هناك ملفات، وإلا JSON عادي
    let payload: any = processedData;
    
    if (personalPhotoFile instanceof File || nationalIdFile instanceof File) {
      const form = new FormData();
      // إضافة البيانات النصية بشكل صحيح
      form.append('name', String(processedData.name));
      form.append('phone', String(processedData.phone));
      form.append('phone2', String(processedData.phone2));
      form.append('customerType', String(processedData.customerType));
      if (processedData.notes) form.append('notes', String(processedData.notes));
      
      // إضافة الملفات
      if (personalPhotoFile instanceof File) {
        form.append('personalPhoto', personalPhotoFile);
        console.log('Adding personal photo file:', personalPhotoFile.name);
      }
      if (nationalIdFile instanceof File) {
        form.append('nationalIdImage', nationalIdFile);
        console.log('Adding national ID file:', nationalIdFile.name);
      }
      
      payload = form;
      console.log('Created FormData with files');
    }

    try {
      let resultCustomer: Customer;

      if (mode === 'edit' && customer) {
        // للتعديل، استخدم addCustomer مع FormData إذا كان هناك ملفات
        if (personalPhotoFile instanceof File || nationalIdFile instanceof File) {
          // إضافة ID المريض للـ FormData
          if (payload instanceof FormData) {
            payload.append('id', customer.id);
          }
          resultCustomer = await addCustomer(payload) as Customer;
        } else {
          // إرسال JSON عادي عند عدم وجود ملفات جديدة
          const updated = updateCustomer(customer.id, processedData);
          if (!updated) {
            throw new Error('فشل في تحديث بيانات المريض');
          }
          resultCustomer = updated;
          // انتظر قليلاً للتأكد من اكتمال العملية في الخلفية
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        if (resultCustomer && resultCustomer.id) {
          const hasNewImages = personalPhotoFile instanceof File || nationalIdFile instanceof File;
          toast({
            title: "تم تحديث بيانات المريض بنجاح",
            description: hasNewImages ? "تم حفظ التغييرات والصور بنجاح" : "تم حفظ التغييرات بنجاح"
          });
          onSuccess?.(resultCustomer);
          onClose();
        } else {
          throw new Error('فشل في تحديث بيانات المريض');
        }
      } else {
        // إرسال FormData عند توفر ملفات لضمان حفظ الروابط في الخادم
        resultCustomer = await addCustomer(payload) as Customer;
        
        if (resultCustomer && resultCustomer.id) {
          toast({
            title: "تم إضافة المريض بنجاح",
            description: "تم إضافة المريض الجديد بنجاح"
          });
          onSuccess?.(resultCustomer);
          onClose();
        } else {
          throw new Error('فشل في إضافة المريض');
        }
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      let errorMessage = "حدث خطأ أثناء حفظ البيانات";
      
      // معالجة أخطاء API
      if (error && typeof error === 'object') {
        if ('data' in error) {
          const apiError = error.data as any;
          if (apiError && typeof apiError === 'object' && 'message' in apiError) {
            errorMessage = apiError.message;
          }
        } else if ('message' in error) {
          errorMessage = (error as Error).message;
        }
      }
      
      // رسائل خاصة للأخطاء الشائعة
      if (errorMessage.includes('الاسم ورقم الجوال مطلوبان') || 
          errorMessage.includes('name and phone are required')) {
        errorMessage = "يرجى التأكد من إدخال الاسم ورقم الجوال بشكل صحيح";
      }
      
      toast({
        title: "خطأ في العملية",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-5 bg-gradient-raghwa text-white rounded-t-lg">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {mode === 'edit' ? <User className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
            </div>
            {mode === 'edit' ? 'تعديل بيانات المريض' : 'إضافة عميل'}
          </DialogTitle>
        </DialogHeader>

        {/* Simplified form for dress shop - both add and edit */}
        <div className="p-5 space-y-4">
                      <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل *</Label>
                      <Input
                        id="name"
                        value={customerData.name}
              onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
              placeholder="اسم المريض"
                        className="border-2 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
            <Label htmlFor="phone">رقم الجوال *</Label>
                      <Input
                        id="phone"
                        value={customerData.phone}
              onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        placeholder="05xxxxxxxx"
                        className="border-2 focus:border-primary"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
            <Label htmlFor="phone2">رقم هاتف إضافي</Label>
                      <Input
                        id="phone2"
                        value={customerData.phone2 || ''}
              onChange={(e) => setCustomerData({ ...customerData, phone2: e.target.value })}
                        placeholder="05xxxxxxxx (اختياري)"
                        className="border-2 focus:border-primary"
                        dir="ltr"
                      />
                    </div>
          <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
              <Label>الصورة الشخصية</Label>
                          <Input
                type="file" 
                accept="image/*" 
                onChange={(e) => setPersonalPhotoFile(e.target.files?.[0] || null)} 
              />
              {(personalPhotoFile || (customerData.personalPhotoUrl && customerData.personalPhotoUrl !== '')) ? (
                <div className="mt-2">
                  <img 
                    src={personalPhotoFile ? URL.createObjectURL(personalPhotoFile) : customerData.personalPhotoUrl} 
                    alt="Personal Photo Preview" 
                    className="w-20 h-20 object-cover rounded border" 
                    onError={(e) => {
                      console.error('Error loading personal photo:', e);
                      console.error('Image URL:', personalPhotoFile ? URL.createObjectURL(personalPhotoFile) : customerData.personalPhotoUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Personal photo loaded successfully');
                    }}
                          />
                  {personalPhotoFile && (
                    <p className="text-xs text-green-600 mt-1">📁 {personalPhotoFile.name}</p>
                  )}
                        </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500 text-center">
                  لا توجد صورة شخصية
                      </div>
              )}
                      </div>
                      <div className="space-y-2">
              <Label>صورة الهوية</Label>
                        <Input
                type="file" 
                accept="image/*" 
                onChange={(e) => setNationalIdFile(e.target.files?.[0] || null)} 
              />
              {(nationalIdFile || (customerData.nationalIdImageUrl && customerData.nationalIdImageUrl !== '')) ? (
                <div className="mt-2">
                  <img 
                    src={nationalIdFile ? URL.createObjectURL(nationalIdFile) : customerData.nationalIdImageUrl} 
                    alt="National ID Preview" 
                    className="w-20 h-20 object-cover rounded border" 
                    onError={(e) => {
                      console.error('Error loading national ID image:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('National ID image loaded successfully');
                    }}
                      />
                  {nationalIdFile && (
                    <p className="text-xs text-green-600 mt-1">📁 {nationalIdFile.name}</p>
                  )}
                    </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500 text-center">
                  لا توجد صورة هوية
                      </div>
                    )}
                      </div>
                      </div>
                  <div className="space-y-2">
            <Label htmlFor="notes">ملاحظة (اختياري)</Label>
                    <Textarea
                      id="notes"
              value={customerData.notes || ''}
              onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
              placeholder="مثال: المقاس المفضل، ملاحظة عن المناسبة..."
              className="border-2 focus:border-primary"
                      rows={3}
                    />
                  </div>
              </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                            <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
              إلغاء
            </Button>
            <Button 
            type="button"
            onClick={handleSave}
              className="w-full"
            >
            {mode === 'edit' ? 'حفظ التغييرات' : 'حفظ'}
            </Button>
          </div>
        </DialogContent>
    </Dialog>
  );
}