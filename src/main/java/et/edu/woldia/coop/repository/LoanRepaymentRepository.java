package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Repository for LoanRepayment entity.
 */
@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, UUID> {
    
    /**
     * Find repayments for a loan
     */
    List<LoanRepayment> findByLoanIdOrderByPaymentDateDesc(UUID loanId);

    /**
     * Count repayments for a loan in a given month/year
     */
    @Query("SELECT COUNT(r) FROM LoanRepayment r WHERE r.loanId = :loanId AND YEAR(r.paymentDate) = :year AND MONTH(r.paymentDate) = :month")
    long countByLoanIdAndMonth(UUID loanId, int year, int month);

    /**
     * Sum all repayment amounts
     */
    @Query("SELECT COALESCE(SUM(r.paymentAmount.amount), 0) FROM LoanRepayment r")
    BigDecimal getTotalRepayments();

    /**
     * Sum all interest paid across all repayments
     */
    @Query("SELECT COALESCE(SUM(r.interestPaid.amount), 0) FROM LoanRepayment r")
    BigDecimal getTotalInterestPaid();
}
