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

export const expensesApi = createApi({
  reducerPath: 'expensesApi',
  baseQuery,
  tagTypes: ['Expense', 'ExpenseCategory', 'ExpenseStatistics', 'ExpenseCategoryStatistics'],
  endpoints: (builder) => ({
    // المصروفات
    getAllExpenses: builder.query({
      query: (params = {}) => ({
        url: "/expenses",
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          search: params.search || '',
          categoryId: params.categoryId || '',
          status: params.status || '',
          startDate: params.startDate || '',
          endDate: params.endDate || '',
          sortBy: params.sortBy || 'expenseDate',
          sortOrder: params.sortOrder || 'DESC'
        }
      }),
      providesTags: (result) => [
        { type: "Expense", id: "LIST" },
        ...(result?.data?.expenses || []).map((expense) => ({ type: "Expense", id: expense.id }))
      ],
    }),
    
    getExpense: builder.query({
      query: (id) => `/expenses/${id}`,
      providesTags: (result, error, id) => [{ type: "Expense", id }],
    }),
    
    createExpense: builder.mutation({
      query: (expenseData) => ({
        url: "/expenses",
        method: "POST",
        body: expenseData,
      }),
      invalidatesTags: [
        { type: "Expense", id: "LIST" },
        "ExpenseStatistics"
      ],
    }),
    
    updateExpense: builder.mutation({
      query: ({ id, ...expenseData }) => ({
        url: `/expenses/${id}`,
        method: "PUT",
        body: expenseData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Expense", id },
        { type: "Expense", id: "LIST" },
        "ExpenseStatistics"
      ],
    }),
    
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Expense", id: "LIST" },
        "ExpenseStatistics"
      ],
    }),
    
    updateExpenseStatus: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `/expenses/${id}/status`,
        method: "PUT",
        body: { status, rejectionReason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Expense", id },
        { type: "Expense", id: "LIST" },
        "ExpenseStatistics"
      ],
    }),
    
    getExpenseStatistics: builder.query({
      query: (params = {}) => ({
        url: "/expenses/statistics",
        params: {
          startDate: params.startDate || '',
          endDate: params.endDate || '',
          categoryId: params.categoryId || ''
        }
      }),
      providesTags: ["ExpenseStatistics"],
    }),
    
    exportExpenses: builder.query({
      query: (params = {}) => ({
        url: "/expenses/export",
        params: {
          startDate: params.startDate || '',
          endDate: params.endDate || '',
          categoryId: params.categoryId || '',
          status: params.status || ''
        }
      }),
    }),

    // فئات المصروفات
    getAllCategories: builder.query({
      query: (params = {}) => ({
        url: "/expenses/categories",
        params: {
          isActive: params.isActive || '',
          search: params.search || ''
        }
      }),
      providesTags: (result) => [
        { type: "ExpenseCategory", id: "LIST" },
        ...(result?.data?.categories || []).map((category) => ({ type: "ExpenseCategory", id: category.id }))
      ],
    }),
    
    getCategory: builder.query({
      query: (id) => `/expenses/categories/${id}`,
      providesTags: (result, error, id) => [{ type: "ExpenseCategory", id }],
    }),
    
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: "/expenses/categories",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: [
        { type: "ExpenseCategory", id: "LIST" },
        "ExpenseCategoryStatistics"
      ],
    }),
    
    updateCategory: builder.mutation({
      query: ({ id, ...categoryData }) => ({
        url: `/expenses/categories/${id}`,
        method: "PUT",
        body: categoryData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ExpenseCategory", id },
        { type: "ExpenseCategory", id: "LIST" },
        "ExpenseCategoryStatistics"
      ],
    }),
    
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/expenses/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "ExpenseCategory", id: "LIST" },
        "ExpenseCategoryStatistics"
      ],
    }),
    
    updateCategoryOrder: builder.mutation({
      query: (categories) => ({
        url: "/expenses/categories/order",
        method: "PUT",
        body: { categories },
      }),
      invalidatesTags: [{ type: "ExpenseCategory", id: "LIST" }],
    }),
    
    getCategoryStatistics: builder.query({
      query: ({ id, ...params }) => ({
        url: `/expenses/categories/${id}/statistics`,
        params: {
          startDate: params.startDate || '',
          endDate: params.endDate || ''
        }
      }),
      providesTags: (result, error, { id }) => [
        { type: "ExpenseCategoryStatistics", id }
      ],
    }),
    
    getCategoriesWithStatistics: builder.query({
      query: (params = {}) => ({
        url: "/expenses/categories/with-statistics",
        params: {
          startDate: params.startDate || '',
          endDate: params.endDate || ''
        }
      }),
      providesTags: (result) => [
        { type: "ExpenseCategory", id: "LIST" },
        "ExpenseCategoryStatistics",
        ...(result?.data?.categories || []).map((category) => ({ type: "ExpenseCategory", id: category.id }))
      ],
    }),
  }),
});

export const {
  useGetAllExpensesQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseStatusMutation,
  useGetExpenseStatisticsQuery,
  useLazyExportExpensesQuery,

  // Original category hook names (kept for compatibility)
  useGetAllCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryOrderMutation,
  useGetCategoryStatisticsQuery,
  useGetCategoriesWithStatisticsQuery,

  // Aliased category hook names (expense-specific)
  useGetAllCategoriesQuery: useGetAllExpenseCategoriesQuery,
  useGetCategoryQuery: useGetExpenseCategoryQuery,
  useCreateCategoryMutation: useCreateExpenseCategoryMutation,
  useUpdateCategoryMutation: useUpdateExpenseCategoryMutation,
  useDeleteCategoryMutation: useDeleteExpenseCategoryMutation,
  useUpdateCategoryOrderMutation: useUpdateExpenseCategoryOrderMutation,
  useGetCategoryStatisticsQuery: useGetExpenseCategoryStatisticsQuery,
  useGetCategoriesWithStatisticsQuery: useGetExpenseCategoriesWithStatisticsQuery,
} = expensesApi;
