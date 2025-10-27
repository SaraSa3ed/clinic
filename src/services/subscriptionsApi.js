import { apiSlice } from './apiSlice';

// تحديث baseUrl ليتطابق مع الخادم
const BASE_URL = 'http://localhost:5011';

export const subscriptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // الحصول على جميع الاشتراكات
    getSubscriptions: builder.query({
      query: (params) => ({
        url: `${BASE_URL}/api/v1/subscriptions`,
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10000000,
          search: params?.search || '',
          status: params?.status || 'all',
          planId: params?.planId || 'all',
          startDate: params?.startDate || '',
          endDate: params?.endDate || '',
          sortBy: params?.sortBy || 'createdAt',
          sortOrder: params?.sortOrder || 'DESC'
        }
      }),
      providesTags: ['Subscriptions']
    }),

    // الحصول على اشتراك واحد
    getSubscription: builder.query({
      query: (id) => `${BASE_URL}/api/v1/subscriptions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Subscriptions', id }]
    }),

    // إنشاء اشتراك جديد
    createSubscription: builder.mutation({
      query: (subscriptionData) => ({
        url: `${BASE_URL}/api/v1/subscriptions`,
        method: 'POST',
        body: subscriptionData
      }),
      invalidatesTags: ['Subscriptions']
    }),

    // تحديث اشتراك
    updateSubscription: builder.mutation({
      query: ({ id, ...subscriptionData }) => ({
        url: `${BASE_URL}/api/v1/subscriptions/${id}`,
        method: 'PATCH',
        body: subscriptionData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Subscriptions', id }]
    }),

    // حذف اشتراك
    deleteSubscription: builder.mutation({
      query: (id) => ({
        url: `${BASE_URL}/api/v1/subscriptions/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Subscriptions']
    }),

    // تبديل حالة الاشتراك
    toggleSubscriptionStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `${BASE_URL}/api/v1/subscriptions/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['Subscriptions']
    }),

    // الحصول على إحصائيات الاشتراكات
    getSubscriptionStats: builder.query({
      query: () => `${BASE_URL}/api/v1/subscriptions/stats`,
      providesTags: ['SubscriptionStats']
    }),

    // البحث عن اشتراكات المريض
    getCustomerSubscriptions: builder.query({
      query: (customerId) => `${BASE_URL}/api/v1/subscriptions/customer/${customerId}`,
      providesTags: (result, error, customerId) => [{ type: 'CustomerSubscriptions', customerId }]
    }),

    // تصدير الاشتراكات
    exportSubscriptions: builder.mutation({
      query: (format = 'json') => ({
        url: `${BASE_URL}/api/v1/subscriptions/export`,
        method: 'GET',
        params: { format }
      })
    })
  })
});

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useToggleSubscriptionStatusMutation,
  useGetSubscriptionStatsQuery,
  useGetCustomerSubscriptionsQuery,
  useExportSubscriptionsMutation
} = subscriptionsApi;
