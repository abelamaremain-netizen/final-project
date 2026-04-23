import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/lib/store/slices/uiSlice';
import { authApi } from '@/features/auth/authApi';
import { membersApi } from '@/features/members/membersApi';
import { accountsApi } from '@/features/accounts/accountsApi';
import { transactionsApi } from '@/features/transactions/transactionsApi';
import { shareCapitalApi } from '@/features/shareCapital/shareCapitalApi';
import { loansApi } from '@/features/loans/loansApi';
import { collateralApi } from '@/features/collateral/collateralApi';
import { documentsApi } from '@/features/documents/documentsApi';
import { auditApi } from '@/features/audit/auditApi';
import { configApi } from '@/features/config/configApi';
import { payrollApi } from '@/features/payroll/payrollApi';
import { reportsApi } from '@/features/reports/reportsApi';
import { usersApi } from '@/features/users/usersApi';
import { memberTypeCategoriesApi } from '@/features/memberTypeCategories/memberTypeCategoriesApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [membersApi.reducerPath]: membersApi.reducer,
    [accountsApi.reducerPath]: accountsApi.reducer,
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    [shareCapitalApi.reducerPath]: shareCapitalApi.reducer,
    [loansApi.reducerPath]: loansApi.reducer,
    [collateralApi.reducerPath]: collateralApi.reducer,
    [documentsApi.reducerPath]: documentsApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,
    [configApi.reducerPath]: configApi.reducer,
    [payrollApi.reducerPath]: payrollApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [memberTypeCategoriesApi.reducerPath]: memberTypeCategoriesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: ['persist/PERSIST'] },
    }).concat(
      authApi.middleware,
      membersApi.middleware,
      accountsApi.middleware,
      transactionsApi.middleware,
      shareCapitalApi.middleware,
      loansApi.middleware,
      collateralApi.middleware,
      documentsApi.middleware,
      auditApi.middleware,
      configApi.middleware,
      payrollApi.middleware,
      reportsApi.middleware,
      usersApi.middleware,
      memberTypeCategoriesApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
