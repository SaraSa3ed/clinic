import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "@/services/apiSlice";
import { loyaltyApi } from "@/services/loyaltyApi";
import { companyApi } from "@/services/companyApi";
import { branchesApi } from "@/services/branchesApi";
import { manufacturersApi } from "@/services/manufacturersApi";
import { brandsApi } from "@/services/brandsApi";
import { inventoryMovementApi } from "@/services/inventoryMovementApi";
import { supplierDashboardApi } from "@/services/supplierDashboardApi";
import { supplierReportsApi } from "@/services/supplierReportsApi";
import { supplierPaymentsApi } from "@/store/supplierPaymentsApi";
import { suppliersApi } from "@/store/suppliersApi";
import { supplierInvoicesApi } from "@/store/supplierInvoicesApi";
import { expensesApi } from "@/services/expensesApi";
import { categoriesApi } from "@/services/categoriesApi";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [loyaltyApi.reducerPath]: loyaltyApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [branchesApi.reducerPath]: branchesApi.reducer,
    [manufacturersApi.reducerPath]: manufacturersApi.reducer,
    [brandsApi.reducerPath]: brandsApi.reducer,
    [inventoryMovementApi.reducerPath]: inventoryMovementApi.reducer,
    [supplierDashboardApi.reducerPath]: supplierDashboardApi.reducer,
    [supplierReportsApi.reducerPath]: supplierReportsApi.reducer,
    [supplierPaymentsApi.reducerPath]: supplierPaymentsApi.reducer,
    [suppliersApi.reducerPath]: suppliersApi.reducer,
    [supplierInvoicesApi.reducerPath]: supplierInvoicesApi.reducer,
    [expensesApi.reducerPath]: expensesApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      loyaltyApi.middleware,
      companyApi.middleware,
      branchesApi.middleware,
      manufacturersApi.middleware,
      brandsApi.middleware,
      inventoryMovementApi.middleware,
      supplierPaymentsApi.middleware,
      suppliersApi.middleware,
      supplierInvoicesApi.middleware,
      expensesApi.middleware,
      categoriesApi.middleware,
      supplierReportsApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
