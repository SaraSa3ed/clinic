import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

// Enhanced booking data structure based on global best practices
export interface AdvancedBookingData {
  // Core identifiers
  id: string;
  bookingCode: string; // QR code compatible
  branchCode: string;
  
  // Customer information
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerType: "new" | "existing" | "vip" | "regular" | "corporate";
  loyaltyPoints: number;
  membershipLevel: "bronze" | "silver" | "gold" | "platinum";
  
  // Vehicle information
  vehicleId?: string;
  plateNumber: string;
  vehicleType: "sedan" | "suv" | "hatchback" | "truck" | "motorcycle" | "luxury";
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  
  // Service details
  services: {
    id: string;
    name: string;
    category: "wash" | "detailing" | "maintenance" | "oil-change" | "inspection";
    duration: number; // in minutes
    price: number;
    priority: "standard" | "premium" | "vip";
  }[];
  servicePackage?: string;
  totalDuration: number;
  totalPrice: number;
  discountAmount: number;
  finalAmount: number;
  
  // Branch and resource allocation
  branchId: string;
  branchName: string;
  servicePath: string;
  assignedEmployee?: string;
  assignedTeam?: string[];
  resourcesRequired: string[];
  
  // Scheduling
  date: string;
  time: string;
  endTime: string;
  timezone: string;
  estimatedCompletion: string;
  actualCompletion?: string;
  
  // Status management
  status: "draft" | "pending" | "confirmed" | "in-progress" | "paused" | "completed" | "cancelled" | "no-show" | "rescheduled";
  substatus?: string;
  priority: "low" | "normal" | "high" | "urgent" | "emergency";
  
  // Booking source and type
  bookingSource: "walk-in" | "phone" | "app" | "website" | "third-party" | "recurring";
  bookingType: "standard" | "express" | "vip" | "corporate" | "maintenance";
  recurringPattern?: {
    frequency: "weekly" | "monthly" | "quarterly";
    endDate?: string;
    occurrences?: number;
  };
  
  // Payment information
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded" | "disputed";
  paymentMethod?: "cash" | "card" | "mobile" | "wallet" | "corporate";
  advancePayment: number;
  paymentDueDate?: string;
  invoiceId?: string;
  
  // Communication and notifications
  remindersSent: {
    type: "sms" | "email" | "push" | "whatsapp";
    sentAt: string;
    status: "sent" | "delivered" | "read" | "failed";
  }[];
  communicationPreferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  
  // Special requirements and notes
  notes: string;
  specialRequests: string[];
  accessibilityNeeds?: string;
  allergyInformation?: string;
  
  // Quality and feedback
  serviceRating?: number;
  customerFeedback?: string;
  qualityCheckPassed?: boolean;
  
  // Operational data
  waitTime?: number; // actual wait time in minutes
  serviceTime?: number; // actual service time in minutes
  queuePosition?: number;
  estimatedWaitTime?: number;
  
  // Audit trail
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy?: string;
  cancellationReason?: string;
  noShowReason?: string;
  
  // Integration data
  workOrderId?: string;
  crmRecordId?: string;
  externalSystemId?: string;
  
  // Analytics and tracking
  customerJourney: {
    stage: string;
    timestamp: string;
    action: string;
    employee?: string;
  }[];
  
  // Compliance and legal
  consentGiven: boolean;
  dataRetentionDate: string;
  complianceFlags: string[];
}

export interface BranchCapacity {
  branchId: string;
  date: string;
  timeSlots: {
    time: string;
    totalCapacity: number;
    availableCapacity: number;
    servicePaths: {
      pathId: string;
      pathName: string;
      capacity: number;
      available: number;
      services: string[];
    }[];
  }[];
}

export interface BookingAnalytics {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  
  averageBookingValue: number;
  totalRevenue: number;
  
  capacityUtilization: number;
  averageWaitTime: number;
  averageServiceTime: number;
  
  customerSatisfactionScore: number;
  repeatCustomerRate: number;
  
  peakHours: string[];
  popularServices: string[];
  
  branchPerformance: {
    branchId: string;
    bookings: number;
    revenue: number;
    utilization: number;
    satisfaction: number;
  }[];
}

export interface BookingFilters {
  branches?: string[];
  statuses?: string[];
  customerTypes?: string[];
  serviceTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  timeRange?: {
    start: string;
    end: string;
  };
  paymentStatus?: string[];
  priority?: string[];
  assignedEmployee?: string;
}

// Global state management
let globalBookings: AdvancedBookingData[] = [];
let globalCapacity: BranchCapacity[] = [];
const subscribers: Array<(bookings: AdvancedBookingData[]) => void> = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback([...globalBookings]));
};

export const useAdvancedBookingSystem = () => {
  const [bookings, setBookings] = useState<AdvancedBookingData[]>(globalBookings);
  const [capacity, setCapacity] = useState<BranchCapacity[]>(globalCapacity);
  const [loading, setLoading] = useState(false);

  // Initialize with sample data
  useEffect(() => {
    const unsubscribe = (updatedBookings: AdvancedBookingData[]) => {
      setBookings(updatedBookings);
    };
    
    subscribers.push(unsubscribe);

    if (globalBookings.length === 0) {
      initializeSampleData();
    }
    
    if (globalCapacity.length === 0) {
      initializeSampleCapacityData();
    }

    return () => {
      const index = subscribers.indexOf(unsubscribe);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  const initializeSampleData = () => {
    const sampleBookings: AdvancedBookingData[] = [
      {
        id: "BK001",
        bookingCode: "QR001234",
        branchCode: "ALY",
        customerId: "CUST001",
        customerName: "أحمد محمد عبدالله",
        customerPhone: "+966501234567",
        customerEmail: "ahmed@example.com",
        customerType: "vip",
        loyaltyPoints: 1250,
        membershipLevel: "gold",
        plateNumber: "أ ب ج 123",
        vehicleType: "sedan",
        vehicleBrand: "تويوتا",
        vehicleModel: "كامري",
        vehicleYear: 2023,
        vehicleColor: "أبيض",
        services: [
          {
            id: "SRV001",
            name: "غسيل شامل",
            category: "wash",
            duration: 45,
            price: 80,
            priority: "premium"
          },
          {
            id: "SRV002",
            name: "تلميع خارجي",
            category: "detailing",
            duration: 30,
            price: 60,
            priority: "premium"
          }
        ],
        totalDuration: 75,
        totalPrice: 140,
        discountAmount: 15,
        finalAmount: 125,
        branchId: "BR001",
        branchName: "فرع العليا",
        servicePath: "vip-lane",
        assignedEmployee: "محمد أحمد",
        resourcesRequired: ["wash-station-1", "detail-bay-1"],
        date: "2024-01-28",
        time: "10:00",
        endTime: "11:15",
        timezone: "Asia/Riyadh",
        estimatedCompletion: "2024-01-28T11:15:00",
        status: "confirmed",
        priority: "high",
        bookingSource: "app",
        bookingType: "vip",
        paymentStatus: "paid",
        paymentMethod: "card",
        advancePayment: 125,
        remindersSent: [
          {
            type: "sms",
            sentAt: "2024-01-27T20:00:00",
            status: "delivered"
          }
        ],
        communicationPreferences: {
          sms: true,
          email: true,
          push: true,
          whatsapp: false
        },
        notes: "عميل VIP - يفضل الخدمة السريعة",
        specialRequests: ["خدمة عاجلة", "تنظيف عميق للمقاعد"],
        customerJourney: [
          {
            stage: "booking_created",
            timestamp: "2024-01-27T15:30:00",
            action: "created_booking",
            employee: "system"
          },
          {
            stage: "payment_completed",
            timestamp: "2024-01-27T15:32:00",
            action: "payment_processed"
          }
        ],
        consentGiven: true,
        dataRetentionDate: "2027-01-28",
        complianceFlags: [],
        createdAt: "2024-01-27T15:30:00",
        updatedAt: "2024-01-27T15:32:00",
        createdBy: "customer_app"
      }
    ];

    globalBookings = sampleBookings;
    notifySubscribers();
  };

  const initializeSampleCapacityData = () => {
    const today = new Date();
    const dates = [];
    
    // Generate capacity data for next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    const branches = ["BR001", "BR002", "BR003"];
    const timeSlots = [
      "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
      "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
      "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
    ];
    
    globalCapacity = branches.flatMap(branchId => 
      dates.map(date => ({
        branchId,
        date,
        timeSlots: timeSlots.map(time => ({
          time,
          totalCapacity: 10,
          availableCapacity: Math.floor(Math.random() * 8) + 2, // Random between 2-9
          servicePaths: [
            {
              pathId: "path1",
              pathName: "مسار سريع",
              capacity: 5,
              available: Math.floor(Math.random() * 4) + 1,
              services: ["غسيل سريع", "تنظيف داخلي"]
            },
            {
              pathId: "path2", 
              pathName: "مسار شامل",
              capacity: 3,
              available: Math.floor(Math.random() * 3) + 1,
              services: ["غسيل شامل", "تلميع"]
            },
            {
              pathId: "path3",
              pathName: "مسار VIP",
              capacity: 2,
              available: Math.floor(Math.random() * 2) + 1,
              services: ["خدمة مميزة"]
            }
          ]
        }))
      }))
    );
    
    setCapacity([...globalCapacity]);
  };

  // Core booking operations
  const createBooking = useCallback(async (bookingData: Partial<AdvancedBookingData>) => {
    setLoading(true);
    try {
      const newBooking: AdvancedBookingData = {
        id: `BK${Date.now()}`,
        bookingCode: `QR${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        branchCode: bookingData.branchId?.substring(0, 3).toUpperCase() || "DEF",
        customerType: "existing",
        loyaltyPoints: 0,
        membershipLevel: "bronze",
        services: [],
        totalDuration: 0,
        totalPrice: 0,
        discountAmount: 0,
        finalAmount: 0,
        timezone: "Asia/Riyadh",
        status: "draft",
        priority: "normal",
        bookingSource: "walk-in",
        bookingType: "standard",
        paymentStatus: "unpaid",
        advancePayment: 0,
        remindersSent: [],
        communicationPreferences: {
          sms: true,
          email: false,
          push: false,
          whatsapp: false
        },
        notes: "",
        specialRequests: [],
        customerJourney: [{
          stage: "booking_created",
          timestamp: new Date().toISOString(),
          action: "created_booking",
          employee: "system"
        }],
        consentGiven: true,
        dataRetentionDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        complianceFlags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "system",
        ...bookingData
      } as AdvancedBookingData;

      globalBookings = [...globalBookings, newBooking];
      notifySubscribers();

      toast({
        title: "تم إنشاء الحجز بنجاح",
        description: `رقم الحجز: ${newBooking.bookingCode}`,
      });

      return newBooking;
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الحجز",
        description: "حدث خطأ أثناء إنشاء الحجز. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (id: string, updates: Partial<AdvancedBookingData>) => {
    setLoading(true);
    try {
      globalBookings = globalBookings.map(booking => {
        if (booking.id === id) {
          const updatedBooking = {
            ...booking,
            ...updates,
            updatedAt: new Date().toISOString(),
            lastModifiedBy: updates.lastModifiedBy || "system",
            customerJourney: [
              ...booking.customerJourney,
              {
                stage: "booking_updated",
                timestamp: new Date().toISOString(),
                action: "updated_booking",
                employee: updates.lastModifiedBy || "system"
              }
            ]
          };
          return updatedBooking;
        }
        return booking;
      });

      notifySubscribers();

      toast({
        title: "تم تحديث الحجز بنجاح",
        description: "تم حفظ التغييرات",
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث الحجز",
        description: "حدث خطأ أثناء تحديث الحجز.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string, reason: string) => {
    await updateBooking(id, {
      status: "cancelled",
      cancellationReason: reason,
      customerJourney: [...(globalBookings.find(b => b.id === id)?.customerJourney || []), {
        stage: "booking_cancelled",
        timestamp: new Date().toISOString(),
        action: "cancelled_booking"
      }]
    });
  }, [updateBooking]);

  const confirmBooking = useCallback(async (id: string) => {
    await updateBooking(id, {
      status: "confirmed",
      customerJourney: [...(globalBookings.find(b => b.id === id)?.customerJourney || []), {
        stage: "booking_confirmed",
        timestamp: new Date().toISOString(),
        action: "confirmed_booking"
      }]
    });
  }, [updateBooking]);

  const startService = useCallback(async (id: string, employeeId: string) => {
    await updateBooking(id, {
      status: "in-progress",
      assignedEmployee: employeeId,
      customerJourney: [...(globalBookings.find(b => b.id === id)?.customerJourney || []), {
        stage: "service_started",
        timestamp: new Date().toISOString(),
        action: "started_service",
        employee: employeeId
      }]
    });
  }, [updateBooking]);

  const completeService = useCallback(async (id: string, rating?: number, feedback?: string) => {
    await updateBooking(id, {
      status: "completed",
      actualCompletion: new Date().toISOString(),
      serviceRating: rating,
      customerFeedback: feedback,
      customerJourney: [...(globalBookings.find(b => b.id === id)?.customerJourney || []), {
        stage: "service_completed",
        timestamp: new Date().toISOString(),
        action: "completed_service"
      }]
    });
  }, [updateBooking]);

  // Advanced filtering and search
  const getFilteredBookings = useCallback((filters: BookingFilters) => {
    return globalBookings.filter(booking => {
      if (filters.branches?.length && !filters.branches.includes(booking.branchId)) {
        return false;
      }
      if (filters.statuses?.length && !filters.statuses.includes(booking.status)) {
        return false;
      }
      if (filters.customerTypes?.length && !filters.customerTypes.includes(booking.customerType)) {
        return false;
      }
      if (filters.dateRange) {
        const bookingDate = new Date(booking.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (bookingDate < startDate || bookingDate > endDate) {
          return false;
        }
      }
      return true;
    });
  }, []);

  const searchBookings = useCallback((query: string) => {
    const searchTerm = query.toLowerCase();
    return globalBookings.filter(booking =>
      booking.customerName.toLowerCase().includes(searchTerm) ||
      booking.customerPhone.includes(searchTerm) ||
      booking.plateNumber.toLowerCase().includes(searchTerm) ||
      booking.bookingCode.toLowerCase().includes(searchTerm) ||
      booking.notes.toLowerCase().includes(searchTerm)
    );
  }, []);

  // Analytics and reporting
  const getBookingAnalytics = useCallback((filters?: BookingFilters): BookingAnalytics => {
    const filteredBookings = filters ? getFilteredBookings(filters) : globalBookings;
    
    const totalBookings = filteredBookings.length;
    const confirmedBookings = filteredBookings.filter(b => b.status === "confirmed").length;
    const completedBookings = filteredBookings.filter(b => b.status === "completed").length;
    const cancelledBookings = filteredBookings.filter(b => b.status === "cancelled").length;
    const noShowBookings = filteredBookings.filter(b => b.status === "no-show").length;
    
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.finalAmount, 0);
    const averageBookingValue = totalRevenue / totalBookings || 0;
    
    const ratingsAvailable = filteredBookings.filter(b => b.serviceRating);
    const customerSatisfactionScore = ratingsAvailable.length > 0 
      ? ratingsAvailable.reduce((sum, b) => sum + (b.serviceRating || 0), 0) / ratingsAvailable.length
      : 0;

    return {
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      noShowBookings,
      averageBookingValue,
      totalRevenue,
      capacityUtilization: 75, // Mock data
      averageWaitTime: 15, // Mock data
      averageServiceTime: 45, // Mock data
      customerSatisfactionScore,
      repeatCustomerRate: 65, // Mock data
      peakHours: ["10:00", "14:00", "16:00"], // Mock data
      popularServices: ["غسيل شامل", "تلميع خارجي"], // Mock data
      branchPerformance: [] // Mock data
    };
  }, [getFilteredBookings]);

  // Capacity management
  const getBranchCapacity = useCallback((branchId: string, date: string) => {
    return capacity.find(c => c.branchId === branchId && c.date === date);
  }, [capacity]);

  const getAvailableTimeSlots = useCallback((branchId: string, date: string, serviceDuration: number = 30) => {
    console.log("Searching time slots for:", { branchId, date, serviceDuration });
    console.log("Available capacity data:", globalCapacity.length);
    
    const branchCapacity = getBranchCapacity(branchId, date);
    console.log("Branch capacity found:", branchCapacity ? "Yes" : "No");
    
    if (!branchCapacity) {
      console.log("No capacity data found for branch/date");
      return [];
    }

    const availableSlots = branchCapacity.timeSlots.filter(slot => {
      const hasCapacity = slot.availableCapacity > 0;
      const hasServicePath = slot.servicePaths.some(path => path.available > 0);
      return hasCapacity && hasServicePath;
    });
    
    console.log("Available time slots:", availableSlots.map(s => s.time));
    return availableSlots.map(slot => slot.time);
  }, [getBranchCapacity]);

  return {
    // State
    bookings,
    capacity,
    loading,

    // Core operations
    createBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    startService,
    completeService,

    // Filtering and search
    getFilteredBookings,
    searchBookings,

    // Analytics
    getBookingAnalytics,

    // Capacity management
    getBranchCapacity,
    getAvailableTimeSlots,

    // Utility functions
    getBookingById: (id: string) => globalBookings.find(b => b.id === id),
    getBookingsByBranch: (branchId: string) => globalBookings.filter(b => b.branchId === branchId),
    getBookingsByDate: (date: string) => globalBookings.filter(b => b.date === date),
    getBookingsByStatus: (status: string) => globalBookings.filter(b => b.status === status),
    getTodayBookings: () => {
      const today = new Date().toISOString().split('T')[0];
      return globalBookings.filter(b => b.date === today);
    }
  };
};