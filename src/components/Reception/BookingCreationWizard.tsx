import { useState, useCallback, useEffect } from "react";
import { 
  CalendarIcon, 
  Clock,
  User, 
  Car, 
  Building2, 
  CreditCard, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Star,
  Zap,
  Timer,
  Search,
  Plus,
  Check,
  ChevronsUpDown,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedBookingSystem, type AdvancedBookingData } from "@/hooks/useAdvancedBookingSystem";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BookingCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const branches = [
  { 
    id: "BR001", 
    name: "فرع العليا", 
    code: "ALY", 
    location: "الرياض - العليا", 
    coordinates: { lat: 24.7136, lng: 46.6753 },
    capacity: 45,
    rating: 4.8,
    workingHours: "06:00 - 23:00",
    services: ["غسيل شامل", "تلميع", "تنظيف داخلي", "تشميع"],
    estimatedWait: 15
  },
  { 
    id: "BR002", 
    name: "فرع الشفا", 
    code: "SHF", 
    location: "الرياض - الشفا", 
    coordinates: { lat: 24.8047, lng: 46.7219 },
    capacity: 35,
    rating: 4.6,
    workingHours: "06:00 - 22:00",
    services: ["غسيل سريع", "تلميع", "تنظيف داخلي"],
    estimatedWait: 20
  },
  { 
    id: "BR003", 
    name: "فرع القصيم", 
    code: "QSM", 
    location: "بريدة - القصيم", 
    coordinates: { lat: 26.3260, lng: 43.9750 },
    capacity: 25,
    rating: 4.5,
    workingHours: "06:00 - 22:00",
    services: ["غسيل سريع", "تلميع"],
    estimatedWait: 10
  }
];

const services = [
  {
    id: "SRV001",
    name: "غسيل سريع",
    category: "wash" as const,
    duration: 20,
    price: 25,
    priority: "standard" as const
  },
  {
    id: "SRV002",
    name: "غسيل شامل", 
    category: "wash" as const,
    duration: 45,
    price: 80,
    priority: "premium" as const
  },
  {
    id: "SRV003",
    name: "تلميع خارجي",
    category: "detailing" as const,
    duration: 30,
    price: 60,
    priority: "premium" as const
  },
  {
    id: "SRV004",
    name: "تنظيف داخلي",
    category: "detailing" as const,
    duration: 35,
    price: 50,
    priority: "standard" as const
  }
];

const vehicleTypes = [
  { value: "sedan", label: "سيدان", multiplier: 1.0 },
  { value: "suv", label: "دفع رباعي", multiplier: 1.2 },
  { value: "hatchback", label: "هاتشباك", multiplier: 0.9 },
  { value: "luxury", label: "فاخرة", multiplier: 1.5 },
  { value: "truck", label: "شاحنة", multiplier: 1.8 }
];

const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"
];

// قائمة العملاء الحاليين (بيانات وهمية)
const existingCustomers = [
  {
    id: "CUST001",
    name: "أحمد محمد الأحمد",
    phone: "+966501234567",
    email: "ahmed@example.com",
    vehicles: [
      { plate: "أ ب ج 123", type: "sedan", brand: "تويوتا", model: "كامري", color: "أبيض" }
    ]
  },
  {
    id: "CUST002", 
    name: "فاطمة علي السالم",
    phone: "+966502345678",
    email: "fatima@example.com",
    vehicles: [
      { plate: "د هـ و 456", type: "suv", brand: "هوندا", model: "بايلوت", color: "أسود" }
    ]
  },
  {
    id: "CUST003",
    name: "محمد سعد القحطاني", 
    phone: "+966503456789",
    email: "mohammed@example.com",
    vehicles: [
      { plate: "ز ح ط 789", type: "luxury", brand: "مرسيدس", model: "E-Class", color: "فضي" }
    ]
  },
  {
    id: "CUST004",
    name: "نورا عبدالله الخالد",
    phone: "+966504567890", 
    email: "nora@example.com",
    vehicles: [
      { plate: "ي ك ل 321", type: "hatchback", brand: "نيسان", model: "ميكرا", color: "أحمر" }
    ]
  },
  {
    id: "CUST005",
    name: "خالد عمر البراك",
    phone: "+966505678901",
    email: "khalid@example.com", 
    vehicles: [
      { plate: "م ن س 654", type: "truck", brand: "فورد", model: "F-150", color: "أزرق" }
    ]
  }
];

export function BookingCreationWizard({ open, onOpenChange }: BookingCreationWizardProps) {
  console.log("BookingCreationWizard rendered with open:", open);
  
  const { toast } = useToast();
  const { createBooking, getAvailableTimeSlots } = useAdvancedBookingSystem();
  
  // Prevent rapid open/close cycles
  const [isStable, setIsStable] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsStable(true), 100);
    return () => clearTimeout(timer);
  }, [open]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [openCustomerCombo, setOpenCustomerCombo] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof existingCustomers[0] | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [customerLocation, setCustomerLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearestBranch, setNearestBranch] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<AdvancedBookingData>>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    plateNumber: "",
    vehicleType: "sedan",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleColor: "",
    services: [],
    branchId: "",
    date: "",
    time: "",
    notes: "",
    specialRequests: [],
    communicationPreferences: {
      sms: true,
      email: false,
      push: false,
      whatsapp: false
    }
  });

  const steps = [
    { id: 1, title: "معلومات المريض", icon: User },
    { id: 2, title: "معلومات المركبة", icon: Car },
    { id: 3, title: "اختيار الفرع", icon: Building2 },
    { id: 4, title: "اختيار الخدمات", icon: Zap },
    { id: 5, title: "الموعد والوقت", icon: CalendarIcon },
    { id: 6, title: "مراجعة وتأكيد", icon: CheckCircle }
  ];

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get customer location and find nearest branch
  const getCustomerLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCustomerLocation({ lat: latitude, lng: longitude });
          
          // Find nearest branch
          let nearestId = null;
          let shortestDistance = Infinity;
          
          branches.forEach(branch => {
            const distance = calculateDistance(
              latitude, longitude,
              branch.coordinates.lat, branch.coordinates.lng
            );
            if (distance < shortestDistance) {
              shortestDistance = distance;
              nearestId = branch.id;
            }
          });
          
          setNearestBranch(nearestId);
          toast({
            title: "تم تحديد الموقع",
            description: `أقرب فرع لك: ${branches.find(b => b.id === nearestId)?.name} (${shortestDistance.toFixed(1)} كم)`,
          });
        },
        (error) => {
          toast({
            title: "تعذر تحديد الموقع",
            description: "يرجى السماح بالوصول إلى الموقع أو اختيار الفرع يدوياً",
            variant: "destructive"
          });
        }
      );
    }
  };

  const calculateTotals = useCallback(() => {
    const basePrice = formData.services?.reduce((sum, service) => sum + service.price, 0) || 0;
    const vehicleMultiplier = vehicleTypes.find(v => v.value === formData.vehicleType)?.multiplier || 1;
    const totalPrice = basePrice * vehicleMultiplier;
    const totalDuration = formData.services?.reduce((sum, service) => sum + service.duration, 0) || 0;
    
    return { totalPrice, totalDuration, basePrice };
  }, [formData.services, formData.vehicleType]);

  // Filter customers based on search
  const filteredCustomers = existingCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    customer.phone.includes(searchValue) ||
    customer.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Handle customer selection
  const handleCustomerSelect = (customer: typeof existingCustomers[0]) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      // Auto-fill vehicle info if customer has one vehicle
      ...(customer.vehicles.length === 1 && {
        plateNumber: customer.vehicles[0].plate,
        vehicleType: customer.vehicles[0].type as any,
        vehicleBrand: customer.vehicles[0].brand,
        vehicleModel: customer.vehicles[0].model,
        vehicleColor: customer.vehicles[0].color
      })
    }));
    setSearchValue(customer.name);
    setOpenCustomerCombo(false);
    setIsNewCustomer(false);
  };

  // Handle new customer
  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setFormData(prev => ({
      ...prev,
      customerName: searchValue,
      customerPhone: "",
      customerEmail: "",
      plateNumber: "",
      vehicleBrand: "",
      vehicleModel: "",
      vehicleColor: ""
    }));
    setOpenCustomerCombo(false);
    setIsNewCustomer(true);
  };

  // Handle date selection and load available time slots
  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot("");
    setAvailableTimeSlots([]);
    
    if (date && formData.branchId) {
      setIsLoadingTimeSlots(true);
      try {
        const dateString = format(date, "yyyy-MM-dd");
        const serviceDuration = formData.services?.reduce((sum, service) => sum + service.duration, 0) || 60;
        const timeSlots = getAvailableTimeSlots(formData.branchId, dateString, serviceDuration);
        // timeSlots now returns an array of strings directly
        setAvailableTimeSlots(timeSlots);
        setFormData(prev => ({ ...prev, date: dateString }));
      } catch (error) {
        console.error("Error loading time slots:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في تحميل الأوقات المتاحة",
          variant: "destructive"
        });
      }
      setIsLoadingTimeSlots(false);
    }
  };

  // Handle time slot selection  
  const handleTimeSlotSelect = (timeSlot: string) => {
    if (timeSlot && timeSlot.trim()) {
      setSelectedTimeSlot(timeSlot);
      setFormData(prev => ({ ...prev, time: timeSlot }));
    }
  };

  const canProceedToNextStep = () => {
    console.log("Current step:", currentStep);
    console.log("Form data:", formData);
    console.log("Selected date:", selectedDate);
    console.log("Selected time slot:", selectedTimeSlot);
    
    switch (currentStep) {
      case 1:
        const step1Valid = formData.customerName && formData.customerPhone;
        console.log("Step 1 valid:", step1Valid);
        return step1Valid;
      case 2:
        const step2Valid = formData.plateNumber && formData.vehicleType;
        console.log("Step 2 valid:", step2Valid);
        return step2Valid;
      case 3:
        const step3Valid = formData.branchId;
        console.log("Step 3 valid:", step3Valid);
        return step3Valid;
      case 4:
        const step4Valid = formData.services && formData.services.length > 0;
        console.log("Step 4 valid:", step4Valid);
        return step4Valid;
      case 5:
        const step5Valid = selectedDate && selectedTimeSlot && selectedTimeSlot.trim() !== "";
        console.log("Step 5 valid:", step5Valid, "Date:", selectedDate, "Time:", selectedTimeSlot);
        return step5Valid;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleServiceToggle = (service: typeof services[0]) => {
    setFormData(prev => {
      const currentServices = prev.services || [];
      const exists = currentServices.find(s => s.id === service.id);
      
      if (exists) {
        return {
          ...prev,
          services: currentServices.filter(s => s.id !== service.id)
        };
      } else {
        return {
          ...prev,
          services: [...currentServices, service]
        };
      }
    });
  };

  const handleSubmit = async () => {
    // Validate required fields before submission
    if (!selectedDate || !selectedTimeSlot || !selectedTimeSlot.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى التأكد من اختيار التاريخ والوقت",
        variant: "destructive"
      });
      return;
    }

    try {
      const { totalPrice, totalDuration } = calculateTotals();
      
      const bookingData = {
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTimeSlot,
        totalPrice,
        totalDuration,
        finalAmount: totalPrice,
        discountAmount: 0,
        status: "pending" as const,
        priority: "normal" as const,
        bookingSource: "walk-in" as const,
        bookingType: "standard" as const,
        paymentStatus: "unpaid" as const,
        customerType: "existing" as const,
        loyaltyPoints: 0,
        membershipLevel: "bronze" as const,
        branchName: branches.find(b => b.id === formData.branchId)?.name || "",
        resourcesRequired: [],
        endTime: "",
        timezone: "Asia/Riyadh",
        estimatedCompletion: "",
        consentGiven: true,
        dataRetentionDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        complianceFlags: []
      };

      await createBooking(bookingData);
      onOpenChange(false);
      setCurrentStep(1);
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        plateNumber: "",
        vehicleType: "sedan",
        services: []
      });
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">اسم المريض *</Label>
              <Popover open={openCustomerCombo} onOpenChange={setOpenCustomerCombo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCustomerCombo}
                    className="w-full justify-between"
                  >
                    {formData.customerName || "البحث عن عميل أو إضافة جديد..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-background border shadow-lg z-50" align="start">
                  <Command className="bg-background">
                    <CommandInput 
                      placeholder="ابحث بالاسم، الجوال، أو البريد..." 
                      value={searchValue}
                      onValueChange={setSearchValue}
                      className="border-none focus:ring-0"
                    />
                    <CommandList className="bg-background">
                      <CommandEmpty className="py-6 text-center text-sm">
                        <div className="space-y-2">
                          <p>لا توجد نتائج للبحث "{searchValue}"</p>
                          {searchValue && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleNewCustomer}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              إضافة "{searchValue}" كعميل جديد
                            </Button>
                          )}
                        </div>
                      </CommandEmpty>
                      {filteredCustomers.length > 0 && (
                        <CommandGroup heading="العملاء الحاليون">
                          {filteredCustomers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              onSelect={() => handleCustomerSelect(customer)}
                              className="cursor-pointer hover:bg-muted p-3"
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex flex-col w-full">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{customer.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {customer.vehicles.length} مركبة
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {customer.phone} • {customer.email}
                                </div>
                                {customer.vehicles.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {customer.vehicles[0].plate} - {customer.vehicles[0].brand} {customer.vehicles[0].model}
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      {searchValue && filteredCustomers.length > 0 && (
                        <CommandGroup>
                          <CommandItem onSelect={handleNewCustomer} className="cursor-pointer">
                            <Plus className="h-4 w-4 mr-2" />
                            إضافة "{searchValue}" كعميل جديد
                          </CommandItem>
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCustomer && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">تم تحديد المريض: {selectedCustomer.name}</span>
                  </div>
                  {selectedCustomer.vehicles.length === 1 && (
                    <p className="text-xs text-green-600 mt-1">
                      تم ملء بيانات المركبة تلقائياً
                    </p>
                  )}
                </div>
              )}
              {isNewCustomer && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">عميل جديد: {formData.customerName}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    سيتم إضافة هذا المريض إلى قاعدة البيانات
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">رقم الجوال *</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="+966xxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="example@email.com"
              />
            </div>
            <div className="space-y-3">
              <Label>تفضيلات التواصل</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>الرسائل النصية</span>
                  <Switch
                    checked={formData.communicationPreferences?.sms}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      communicationPreferences: {
                        ...prev.communicationPreferences!,
                        sms: checked
                      }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>البريد الإلكتروني</span>
                  <Switch
                    checked={formData.communicationPreferences?.email}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      communicationPreferences: {
                        ...prev.communicationPreferences!,
                        email: checked
                      }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plateNumber">رقم اللوحة *</Label>
              <Input
                id="plateNumber"
                value={formData.plateNumber || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                placeholder="أ ب ج 123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleType">نوع المركبة *</Label>
              <Select 
                value={formData.vehicleType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleBrand">الماركة</Label>
                <Input
                  id="vehicleBrand"
                  value={formData.vehicleBrand || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleBrand: e.target.value }))}
                  placeholder="تويوتا، هوندا..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">الطراز</Label>
                <Input
                  id="vehicleModel"
                  value={formData.vehicleModel || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                  placeholder="كامري، أكورد..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleColor">اللون</Label>
              <Input
                id="vehicleColor"
                value={formData.vehicleColor || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleColor: e.target.value }))}
                placeholder="أبيض، أسود..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">اختيار الفرع</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={getCustomerLocation}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                تحديد أقرب فرع
              </Button>
            </div>
            
            <div className="grid gap-4">
              {branches
                .sort((a, b) => {
                  // Sort by nearest branch first if location is available
                  if (customerLocation) {
                    const distanceA = calculateDistance(
                      customerLocation.lat, customerLocation.lng,
                      a.coordinates.lat, a.coordinates.lng
                    );
                    const distanceB = calculateDistance(
                      customerLocation.lat, customerLocation.lng,
                      b.coordinates.lat, b.coordinates.lng
                    );
                    return distanceA - distanceB;
                  }
                  return 0;
                })
                .map((branch) => {
                  const isNearest = nearestBranch === branch.id;
                  const distance = customerLocation ? 
                    calculateDistance(
                      customerLocation.lat, customerLocation.lng,
                      branch.coordinates.lat, branch.coordinates.lng
                    ) : null;
                  
                  return (
                    <Card 
                      key={branch.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        formData.branchId === branch.id 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : isNearest 
                          ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, branchId: branch.id }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{branch.name}</h3>
                              {isNearest && (
                                <Badge className="bg-green-600 text-white text-xs">
                                  الأقرب
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {branch.location}
                              {distance && (
                                <span className="text-green-600 font-medium">
                                  ({distance.toFixed(1)} كم)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-sm">{branch.rating}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                الطاقة: {branch.capacity}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{branch.workingHours}</div>
                            <div className="text-xs text-muted-foreground">
                              وقت الانتظار المتوقع: {branch.estimatedWait} دقيقة
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              {services.map((service) => {
                const isSelected = formData.services?.some(s => s.id === service.id);
                return (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
                    }`}
                    onClick={() => handleServiceToggle(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{service.category}</Badge>
                            <div className="flex items-center gap-1 text-sm">
                              <Timer className="h-3 w-3" />
                              {service.duration} دقيقة
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{service.price} ج.م</div>
                          {service.priority === "premium" && (
                            <Badge className="bg-gold text-white">مميز</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {formData.services && formData.services.length > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">ملخص الخدمات المحددة</h3>
                  <div className="space-y-1">
                    {formData.services.map((service, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{service.name}</span>
                        <span>{service.price} ج.م</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>المجموع:</span>
                      <span>{calculateTotals().totalPrice} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>المدة الإجمالية:</span>
                      <span>{calculateTotals().totalDuration} دقيقة</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CalendarIcon className="h-16 w-16 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">اختيار الموعد والوقت</h3>
              <p className="text-muted-foreground">اختر التاريخ والوقت المناسب حسب الفرع المحدد</p>
            </div>

            {formData.branchId ? (
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium">
                    الفرع المحدد: {branches.find(b => b.id === formData.branchId)?.name}
                  </span>
                </div>
                
                <TimeSlotPicker
                  selectedDate={selectedDate}
                  selectedTime={selectedTimeSlot}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      setFormData(prev => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
                    }
                  }}
                  onTimeChange={(time) => {
                    setSelectedTimeSlot(time);
                    setFormData(prev => ({ ...prev, time }));
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  يرجى اختيار الفرع أولاً
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(3)}
                  className="mt-3"
                >
                  العودة لاختيار الفرع
                </Button>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">مراجعة الحجز</h3>
              <p className="text-muted-foreground">تأكد من صحة البيانات قبل التأكيد</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">معلومات المريض</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>الاسم:</strong> {formData.customerName}</div>
                  <div><strong>الجوال:</strong> {formData.customerPhone}</div>
                  {formData.customerEmail && (
                    <div><strong>البريد:</strong> {formData.customerEmail}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">معلومات المركبة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>رقم اللوحة:</strong> {formData.plateNumber}</div>
                  <div><strong>النوع:</strong> {vehicleTypes.find(v => v.value === formData.vehicleType)?.label}</div>
                  {formData.vehicleBrand && (
                    <div><strong>الماركة:</strong> {formData.vehicleBrand} {formData.vehicleModel}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">تفاصيل الحجز</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>الفرع:</strong> {branches.find(b => b.id === formData.branchId)?.name}</div>
                  <div><strong>التاريخ:</strong> {formData.date}</div>
                  <div><strong>الوقت:</strong> {formData.time}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">الخدمات والتكلفة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {formData.services?.map((service, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{service.name}</span>
                        <span>{service.price} ج.م</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>المجموع النهائي:</span>
                      <span>{calculateTotals().totalPrice} ج.م</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render if not stable to prevent rapid open/close
  if (!isStable) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>إنشاء سشحجز جديد</DialogTitle>
              <DialogDescription>
                اتبع الخطوات لإنشاء حجز جديد
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log("Close button clicked");
                onOpenChange(false);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              الخطوة {currentStep} من {steps.length}
            </span>
            <span className="text-sm font-medium">
              {steps.find(s => s.id === currentStep)?.title}
            </span>
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
          
          <div className="flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 text-center">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            السابق
          </Button>
          
          {currentStep === steps.length ? (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              تأكيد الحجز
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceedToNextStep()}
            >
              التالي
              <ArrowLeft className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}