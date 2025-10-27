import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5011";

export const supplierReportsApi = createApi({
  reducerPath: 'supplierReportsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1/supplier-reports`,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['SupplierReports', 'SupplierStats', 'SupplierPerformance', 'SupplierPayments', 'SupplierOrders', 'SupplierComplaints', 'SupplierRisks', 'SupplierRatings', 'SupplierPaymentsList'],
  endpoints: (builder) => ({
    // تقارير الموردين الأساسية
    getSupplierReports: builder.query({
      query: (params) => ({
        url: '/reports',
        params,
      }),
      providesTags: ['SupplierReports'],
    }),

    // إحصائيات الموردين
    getSupplierReportStats: builder.query({
      query: (params) => ({
        url: '/stats',
        params,
      }),
      providesTags: ['SupplierStats'],
    }),

    // تقرير أداء الموردين
    getSupplierPerformanceReport: builder.query({
      query: (params) => ({
        url: '/performance',
        params,
      }),
      providesTags: ['SupplierPerformance'],
    }),

    // تقرير مدفوعات الموردين
    getSupplierPaymentsReport: builder.query({
      query: (params) => ({
        url: '/payments',
        params,
      }),
      providesTags: ['SupplierPayments'],
    }),

    // تقرير طلبيات الموردين
    getSupplierOrdersReport: builder.query({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: ['SupplierOrders'],
    }),

    // تقرير شكاوى الموردين
    getSupplierComplaintsReport: builder.query({
      query: (params) => ({
        url: '/complaints',
        params,
      }),
      providesTags: ['SupplierComplaints'],
    }),

    // تقرير مخاطر الموردين
    getSupplierRisksReport: builder.query({
      query: (params) => ({
        url: '/risks',
        params,
      }),
      providesTags: ['SupplierRisks'],
    }),

    // تصدير التقرير
    exportSupplierReport: builder.mutation({
      query: (data) => ({
        url: '/export',
        method: 'POST',
        body: data,
      }),
    }),

    // تقييمات الموردين
    addSupplierRating: builder.mutation({
      query: (data) => ({
        url: '/ratings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupplierRatings', 'SupplierPerformance'],
    }),

    updateSupplierRating: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/ratings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SupplierRatings', 'SupplierPerformance'],
    }),

    deleteSupplierRating: builder.mutation({
      query: (id) => ({
        url: `/ratings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupplierRatings', 'SupplierPerformance'],
    }),

    getSupplierRatings: builder.query({
      query: (params) => ({
        url: '/ratings',
        params,
      }),
      providesTags: ['SupplierRatings'],
    }),

    // مدفوعات الموردين
    addSupplierPayment: builder.mutation({
      query: (data) => ({
        url: '/payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupplierPaymentsList', 'SupplierPayments'],
    }),

    updateSupplierPayment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/payments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SupplierPaymentsList', 'SupplierPayments'],
    }),

    deleteSupplierPayment: builder.mutation({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupplierPaymentsList', 'SupplierPayments'],
    }),

    getSupplierPayments: builder.query({
      query: (params) => ({
        url: '/payments',
        params,
      }),
      providesTags: ['SupplierPaymentsList'],
    }),

    // تفاصيل الموردين
    getSupplierDetails: builder.query({
      query: (id) => ({
        url: `/suppliers/${id}`,
      }),
    }),

    // تحديث حالة المورد
    updateSupplierStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/suppliers/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['SupplierReports', 'SupplierPerformance', 'SupplierRisks'],
    }),
  }),
});

export const {
  useGetSupplierReportsQuery,
  useGetSupplierReportStatsQuery,
  useGetSupplierPerformanceReportQuery,
  useGetSupplierPaymentsReportQuery,
  useGetSupplierOrdersReportQuery,
  useGetSupplierComplaintsReportQuery,
  useGetSupplierRisksReportQuery,
  useExportSupplierReportMutation,
  useAddSupplierRatingMutation,
  useUpdateSupplierRatingMutation,
  useDeleteSupplierRatingMutation,
  useGetSupplierRatingsQuery,
  useAddSupplierPaymentMutation,
  useUpdateSupplierPaymentMutation,
  useDeleteSupplierPaymentMutation,
  useGetSupplierPaymentsQuery,
  useGetSupplierDetailsQuery,
  useUpdateSupplierStatusMutation,
} = supplierReportsApi;