package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.LoanPenalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Repository for LoanPenalty entity.
 */
@Repository
public interface LoanPenaltyRepository extends JpaRepository<LoanPenalty, UUID> {
    
    /**
     * Find penalties for a loan
     */
    List<LoanPenalty> findByLoanIdOrderByAssessmentDateDesc(UUID loanId);
    
    /**
     * Find unpaid penalties for a loan
     */
    List<LoanPenalty> findByLoanIdAndIsPaidFalseOrderByAssessmentDateAsc(UUID loanId);
    
    /**
     * Check if a penalty was already assessed for a loan in the current month
     */
    @Query("SELECT COUNT(p) > 0 FROM LoanPenalty p WHERE p.loanId = :loanId " +
           "AND YEAR(p.assessmentDate) = :year AND MONTH(p.assessmentDate) = :month")
    boolean existsByLoanIdAndAssessmentMonth(@Param("loanId") UUID loanId,
                                             @Param("year") int year,
                                             @Param("month") int month);
    
    /**
     * Calculate total unpaid penalties for a loan
     */
    @Query("SELECT COALESCE(SUM(p.penaltyAmount.amount), 0) FROM LoanPenalty p " +
           "WHERE p.loanId = :loanId AND p.isPaid = false")
    BigDecimal getTotalUnpaidPenalties(@Param("loanId") UUID loanId);
}
