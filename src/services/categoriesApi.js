import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5011';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}${API_PREFIX}`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery,
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: (params = {}) => ({
        url: "/categories",
        params: {
          limit: 1000, // طلب 1000 فئة كحد أقصى
          page: 1,
          ...params
        }
      }),
      providesTags: ["Category"],
      // Add error handling for when backend is not available
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.warn("Categories API error:", error);
        }
      },
    }),
    createCategory: builder.mutation({
      query: (category) => ({
        url: "/categories",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["Category"],
      // Add error handling for when backend is not available
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log("Category created successfully:", result);
        } catch (error) {
          console.warn("Create category API error:", error);
          // If backend is not available, we can't create categories
          // This is handled by the mock data in apiSlice
        }
      },
    }),
    getCategory: builder.query({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),
    updateCategory: builder.mutation({
      query: ({ id, updatedCategory }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body: updatedCategory,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        "Category",
      ],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
    getRootCategories: builder.query({
      query: () => "/categories/root",
      providesTags: ["Category"],
    }),
    getChildrenCategories: builder.query({
      query: (id) => `/categories/${id}/children`,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useGetCategoryQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetRootCategoriesQuery,
  useGetChildrenCategoriesQuery,
} = categoriesApi;
