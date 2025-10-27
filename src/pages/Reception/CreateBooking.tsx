import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DentalAppointmentWizard } from "@/components/Reception/DentalAppointmentWizard";
import { useListAppointmentsQuery } from "@/services/dentalAppointmentApi";
import { Loader2 } from "lucide-react";
import { 
  Plus, 
  BookOpen, 
  Sparkles, 
  Zap, 
  Calendar, 
  Clock, 
  Users, 
  Star,
  Award,
  Timer,
  PhoneCall
} from "lucide-react";

export default function CreateBooking() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useListAppointmentsQuery();
  const appointments = (data as any)?.data ?? [];

  const openBooking = () => {
    console.log("فتح نافذة الحجز");
    setIsOpen(true);
  };

  const closeBooking = () => {
    console.log("إغلاق نافذة الحجز");
    setIsOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((b: any) => {
    try {
      const d = new Date(b.appointment_datetime).toISOString().split('T')[0];
      return d === todayStr;
    } catch {
      return false;
    }
  });
  const countToday = todayAppointments.length;
  const countConfirmed = appointments.filter((b: any) => b.status === 'confirmed').length;
  const countInProgress = appointments.filter((b: any) => b.status === 'in-progress').length;
  const todayRevenue = todayAppointments.reduce((sum: number, b: any) => {
    const paymentAmount = Number(b.payment_amount ?? 0);
    const insuranceAmount = Number(b.insurance_amount ?? 0);
    return sum + paymentAmount + insuranceAmount;
  }, 0);

  const appointmentTypes = [
    {
      title: "موعد عاجل",
      description: "للحالات الطارئة - أولوية قصوى",
      icon: Zap,
      time: "15-30 دقيقة",
      color: "from-red-500 to-red-600",
      hoverColor: "hover:from-red-600 hover:to-red-700",
      bgGradient: "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20",
      badge: "عاجل",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    },
    {
      title: "موعد روتيني", 
      description: "كشف عام أو متابعة دورية",
      icon: BookOpen,
      time: "30-45 دقيقة",
      color: "from-emerald-500 to-green-600",
      hoverColor: "hover:from-emerald-600 hover:to-green-700",
      bgGradient: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20",
      badge: "روتيني",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
    },
    {
      title: "موعد متقدم",
      description: "علاج متخصص (زراعة، تقويم)",
      icon: Sparkles,
      time: "60-90 دقيقة",
      color: "from-purple-500 to-pink-600",
      hoverColor: "hover:from-purple-600 hover:to-pink-700",
      bgGradient: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      badge: "متقدم",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
        
        {/* Compact Header */}
        <Card className="border-0 shadow-card bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">حجز موعد أسنان جديد</h1>
                <p className="text-sm text-muted-foreground">نظام إدارة مواعيد عيادة الأسنان</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <Card className="group relative border border-border/50 shadow-card bg-card overflow-hidden">
            <CardContent className="relative p-4 lg:p-6 z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">مواعيد اليوم</p>
                <p className="text-lg lg:text-2xl font-bold text-foreground">{isLoading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : countToday}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative border border-border/50 shadow-card bg-card overflow-hidden">
            <CardContent className="relative p-4 lg:p-6 z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">مواعيد مؤكدة</p>
                <p className="text-lg lg:text-2xl font-bold text-foreground">{isLoading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : countConfirmed}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative border border-border/50 shadow-card bg-card overflow-hidden">
            <CardContent className="relative p-4 lg:p-6 z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">جلسات جارية</p>
                <p className="text-lg lg:text-2xl font-bold text-foreground">{isLoading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : countInProgress}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative border border-border/50 shadow-card bg-card overflow-hidden">
            <CardContent className="relative p-4 lg:p-6 z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                  <Star className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">إيراد اليوم</p>
                <p className="text-lg lg:text-2xl font-bold text-foreground">{isLoading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : `${todayRevenue.toLocaleString()} ج.م`}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أنواع المواعيد */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {appointmentTypes.map((type, index) => (
            <Card 
              key={index} 
              className="group relative border border-border/40 shadow-elegant hover:shadow-glow transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden bg-card animate-fade-in hover:border-primary/50"
              style={{ animationDelay: `${(index + 4) * 150}ms` }}
            >
              {/* Animated Background Gradients */}
              <div className={`absolute inset-0 ${type.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-br ${type.color} rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500`}></div>
              
              {/* Floating Particles Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary/40 rounded-full animate-ping"></div>
                <div className="absolute bottom-8 left-6 w-1 h-1 bg-secondary/60 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-4 w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce"></div>
              </div>
              
              <CardHeader className="relative text-center p-6 lg:p-8 z-10">
                <div className="relative mx-auto mb-4 lg:mb-6">
                  {/* Icon with Multiple Effects */}
                  <div className="relative">
                    <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <type.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white group-hover:animate-pulse transition-all duration-300" />
                    </div>
                    {/* Rotating Ring */}
                    <div className={`absolute inset-0 rounded-xl lg:rounded-2xl border-2 border-gradient ${type.color} opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-500`}></div>
                  </div>
                  
                  {/* Enhanced Badge */}
                  <div className="absolute -top-2 -right-2 group-hover:scale-110 transition-transform duration-300">
                    <Badge className={`${type.badgeColor} text-xs px-2 py-1 shadow-sm group-hover:shadow-md`}>
                      {type.badge}
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-xl lg:text-2xl font-bold text-foreground mb-2 lg:mb-3 group-hover:text-primary transition-all duration-300 group-hover:scale-105">
                  {type.title}
                </CardTitle>
                
                <CardDescription className="text-sm lg:text-base text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  {type.description}
                </CardDescription>
                
                <div className="flex items-center justify-center gap-2 mt-3 lg:mt-4 group-hover:scale-105 transition-transform duration-300">
                  <Timer className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  <span className="text-sm text-muted-foreground font-medium group-hover:text-primary transition-colors duration-300">{type.time}</span>
                </div>
              </CardHeader>
              
              <CardContent className="relative p-4 lg:p-6 pt-0 z-10">
                <Button 
                  onClick={openBooking}
                  className={`w-full h-12 lg:h-14 text-base lg:text-lg font-semibold bg-gradient-to-r ${type.color} ${type.hoverColor} text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg lg:rounded-xl group-hover:scale-105 group-hover:shadow-glow relative overflow-hidden`}
                >
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Zap className="w-4 h-4 lg:w-5 lg:h-5 mr-2 group-hover:animate-bounce" />
                  احجز موعد الآن
                </Button>
              </CardContent>
              
              {/* Bottom Border Animation */}
              <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${type.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`}></div>
            </Card>
          ))}
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Emergency Booking */}
          

         
        </div>
      </div>

      {/* Dental Appointment Wizard */}
      <DentalAppointmentWizard 
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </div>
  );
}