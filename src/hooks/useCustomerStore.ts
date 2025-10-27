import { useState, useCallback, useEffect } from 'react';
import { Customer, CustomerFormData } from '@/types/customer';
import { 
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from '@/services/customersApi';

let localCustomers: Customer[] = [];

export function useCustomerStore() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { data: customersResponse } = useGetCustomersQuery({ limit: 500 });
  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomerApi] = useUpdateCustomerMutation();
  const [deleteCustomerApi] = useDeleteCustomerMutation();

  useEffect(() => {
    if (customersResponse?.data) {
      setCustomers(customersResponse.data as Customer[]);
    }
  }, [customersResponse]);

  const addCustomer = useCallback((customerData: CustomerFormData | FormData): Customer => {
    // فحص إذا كان هذا تعديل (يحتوي على ID)
    const isUpdate = customerData instanceof FormData && customerData.has('id');
    
    const optimistic: Customer = {
      id: isUpdate ? customerData.get('id') as string : `temp_${Date.now()}`,
      name: customerData instanceof FormData ? customerData.get('name') as string : customerData.name,
      phone: customerData instanceof FormData ? customerData.get('phone') as string : customerData.phone,
      phone2: customerData instanceof FormData ? customerData.get('phone2') as string : customerData.phone2,
      customerType: customerData instanceof FormData ? customerData.get('customerType') as any : customerData.customerType,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      joinDate: new Date().toISOString(),
      totalVisits: 0,
      totalSpent: 0,
      coupons: [],
      packages: [],
      cars: [],
      contacts: [],
      relatedCustomers: [],
      notes: customerData instanceof FormData ? customerData.get('notes') as string : customerData.notes,
      personalPhotoUrl: '',
      nationalIdImageUrl: '',
      nationalIdNumber: '',
      email: '',
      address: ''
    };
    
    if (isUpdate) {
      // للتعديل، نحدث المريض الموجود
      const existingCustomer = customers.find(c => c.id === optimistic.id);
      if (existingCustomer) {
        setCustomers((prev) => prev.map(c => c.id === optimistic.id ? { ...c, ...optimistic } : c));
      }
    } else {
      // للإضافة، نضيف عميل جديد
      setCustomers((prev) => [optimistic, ...prev]);
    }
    
    (async () => {
      try {
        let res: any;
        if (customerData instanceof FormData) {
          console.log('Sending FormData to API');
          console.log('FormData contents:');
          for (let [key, value] of customerData.entries()) {
            console.log(`${key}:`, value);
          }
          if (isUpdate) {
            // استخدام updateCustomer للتعديل مع FormData مباشرة
            const id = customerData.get('id') as string;
            console.log('Sending FormData for update with ID:', id);
            console.log('FormData contents:');
            for (let [key, value] of customerData.entries()) {
              console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
            }
            
            // إرسال FormData مباشرة للـ updateCustomerApi
            res = await updateCustomerApi({ id, body: customerData }).unwrap();
          } else {
            // استخدام createCustomer للإضافة
            res = await createCustomer(customerData as any).unwrap();
          }
        } else {
          console.log('Sending JSON data to API:', customerData);
          res = await createCustomer({ ...(customerData as any) }).unwrap();
        }
        
        const result = res?.data as Customer;
        if (result) {
          if (isUpdate) {
            setCustomers((prev) => prev.map(c => c.id === result.id ? result : c));
            window.dispatchEvent(new CustomEvent('customerUpdated', { detail: result }));
            console.log('Customer updated successfully:', result);
          } else {
            setCustomers((prev) => [result, ...prev.filter((c) => c.id !== optimistic.id)]);
            window.dispatchEvent(new CustomEvent('customerAdded', { detail: result }));
            console.log('Customer added successfully:', result);
          }
        } else {
          throw new Error('No data returned from server');
        }
      } catch (e) {
        // rollback
        if (isUpdate) {
          setCustomers((prev) => prev.map(c => c.id === optimistic.id ? customers.find(orig => orig.id === optimistic.id) || c : c));
        } else {
          setCustomers((prev) => prev.filter((c) => c.id !== optimistic.id));
        }
        console.error('Failed to save customer', e);
        // إظهار رسالة خطأ للمستخدم
        if (e && typeof e === 'object' && 'data' in e) {
          console.error('API Error:', e.data);
          const errorData = e.data as any;
          if (errorData && errorData.message) {
            console.error('Error message:', errorData.message);
          }
        }
        // رفع الخطأ مرة أخرى للتعامل معه في المكون
        throw e;
      }
    })();
    return optimistic;
  }, [createCustomer, updateCustomerApi, customers]);

  const updateCustomer = useCallback((customerId: string, customerData: Partial<Customer>): Customer | null => {
    const previous = customers;
    const patched: Customer[] = customers.map((c) => (c.id === customerId ? { ...c, ...customerData } : c));
    setCustomers(patched);
    
    (async () => {
      try {
        console.log('Updating customer with ID:', customerId);
        console.log('Customer data to update:', customerData);
        
        const result = await updateCustomerApi({ id: customerId, body: customerData }).unwrap();
        console.log('Update result:', result);
        
        const updated = patched.find((c) => c.id === customerId);
        if (updated) {
          // تحديث البيانات المحلية بالبيانات الجديدة من الخادم
          const serverData = result?.data || result;
          if (serverData) {
            setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...serverData } : c));
            window.dispatchEvent(new CustomEvent('customerUpdated', { detail: serverData }));
          } else {
            window.dispatchEvent(new CustomEvent('customerUpdated', { detail: updated }));
          }
        }
      } catch (e) {
        console.error('Failed to update customer', e);
        setCustomers(previous);
        // رفع الخطأ مرة أخرى للتعامل معه في المكون
        throw e;
      }
    })();
    
    return patched.find((c) => c.id === customerId) || null;
  }, [customers, updateCustomerApi]);

  // البحث عن عميل
  const searchCustomer = useCallback((query: string): Customer[] => {
    if (!query.trim()) return customers;
    
    const lowercaseQuery = query.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowercaseQuery) ||
      customer.phone.includes(query) ||
      customer.email?.toLowerCase().includes(lowercaseQuery) ||
      customer.cars.some(car => 
        car.plate.toLowerCase().includes(lowercaseQuery) ||
        car.make.toLowerCase().includes(lowercaseQuery) ||
        car.model.toLowerCase().includes(lowercaseQuery)
      )
    );
  }, [customers]);

  const getCustomerById = useCallback((customerId: string): Customer | null => {
    return customers.find(customer => customer.id === customerId) || null;
  }, [customers]);

  const getCustomerByPhone = useCallback((phone: string): Customer | null => {
    return customers.find(customer => customer.phone === phone) || null;
  }, [customers]);

  const getCustomerByPlate = useCallback((plate: string): Customer | null => {
    return customers.find(customer => 
      customer.cars.some(car => car.plate === plate)
    ) || null;
  }, [customers]);

  const getCustomersStats = useCallback(() => {
    const totalCustomers = customers.length;
    const individualCustomers = customers.filter(c => c.customerType === 'Individual').length;
    const companyCustomers = customers.filter(c => c.customerType === 'Company').length;
    const groupCustomers = customers.filter(c => c.customerType === 'Group').length;
    
    return {
      total: totalCustomers,
      individual: individualCustomers,
      company: companyCustomers,
      group: groupCustomers
    };
  }, [customers]);

  const removeCustomer = useCallback((customerId: string): Promise<void> => {
    const previous = customers;
    const customerToDelete = customers.find(c => c.id === customerId);
    
    // إزالة المريض مؤقتاً من القائمة
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    
    // إرسال طلب الحذف للخادم
    return (async () => {
      try {
        await deleteCustomerApi(customerId).unwrap();
        window.dispatchEvent(new CustomEvent('customerDeleted', { detail: customerToDelete }));
      } catch (e) {
        // إعادة المريض في حالة فشل الحذف
        setCustomers(previous);
        console.error('Failed to delete customer', e);
        throw e;
      }
    })();
  }, [customers, deleteCustomerApi]);

  const refreshCustomers = useCallback(() => {
    // rely on RTK Query cache invalidation via mutations
    setCustomers((prev) => [...prev]);
  }, []);

  return {
    customers,
    addCustomer,
    updateCustomer,
    removeCustomer,
    searchCustomer,
    getCustomerById,
    getCustomerByPhone,
    getCustomerByPlate,
    getCustomersStats,
    refreshCustomers
  };
}