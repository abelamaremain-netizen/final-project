package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Transaction entity.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    
    /**
     * Find all transactions for an account
     */
    List<Transaction> findByAccountIdOrderByTimestampDesc(UUID accountId);

    /**
     * Paginated transaction history for an account
     */
    Page<Transaction> findByAccountIdOrderByTimestampDesc(UUID accountId, Pageable pageable);
    
    /**
     * Find transactions for an account within a date range
     */
    @Query("SELECT t FROM Transaction t WHERE t.accountId = :accountId " +
           "AND t.timestamp BETWEEN :startDate AND :endDate " +
           "ORDER BY t.timestamp DESC")
    List<Transaction> findByAccountIdAndTimestampBetween(
        @Param("accountId") String accountId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Find transactions processed by a specific user
     */
    List<Transaction> findByProcessedByOrderByTimestampDesc(String processedBy);
    
    /**
     * Find transactions by type
     */
    List<Transaction> findByTransactionTypeOrderByTimestampDesc(Transaction.TransactionType transactionType);

    /**
     * Sum transaction amounts by type
     */
    @Query("SELECT COALESCE(SUM(t.amount.amount), 0) FROM Transaction t WHERE t.transactionType = :type")
    BigDecimal getTotalAmountByType(@Param("type") Transaction.TransactionType type);

    /**
     * Check if a DEPOSIT exists for an account within a date range (used for monthly deposit check)
     */
    boolean existsByAccountIdAndTransactionTypeAndTimestampBetween(
        UUID accountId,
        Transaction.TransactionType transactionType,
        LocalDateTime start,
        LocalDateTime end
    );

    /**
     * Sum deposits for an account within a date range
     */
    @Query("SELECT COALESCE(SUM(t.amount.amount), 0) FROM Transaction t " +
           "WHERE t.accountId = :accountId AND t.transactionType = 'DEPOSIT' " +
           "AND t.timestamp BETWEEN :start AND :end")
    BigDecimal sumDepositsForAccountInPeriod(
        @Param("accountId") UUID accountId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
