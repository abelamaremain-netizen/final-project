package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.AccountDto;
import et.edu.woldia.coop.dto.TransactionDto;
import et.edu.woldia.coop.entity.Account;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.entity.Transaction;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.AccountMapper;
import et.edu.woldia.coop.mapper.TransactionMapper;
import et.edu.woldia.coop.repository.AccountRepository;
import et.edu.woldia.coop.repository.CollateralRepository;
import et.edu.woldia.coop.repository.MemberRepository;
import et.edu.woldia.coop.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for account management operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {
    
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AccountMapper accountMapper;
    private final TransactionMapper transactionMapper;
    private final ConfigurationService configurationService;
    private final CollateralRepository collateralRepository;
    private final MemberRepository memberRepository;
    private final AuditService auditService;
    
    /**
     * Create Regular Saving account
     */
    @Transactional
    public AccountDto createRegularSavingAccount(UUID memberId, String createdBy) {
        log.info("Creating Regular Saving account for member: {}", memberId);
        
        // Check if member already has a regular saving account
        if (accountRepository.existsByMemberIdAndAccountType(memberId, Account.AccountType.REGULAR_SAVING)) {
            throw new ValidationException("Member already has a Regular Saving account");
        }
        
        // Get current configuration for interest rate
        SystemConfiguration config = configurationService.getCurrentConfiguration();
        
        Account account = new Account();
        account.setMemberId(memberId);
        account.setAccountType(Account.AccountType.REGULAR_SAVING);
        account.setBalance(new Money(BigDecimal.ZERO, "ETB"));
        account.setPledgedAmount(new Money(BigDecimal.ZERO, "ETB"));
        account.setInterestRate(config.getSavingsInterestRate());
        account.setCreatedDate(LocalDate.now());
        account.setStatus(Account.AccountStatus.ACTIVE);
        
        Account saved = accountRepository.save(account);
        
        log.info("Regular Saving account created: {} for member: {}", saved.getId(), memberId);

        try { auditService.logAction(null, createdBy, "CREATE", "ACCOUNT", saved.getId(),
            "Regular Saving account created for member " + memberId); } catch (Exception ignored) {}

        return accountMapper.toDto(saved);
    }
    
    /**
     * Create Non-Regular Saving account
     */
    @Transactional
    public AccountDto createNonRegularSavingAccount(UUID memberId, String createdBy) {
        log.info("Creating Non-Regular Saving account for member: {}", memberId);
        
        // Check if member already has a non-regular saving account
        if (accountRepository.existsByMemberIdAndAccountType(memberId, Account.AccountType.NON_REGULAR_SAVING)) {
            throw new ValidationException("Member already has a Non-Regular Saving account");
        }
        
        // Get current configuration for interest rate
        SystemConfiguration config = configurationService.getCurrentConfiguration();
        
        Account account = new Account();
        account.setMemberId(memberId);
        account.setAccountType(Account.AccountType.NON_REGULAR_SAVING);
        account.setBalance(new Money(BigDecimal.ZERO, "ETB"));
        account.setPledgedAmount(new Money(BigDecimal.ZERO, "ETB"));
        account.setInterestRate(config.getSavingsInterestRate());
        account.setCreatedDate(LocalDate.now());
        account.setStatus(Account.AccountStatus.ACTIVE);
        
        Account saved = accountRepository.save(account);
        
        log.info("Non-Regular Saving account created: {} for member: {}", saved.getId(), memberId);

        try { auditService.logAction(null, createdBy, "CREATE", "ACCOUNT", saved.getId(),
            "Non-Regular Saving account created for member " + memberId); } catch (Exception ignored) {}

        return accountMapper.toDto(saved);
    }
    
    /**
     * Deposit funds to account
     */
    @Transactional
    public TransactionDto deposit(UUID accountId, BigDecimal amount, String source, 
                                   String reference, String notes, String processedBy) {
        log.info("Processing deposit: {} to account: {}", amount, accountId);
        
        Account account = findAccountById(accountId);
        
        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new ValidationException("Cannot deposit to inactive account");
        }

        // Enforce minimum deposit and monthly limit for Regular Saving accounts
        if (account.getAccountType() == Account.AccountType.REGULAR_SAVING) {
            SystemConfiguration config = configurationService.getCurrentConfiguration();
            if (config.getMinimumMonthlyDeduction() != null &&
                    amount.compareTo(config.getMinimumMonthlyDeduction().getAmount()) < 0) {
                throw new ValidationException(
                    "Minimum deposit for Regular Saving account is " +
                    config.getMinimumMonthlyDeduction().getAmount() + " ETB"
                );
            }

            // Check if the member's committed deduction for this month has already been deposited
            et.edu.woldia.coop.entity.Member member = memberRepository
                .findById(account.getMemberId())
                .orElse(null);
            if (member != null && member.getCommittedDeduction() != null) {
                YearMonth currentMonth = YearMonth.now();
                LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
                LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(23, 59, 59);
                BigDecimal alreadyDeposited = transactionRepository
                    .sumDepositsForAccountInPeriod(account.getId(), monthStart, monthEnd);
                BigDecimal committed = member.getCommittedDeduction().getAmount();
                if (alreadyDeposited.compareTo(committed) >= 0) {
                    throw new ValidationException(
                        "Monthly committed deduction of " + committed + " ETB has already been deposited this month (" +
                        currentMonth + "). Total deposited so far: " + alreadyDeposited + " ETB."
                    );
                }
            }
        }
        Money depositAmount = new Money(amount, "ETB");
        Money balanceBefore = account.getBalance();
        // Guard against legacy accounts where balance_currency was stored as NULL in the DB
        if (balanceBefore.getCurrency() == null) {
            balanceBefore = new Money(balanceBefore.getAmount(), "ETB");
        }
        Money balanceAfter = new Money(
            balanceBefore.getAmount().add(depositAmount.getAmount()),
            "ETB"
        );
        
        // Update account balance — ensure currency is set to avoid NOT NULL constraint
        account.setBalance(balanceAfter);
        if (account.getPledgedAmount().getCurrency() == null) {
            account.setPledgedAmount(new Money(account.getPledgedAmount().getAmount(), "ETB"));
        }
        accountRepository.save(account);
        
        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setAccountId(accountId);
        transaction.setTransactionType(Transaction.TransactionType.DEPOSIT);
        transaction.setAmount(depositAmount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setSource(source);
        transaction.setReference(reference);
        transaction.setNotes(notes);
        transaction.setProcessedBy(processedBy);
        
        Transaction saved = transactionRepository.save(transaction);
        
        log.info("Deposit completed: {} to account: {}, new balance: {}", 
            amount, accountId, balanceAfter.getAmount());

        // Audit log
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            auditService.logAction(null, username, "DEPOSIT", "ACCOUNT", accountId,
                "Deposited " + amount + " ETB to account " + accountId + ". New balance: " + balanceAfter.getAmount());
        } catch (Exception ignored) {}

        return transactionMapper.toDto(saved);
    }
    
    /**
     * Withdraw funds from account (Non-Regular Saving only)
     */
    @Transactional
    public TransactionDto withdraw(UUID accountId, BigDecimal amount, String notes, String processedBy) {
        log.info("Processing withdrawal: {} from account: {}", amount, accountId);
        
        Account account = findAccountById(accountId);
        
        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new ValidationException("Cannot withdraw from inactive or frozen account");
        }
        
        if (account.getAccountType() == Account.AccountType.REGULAR_SAVING) {
            throw new ValidationException("Cannot withdraw from Regular Saving account");
        }
        
        Money withdrawalAmount = new Money(amount, "ETB");
        
        // Check if this account is acting as a guarantor for someone else's active loan
        var activeGuarantees = collateralRepository.findActiveGuaranteesByAccountId(accountId);
        if (!activeGuarantees.isEmpty()) {
            throw new ValidationException(
                "Cannot withdraw: this account is a guarantor for " + activeGuarantees.size() +
                " active loan(s). The guaranteed amount must remain locked."
            );
        }
        
        // Check available balance (balance - own pledged amount)
        if (!account.hasSufficientBalance(withdrawalAmount)) {
            throw new ValidationException(
                "Insufficient available balance. Available: " + account.getAvailableBalance().getAmount()
            );
        }
        
        Money balanceBefore = account.getBalance();
        if (balanceBefore.getCurrency() == null) {
            balanceBefore = new Money(balanceBefore.getAmount(), "ETB");
        }
        Money balanceAfter = new Money(
            balanceBefore.getAmount().subtract(withdrawalAmount.getAmount()),
            "ETB"
        );
        
        // Update account balance — ensure currency is set
        account.setBalance(balanceAfter);
        if (account.getPledgedAmount().getCurrency() == null) {
            account.setPledgedAmount(new Money(account.getPledgedAmount().getAmount(), "ETB"));
        }
        accountRepository.save(account);
        
        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setAccountId(accountId);
        transaction.setTransactionType(Transaction.TransactionType.WITHDRAWAL);
        transaction.setAmount(withdrawalAmount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setNotes(notes);
        transaction.setProcessedBy(processedBy);
        
        Transaction saved = transactionRepository.save(transaction);
        
        log.info("Withdrawal completed: {} from account: {}, new balance: {}", 
            amount, accountId, balanceAfter.getAmount());

        // Audit log
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            auditService.logAction(null, username, "WITHDRAWAL", "ACCOUNT", accountId,
                "Withdrew " + amount + " ETB from account " + accountId + ". New balance: " + balanceAfter.getAmount());
        } catch (Exception ignored) {}

        return transactionMapper.toDto(saved);
    }
    
    /**
     * Get account balance
     */
    @Transactional(readOnly = true)
    public AccountDto getAccountBalance(UUID accountId) {
        Account account = findAccountById(accountId);
        return accountMapper.toDto(account);
    }
    
    /**
     * Get transaction history
     */
    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactionHistory(UUID accountId) {
        return transactionRepository.findByAccountIdOrderByTimestampDesc(accountId).stream()
            .map(transactionMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get transaction history — paginated
     */
    @Transactional(readOnly = true)
    public Page<TransactionDto> getTransactionHistoryPaged(UUID accountId, Pageable pageable) {
        return transactionRepository.findByAccountIdOrderByTimestampDesc(accountId, pageable)
            .map(transactionMapper::toDto);
    }
    
    /**
     * Get member accounts
     */
    @Transactional(readOnly = true)
    public List<AccountDto> getMemberAccounts(UUID memberId) {
        return accountRepository.findByMemberId(memberId).stream()
            .map(accountMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Pledge amount for collateral
     */
    @Transactional
    public void pledgeAmount(UUID accountId, BigDecimal amount, String reference, String processedBy) {
        log.info("Pledging amount: {} on account: {}", amount, accountId);
        
        Account account = findAccountById(accountId);
        
        Money pledgeAmount = new Money(amount, "ETB");
        String pledgedCurrency = account.getPledgedAmount().getCurrency() != null 
            ? account.getPledgedAmount().getCurrency() : "ETB";
        Money newPledgedAmount = new Money(
            account.getPledgedAmount().getAmount().add(pledgeAmount.getAmount()),
            pledgedCurrency
        );
        
        // Check if sufficient balance
        if (account.getBalance().getAmount().compareTo(newPledgedAmount.getAmount()) < 0) {
            throw new ValidationException("Insufficient balance to pledge");
        }
        
        Money balanceBefore = account.getBalance();
        if (balanceBefore.getCurrency() == null) {
            balanceBefore = new Money(balanceBefore.getAmount(), "ETB");
        }
        account.setPledgedAmount(newPledgedAmount);
        accountRepository.save(account);
        
        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setAccountId(accountId);
        transaction.setTransactionType(Transaction.TransactionType.PLEDGE);
        transaction.setAmount(pledgeAmount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(account.getBalance());
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setReference(reference);
        transaction.setProcessedBy(processedBy);
        
        transactionRepository.save(transaction);
        
        log.info("Amount pledged: {} on account: {}, total pledged: {}", 
            amount, accountId, newPledgedAmount.getAmount());
    }
    
    /**
     * Release pledged amount
     */
    @Transactional
    public void releaseAmount(UUID accountId, BigDecimal amount, String reference, String processedBy) {
        log.info("Releasing pledged amount: {} on account: {}", amount, accountId);
        
        Account account = findAccountById(accountId);
        
        Money releaseAmount = new Money(amount, "ETB");
        
        if (account.getPledgedAmount().getAmount().compareTo(releaseAmount.getAmount()) < 0) {
            throw new ValidationException("Cannot release more than pledged amount");
        }
        
        Money balanceBefore = account.getBalance();
        if (balanceBefore.getCurrency() == null) {
            balanceBefore = new Money(balanceBefore.getAmount(), "ETB");
        }
        String pledgedCurrency2 = account.getPledgedAmount().getCurrency() != null
            ? account.getPledgedAmount().getCurrency() : "ETB";
        Money newPledgedAmount = new Money(
            account.getPledgedAmount().getAmount().subtract(releaseAmount.getAmount()),
            pledgedCurrency2
        );
        
        account.setPledgedAmount(newPledgedAmount);
        accountRepository.save(account);
        
        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setAccountId(accountId);
        transaction.setTransactionType(Transaction.TransactionType.RELEASE);
        transaction.setAmount(releaseAmount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(account.getBalance());
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setReference(reference);
        transaction.setProcessedBy(processedBy);
        
        transactionRepository.save(transaction);
        
        log.info("Amount released: {} on account: {}, remaining pledged: {}", 
            amount, accountId, newPledgedAmount.getAmount());
    }
    
    /**
     * Freeze an account — prevents deposits and withdrawals.
     */
    @Transactional
    public AccountDto freezeAccount(UUID accountId, String reason, String processedBy) {
        log.info("Freezing account: {} by: {}", accountId, processedBy);

        Account account = findAccountById(accountId);

        if (account.getStatus() == Account.AccountStatus.CLOSED) {
            throw new ValidationException("Cannot freeze a closed account");
        }
        if (account.getStatus() == Account.AccountStatus.FROZEN) {
            throw new ValidationException("Account is already frozen");
        }

        account.setStatus(Account.AccountStatus.FROZEN);
        accountRepository.save(account);

        log.info("Account frozen: {}, reason: {}", accountId, reason);

        try { auditService.logAction(null, processedBy, "FREEZE", "ACCOUNT", accountId,
            "Account frozen. Reason: " + reason); } catch (Exception ignored) {}

        return accountMapper.toDto(account);
    }

    /**
     * Unfreeze a previously frozen account.
     */
    @Transactional
    public AccountDto unfreezeAccount(UUID accountId, String processedBy) {
        log.info("Unfreezing account: {} by: {}", accountId, processedBy);

        Account account = findAccountById(accountId);

        if (account.getStatus() != Account.AccountStatus.FROZEN) {
            throw new ValidationException("Account is not frozen");
        }

        account.setStatus(Account.AccountStatus.ACTIVE);
        accountRepository.save(account);

        log.info("Account unfrozen: {}", accountId);

        try { auditService.logAction(null, processedBy, "UNFREEZE", "ACCOUNT", accountId,
            "Account unfrozen"); } catch (Exception ignored) {}

        return accountMapper.toDto(account);
    }

    /**
     * Find account by ID or throw exception
     */
    private Account findAccountById(UUID id) {
        return accountRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));
    }
    
    /**
     * Get account by member ID and account type
     */
    @Transactional(readOnly = true)
    public Account getAccountByMemberIdAndType(UUID memberId, Account.AccountType accountType) {
        return accountRepository.findByMemberIdAndAccountType(memberId, accountType)
                .orElseThrow(() -> new ResourceNotFoundException(
                accountType + " account not found for member: " + memberId));
    }
}
