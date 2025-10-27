import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Receipt, 
  Calendar, 
  Car, 
  User, 
  Search,
  Filter,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Loader2
} from 'lucide-react';

interface Transaction {
  id: string;
  customerId: string;
  date: string;
  services: string[];
  amount: number;
  paidAmount: number;
  status: 'مكتمل' | 'جزئي' | 'معلق' | 'ملغي';
  carPlate: string;
  carModel: string;
  supervisor: string;
  branch: string;
  paymentMethod: string;
  notes: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerTransactionHistoryProps {
  customerId: string;
}

export function CustomerTransactionHistory({ customerId }: CustomerTransactionHistoryProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دالة جلب بيانات المعاملات من API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/transactions/customer/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل في جلب بيانات المعاملات');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      
      toast({
        title: "تم جلب البيانات بنجاح",
        description: `تم العثور على ${data.transactions?.length || 0} معاملة`,
        variant: "default"
      });
    } catch (error) {
      console.error('خطأ في جلب المعاملات:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
      
      toast({
        title: "خطأ في جلب البيانات",
        description: "فشل في جلب بيانات المعاملات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    if (customerId) {
      fetchTransactions();
    }
  }, [customerId]);

  // دالة تحديث المعاملة
  const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث حالة المعاملة');
      }

      // تحديث البيانات المحلية
      setTransactions(prev => prev.map(txn => 
        txn.id === transactionId ? { ...txn, status: newStatus as any } : txn
      ));

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة المعاملة",
        variant: "default"
      });
    } catch (error) {
      console.error('خطأ في تحديث المعاملة:', error);
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث حالة المعاملة",
        variant: "destructive"
      });
    }
  };

  // دالة تصدير البيانات
  const exportTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions/customer/${customerId}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل في تصدير البيانات');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `معاملات_المريض_${customerId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تحميل ملف البيانات",
        variant: "default"
      });
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
      toast({
        title: "خطأ في التصدير",
        description: "فشل في تصدير البيانات",
        variant: "destructive"
      });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'مكتمل':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'جزئي':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: Clock,
          iconColor: 'text-yellow-600'
        };
      case 'معلق':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: AlertCircle,
          iconColor: 'text-red-600'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: Clock,
          iconColor: 'text-gray-600'
        };
    }
  };

  // تصفية المعاملات حسب البحث والحالة والتاريخ
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.services.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.carPlate.includes(searchTerm) ||
                         transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    // تصفية التاريخ
    let matchesDate = true;
    if (dateRange !== 'all') {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          matchesDate = transactionDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= monthAgo;
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= quarterAgo;
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= yearAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalTransactions = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const totalPaid = filteredTransactions.reduce((sum, txn) => sum + txn.paidAmount, 0);
  const pendingAmount = totalAmount - totalPaid;

  return (
    <div className="space-y-6">
      {/* حالة التحميل */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <div className="text-gray-600">جاري تحميل بيانات المعاملات...</div>
          </CardContent>
        </Card>
      )}

      {/* رسالة الخطأ */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <div className="text-red-800 font-semibold mb-2">حدث خطأ</div>
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={fetchTransactions} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* إحصائيات سريعة */}
      {!loading && !error && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-800">{totalTransactions}</div>
              <div className="text-sm text-blue-600">إجمالي المعاملات</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-800">{totalAmount.toLocaleString()}</div>
              <div className="text-sm text-green-600">إجمالي المبلغ</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-800">{totalPaid.toLocaleString()}</div>
              <div className="text-sm text-purple-600">المبلغ المدفوع</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-800">{pendingAmount.toLocaleString()}</div>
              <div className="text-sm text-orange-600">المتبقي</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* أدوات التصفية والبحث */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                سجل المعاملات
                {transactions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {transactions.length} معاملة
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportTransactions}
                  disabled={transactions.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  تصدير
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchTransactions}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  تحديث
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في المعاملات، رقم اللوحة، أو رقم الفاتورة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="تصفية بالحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="مكتمل">مكتمل</SelectItem>
                  <SelectItem value="جزئي">جزئي</SelectItem>
                  <SelectItem value="معلق">معلق</SelectItem>
                  <SelectItem value="ملغي">ملغي</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفترات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="quarter">هذا الربع</SelectItem>
                  <SelectItem value="year">هذا العام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* قائمة المعاملات */}
            <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={transaction.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Receipt className="h-6 w-6 text-white" />
                        </div>
                        
                        <div>
                          <div className="font-bold text-lg text-gray-800">
                            {transaction.services.join(' + ')}
                          </div>
                          <div className="text-sm text-gray-600 space-x-2">
                            <span className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {transaction.carPlate} - {transaction.carModel}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1 space-x-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(transaction.date).toLocaleString('ar-SA')}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              المشرف: {transaction.supervisor}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="font-bold text-xl text-green-600">
                          {transaction.amount.toLocaleString()} ج.م
                        </div>
                        
                        <Badge className={`${statusConfig.color} border`}>
                          <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.iconColor}`} />
                          {transaction.status}
                        </Badge>
                        
                        {transaction.status === 'جزئي' && (
                          <div className="text-sm text-orange-600">
                            مدفوع: {transaction.paidAmount.toLocaleString()} ج.م
                            <br />
                            متبقي: {(transaction.amount - transaction.paidAmount).toLocaleString()} ج.م
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            عرض
                          </Button>
                          {transaction.status !== 'مكتمل' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateTransactionStatus(transaction.id, 'مكتمل')}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              إكمال
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {transaction.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <strong>ملاحظات:</strong> {transaction.notes}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t pt-2">
                      <span>الفرع: {transaction.branch}</span>
                      <span>رقم الفاتورة: {transaction.invoiceNumber}</span>
                      <span>طريقة الدفع: {transaction.paymentMethod}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredTransactions.length === 0 && !loading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <div className="text-gray-600">
                    {transactions.length === 0 ? 'لا توجد معاملات لهذا المريض' : 'لا توجد معاملات تطابق البحث'}
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}