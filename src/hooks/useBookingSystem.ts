import { useState, useEffect, useCallback } from 'react';

interface BookingData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerType: "new" | "existing" | "vip" | "regular";
  vehicleModel?: string;
  plateNumber?: string;
  vehicleType?: string;
  services: string[];
  branch: string;
  servicePath: string;
  assignedEmployee?: string;
  date: string;
  time: string;
  duration: number;
  totalPrice: number;
  bookingType: "direct" | "app" | "recurring" | "urgent";
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  priority: "high" | "normal" | "low";
  notes: string;
  paymentStatus: "unpaid" | "partial" | "paid";
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  workOrderId?: string;
}

interface UseBookingSystemReturn {
  bookings: BookingData[];
  addBooking: (booking: Omit<BookingData, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBooking: (id: string, updates: Partial<BookingData>) => void;
  deleteBooking: (id: string) => void;
  getBookingById: (id: string) => BookingData | undefined;
  getBookingsByDate: (date: string) => BookingData[];
  getBookingsByBranch: (branch: string) => BookingData[];
  getBookingsByStatus: (status: BookingData['status']) => BookingData[];
  searchBookings: (query: string) => BookingData[];
}

// Global bookings state
let globalBookings: BookingData[] = [];
const subscribers: Array<(bookings: BookingData[]) => void> = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback([...globalBookings]));
};

export const useBookingSystem = (): UseBookingSystemReturn => {
  const [bookings, setBookings] = useState<BookingData[]>(globalBookings);

  useEffect(() => {
    // Subscribe to global state changes
    const unsubscribe = (updatedBookings: BookingData[]) => {
      setBookings(updatedBookings);
    };
    
    subscribers.push(unsubscribe);

    // Initialize with sample data if empty
    if (globalBookings.length === 0) {
      const sampleBookings: BookingData[] = [
        {
          id: "1",
          customerName: "أحمد محمد",
          customerPhone: "0501234567",
          customerType: "existing",
          vehicleModel: "تويوتا كامري 2023",
          plateNumber: "أ ب ج 123",
          vehicleType: "سيدان",
          services: ["quick-wash", "interior-clean"],
          branch: "main",
          servicePath: "quick-wash",
          assignedEmployee: "محمد أحمد",
          date: new Date().toISOString().split('T')[0],
          time: "09:00",
          duration: 40,
          totalPrice: 65,
          bookingType: "app",
          status: "confirmed",
          priority: "normal",
          notes: "عميل VIP - يفضل الخدمة السريعة",
          paymentStatus: "paid",
          reminderSent: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
          workOrderId: "WO001"
        },
        {
          id: "2",
          customerName: "فاطمة أحمد",
          customerPhone: "0509876543",
          customerType: "new",
          vehicleModel: "هوندا أكورد 2022",
          plateNumber: "د هـ و 456",
          vehicleType: "سيدان",
          services: ["full-wash", "wax"],
          branch: "main",
          servicePath: "vip",
          assignedEmployee: "علي سالم",
          date: new Date().toISOString().split('T')[0],
          time: "11:30",
          duration: 75,
          totalPrice: 130,
          bookingType: "direct",
          status: "in-progress",
          priority: "high",
          notes: "تلميع خاص للسيارة",
          paymentStatus: "partial",
          reminderSent: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "reception1"
        }
      ];
      
      globalBookings = sampleBookings;
      notifySubscribers();
    }

    // Cleanup subscription
    return () => {
      const index = subscribers.indexOf(unsubscribe);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  const addBooking = useCallback((bookingData: Omit<BookingData, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBooking: BookingData = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    globalBookings = [...globalBookings, newBooking];
    notifySubscribers();
  }, []);

  const updateBooking = useCallback((id: string, updates: Partial<BookingData>) => {
    globalBookings = globalBookings.map(booking =>
      booking.id === id 
        ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
        : booking
    );
    notifySubscribers();
  }, []);

  const deleteBooking = useCallback((id: string) => {
    globalBookings = globalBookings.filter(booking => booking.id !== id);
    notifySubscribers();
  }, []);

  const getBookingById = useCallback((id: string) => {
    return globalBookings.find(booking => booking.id === id);
  }, []);

  const getBookingsByDate = useCallback((date: string) => {
    return globalBookings.filter(booking => booking.date === date);
  }, []);

  const getBookingsByBranch = useCallback((branch: string) => {
    return globalBookings.filter(booking => booking.branch === branch);
  }, []);

  const getBookingsByStatus = useCallback((status: BookingData['status']) => {
    return globalBookings.filter(booking => booking.status === status);
  }, []);

  const searchBookings = useCallback((query: string) => {
    const searchTerm = query.toLowerCase();
    return globalBookings.filter(booking =>
      booking.customerName.toLowerCase().includes(searchTerm) ||
      booking.customerPhone.includes(searchTerm) ||
      booking.plateNumber?.toLowerCase().includes(searchTerm) ||
      booking.notes.toLowerCase().includes(searchTerm)
    );
  }, []);

  return {
    bookings,
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingById,
    getBookingsByDate,
    getBookingsByBranch,
    getBookingsByStatus,
    searchBookings
  };
};