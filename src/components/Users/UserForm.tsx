import { User as UserIcon, Building, Phone, Mail, MapPin, Heart, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserFormData, roles } from "@/types/user";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserFormProps {
  formData: UserFormData;
  onInputChange: (field: string, value: string | number | object) => void;
  editingUser: User | null;
}

export function UserForm({ formData, onInputChange, editingUser }: UserFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          return 'الاسم يجب أن يكون على الأقل حرفين';
        }
        break;
      case 'email':
        if (!value) {
          return 'البريد الإلكتروني مطلوب';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'البريد الإلكتروني غير صحيح';
        }
        break;
      case 'phone':
        if (!value) {
          return 'رقم الهاتف مطلوب';
        }
        const phoneRegex = /^\+966\d{9}$/;
        if (!phoneRegex.test(value)) {
          return 'رقم الهاتف يجب أن يكون بتنسيق +966xxxxxxxxx';
        }
        break;
      case 'nationalId':
        if (!value) {
          return 'رقم الهوية الوطنية مطلوب';
        }
        if (value.length !== 14) {
          return 'رقم الهوية الوطنية يجب أن يكون 14 أرقام';
        }
        break;
      case 'role':
        if (!value) {
          return 'الدور مطلوب';
        }
        break;
      case 'department':
        if (!value) {
          return 'القسم مطلوب';
        }
        break;
    }
    return '';
  };

  const handleInputChange = (field: string, value: string | number | object) => {
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Validate field
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
    
    // Call parent handler
    onInputChange(field, value);
  };

  const hasErrors = Object.values(errors).some(error => error !== '');

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            يرجى تصحيح الأخطاء التالية قبل المتابعة
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card className="group shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-primary/5 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <UserIcon className="w-4 h-4 text-primary" />
            </div>
            {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
          </CardTitle>
          <CardDescription>المعلومات الشخصية للمستخدم</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <UserIcon className="w-3 h-3 text-primary" />
                الاسم الكامل (عربي) *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="أدخل الاسم الكامل"
                className={`focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                  errors.name ? 'border-destructive focus:ring-destructive/20' : ''
                }`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="nameEn" className="flex items-center gap-2">
                <UserIcon className="w-3 h-3 text-secondary-blue" />
                الاسم الكامل (إنجليزي)
              </Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => handleInputChange("nameEn", e.target.value)}
                placeholder="Full Name in English"
                className="focus:ring-2 focus:ring-secondary-blue/20 transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-primary" />
                البريد الإلكتروني *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="user@example.com"
                className={`focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                  errors.email ? 'border-destructive focus:ring-destructive/20' : ''
                }`}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="nationalId" className="flex items-center gap-2">
                <Building className="w-3 h-3 text-warning" />
                رقم الهوية الوطنية *
              </Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => handleInputChange("nationalId", e.target.value)}
                placeholder="1234567890"
                maxLength={10}
                className={`focus:ring-2 focus:ring-warning/20 transition-all duration-200 ${
                  errors.nationalId ? 'border-destructive focus:ring-destructive/20' : ''
                }`}
              />
              {errors.nationalId && (
                <p className="text-sm text-destructive mt-1">{errors.nationalId}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-success" />
                رقم الهاتف *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+966xxxxxxxxx"
                className={`focus:ring-2 focus:ring-success/20 transition-all duration-200 ${
                  errors.phone ? 'border-destructive focus:ring-destructive/20' : ''
                }`}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="mobile" className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-secondary-blue" />
                رقم الجوال
              </Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                placeholder="+966xxxxxxxxx"
                className="focus:ring-2 focus:ring-secondary-blue/20 transition-all duration-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Information */}
      <Card className="group shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-secondary-blue/5 border-l-4 border-l-secondary-blue">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Building className="w-4 h-4 text-secondary-blue" />
            </div>
            المعلومات الوظيفية
          </CardTitle>
          <CardDescription>تفاصيل الوظيفة والدور</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="role" className="flex items-center gap-2">
                <Building className="w-3 h-3 text-primary" />
                الدور *
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger className={`focus:ring-2 focus:ring-primary/20 ${
                  errors.role ? 'border-destructive focus:ring-destructive/20' : ''
                }`}>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive mt-1">{errors.role}</p>
              )}
            </div>
            <div>
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building className="w-3 h-3 text-secondary-blue" />
                القسم *
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="أدخل اسم القسم"
                className={`focus:ring-2 focus:ring-secondary-blue/20 transition-all duration-200 ${
                  errors.department ? 'border-destructive focus:ring-destructive/20' : ''
                }`}
              />
              {errors.department && (
                <p className="text-sm text-destructive mt-1">{errors.department}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="position" className="flex items-center gap-2">
                <Building className="w-3 h-3 text-warning" />
                المنصب
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="أدخل المنصب"
                className="focus:ring-2 focus:ring-warning/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label htmlFor="branch" className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-success" />
                الفرع
              </Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => handleInputChange("branch", e.target.value)}
                placeholder="أدخل اسم الفرع"
                className="focus:ring-2 focus:ring-success/20 transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="supervisor" className="flex items-center gap-2">
                <UserIcon className="w-3 h-3 text-primary" />
                المشرف المباشر
              </Label>
              <Input
                id="supervisor"
                value={formData.supervisor}
                onChange={(e) => handleInputChange("supervisor", e.target.value)}
                placeholder="أدخل اسم المشرف"
                className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label htmlFor="hireDate" className="flex items-center gap-2">
                <Building className="w-3 h-3 text-secondary-blue" />
                تاريخ التوظيف
              </Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleInputChange("hireDate", e.target.value)}
                className="focus:ring-2 focus:ring-secondary-blue/20 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="salary" className="flex items-center gap-2">
              <Building className="w-3 h-3 text-warning" />
              الراتب الأساسي
            </Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => handleInputChange("salary", parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="100"
              className="focus:ring-2 focus:ring-warning/20 transition-all duration-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="group shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-success/5 border-l-4 border-l-success">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-4 h-4 text-success" />
            </div>
            معلومات العنوان
          </CardTitle>
          <CardDescription>عنوان السكن</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="country" className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" />
                الدولة
              </Label>
              <Input
                id="country"
                value={formData.address.country}
                onChange={(e) => handleInputChange("address.country", e.target.value)}
                placeholder="أدخل اسم الدولة"
                className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-secondary-blue" />
                المدينة
              </Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => handleInputChange("address.city", e.target.value)}
                placeholder="أدخل اسم المدينة"
                className="focus:ring-2 focus:ring-secondary-blue/20 transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="district" className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-warning" />
                الحي
              </Label>
              <Input
                id="district"
                value={formData.address.district}
                onChange={(e) => handleInputChange("address.district", e.target.value)}
                placeholder="أدخل اسم الحي"
                className="focus:ring-2 focus:ring-warning/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label htmlFor="street" className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-success" />
                الشارع
              </Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleInputChange("address.street", e.target.value)}
                placeholder="أدخل اسم الشارع"
                className="focus:ring-2 focus:ring-success/20 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="postalCode" className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-primary" />
              الرمز البريدي
            </Label>
            <Input
              id="postalCode"
              value={formData.address.postalCode}
              onChange={(e) => handleInputChange("address.postalCode", e.target.value)}
              placeholder="12345"
              maxLength={5}
              className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="group shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-warning/5 border-l-4 border-l-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-4 h-4 text-warning" />
            </div>
            جهة الاتصال في حالات الطوارئ
          </CardTitle>
          <CardDescription>بيانات شخص للاتصال به في حالات الطوارئ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="emergencyName" className="flex items-center gap-2">
                <UserIcon className="w-3 h-3 text-primary" />
                الاسم
              </Label>
              <Input
                id="emergencyName"
                value={formData.emergency.name}
                onChange={(e) => handleInputChange("emergency.name", e.target.value)}
                placeholder="أدخل اسم الشخص"
                className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone" className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-secondary-blue" />
                رقم الهاتف
              </Label>
              <Input
                id="emergencyPhone"
                value={formData.emergency.phone}
                onChange={(e) => handleInputChange("emergency.phone", e.target.value)}
                placeholder="+966xxxxxxxxx"
                className="focus:ring-2 focus:ring-secondary-blue/20 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="emergencyRelation" className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-warning" />
              صلة القرابة
            </Label>
            <Input
              id="emergencyRelation"
              value={formData.emergency.relation}
              onChange={(e) => handleInputChange("emergency.relation", e.target.value)}
              placeholder="مثال: الزوج/الزوجة، الأب، الأم، الأخ، إلخ"
              className="focus:ring-2 focus:ring-warning/20 transition-all duration-200"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}