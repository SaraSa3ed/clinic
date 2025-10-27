import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  FileText, 
  Download,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { useGetDailyReportQuery } from "@/services/dentalAppointmentApi";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function DailyRentalReport() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const { data: reportData, isLoading, error, refetch } = useGetDailyReportQuery({
    date: selectedDate
  });

  const report = reportData?.data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "مؤكد";
      case "in-progress":
        return "قيد التنفيذ";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const handleExport = () => {
    if (!report) return;
    
    const csvContent = [
      ["رقم الحجز", "اسم المريض", "رقم الجوال", "اسم الخامه او المنتج", "قيمة الإيجار", "المبلغ المدفوع", "مبلغ التأمين", "المبلغ المتبقي", "الحالة", "تاريخ الإنشاء"],
      ...report.bookings.map(booking => [
        booking.booking_id,
        booking.customer_name,
        booking.customer_phone,
        booking.product_name,
        booking.rental_price || 0,
        booking.payment_amount || 0,
        booking.insurance_amount || 0,
        booking.remaining_amount || 0,
        getStatusText(booking.status),
        format(new Date(booking.created_at), "yyyy-MM-dd HH:mm", { locale: ar })
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_إيراد_إيجار_${selectedDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل التقرير...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">حدث خطأ في تحميل التقرير</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقرير إيراد إيجار اليوم</h1>
          <p className="text-muted-foreground">عرض جميع المبالغ المدفوعة والعمليات المالية</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          <Button onClick={handleExport} disabled={!report?.bookings?.length}>
            <Download className="h-4 w-4 mr-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            اختيار التاريخ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            </div>
            <Button onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}>
              اليوم
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalBookings}</div>
                <p className="text-xs text-muted-foreground">حجز في هذا اليوم</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">جنيه مصري (مدفوع + تأمين)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المدفوع</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalPaymentAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">جنيه مصري</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيمة الإيجار</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{report.summary.totalRentalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">جنيه مصري</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Status */}
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.revenueByStatus.map((status) => (
                  <div key={status.status} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status.status)}
                      <div>
                        <p className="font-medium">{getStatusText(status.status)}</p>
                        <p className="text-sm text-muted-foreground">{status.count} حجز</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{status.paymentAmount.toLocaleString()} ج.م</p>
                      <p className="text-sm text-muted-foreground">قيمة الإيجار: {status.rentalAmount.toLocaleString()} ج.م</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.productStats.map((product) => (
                  <div key={product.product_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">الرمز: {product.product_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.count} حجز</p>
                      <p className="text-sm text-muted-foreground">إجمالي: {product.totalPayment.toLocaleString()} ج.م</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الحجوزات</CardTitle>
              <CardDescription>جميع الحجوزات في {format(new Date(selectedDate), "yyyy-MM-dd", { locale: ar })}</CardDescription>
            </CardHeader>
            <CardContent>
              {report.bookings.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد حجوزات في هذا اليوم</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.bookings.map((booking) => (
                    <div key={booking.booking_id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{booking.customer_name}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {booking.customer_phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {booking.product_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(booking.created_at), "HH:mm", { locale: ar })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">الإيجار:</span>
                              <span className="font-medium mr-1">{booking.rental_price || 0} ج.م</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">المدفوع:</span>
                              <span className="font-medium mr-1 text-green-600">{booking.payment_amount || 0} ج.م</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">التأمين:</span>
                              <span className="font-medium mr-1 text-blue-600">{booking.insurance_amount || 0} ج.م</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">المتبقي:</span>
                              <span className="font-medium mr-1 text-orange-600">{booking.remaining_amount || 0} ج.م</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
