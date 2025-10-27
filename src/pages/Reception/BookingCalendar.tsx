import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useListAppointmentsQuery, useUpdateAppointmentMutation } from "@/services/dentalAppointmentApi";
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  User, 
  MapPin, 
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Download,
  Activity,
  TrendingUp,
  Target,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Clock3,
  CheckCircle2,
  UserX,
  Sparkles,
  Phone,
  Mail,
  Package,
  FileText,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from "lucide-react";
import { DentalAppointmentWizard } from "@/components/Reception/DentalAppointmentWizard";
import { useToast } from "@/hooks/use-toast";

interface BookingStatus {
  status: string;
  label: string;
  color: string;
  bgColor: string;
  icon: any;
}

const bookingStatuses: BookingStatus[] = [
  { status: 'pending', label: 'في الانتظار', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300', icon: Clock3 },
  { status: 'confirmed', label: 'مؤكد', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300', icon: CheckCircle },
  { status: 'in-progress', label: 'قيد التنفيذ', color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-300', icon: PlayCircle },
  { status: 'completed', label: 'مكتمل', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300', icon: CheckCircle2 },
  { status: 'cancelled', label: 'ملغي', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300', icon: XCircle },
  { status: 'no-show', label: 'لم يحضر', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-300', icon: UserX },
];

export default function BookingCalendar() {
  const { data, isLoading, refetch } = useListAppointmentsQuery();
  const [updateAppointmentMut] = useUpdateAppointmentMutation();
  const apiAppointments = (data as any)?.data ?? [];
  
  // Map API appointments to calendar-friendly structure used below
  const appointments = (apiAppointments as any[]).map((b: any) => {
    const start = new Date(b.appointment_datetime);
    const date = start.toISOString().split('T')[0];
    const time = start.toTimeString().slice(0,5);
    
    return {
      id: b.appointment_id,
      customerName: b.patient_name || '',
      patientName: b.patient_name || '',
      customerPhone: b.patient_phone || '',
      patientPhone: b.patient_phone || '',
      doctorName: b.doctor_name || 'غير محدد',
      treatmentName: b.treatment_name || 'غير محدد',
      treatmentType: b.treatment_type || '',
      toothNumber: b.tooth_number || '',
      date,
      time,
      status: b.status,
      consultationFee: Number(b.consultation_fee ?? 0),
      treatmentCost: Number(b.treatment_cost ?? 0),
      totalPrice: Number(b.consultation_fee ?? 0) + Number(b.treatment_cost ?? 0),
      dressColor: b.color || '',
      services: [b.product_name || 'غير محدد'],
      notes: b.notes || '',
      branch: b.branch_name || '',
      dressId: b.product_id || '',
      rentalDuration: b.rental_duration || '',
      pickupDate: b.pickup_date || '',
      returnDate: b.return_date || '',
      depositAmount: b.deposit_amount || 0,
      customerEmail: b.customer_email || '',
      customerNameEn: '',
      dressModel: b.product_name || '',
      dressModelEn: '',
      dressSize: '',
      plateNumber: '',
      specialRequests: b.special_requests || ''
    } as any;
  });
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(new Date());

  // Generate calendar days for current month
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getBookingsForDate = (day: number) => {
    if (!day) return [];
    const date = new Date(currentYear, currentMonth, day);
    return appointments.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'انتظار';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return 'غير محدد';
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = appointments.filter(b => b.date === today);
    
    return {
      total: appointments.length,
      pending: appointments.filter(b => b.status === 'pending').length,
      confirmed: appointments.filter(b => b.status === 'confirmed').length,
      inProgress: appointments.filter(b => b.status === 'in-progress').length,
      completed: appointments.filter(b => b.status === 'completed').length,
      todayTotal: todayBookings.length,
      todayRevenue: todayBookings.reduce((sum, b) => sum + b.totalPrice, 0),
      avgBookingValue: appointments.length > 0 ? appointments.reduce((sum, b) => sum + b.totalPrice, 0) / appointments.length : 0,
      completionRate: appointments.length > 0 ? (appointments.filter(b => b.status === 'completed').length / appointments.length) * 100 : 0
    };
  }, [appointments]);

  const getStatusConfig = (status: string) => {
    return bookingStatuses.find(s => s.status === status) || bookingStatuses[0];
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateAppointmentMut({ id: bookingId, body: { status: newStatus } }).unwrap();
      toast({
        title: "تم تحديث حالة الحجز",
        description: `تم تغيير حالة الحجز إلى ${getStatusConfig(newStatus).label}`,
      });
      await refetch();
    } catch (e: any) {
      toast({ title: "فشل التحديث", description: e?.data?.message || 'خطأ غير متوقع', variant: 'destructive' });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({ title: "تم تحديث البيانات", description: "تم تحديث قائمة الحجوزات بنجاح" });
  };

  const selectedDayBookings = selectedDay ? getBookingsForDate(selectedDay) : [];

  const todayBookings = getBookingsForDate(new Date().getDate());

  // Get current day bookings for day view
  const currentDayBookings = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments.filter(booking => booking.date === dateStr);
  }, [appointments, selectedDate]);

  // Get week bookings for week view
  const weekBookings = useMemo(() => {
    const weekDays = [];
    const startOfWeek = new Date(selectedWeekStart);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dateStr = day.toISOString().split('T')[0];
      const dayBookings = appointments.filter(booking => booking.date === dateStr);
      weekDays.push({
        date: day,
        dateStr,
        bookings: dayBookings
      });
    }
    return weekDays;
  }, [appointments, selectedWeekStart]);

  // Filtered bookings based on search and status
  const filteredCurrentDayBookings = useMemo(() => {
    let filtered = currentDayBookings;

    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerPhone.includes(searchQuery) ||
        booking.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    return filtered;
  }, [currentDayBookings, searchQuery, statusFilter]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setSelectedDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeekStart);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedWeekStart(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    switch (calendarView) {
      case 'month':
        navigateMonth(direction);
        break;
      case 'week':
        navigateWeek(direction);
        break;
      case 'day':
        navigateDay(direction);
        break;
    }
  };

  const getCurrentTitle = () => {
    switch (calendarView) {
      case 'month':
        return `${monthNames[currentMonth]} ${currentYear}`;
      case 'week':
        const startWeek = new Date(selectedWeekStart);
        startWeek.setDate(startWeek.getDate() - startWeek.getDay());
        const endWeek = new Date(startWeek);
        endWeek.setDate(startWeek.getDate() + 6);
        return `${startWeek.getDate()} - ${endWeek.getDate()} ${monthNames[startWeek.getMonth()]} ${startWeek.getFullYear()}`;
      case 'day':
        return `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
      default:
        return '';
    }
  };

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const dayNames = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">إجمالي الحجوزات</p>
                  <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                  <p className="text-xs text-blue-500 mt-1">جميع الحجوزات</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">حجوزات اليوم</p>
                  <p className="text-3xl font-bold text-green-700">{stats.todayTotal}</p>
                  <p className="text-xs text-green-500 mt-1">{stats.todayRevenue.toLocaleString()} جنية مصري</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">قيد التنفيذ</p>
                  <p className="text-3xl font-bold text-purple-700">{stats.inProgress}</p>
                  <p className="text-xs text-purple-500 mt-1">يجري العمل عليها</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">معدل الإنجاز</p>
                  <p className="text-3xl font-bold text-orange-700">{stats.completionRate.toFixed(0)}%</p>
                  <Progress value={stats.completionRate} className="mt-2 h-2" />
                </div>
                <div className="p-3 bg-orange-200 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="p-6 rounded-xl border shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold">تقويم حجوزات الخامات ومنتجات</h1>
                <p className="text-muted-foreground mt-2">
                  عرض تقويمي شامل لحجوزات وإيجار الخامات ومنتجات مع إمكانية الإدارة والتنظيم المتقدمة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button onClick={() => setShowBookingWizard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                حجز جديد
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في الحجوزات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {bookingStatuses.map(status => (
                      <SelectItem key={status.status} value={status.status}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCalendarView('month')}
                  className={`transition-all duration-200 ${calendarView === 'month' ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'}`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  شهري
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCalendarView('week')}
                  className={`transition-all duration-200 ${calendarView === 'week' ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'}`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  أسبوعي
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCalendarView('day')}
                  className={`transition-all duration-200 ${calendarView === 'day' ? 'bg-primary text-white border-primary' : 'hover:bg-primary/10'}`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  يومي
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar Area */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {isLoading ? 'جاري التحميل...' : getCurrentTitle()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleNavigation('prev')}
                    className="hover:bg-primary/10 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleNavigation('next')}
                    className="hover:bg-primary/10 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Render different views based on calendarView */}
              {calendarView === 'month' && (
                <div>
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {dayNames.map(day => (
                      <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                      if (!day) {
                        return <div key={index} className="p-2" />;
                      }
                      
                      const dayBookings = getBookingsForDate(day);
                      const isToday = new Date().getDate() === day && 
                                      new Date().getMonth() === currentMonth && 
                                      new Date().getFullYear() === currentYear;
                      const hasBookings = dayBookings.length > 0;
                      
                      return (
                        <div 
                          key={day} 
                          className={`p-2 min-h-20 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-md animate-fade-in ${
                            isToday ? 'bg-primary/10 border-primary ring-1 ring-primary/20' : ''
                          } ${hasBookings ? 'border-blue-200' : ''}`}
                          onClick={() => setSelectedDay(day)}
                        >
                          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayBookings.slice(0, 3).map((booking, i) => (
                              <div 
                                key={i} 
                                className={`text-xs p-1 rounded text-white truncate hover-scale ${getStatusColor(booking.status)}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(booking);
                                }}
                              >
                                {booking.time} - {booking.customerName}
                                {booking.customerNameEn && (
                                  <div className="text-xs opacity-80">{booking.customerNameEn}</div>
                                )}
                              </div>
                            ))}
                            {dayBookings.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{dayBookings.length - 3} أخرى
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Week View */}
              {calendarView === 'week' && (
                <div className="space-y-4">
                  {/* Week Header */}
                  <div className="grid grid-cols-7 gap-2">
                    {weekBookings.map((day, index) => {
                      const isToday = day.date.toDateString() === new Date().toDateString();
                      return (
                        <div key={index} className={`p-3 text-center border rounded-lg ${isToday ? 'bg-primary/10 border-primary' : 'bg-muted/30'}`}>
                          <div className={`font-medium ${isToday ? 'text-primary' : ''}`}>
                            {dayNames[day.date.getDay()]}
                          </div>
                          <div className={`text-xl font-bold ${isToday ? 'text-primary' : ''}`}>
                            {day.date.getDate()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {day.bookings.length} حجز
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Week Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {weekBookings.map((day, index) => (
                      <div key={index} className="space-y-2 min-h-32">
                        {day.bookings.map((booking, i) => (
                          <Card 
                            key={i} 
                            className="p-2 cursor-pointer hover:shadow-md transition-all hover-scale animate-fade-in"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <div className={`text-xs p-1 rounded text-white text-center ${getStatusColor(booking.status)}`}>
                              {booking.time}
                            </div>
                            <div className="text-xs font-medium truncate mt-1">
                              {booking.customerName}
                              {booking.customerNameEn && (
                                <div className="text-xs opacity-70 truncate">{booking.customerNameEn}</div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {booking.dressModel || booking.dressModelEn || 'غير محدد'}
                              {booking.dressModel && booking.dressModelEn && (
                                <div className="text-xs opacity-70 truncate">{booking.dressModelEn}</div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day View */}
              {calendarView === 'day' && (
                <div className="space-y-4">
                  {/* Day Header */}
                  <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">
                      {dayNames[selectedDate.getDay()]}
                    </h3>
                    <p className="text-muted-foreground">
                      {filteredCurrentDayBookings.length} حجز مجدول
                    </p>
                  </div>

                  {/* Time slots for day view */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCurrentDayBookings.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>لا توجد حجوزات خامات ومنتجات في هذا اليوم</p>
                      </div>
                    ) : (
                      filteredCurrentDayBookings
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((booking) => {
                          const statusConfig = getStatusConfig(booking.status);
                          const StatusIcon = statusConfig.icon;
                          
                          return (
                            <Card 
                              key={booking.id} 
                              className="p-4 cursor-pointer hover:shadow-lg transition-all hover-scale animate-fade-in"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl font-bold text-primary">
                                    {booking.time}
                                  </div>
                                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                <div className="text-xl font-bold text-primary">
                                  {booking.totalPrice} ج.م
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <span className="font-medium">{booking.customerName}</span>
                                    {booking.customerNameEn && (
                                      <div className="text-xs text-muted-foreground italic">{booking.customerNameEn}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <span>{booking.dressModel || booking.dressModelEn || 'غير محدد'}</span>
                                    {booking.dressModel && booking.dressModelEn && (
                                      <div className="text-xs text-muted-foreground italic">{booking.dressModelEn}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-1">
                                  {booking.services.slice(0, 3).map((service: any, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {typeof service === 'string' ? service : service.name}
                                    </Badge>
                                  ))}
                                  {booking.services.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{booking.services.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {booking.notes && (
                                <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                                  {booking.notes}
                                </div>
                              )}
                            </Card>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  حجوزات اليوم
                </CardTitle>
                <CardDescription>
                  {todayBookings.length} حجز مجدول لهذا اليوم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayBookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لا توجد حجوزات خامات ومنتجات اليوم</p>
                  ) : (
                    todayBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-2 rounded border">
                        <div>
                          <p className="text-sm font-medium">{booking.customerName}</p>
                          {booking.customerNameEn && (
                            <p className="text-xs text-muted-foreground italic">{booking.customerNameEn}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {booking.time}
                          </p>
                        </div>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          booking.status === 'completed' ? 'secondary' :
                          'destructive'
                        }>
                          {booking.status === 'confirmed' ? 'مؤكد' :
                           booking.status === 'pending' ? 'انتظار' :
                           booking.status === 'completed' ? 'مكتمل' :
                           booking.status === 'cancelled' ? 'ملغي' : 'لم يحضر'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  إحصائيات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">حجوزات هذا الشهر</span>
                    <Badge variant="secondary">
                      {appointments.filter(b => {
                        const bookingDate = new Date(b.date);
                        return bookingDate.getMonth() === currentMonth && 
                               bookingDate.getFullYear() === currentYear;
                      }).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">حجوزات مؤكدة</span>
                    <Badge variant="secondary">
                      {appointments.filter(b => b.status === 'confirmed').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">في الانتظار</span>
                    <Badge variant="secondary">
                      {appointments.filter(b => b.status === 'pending').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Day Details Dialog */}
        <Dialog open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                حجوزات وإيجار الخامات ومنتجات - يوم {selectedDay} {monthNames[currentMonth]} {currentYear}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedDayBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد حجوزات خامات ومنتجات في هذا اليوم</p>
                  </div>
              ) : (
                selectedDayBookings.map((booking) => (
                  <Card 
                    key={booking.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(booking.status)} text-white`}>
                            {getStatusText(booking.status)}
                          </Badge>
                          <span className="text-sm font-medium">{booking.time}</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{booking.totalPrice} ج.م</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span>{booking.customerName}</span>
                            {booking.customerNameEn && (
                              <div className="text-xs text-muted-foreground italic">{booking.customerNameEn}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span>{booking.dressModel || booking.dressModelEn || 'غير محدد'}</span>
                            {booking.dressModel && booking.dressModelEn && (
                              <div className="text-xs text-muted-foreground italic">{booking.dressModelEn}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">الخامات ومنتجات: </span>
                        <span className="text-xs">{booking.services.map((s: any) => typeof s === 'string' ? s : s.name).join(', ')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Booking Details Dialog */}
        <Dialog open={selectedBooking !== null} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                تفاصيل حجز الخامه او المنتج
              </DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(selectedBooking.status)} text-white text-sm`}>
                        {getStatusText(selectedBooking.status)}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        رقم الحجز: #{selectedBooking.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{selectedBooking.totalPrice} ج.م</div>
                      <div className="text-sm text-muted-foreground">إجمالي المبلغ</div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    معلومات المريض
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">الاسم الكامل</span>
                      </div>
                      <p className="text-sm font-semibold">{selectedBooking.customerName}</p>
                      {selectedBooking.customerNameEn && (
                        <p className="text-sm text-muted-foreground italic">{selectedBooking.customerNameEn}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{selectedBooking.customerPhone}</span>
                      </div>
                      {selectedBooking.customerEmail && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{selectedBooking.customerEmail}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">تفاصيل الخامه او المنتج</span>
                      </div>
                      {selectedBooking.dressModel && (
                        <p className="text-sm font-semibold">{selectedBooking.dressModel}</p>
                      )}
                      {selectedBooking.dressModelEn && (
                        <p className="text-sm text-muted-foreground italic">{selectedBooking.dressModelEn}</p>
                      )}
                      {!selectedBooking.dressModel && !selectedBooking.dressModelEn && (
                        <p className="text-sm text-muted-foreground">غير محدد</p>
                      )}
                      {selectedBooking.dressSize && <p className="text-sm text-muted-foreground">المقاس: {selectedBooking.dressSize}</p>}
                      {selectedBooking.dressColor && <p className="text-sm text-muted-foreground">اللون: {selectedBooking.dressColor}</p>}
                      {selectedBooking.dressId && <p className="text-sm text-muted-foreground font-mono">رقم الخامه او المنتج: {selectedBooking.dressId}</p>}
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    تفاصيل الحجز
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">تاريخ الحجز</span>
                      </div>
                      <p className="text-sm">{selectedBooking.date} - {selectedBooking.time}</p>
                    </div>

                    {selectedBooking.pickupDate && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">تاريخ الاستلام</span>
                        </div>
                        <p className="text-sm">{selectedBooking.pickupDate}</p>
                      </div>
                    )}

                    {selectedBooking.returnDate && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">تاريخ الإرجاع</span>
                        </div>
                        <p className="text-sm">{selectedBooking.returnDate}</p>
                      </div>
                    )}

                    {selectedBooking.rentalDuration && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">مدة الإيجار</span>
                        </div>
                        <p className="text-sm">{selectedBooking.rentalDuration} أيام</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">الفرع</span>
                      </div>
                      <p className="text-sm">{selectedBooking.branch || 'غير محدد'}</p>
                    </div>

                    {selectedBooking.depositAmount > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">مبلغ الضمان</span>
                        </div>
                        <p className="text-sm">{selectedBooking.depositAmount} ج.م</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services and Additional Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">الخامات ومنتجات المطلوبة:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedBooking.services.map((service: any, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {typeof service === 'string' ? service : service.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedBooking.specialRequests && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">طلبات خاصة:</span>
                      <p className="text-sm bg-muted p-3 rounded border-r-4 border-primary">{selectedBooking.specialRequests}</p>
                    </div>
                  )}

                  {selectedBooking.notes && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">ملاحظات إضافية:</span>
                      </div>
                      <p className="text-sm bg-muted p-3 rounded border-r-4 border-blue-500">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dental Appointment Creation Wizard */}
        <DentalAppointmentWizard 
          open={showBookingWizard}
          onOpenChange={setShowBookingWizard}
        />
      </div>
    </div>
  );
}