import { apiSlice } from './apiSlice';

export const purchaseInvoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listPurchaseInvoices: builder.query<any, { include?: string } | void>({
      query: (params) => ({ url: '/supplier-invoices', params: params as any }),
    }),
    createDressIntake: builder.mutation<any, FormData | { productName: string; supplierName: string; quantity: number; price: number; invoiceDate?: string; paymentMethod?: string }>(
      {
        query: (body) => {
          const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
          return {
            url: '/supplier-invoices/dress-intake',
            method: 'POST',
            body,
          } as any;
        },
      }
    ),
    updatePurchaseInvoice: builder.mutation<any, { id: number | string; body: any }>({
      query: ({ id, body }) => ({ url: `/supplier-invoices/${id}`, method: 'PUT', body }),
    }),
    deletePurchaseInvoice: builder.mutation<void, number | string>({
      query: (id) => ({ url: `/supplier-invoices/${id}`, method: 'DELETE' }),
    }),
  }),
});

export const {
  useListPurchaseInvoicesQuery,
  useCreateDressIntakeMutation,
  useUpdatePurchaseInvoiceMutation,
  useDeletePurchaseInvoiceMutation,
} = purchaseInvoiceApi;


