import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/$/, '') + '/api/v1' || 'http://localhost:5011/api/v1',
    credentials: 'include',
  }),
  tagTypes: ['Product', 'DentalAppointment', 'Customer', 'Doctor', 'Treatment'],
  endpoints: () => ({}),
});


