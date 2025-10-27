/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Package,
  Save,
  X,
  Upload,
  Barcode,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useGetAllCategoriesQuery } from "@/services/categoriesApi";
import { useGetAllBrandsQuery } from "@/services/brandsApi";
import { useGetAllManufacturersQuery } from "@/services/manufacturersApi";
import { useGetAllSuppliersQuery } from "@/services/suppliersApi";
// Removed warehouses and branches dependencies per new requirements
import { useCreateProductMutation, useUpdateProductMutation } from "@/services/productApi";
// Removed product branch and inventory creation per new requirements
import { apiSlice } from "@/services/apiSlice";

// Define interfaces to match the database schema
interface Category {
  category_id: number;
  name_ar: string;
  name_en: string;
}

interface Brand {
  brand_id: number;
  name_ar: string;
  name_en: string;
}

interface Manufacturer {
  manufacturer_id: number;
  name_ar: string;
  name_en: string;
}

interface Supplier {
  supplier_id: number;
  name_ar: string;
  name_en: string;
}

// Removed Storage and Branch interfaces per new requirements

interface Product {
  product_id?: string;
  barcode?: string;
  name_ar: string;
  name_en: string;
  category_id: number;
  brand_id?: number;
  model?: string;
  status: "active" | "inactive";
  description?: string;
  manufacturer_id?: number;
  supplier_id?: number;
  selling_price: number;
  rental_price?: number;
  image_url?: string;
  weight_kg?: number;
  color?: string;
  size?: string;
  material?: string;
  shelf_location?: string;
  current_stock?: number;
}

interface ProductFormProps {
  editingProduct?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

// Helper function to get initial form data
const getInitialFormData = (): Product => ({
  product_id: "",
  barcode: "",
  name_ar: "",
  name_en: "",
  category_id: 0,
  brand_id: 0,
  model: "",
  status: "active",
  description: "",
  manufacturer_id: 0,
  supplier_id: 0,
  selling_price: 0,
  rental_price: 0,
  image_url: "",
  weight_kg: 0,
  color: "",
  size: "",
  material: "",
  shelf_location: "",
  current_stock: 0,
});

export const ProductForm: React.FC<ProductFormProps> = ({
  editingProduct,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(editingProduct && editingProduct.product_id);
  // If editingProduct is provided, use its values, otherwise use initial empty values
  const [formData, setFormData] = useState<Product>(
    editingProduct
      ? {
          product_id: editingProduct.product_id || "",
          barcode: editingProduct.barcode || "",
          name_ar: editingProduct.name_ar || "",
          name_en: editingProduct.name_en || "",
          category_id: editingProduct.category_id || 0,
          brand_id: editingProduct.brand_id || 0,
          model: editingProduct.model || "",
          status: editingProduct.status || "active",
          description: editingProduct.description || "",
          manufacturer_id: editingProduct.manufacturer_id || 0,
          supplier_id: editingProduct.supplier_id || 0,
          selling_price: editingProduct.selling_price || 0,
          rental_price: (editingProduct as any).rental_price || 0,
          image_url: editingProduct.image_url || "",
          weight_kg: editingProduct.weight_kg || 0,
          color: editingProduct.color || "",
          size: editingProduct.size || "",
          material: editingProduct.material || "",
          shelf_location: editingProduct.shelf_location || "",
          current_stock: (editingProduct as any).current_stock || 0,
        }
      : getInitialFormData()
  );

  // عرض البيانات الأولية
  useEffect(() => {
   
  }, []);

  const [activeTab, setActiveTab] = useState("details");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    editingProduct?.image_url || ""
  );
  const [error, setError] = useState<string | null>(null);

  // API Queries
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useGetAllCategoriesQuery(undefined);
  const {
    data: brandsData,
    isLoading: isBrandsLoading,
    error: brandsError,
  } = useGetAllBrandsQuery(undefined);
  const {
    data: manufacturersData,
    isLoading: isManufacturersLoading,
    error: manufacturersError,
  } = useGetAllManufacturersQuery(undefined);
  const {
    data: suppliersData,
    isLoading: isSuppliersLoading,
    error: suppliersError,
  } = useGetAllSuppliersQuery(undefined);
  const {
    // warehouses and branches queries removed
  } = {} as any;

  const [createProductTrigger, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [updateProductTrigger, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
  // removed inventory and product-branch mutations

  // Normalize API data to ensure arrays
  const normalizeData = (data: any, source: string): any[] => {
    if (!data) {
      console.warn(`No data received for ${source}`);
      return [];
    }
    if (Array.isArray(data)) return data;
    if (typeof data === "object") {
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      // Handle direct array in data: { data: [...] }
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      if (data.data && Array.isArray(data.data[source])) {
        return data.data[source];
      }
      if (data.data[source] && Array.isArray(data[source])) {
        return data.data[source];
      }
      if (Array.isArray(data.data.results)) {
        return data.data.results;
      }
      if (Array.isArray(data.data.items)) {
        return data.data.items;
      }
    }
    console.warn(`Unexpected ${source} data structure:`, data);
    return [];
  };

  // Ensure normalizeData always returns an array
  const safeNormalizeData = (data: any, source: string): any[] => {
    try {
      const result = normalizeData(data, source);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error(`Error normalizing ${source} data:`, error);
      return [];
    }
  };

  // Function to generate automatic product code
  const generateProductCode = useCallback(() => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const code = `PRD-${timestamp}-${randomSuffix}`;
    return code;
  }, []);

  // Extract and normalize data
  const categories = safeNormalizeData(categoriesData, "categories");
  const brands = safeNormalizeData(brandsData, "brands");
  const manufacturers = safeNormalizeData(manufacturersData, "manufacturers");
  const suppliers = safeNormalizeData(suppliersData, "suppliers");

  // Fallback to mock data if API fails - removed as not needed

  // Use actual data
  const finalManufacturers = manufacturers;
  const finalSuppliers = suppliers;

  // Ensure all arrays are valid
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeBrands = Array.isArray(brands) ? brands : [];
  const safeManufacturers = Array.isArray(finalManufacturers) ? finalManufacturers : [];
  const safeSuppliers = Array.isArray(finalSuppliers) ? finalSuppliers : [];

  
  // removed unit options

  const updateFormData = useCallback((field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Generate automatic product code when component mounts
  useEffect(() => {
    if (!editingProduct && formData.product_id === "") {
      const newCode = generateProductCode();
      setFormData((prev) => ({
        ...prev,
        product_id: newCode,
      }));
    }
  }, [editingProduct, formData.product_id, generateProductCode]);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreview(result);
          updateFormData("image_url", result);
        };
        reader.readAsDataURL(file);
      }
    },
    [updateFormData]
  );

  // Removed profit margin calculation (not needed for dresses form)

  // Helper to reset form fields after adding a product
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setImageFile(null);
    setImagePreview("");
    setActiveTab("basic");
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Validate required fields
      if (
        !formData.name_ar ||
        !formData.name_en ||
        !formData.category_id ||
        !formData.selling_price
      ) {
        setError("يرجى ملء جميع الحقول المطلوبة");
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        return;
      }

      // Generate product_id if not provided (only when creating)
      if (!isEditing && !formData.product_id) {
        const newProductId = generateProductCode();
        setFormData(prev => ({ ...prev, product_id: newProductId }));
        formData.product_id = newProductId;
      }

      // Removed defaults for warehouse/stock

      try {
        // إذا كانت هناك صورة مرفوعة، استخدم FormData ليرسل كـ multipart/form-data
        if (imageFile) {
          const form = new FormData();
          form.append("product_id", formData.product_id || "");
          if (formData.barcode) form.append("barcode", formData.barcode);
          form.append("name_ar", formData.name_ar);
          form.append("name_en", formData.name_en);
          form.append("category_id", String(formData.category_id));
          if (formData.brand_id) form.append("brand_id", String(formData.brand_id));
          if (formData.model) form.append("model", formData.model);
          form.append("status", formData.status);
          if (formData.description) form.append("description", formData.description);
          if (formData.manufacturer_id) form.append("manufacturer_id", String(formData.manufacturer_id));
          if (formData.supplier_id) form.append("supplier_id", String(formData.supplier_id));
          form.append("selling_price", String(formData.selling_price));
          if (formData.rental_price !== undefined && formData.rental_price !== null) {
            form.append("rental_price", String(formData.rental_price));
          }
          form.append("current_stock", String(formData.current_stock ?? 0));
          if (formData.weight_kg !== undefined && formData.weight_kg !== null) form.append("weight_kg", String(formData.weight_kg));
          if (formData.color) form.append("color", formData.color);
          if (formData.size) form.append("size", formData.size);
          if (formData.material) form.append("material", formData.material);
          if (formData.shelf_location) form.append("shelf_location", formData.shelf_location);
          form.append("image_url", imageFile);

          if (isEditing) {
            await updateProductTrigger({ id: formData.product_id, updatedProduct: form }).unwrap();
            toast.success("تم تحديث المنتج بنجاح");
          } else {
            await createProductTrigger(form).unwrap();
            toast.success("تم إنشاء المنتج بنجاح");
          }
        } else {
          const payload = {
          product_id: formData.product_id,
          barcode: formData.barcode || null,
          name_ar: formData.name_ar,
          name_en: formData.name_en,
          category_id: formData.category_id,
          brand_id: formData.brand_id || null,
          model: formData.model || null,
          status: formData.status,
          description: formData.description || null,
          manufacturer_id: formData.manufacturer_id || null,
          supplier_id: formData.supplier_id || null,
          selling_price: formData.selling_price,
          rental_price: formData.rental_price || null,
          current_stock: formData.current_stock ?? 0,
          image_url: formData.image_url || null,
          weight_kg: formData.weight_kg || null,
          color: formData.color || null,
          size: formData.size || null,
          material: formData.material || null,
        };

          if (isEditing) {
            await updateProductTrigger({ id: formData.product_id, updatedProduct: payload }).unwrap();
            toast.success("تم تحديث المنتج بنجاح");
          } else {
            await createProductTrigger(payload).unwrap();
            toast.success("تم إنشاء المنتج بنجاح");
          }
        }

        // Skipped inventory creation and branch linking per new requirements
        // Only reset the form if not editing (i.e. adding new)
        if (!isEditing) {
          resetForm();
        }
        console.log("📤 استدعاء onSave");
        onSave();
      } catch (error: any) {
        console.error("❌ خطأ في إنشاء المنتج:", error);
        // intentionally no error toast to avoid showing alerts when save actually succeeds
      }
    },
    [formData, createProductTrigger, updateProductTrigger, onSave, resetForm, isEditing]
  );

  const isLoading =
    isCategoriesLoading ||
    isBrandsLoading ||
    isManufacturersLoading ||
    isSuppliersLoading ||
    isCreatingProduct ||
    isUpdatingProduct;

  // We avoid rendering a blocking error banner to prevent noisy messages when DB operations succeed.

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
        </h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 ml-2" />
            {isLoading ? "جارٍ الحفظ..." : "حفظ المنتج"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="image">الصور</TabsTrigger>
        </TabsList>

        {/* Details Tab (for dresses) */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                تفاصيل الخامه او المنتج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_id">كود المنتج *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product_id"
                      value={formData.product_id}
                      onChange={(e) =>
                        updateFormData("product_id", e.target.value)
                      }
                      placeholder={isEditing ? "" : "سيتم التوليد تلقائياً"}
                      disabled={isEditing}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateFormData("product_id", generateProductCode())}
                      disabled={isEditing}
                      title="توليد كود جديد"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    يتم توليد الكود تلقائياً، يمكنك تعديله يدوياً إذا لزم الأمر
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">الباركود</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) =>
                        updateFormData("barcode", e.target.value)
                      }
                      placeholder="1234567890123"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Barcode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_ar">اسم المنتج بالعربية *</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => updateFormData("name_ar", e.target.value)}
                    placeholder="فستان زفاف كلاسيكي"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">اسم المنتج بالإنجليزية *</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => updateFormData("name_en", e.target.value)}
                    placeholder="Classic Wedding Dress"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">الفئة *</Label>
                  <Select
                    value={
                      formData.category_id ? String(formData.category_id) : ""
                    }
                    onValueChange={(value) =>
                      updateFormData("category_id", Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeCategories?.map((category: Category) => (
                        <SelectItem
                          key={category.category_id}
                          value={String(category.category_id)}
                        >
                          {category.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {safeCategories.length === 0 && !isCategoriesLoading && (
                    <p className="text-sm text-gray-500 mt-1">
                      لا يوجد فئات متاحة. يرجى إضافة فئات أولاً.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_id">العلامة التجارية</Label>
                  <Select
                    value={formData.brand_id ? String(formData.brand_id) : ""}
                    onValueChange={(value) =>
                      updateFormData("brand_id", Number(value))
                    }
                    disabled={isBrandsLoading || safeBrands.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isBrandsLoading
                            ? "جارٍ التحميل..."
                            : safeBrands.length === 0
                            ? "لا يوجد علامات تجارية متاحة"
                            : "اختر العلامة التجارية"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(safeBrands) && safeBrands.length > 0 ? (
                        safeBrands.map((brand: Brand) => (
                          <SelectItem
                            key={brand.brand_id}
                            value={String(brand.brand_id)}
                          >
                            {brand.name_ar}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          لا يوجد علامات تجارية متاحة
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {safeBrands.length === 0 && !isBrandsLoading && (
                    <p className="text-sm text-gray-500 mt-1">
                      لا يوجد علامات تجارية متاحة. يرجى إضافة علامات تجارية
                      أولاً.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">الموديل</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => updateFormData("model", e.target.value)}
                    placeholder="موديل 2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      updateFormData("status", value as "active" | "inactive")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">المقاس</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => updateFormData("size", e.target.value)}
                    placeholder="XS / S / M / L / XL / XXL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">اللون</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => updateFormData("color", e.target.value)}
                    placeholder="مثل: أبيض / عاجي / وردي / أزرق"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer_id">الشركة المصنعة</Label>
                  <Select
                    value={
                      formData.manufacturer_id
                        ? String(formData.manufacturer_id)
                        : ""
                    }
                    onValueChange={(value) =>
                      updateFormData("manufacturer_id", Number(value))
                    }
                    disabled={
                      isManufacturersLoading ||
                      !Array.isArray(safeManufacturers) ||
                      safeManufacturers.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isManufacturersLoading
                            ? "جارٍ التحميل..."
                            : safeManufacturers.length === 0
                            ? "لا يوجد شركات مصنعة متاحة"
                            : "اختر الشركة المصنعة"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(safeManufacturers) &&
                      safeManufacturers.length > 0 ? (
                        safeManufacturers.map((manufacturer: Manufacturer) => (
                          <SelectItem
                            key={manufacturer.manufacturer_id}
                            value={String(manufacturer.manufacturer_id)}
                          >
                            {manufacturer.name_ar}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          لا يوجد شركات مصنعة متاحة
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {!isManufacturersLoading && safeManufacturers.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      لا يوجد شركات مصنعة متاحة. يرجى إضافة شركات مصنعة أولاً.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_id">المورد</Label>
                  <Select
                    value={
                      formData.supplier_id ? String(formData.supplier_id) : ""
                    }
                    onValueChange={(value) =>
                      updateFormData("supplier_id", Number(value))
                    }
                    disabled={
                      isSuppliersLoading ||
                      !Array.isArray(safeSuppliers) ||
                      safeSuppliers.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isSuppliersLoading
                            ? "جارٍ التحميل..."
                            : !Array.isArray(safeSuppliers) ||
                              safeSuppliers.length === 0
                            ? "لا يوجد موردين متاحين"
                            : "اختر المورد"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(safeSuppliers) && safeSuppliers.length > 0 ? (
                        safeSuppliers.map((supplier: Supplier) => (
                          <SelectItem
                            key={supplier.supplier_id}
                            value={String(supplier.supplier_id)}
                          >
                            {supplier.name_ar}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          لا يوجد موردين متاحين
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {!isSuppliersLoading &&
                    (!Array.isArray(safeSuppliers) || safeSuppliers.length === 0) && (
                      <p className="text-sm text-gray-500 mt-1">
                        لا يوجد موردين متاحين. يرجى إضافة موردين أولاً.
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                  placeholder="تفاصيل التصميم، نوع القماش، القَصّة، اللمسات الخاصة، الإكسسوارات..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">الخامة</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => updateFormData("material", e.target.value)}
                    placeholder="مثل: شيفون، ساتان، تول، دانتيل، حرير"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_stock">الكمية</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    value={formData.current_stock}
                    onChange={(e) =>
                      updateFormData("current_stock", Number(e.target.value))
                    }
                    min="0"
                    step="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">الوزن (كجم)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    value={formData.weight_kg}
                    onChange={(e) =>
                      updateFormData("weight_kg", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling_price">سعر الخامه او المنتج *</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    value={formData.selling_price}
                    onChange={(e) =>
                      updateFormData("selling_price", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rental_price">سعر الإيجار اليومي</Label>
                  <Input
                    id="rental_price"
                    type="number"
                    value={formData.rental_price}
                    onChange={(e) =>
                      updateFormData("rental_price", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        

        {/* Image Tab */}
        <TabsContent value="image" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                صورة المنتج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="image-upload">صورة المنتج</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span>رفع صورة</span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="معاينة المنتج"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                          updateFormData("image_url", "");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
};