import { apiSlice } from './apiSlice';

export const debitNoteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listDebitNotes: builder.query<any, Record<string, any> | void>({
      query: (params) => ({ url: '/debit-notes', params: params as any }),
    }),
    getDebitNoteStats: builder.query<any, void>({
      query: () => ({ url: '/debit-notes/stats' }),
    }),
    createDebitNote: builder.mutation<any, any>({
      query: (body) => ({ url: '/debit-notes', method: 'POST', body }),
    }),
    updateDebitNote: builder.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/debit-notes/${id}`, method: 'PUT', body }),
    }),
    deleteDebitNote: builder.mutation<void, string | number>({
      query: (id) => ({ url: `/debit-notes/${id}`, method: 'DELETE' }),
    }),
    changeDebitNoteStatus: builder.mutation<any, { id: string | number; status: string }>({
      query: ({ id, status }) => ({ url: `/debit-notes/${id}/status`, method: 'POST', body: { status } }),
    }),
    sendDebitNoteToSupplier: builder.mutation<any, { id: string | number }>({
      query: ({ id }) => ({ url: `/debit-notes/${id}/send`, method: 'POST' }),
    }),
  }),
});

export const {
  useListDebitNotesQuery,
  useGetDebitNoteStatsQuery,
  useCreateDebitNoteMutation,
  useUpdateDebitNoteMutation,
  useDeleteDebitNoteMutation,
  useChangeDebitNoteStatusMutation,
  useSendDebitNoteToSupplierMutation,
} = debitNoteApi;


