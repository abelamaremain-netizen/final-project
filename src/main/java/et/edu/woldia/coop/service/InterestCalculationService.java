package et.edu.woldia.coop.service;

import et.edu.woldia.coop.entity.Account;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.entity.Transaction;
import et.edu.woldia.coop.repository.AccountRepository;
import et.edu.woldia.coop.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for calculating and applying interest to accounts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InterestCalculationService {
    
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AuditService auditService;
    
    private static final String SYSTEM_USER = "SYSTEM";
    
    /**
     * Calculate monthly interest for a single account
     * Formula: (balance × interestRate) / 12
     */
    public BigDecimal calculateMonthlyInterest(Account account) {
        BigDecimal balance = account.getBalance().getAmount();
        BigDecimal annualRate = account.getInterestRate();
        
        // Monthly interest = (balance × annual rate) / 12
        BigDecimal monthlyInterest = balance
            .multiply(annualRate)
            .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        
        return monthlyInterest;
    }
    
    /**
     * Apply monthly interest to a single account
     */
    @Transactional
    public void applyMonthlyInterest(UUID accountId, String processedBy) {
        log.info("Applying monthly interest to account: {}", accountId);
        
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));
        
        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            log.warn("Skipping inactive account: {}", accountId);
            return;
        }
        
        BigDecimal interestAmount = calculateMonthlyInterest(account);
        
        if (interestAmount.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("No interest to apply for account: {}", accountId);
            return;
        }
        
        Money balanceBefore = account.getBalance();
        Money balanceAfter = new Money(
            balanceBefore.getAmount().add(interestAmount),
            balanceBefore.getCurrency()
        );
        
        // Update account
        account.setBalance(balanceAfter);
        account.setLastInterestDate(LocalDate.now());
        accountRepository.save(account);
        
        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setAccountId(accountId);
        transaction.setTransactionType(Transaction.TransactionType.INTEREST_CREDIT);
        transaction.setAmount(new Money(interestAmount, "ETB"));
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setProcessedBy(processedBy);
        transaction.setNotes("Monthly interest credit");
        
        transactionRepository.save(transaction);
        
        log.info("Interest applied to account {}: {} ETB, new balance: {}", 
            accountId, interestAmount, balanceAfter.getAmount());

        try { auditService.logAction(null, processedBy, "INTEREST_APPLIED", "ACCOUNT", accountId,
            "Monthly interest of ETB " + interestAmount + " applied. New balance: " + balanceAfter.getAmount()); } catch (Exception ignored) {}
    }
    
    /**
     * Apply monthly interest to all active accounts
     */
    @Transactional
    public void applyMonthlyInterestForAllAccounts() {
        log.info("Starting monthly interest calculation for all accounts");
        
        List<Account> accounts = accountRepository.findByStatus(Account.AccountStatus.ACTIVE);
        
        int successCount = 0;
        int failureCount = 0;
        
        for (Account account : accounts) {
            try {
                applyMonthlyInterest(account.getId(), SYSTEM_USER);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to apply interest to account {}: {}", account.getId(), e.getMessage());
                failureCount++;
            }
        }
        
        log.info("Monthly interest calculation completed. Success: {}, Failures: {}", 
            successCount, failureCount);
    }
    
    /**
     * Scheduled job to run monthly interest calculation
     * Runs at 23:00 on the last day of each month.
     * Spring cron: second minute hour day-of-month month day-of-week
     * Day 28 is used as a safe "end of month" trigger that works for all months.
     */
    @Scheduled(cron = "0 0 23 28 * *")
    @Transactional
    public void scheduledMonthlyInterestCalculation() {
        log.info("Scheduled monthly interest calculation triggered");
        applyMonthlyInterestForAllAccounts();
    }
}
