// Core User and Authentication Types
export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  active: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  username: string;
  roles: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Member Types
export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  WITHDRAWN = 'WITHDRAWN',
  INACTIVE = 'INACTIVE',
  DECEASED = 'DECEASED',
}

export interface Member {
  id: string;
  externalCooperativeMemberId?: string;
  externalCooperativeName?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  dateOfBirth?: string;
  memberType?: string;
  employmentStatus?: string;
  committedDeduction?: number;
  shareCount?: number;
  registrationDate?: string;
  registrationConfigVersion?: number;
  lastDeductionChangeDate?: string;
  address?: string;
  status: MemberStatus;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateMemberDto {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  initialShareCapital: number;
}

export interface MemberSuspension {
  id: string;
  memberId: string;
  memberName?: string;
  reason: string;
  suspendedAt?: string;
  suspendedDate?: string;
  suspendedBy?: string;
  liftedAt?: string;
  reactivatedDate?: string;
  reactivatedBy?: string;
  active?: boolean;
}

// Account Types
export enum AccountType {
  REGULAR_SAVING = 'REGULAR_SAVING',
  NON_REGULAR_SAVING = 'NON_REGULAR_SAVING',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  FROZEN = 'FROZEN',
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  status: AccountStatus;
  memberId: string;
  member?: Member;
  openDate: string;
  closedDate?: string;
}

export interface CreateAccountDto {
  memberId: string;
  accountType: AccountType;
  initialDeposit?: number;
}

// Transaction Types
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
}

export interface Transaction {
  id: string;
  accountId: string;
  transactionType: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;       // matches backend TransactionDto.timestamp
  source?: string;
  reference?: string;
  processedBy: string;
  notes?: string;
}

export interface DepositDto {
  accountId: string;
  amount: number;
  currency?: string;
}

export interface WithdrawalDto {
  accountId: string;
  amount: number;
  currency?: string;
}

// Loan Types
export enum LoanStatus {
  APPROVED = 'APPROVED',
  CONTRACT_PENDING = 'CONTRACT_PENDING',
  DISBURSED = 'DISBURSED',
  ACTIVE = 'ACTIVE',
  PAID_OFF = 'PAID_OFF',
  DEFAULTED = 'DEFAULTED',
  RESTRUCTURED = 'RESTRUCTURED',
}

export interface LoanApplication {
  id: string;
  memberId: string;
  requestedAmount: Money;
  loanDurationMonths: number;
  loanPurpose: string;
  status: LoanStatus;
  submissionDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
  denialReason?: string;
}

export interface Loan {
  id: string;
  applicationId: string;
  memberId: string;
  principalAmount: Money;
  interestRate: number;
  durationMonths: number;
  outstandingPrincipal: Money;
  outstandingInterest: Money;
  status: LoanStatus;
  disbursementDate?: string;
  maturityDate?: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  paymentAmount: number;
  principalPaid: number;
  interestPaid: number;
  penaltyPaid?: number;
  paymentDate: string;
  processedBy: string;
  notes?: string;
  currency?: string;
}

export interface CreateLoanApplicationDto {
  memberId: string;
  requestedAmount: number;
  loanDurationMonths: number;
  loanPurpose: string;
}

// Collateral Types
export interface Collateral {
  id: string;
  loanId: string;
  collateralType: 'OWN_SAVINGS' | 'GUARANTOR' | 'EXTERNAL_COOPERATIVE' | 'FIXED_ASSET';
  collateralValue: number;
  status: 'PLEDGED' | 'RELEASED' | 'LIQUIDATED';
  // Own Savings
  accountId?: string;
  pledgedAmount?: number;
  // Guarantor
  guarantorMemberId?: string;
  guarantorMemberName?: string;
  guarantorAccountId?: string;
  guaranteedAmount?: number;
  // External Cooperative
  externalCooperativeName?: string;
  externalAccountNumber?: string;
  verificationDocument?: string;
  // Fixed Asset
  assetType?: string;
  assetDescription?: string;
  vehicleYear?: number;
  appraisalValue?: number;
  appraisalDate?: string;
  appraisedBy?: string;
  pledgeDate?: string;
  releaseDate?: string;
  createdBy?: string;
}

// Document Types
export interface DocumentMeta {
  id: string;
  entityType: string;
  entityId: string;
  documentName: string;
  documentType: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  uploadDate: string;   // matches backend DocumentDto.uploadDate
  description?: string;
  status?: string;
}

// Share Capital Types
export interface ShareCapital {
  memberId: string;
  memberName: string;
  totalShares: number;
  currentPricePerShare: number;
  totalValue: number;
  currency: string;
}

export interface PassbookEntry {
  id: string;
  memberId: string;
  transactionType: 'PURCHASE' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  numberOfShares: number;
  shareValue: number;
  transactionDate: string;
  runningTotal: number;
}

// Passbook DTO — matches backend PassbookDto exactly
export interface PassbookTransactionDto {
  date: string;
  type: string;
  description: string;
  amount: number;
  balance: number;
}

export interface PassbookRepaymentDto {
  date: string;
  amount: number;
  principalPortion: number;
  interestPortion: number;
  outstandingAfter: number;
}

export interface PassbookLoanDto {
  loanId: string;
  disbursementDate?: string;
  principal: number;
  interestRate: number;
  duration: number;
  outstandingBalance: number;
  status: string;
  repayments: PassbookRepaymentDto[];
}

export interface PassbookDto {
  memberId: string;
  memberName: string;
  nationalId: string;
  registrationDate: string;
  generatedDate: string;
  regularSavingsBalance: number;
  nonRegularSavingsBalance: number;
  totalSavings: number;
  shareCount: number;
  shareValue: number;
  pledgedAmount: number;
  availableBalance: number;
  regularSavingsTransactions: PassbookTransactionDto[];
  nonRegularSavingsTransactions: PassbookTransactionDto[];
  loans: PassbookLoanDto[];
}

// Loan Appeal Types
export interface LoanAppeal {
  id: string;
  applicationId: string;
  memberId: string;
  appealReason: string;
  decision?: 'APPROVED' | 'REJECTED';
  decisionNotes?: string;
  decidedBy?: string;
  decidedAt?: string;
  submissionDate: string;   // matches backend LoanAppealDto.submissionDate
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// Loan Default Types
export interface LoanDefault {
  id: string;
  loanId: string;
  reason: string;
  status: 'DEFAULTED' | 'LEGAL_ACTION_INITIATED' | 'IN_COURT' | 'RESOLVED';
  courtCaseNumber?: string;
  resolutionNotes?: string;
  declaredAt: string;
  declaredBy: string;
}

// Loan Penalty Types
export interface LoanPenalty {
  id: string;
  loanId: string;
  amount: number;
  reason: string;
  assessedAt: string;
  assessedBy: string;
  paid: boolean;
  paidAt?: string;
}

// Loan Restructuring Types
export interface LoanRestructuring {
  id: string;
  loanId: string;
  originalLoanId?: string;
  memberId?: string;
  restructuringReason: string;
  newDurationMonths: number;
  newInterestRate: number;
  newMonthlyPaymentAmount?: number;
  newMonthlyPayment?: { amount: number; currency: string };
  outstandingAtRestructure?: { amount: number; currency: string };
  requestDate?: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'COMPLETED';
  decidedBy?: string;
  decidedAt?: string;
  denialReason?: string;
}

// Payroll Types
export interface PayrollDeduction {
  id: string;
  memberId: string;
  deductionType: 'LOAN_REPAYMENT' | 'SAVINGS';
  amount: Money;
  effectiveDate: string;
  status: 'ACTIVE' | 'CANCELLED';
}

// Configuration Types
export interface SystemConfiguration {
  id: string;
  version: number;
  effectiveDate: string;
  registrationFee?: number;
  sharePricePerShare?: number;
  minimumSharesRequired?: number;
  maximumSharesAllowed?: number;
  minimumMonthlyDeduction?: number;
  savingsInterestRate?: number;
  loanInterestRateMin?: number;
  loanInterestRateMax?: number;
  maximumLoanCapPerMember?: number;
  lendingLimitPercentage?: number;
  fixedAssetLtvRatio?: number;
  membershipDurationThresholdMonths?: number;
  loanMultiplierBelowThreshold?: number;
  loanMultiplierAboveThreshold?: number;
  contractSigningDeadlineDays?: number;
  loanDisbursementDeadlineDays?: number;
  loanProcessingSlaDays?: number;
  delinquencyGracePeriodDays?: number;
  memberWithdrawalProcessingDays?: number;
  collateralAppraisalValidityMonths?: number;
  vehicleAgeLimitYears?: number;
  deductionDecreaseWaitingMonths?: number;
  nonRegularSavingsWithdrawalDays?: number;
  latePaymentPenaltyRate?: number;
  latePaymentPenaltyGraceDays?: number;
  earlyLoanRepaymentPenalty?: number;
  memberWithdrawalProcessingFee?: number;
  shareTransferFee?: number;
  maximumActiveLoansPerMember?: number;
  minimumLoanAmount?: number;
  maxConsecutiveMissedDeductionsBeforeSuspension?: number;
  minimumMembershipDurationBeforeWithdrawalMonths?: number;
  createdAt?: string;
  createdBy?: string;
}

// User Management Types
export interface RoleDto {
  id: string;
  name: string;
  description?: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  status: string; // "ACTIVE" | "INACTIVE"
  roles: string[]; // role names from backend
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
}

export interface RoleAssignmentRequest {
  roleId: string;
  reason: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  username?: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  description?: string;
  ipAddress?: string;
  status?: string;
  errorMessage?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// API Response Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
