import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Receipt, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Tag,
  Loader2
} from 'lucide-react';
import { 
  useGetAllExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseStatisticsQuery,
  useLazyExportExpensesQuery,
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesWithStatisticsQuery
} from '@/services/expensesApi';

// أنواع البيانات
interface Expense {
  id: number;
  title: string;
  amount: number;
  description: string;
  expenseDate: string;
  notes?: string;
  category: {
    id: number;
    name: string;
    description: string;
    color: string;
  };
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  totalExpenses: number;
  totalCount: number;
}

export default function ExpensesManagement() {
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<ExpenseCategory | null>(null);
  
  // Form states
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
    categoryId: ''
  });
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: 'bg-blue-100 text-blue-800'
  });

  // API queries
  const { 
    data: expensesData, 
    isLoading: expensesLoading, 
    error: expensesError,
    refetch: refetchExpenses
  } = useGetAllExpensesQuery({
    page,
    limit,
    search: searchTerm,
    categoryId: selectedCategory !== 'all' ? selectedCategory : ''
  });

  const { 
    data: statisticsData, 
    isLoading: statisticsLoading 
  } = useGetExpenseStatisticsQuery({});

  const { 
    data: categoriesData, 
    isLoading: categoriesLoading 
  } = useGetCategoriesWithStatisticsQuery({});

  // API mutations
  const [createExpense, { isLoading: createLoading }] = useCreateExpenseMutation();
  const [deleteExpense, { isLoading: deleteLoading }] = useDeleteExpenseMutation();
  const [createCategory, { isLoading: createCategoryLoading }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updateCategoryLoading }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleteCategoryLoading }] = useDeleteCategoryMutation();
  const [exportExpenses] = useLazyExportExpensesQuery();

  // Derived data
  const expenses = expensesData?.data?.expenses || [];
  const statistics = statisticsData?.data?.statistics || {
    totalExpenses: 0,
    totalCount: 0
  };
  const categories = categoriesData?.data?.categories || [];

  // إضافة مصروف جديد
  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.categoryId) {
      return;
    }

    try {
      await createExpense({
        title: newExpense.title,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description || null,
        expenseDate: newExpense.expenseDate || new Date().toISOString().split('T')[0],
        notes: newExpense.notes || null,
        categoryId: parseInt(newExpense.categoryId)
      }).unwrap();

      setNewExpense({
        title: '',
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: '',
        categoryId: ''
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  // حذف مصروف
  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id).unwrap();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // إضافة فئة جديدة
  const handleAddCategory = async () => {
    if (!newCategory.name) return;

    try {
      await createCategory({
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color
      }).unwrap();

      setNewCategory({
        name: '',
        description: '',
        color: 'bg-blue-100 text-blue-800'
      });
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // تعديل فئة
  const handleEditCategory = (category: ExpenseCategory) => {
    setSelectedCategoryForEdit(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setIsEditCategoryDialogOpen(true);
  };

  // حفظ تعديل الفئة
  const handleSaveEditCategory = async () => {
    if (!selectedCategoryForEdit || !newCategory.name) return;

    try {
      await updateCategory({
        id: selectedCategoryForEdit.id,
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color
      }).unwrap();

      setNewCategory({
        name: '',
        description: '',
        color: 'bg-blue-100 text-blue-800'
      });
      setSelectedCategoryForEdit(null);
      setIsEditCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  // حذف فئة
  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id).unwrap();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // تصدير المصروفات
  const handleExportExpenses = async () => {
    try {
      const result = await exportExpenses({
        startDate: '',
        endDate: '',
        categoryId: selectedCategory !== 'all' ? selectedCategory : ''
      }).unwrap();
      
      // تحويل البيانات إلى CSV وتنزيلها
      const csvData = result.data.expenses.map((expense: any) => ({
        'العنوان': expense.title,
        'المبلغ': expense.amount,
        'الفئة': expense.category?.name || '',
        'التاريخ': expense.expenseDate,
        'الوصف': expense.description || '',
        'الملاحظات': expense.notes || ''
      }));

      const csv = Object.keys(csvData[0]).join(',') + '\n' + 
        csvData.map((row: any) => Object.values(row).join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting expenses:', error);
    }
  };

  // Loading state
  if (expensesLoading || statisticsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المصروفات</h1>
          <p className="text-gray-600 mt-2">إدارة وتتبع جميع المصروفات والمصاريف</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCategoryDialogOpen(true)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Tag className="w-4 h-4 ml-2" />
            إدارة الفئات
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مصروف جديد
          </Button>
        </div>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalExpenses.toLocaleString()} جنية مصري</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Receipt className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد المصروفات</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.totalCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والتصفية */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="البحث في المصروفات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Label htmlFor="category">الفئة</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map((category: ExpenseCategory) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full md:w-auto"
                onClick={handleExportExpenses}
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول المصروفات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المصروفات</CardTitle>
          <CardDescription>
            عرض جميع المصروفات مع إمكانية التصفية والبحث
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expensesLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="mr-2">جاري تحميل المصروفات...</span>
            </div>
          ) : expensesError ? (
            <div className="text-center text-red-600 py-8">
              <p>حدث خطأ في تحميل المصروفات</p>
              <Button 
                variant="outline" 
                onClick={() => refetchExpenses()}
                className="mt-2"
              >
                إعادة المحاولة
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الملاحظات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense: Expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>{expense.amount.toLocaleString()} جنية مصري</TableCell>
                    <TableCell>
                      <Badge className={expense.category.color}>
                        {expense.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(expense.expenseDate).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>{expense.description || '-'}</TableCell>
                    <TableCell>{expense.notes || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedExpense(expense)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={deleteLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* نافذة إضافة مصروف جديد */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مصروف جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل المصروف الجديد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان المصروف</Label>
              <Input
                id="title"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                placeholder="أدخل عنوان المصروف"
              />
            </div>
            <div>
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="أدخل المبلغ"
              />
            </div>
            <div>
              <Label htmlFor="category">الفئة</Label>
              <Select value={newExpense.categoryId} onValueChange={(value) => setNewExpense({ ...newExpense, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: ExpenseCategory) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.expenseDate}
                onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="أدخل وصف المصروف"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">الملاحظات</Label>
              <Textarea
                id="notes"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                placeholder="أدخل ملاحظات إضافية"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleAddExpense} 
              className="bg-red-600 hover:bg-red-700"
              disabled={createLoading}
            >
              {createLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                'إضافة المصروف'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة عرض تفاصيل المصروف */}
      {selectedExpense && (
        <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>تفاصيل المصروف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">العنوان</Label>
                  <p className="text-lg font-semibold">{selectedExpense.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">المبلغ</Label>
                  <p className="text-lg font-semibold text-red-600">{selectedExpense.amount.toLocaleString()} جنية مصري</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">الفئة</Label>
                  <Badge className={selectedExpense.category.color}>
                    {selectedExpense.category.name}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">التاريخ</Label>
                  <p className="text-gray-900">{new Date(selectedExpense.expenseDate).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">الوصف</Label>
                <p className="text-gray-900">{selectedExpense.description || '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">الملاحظات</Label>
                <p className="text-gray-900">{selectedExpense.notes || '-'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedExpense(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* نافذة إدارة الفئات */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>إدارة فئات المصروفات</DialogTitle>
            <DialogDescription>
              إضافة وتعديل وحذف فئات المصروفات
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* إضافة فئة جديدة */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">إضافة فئة جديدة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="categoryName">اسم الفئة</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="أدخل اسم الفئة"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">الوصف</Label>
                  <Input
                    id="categoryDescription"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="أدخل وصف الفئة"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryColor">اللون</Label>
                  <Select value={newCategory.color} onValueChange={(value) => setNewCategory({ ...newCategory, color: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللون" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-blue-100 text-blue-800">أزرق</SelectItem>
                      <SelectItem value="bg-green-100 text-green-800">أخضر</SelectItem>
                      <SelectItem value="bg-red-100 text-red-800">أحمر</SelectItem>
                      <SelectItem value="bg-yellow-100 text-yellow-800">أصفر</SelectItem>
                      <SelectItem value="bg-purple-100 text-purple-800">بنفسجي</SelectItem>
                      <SelectItem value="bg-pink-100 text-pink-800">وردي</SelectItem>
                      <SelectItem value="bg-orange-100 text-orange-800">برتقالي</SelectItem>
                      <SelectItem value="bg-gray-100 text-gray-800">رمادي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleAddCategory} 
                className="mt-3 bg-blue-600 hover:bg-blue-700"
                disabled={createCategoryLoading}
              >
                {createCategoryLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة الفئة
                  </>
                )}
              </Button>
            </div>

            {/* قائمة الفئات الموجودة */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">الفئات الموجودة</h3>
              <div className="space-y-2">
                {categories.map((category: ExpenseCategory) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={category.color}>
                        {category.name}
                      </Badge>
                      <span className="text-sm text-gray-600">{category.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteCategoryLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل الفئة */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الفئة</DialogTitle>
            <DialogDescription>
              تعديل بيانات الفئة المحددة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCategoryName">اسم الفئة</Label>
              <Input
                id="editCategoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="أدخل اسم الفئة"
              />
            </div>
            <div>
              <Label htmlFor="editCategoryDescription">الوصف</Label>
              <Input
                id="editCategoryDescription"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="أدخل وصف الفئة"
              />
            </div>
            <div>
              <Label htmlFor="editCategoryColor">اللون</Label>
              <Select value={newCategory.color} onValueChange={(value) => setNewCategory({ ...newCategory, color: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر اللون" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-blue-100 text-blue-800">أزرق</SelectItem>
                  <SelectItem value="bg-green-100 text-green-800">أخضر</SelectItem>
                  <SelectItem value="bg-red-100 text-red-800">أحمر</SelectItem>
                  <SelectItem value="bg-yellow-100 text-yellow-800">أصفر</SelectItem>
                  <SelectItem value="bg-purple-100 text-purple-800">بنفسجي</SelectItem>
                  <SelectItem value="bg-pink-100 text-pink-800">وردي</SelectItem>
                  <SelectItem value="bg-orange-100 text-orange-800">برتقالي</SelectItem>
                  <SelectItem value="bg-gray-100 text-gray-800">رمادي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSaveEditCategory} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updateCategoryLoading}
            >
              {updateCategoryLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}