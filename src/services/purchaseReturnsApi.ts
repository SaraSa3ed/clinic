import { apiSlice } from './apiSlice';

export const purchaseReturnsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listPurchaseReturns: builder.query<any, Record<string, any> | void>({
      query: (params) => ({ 
        url: '/supplier-invoices', 
        params: { 
          ...params,
          // فلترة الفواتير التي يمكن أن تكون مرتجعات
          status: 'مسودة' // أو أي حالة أخرى مناسبة
        } as any 
      }),
    }),
    createPurchaseReturn: builder.mutation<any, any>({
      query: (body) => ({ 
        url: '/supplier-invoices', 
        method: 'POST', 
        body: {
          ...body,
          // إضافة معرفات إضافية للمرتجع
          referenceType: 'purchase_return',
          status: 'مسودة'
        }
      }),
    }),
    updatePurchaseReturn: builder.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ 
        url: `/supplier-invoices/${id}`, 
        method: 'PUT', 
        body: {
          ...body,
          referenceType: 'purchase_return'
        }
      }),
    }),
  }),
});

export const {
  useListPurchaseReturnsQuery,
  useCreatePurchaseReturnMutation,
  useUpdatePurchaseReturnMutation,
} = purchaseReturnsApi;


