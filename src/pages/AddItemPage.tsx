import React from "react";
import { AddItemForm } from "@/components/Inventory/AddItemForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AddItemPage() {
  const navigate = useNavigate();

  const handleSave = () => {
    // يمكن إضافة منطق إضافي هنا مثل إعادة التوجيه
    console.log("تم حفظ الصنف بنجاح");
    navigate("/inventory"); // العودة إلى صفحة المخزون
  };

  const handleCancel = () => {
    navigate("/inventory"); // العودة إلى صفحة المخزون
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-purple-50/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/inventory")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للمخزون
            </Button>
          </div>
          
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-amber-900">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-purple-600 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                إضافة صنف جديد
              </CardTitle>
              <p className="text-amber-700 mt-2">
                أضف خدمات أو منتجات أو مستهلكات أو قطع غيار جديدة إلى النظام
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Form */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <AddItemForm onSave={handleSave} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 