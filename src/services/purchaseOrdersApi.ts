import { apiSlice } from './apiSlice';

export const purchaseOrdersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listPurchaseOrders: builder.query<any, Record<string, any> | void>({
      query: (params) => ({ 
        url: '/supplier-invoices', 
        params: { 
          ...params,
          // فلترة الفواتير التي هي أوامر شراء
          referenceType: 'purchase_order',
          status: 'مسودة' // أو أي حالة أخرى مناسبة
        } as any 
      }),
    }),
    updatePurchaseOrder: builder.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ 
        url: `/supplier-invoices/${id}`, 
        method: 'PUT', 
        body: {
          ...body,
          referenceType: 'purchase_order'
        }
      }),
    }),
  }),
});

export const {
  useListPurchaseOrdersQuery,
  useUpdatePurchaseOrderMutation,
} = purchaseOrdersApi;


