import { useState } from "react";
import { Users, Activity, Search, Filter, Edit, Trash2, UserCheck, UserX, Shield, Download, Upload, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, roles } from "@/types/user";
import { useExportUsersMutation, useImportUsersMutation } from "@/services/userApi";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UsersListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  isLoading?: boolean;
}

export function UsersList({ users, onEdit, onDelete, onToggleStatus, isLoading = false }: UsersListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];
  
  // Debug: Log users data
  // console.log('UsersList - users prop:', users);
  // console.log('UsersList - safeUsers:', safeUsers);
  // console.log('UsersList - safeUsers.length:', safeUsers.length);
  
  // // Debug: Log individual user data
  // safeUsers.forEach((user, index) => {
  //   console.log(`User ${index + 1}:`, {
  //     id: user.id,
  //     name: user.name,
  //     role: user.role,
  //     department: user.department,
  //     branch: user.branch,
  //     status: user.status
  //   });
  // });

  // API hooks
  const [exportUsers, { isLoading: isExporting }] = useExportUsersMutation();
  const [importUsers, { isLoading: isImporting }] = useImportUsersMutation();

  const getRoleName = (role: string) => {
    // إذا كان role يحتوي على نص عربي، اعرضه كما هو
    if (role && typeof role === 'string') {
      // إذا كان role هو ID، ابحث عن الاسم
      const roleObj = roles.find(r => r.id === role);
      if (roleObj) {
        return roleObj.name;
      }
      // إذا لم يكن ID، اعرض النص كما هو (مثل "بدون دور")
      return role;
    }
    return role || 'غير محدد';
  };

  const getStatusBadge = (status: "active" | "inactive") => {
    return status === "active" 
      ? <Badge className="bg-success/10 text-success border-success/20">نشط</Badge>
      : <Badge className="bg-destructive/10 text-destructive border-destructive/20">غير نشط</Badge>;
  };

  const filteredUsers = safeUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm) ||
                         user.nationalId.includes(searchTerm);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const activeUsers = safeUsers.filter(user => user.status === "active").length;
  const managers = safeUsers.filter(user => user.role === "manager" || user.role === "admin").length;
  const onlineUsers = safeUsers.filter(user => user.lastLogin !== "لم يسجل دخول بعد").length;

  // Get unique departments for filter
  const departments = [...new Set(safeUsers.map(user => user.department))];

  const handleExportUsers = async () => {
    try {
      const blob = await exportUsers({
        format: 'excel',
        filters: {
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          department: departmentFilter !== 'all' ? departmentFilter : undefined,
          search: searchTerm || undefined
        }
      }).unwrap();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير بيانات المستخدمين",
      });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    }
  };

  const handleImportUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "خطأ في نوع الملف",
        description: "يرجى اختيار ملف Excel (.xlsx أو .xls)",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    importUsers(formData)
      .unwrap()
      .then(() => {
        toast({
          title: "تم الاستيراد بنجاح",
          description: "تم استيراد بيانات المستخدمين",
        });
        // Reset file input
        event.target.value = '';
      })
      .catch((error) => {
        console.error('Error importing users:', error);
        toast({
          title: "خطأ في الاستيراد",
          description: "حدث خطأ أثناء استيراد البيانات",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمين النشطين</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المديرين</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{managers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-blue/5 to-secondary-blue/10 border-l-4 border-l-secondary-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متصلين حالياً</CardTitle>
            <Activity className="h-4 w-4 text-secondary-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-blue">{onlineUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex-1">
              <Input
                placeholder="البحث بالاسم أو البريد الإلكتروني أو رقم الهاتف أو الهوية الوطنية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأدوار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأقسام" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleExportUsers}
                disabled={isExporting}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "جاري التصدير..." : "تصدير البيانات"}
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportUsers}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button 
                  variant="outline"
                  className="gap-2"
                  disabled={isImporting}
                >
                  <Upload className="w-4 h-4" />
                  {isImporting ? "جاري الاستيراد..." : "استيراد البيانات"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>معلومات التصحيح</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>users prop:</strong> {JSON.stringify(users)}</p>
            <p><strong>safeUsers:</strong> {JSON.stringify(safeUsers)}</p>
            <p><strong>safeUsers.length:</strong> {safeUsers.length}</p>
            <p><strong>filteredUsers.length:</strong> {filteredUsers.length}</p>
          </div>
        </CardContent>
      </Card> */}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>
            عرض {filteredUsers.length} من أصل {safeUsers.length} مستخدم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>آخر تسجيل دخول</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.nameEn}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getRoleName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {user.department || 'بدون قسم'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {user.branch || 'بدون فرع'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>إجراءات إضافية</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onToggleStatus(user.id)}>
                              {user.status === "active" ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  إلغاء التفعيل
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  تفعيل
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                // تأكيد الحذف مع رسالة أكثر وضوحاً
                                const confirmed = window.confirm(
                                  `هل أنت متأكد من حذف المستخدم "${user.name}"؟\n\nهذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بيانات المستخدم.`
                                );
                                if (confirmed) {
                                  onDelete(user.id);
                                }
                              }} 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50 animate-spin" />
              <p>جاري تحميل المستخدمين...</p>
            </div>
          ) : safeUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مستخدمين في النظام</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد نتائج تطابق البحث</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}