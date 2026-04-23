// User Roles
export const ROLES = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  MANAGER: 'MANAGER',
  LOAN_OFFICER: 'LOAN_OFFICER',
  MEMBER_OFFICER: 'MEMBER_OFFICER',
  ACCOUNTANT: 'ACCOUNTANT',
  AUDITOR: 'AUDITOR',
  TELLER: 'TELLER',
  MEMBER: 'MEMBER',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MEMBERS: '/dashboard/members',
  ACCOUNTS: '/dashboard/accounts',
  TRANSACTIONS: '/dashboard/transactions',
  LOANS: '/dashboard/loans',
  SHARE_CAPITAL: '/dashboard/share-capital',
  PAYROLL: '/dashboard/payroll',
  REPORTS: '/dashboard/reports',
  AUDIT: '/dashboard/audit',
  CONFIGURATION: '/dashboard/config',
  USERS: '/dashboard/users',
  DOCUMENTS: '/dashboard/documents',
  UNAUTHORIZED: '/unauthorized',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_ME: '/api/users/me',

  // Members
  MEMBERS: '/api/members',
  MEMBER_BY_ID: (id: string) => `/api/members/${id}`,
  MEMBER_SEARCH: '/api/members/search',
  MEMBER_SUSPEND: (id: string) => `/api/members/${id}/suspend`,
  MEMBER_REACTIVATE: (id: string) => `/api/members/${id}/reactivate`,

  // Accounts
  ACCOUNTS_REGULAR: '/api/accounts/regular',
  ACCOUNTS_NON_REGULAR: '/api/accounts/non-regular',
  ACCOUNTS_BY_MEMBER: (memberId: string) => `/api/accounts/member/${memberId}`,
  ACCOUNT_BY_ID: (id: string) => `/api/accounts/${id}`,
  ACCOUNT_BALANCE: (id: string) => `/api/accounts/${id}/balance`,
  ACCOUNT_DEPOSIT: (id: string) => `/api/accounts/${id}/deposit`,
  ACCOUNT_WITHDRAW: (id: string) => `/api/accounts/${id}/withdraw`,
  ACCOUNT_TRANSACTIONS: (id: string) => `/api/accounts/${id}/transactions`,

  // Transactions
  TRANSACTION_DEPOSIT: '/api/transactions/deposit',
  TRANSACTION_WITHDRAW: '/api/transactions/withdraw',
  TRANSACTION_BY_ID: (id: string) => `/api/transactions/${id}`,

  // Loans
  LOAN_APPLICATIONS: '/api/loans/applications',
  LOAN_APPLICATION_BY_ID: (id: string) => `/api/loans/applications/${id}`,
  LOAN_APPROVE: (id: string) => `/api/loans/applications/${id}/approve`,
  LOAN_DENY: (id: string) => `/api/loans/applications/${id}/deny`,
  LOAN_DISBURSE: (id: string) => `/api/loans/${id}/disburse`,
  LOAN_REPAYMENT: (id: string) => `/api/loans/${id}/repayments`,
  LOAN_BY_ID: (id: string) => `/api/loans/${id}`,

  // Share Capital
  SHARES_PURCHASE: '/api/shares/purchase',
  SHARES_BY_MEMBER: (memberId: string) => `/api/shares/${memberId}`,
  SHARES_TRANSFER: '/api/shares/transfer',
  PASSBOOK: (memberId: string) => `/api/members/${memberId}/passbook`,

  // Reports
  REPORTS_FINANCIAL: '/api/reports/financial',
  REPORTS_LOAN_PORTFOLIO: '/api/reports/loan-portfolio',
  REPORTS_MEMBERSHIP: '/api/reports/membership',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  DATE_ONLY: 'yyyy-MM-dd',
} as const;

// Currency
export const CURRENCY = {
  DEFAULT: 'ETB',
  SYMBOL: 'Br',
} as const;

// Status Colors
export const STATUS_COLORS = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  SUSPENDED: 'warning',
  CLOSED: 'error',
  PENDING: 'info',
  APPROVED: 'success',
  DENIED: 'error',
  DISBURSED: 'primary',
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  PHONE_LENGTH: 10,
  MIN_LOAN_AMOUNT: 1000,
  MAX_LOAN_AMOUNT: 1000000,
  MIN_SHARE_CAPITAL: 100,
} as const;
