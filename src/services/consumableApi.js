import { apiSlice } from "./apiSlice";

export const consumableApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllConsumables: builder.query({
      query: () => "/consumables",
      providesTags: ["Consumable"],
    }),
    getConsumableById: builder.query({
      query: (id) => `/consumables/${id}`,
      providesTags: (result, error, id) => [{ type: "Consumable", id }],
    }),
    createConsumable: builder.mutation({
      query: (newConsumable) => ({
        url: "/consumables",
        method: "POST",
        body: newConsumable,
      }),
      invalidatesTags: ["Consumable"],
    }),
    updateConsumable: builder.mutation({
      query: ({ id, updatedConsumable }) => ({
        url: `/consumables/${id}`,
        method: "PATCH",
        body: updatedConsumable,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Consumable", id },
        "Consumable",
      ],
    }),
    deleteConsumable: builder.mutation({
      query: (id) => ({
        url: `/consumables/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Consumable"],
    }),
  }),
});

export const {
  useGetAllConsumablesQuery,
  useGetConsumableByIdQuery,
  useCreateConsumableMutation,
  useUpdateConsumableMutation,
  useDeleteConsumableMutation,
} = consumableApi;
