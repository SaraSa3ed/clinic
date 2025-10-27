import { apiSlice } from "./apiSlice";

export const insuranceDepositsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInsuranceDeposits: builder.query({
      query: (params = {}) => ({
        url: "/insurance-deposits",
        params,
      }),
      providesTags: ["InsuranceDeposit"],
      transformResponse: (response) => response?.data || [],
    }),
    getInsuranceDepositById: builder.query({
      query: (id) => `/insurance-deposits/${id}`,
      providesTags: (result, error, id) => [{ type: "InsuranceDeposit", id }],
      transformResponse: (response) => response?.data || response,
    }),
    refundFullDeposit: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/insurance-deposits/${id}/refund-full`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["InsuranceDeposit"],
    }),
    refundPartialDeposit: builder.mutation({
      query: ({ id, amount, reason }) => ({
        url: `/insurance-deposits/${id}/refund-partial`,
        method: "POST",
        body: { amount, reason },
      }),
      invalidatesTags: ["InsuranceDeposit"],
    }),
    forfeitDeposit: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/insurance-deposits/${id}/forfeit`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["InsuranceDeposit"],
    }),
  }),
});

export const {
  useGetInsuranceDepositsQuery,
  useGetInsuranceDepositByIdQuery,
  useRefundFullDepositMutation,
  useRefundPartialDepositMutation,
  useForfeitDepositMutation,
} = insuranceDepositsApi;


