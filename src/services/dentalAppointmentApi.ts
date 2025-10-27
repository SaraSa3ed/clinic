import { apiSlice } from './apiSlice';

export const dentalAppointmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listAppointments: builder.query<any, { 
      from?: string; 
      to?: string; 
      status?: string; 
      doctor_id?: string; 
      patient_phone?: string;
      treatment_id?: string;
    } | void>({
      query: (params) => ({ url: '/dental-appointments', params: params as any }),
      providesTags: ['DentalAppointment'],
    }),
    getAppointment: builder.query<any, string>({
      query: (id) => `/dental-appointments/${id}`,
      providesTags: (res, err, id) => [{ type: 'DentalAppointment' as const, id }],
    }),
    createAppointment: builder.mutation<any, any>({
      query: (body) => ({ url: '/dental-appointments', method: 'POST', body }),
      invalidatesTags: ['DentalAppointment'],
    }),
    updateAppointment: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/dental-appointments/${id}`, method: 'PATCH', body }),
      invalidatesTags: (res, err, { id }) => [{ type: 'DentalAppointment' as const, id }, 'DentalAppointment'],
    }),
    deleteAppointment: builder.mutation<void, string>({
      query: (id) => ({ url: `/dental-appointments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['DentalAppointment'],
    }),
    checkDoctorAvailability: builder.mutation<any, { 
      doctor_id: string; 
      appointment_datetime: string; 
      exclude_appointment_id?: string; 
    }>({
      query: (body) => ({ 
        url: '/dental-appointments/check-availability', 
        method: 'POST', 
        body 
      }),
    }),
    getDailyReport: builder.query<any, { date?: string } | void>({
      query: (params) => ({ 
        url: '/dental-appointments/reports/daily', 
        params: params as any 
      }),
      providesTags: ['DentalAppointment'],
    }),
    getPatientHistory: builder.query<any, string>({
      query: (patient_phone) => `/dental-appointments/patient-history/${patient_phone}`,
      providesTags: ['DentalAppointment'],
    }),
  }),
});

export const {
  useListAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useCheckDoctorAvailabilityMutation,
  useGetDailyReportQuery,
  useGetPatientHistoryQuery,
} = dentalAppointmentApi;
