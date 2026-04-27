package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Loan entity.
 */
@Repository
public interface LoanRepository extends JpaRepository<Loan, UUID> {
    
    /**
     * Find loans by member
     */
    List<Loan> findByMemberIdOrderByApprovalDateDesc(UUID memberId);
    
    /**
     * Find loans by status
     */
    List<Loan> findByStatusOrderByApprovalDateDesc(Loan.LoanStatus status);

    /**
     * Find loans by status with pagination
     */
    Page<Loan> findByStatus(Loan.LoanStatus status, Pageable pageable);
    
    /**
     * Find active loans for a member using native SQL to avoid enum casting issues
     */
    @Query(value = "SELECT * FROM loans WHERE member_id = :memberId AND status::text IN ('ACTIVE', 'DISBURSED')",
           nativeQuery = true)
    List<Loan> findActiveLoansForMember(
        @Param("memberId") UUID memberId
    );
    
    /**
     * Calculate total outstanding loans
     */
    @Query("SELECT COALESCE(SUM(l.outstandingPrincipal.amount + l.outstandingInterest.amount), 0) " +
           "FROM Loan l WHERE l.status IN ('ACTIVE', 'DISBURSED')")
    BigDecimal getTotalOutstandingLoans();
    
    /**
     * Calculate total outstanding for a member
     */
    @Query("SELECT COALESCE(SUM(l.outstandingPrincipal.amount + l.outstandingInterest.amount), 0) " +
           "FROM Loan l WHERE l.memberId = :memberId AND l.status IN ('ACTIVE', 'DISBURSED')")
    BigDecimal getTotalOutstandingForMember(@Param("memberId") UUID memberId);

    /**
     * Count loans by status
     */
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = :status")
    long countByStatus(@Param("status") Loan.LoanStatus status);

    /**
     * Sum principal for all disbursed/active/paid loans (total ever disbursed)
     */
    @Query("SELECT COALESCE(SUM(l.principalAmount.amount), 0) FROM Loan l " +
           "WHERE l.status NOT IN ('APPROVED', 'CONTRACT_PENDING')")
    BigDecimal getTotalDisbursedPrincipal();

    /**
     * Sum outstanding principal+interest for active loans
     */
    @Query("SELECT COALESCE(SUM(l.outstandingPrincipal.amount + l.outstandingInterest.amount), 0) " +
           "FROM Loan l WHERE l.status = 'ACTIVE'")
    BigDecimal getTotalOutstandingActive();

    /**
     * Average interest rate across all loans
     */
    @Query("SELECT COALESCE(AVG(l.interestRate), 0) FROM Loan l")
    BigDecimal getAverageInterestRate();

    /**
     * Count delinquent loans (ACTIVE past maturity date)
     */
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'ACTIVE' AND l.maturityDate < CURRENT_DATE")
    long countDelinquentLoans();

    /**
     * Sum outstanding for delinquent loans
     */
    @Query("SELECT COALESCE(SUM(l.outstandingPrincipal.amount + l.outstandingInterest.amount), 0) " +
           "FROM Loan l WHERE l.status = 'ACTIVE' AND l.maturityDate < CURRENT_DATE")
    BigDecimal getTotalDelinquentOutstanding();

    /**
     * Count and sum loans grouped by status for portfolio report
     */
    @Query("SELECT l.status, COUNT(l), COALESCE(SUM(l.principalAmount.amount), 0), " +
           "COALESCE(SUM(l.outstandingPrincipal.amount + l.outstandingInterest.amount), 0) " +
           "FROM Loan l GROUP BY l.status")
    List<Object[]> getLoanStatsByStatus();

    /**
     * Count and sum loans grouped by duration bucket
     */
    @Query("SELECT l.durationMonths, COUNT(l), " +
           "COALESCE(SUM(l.outstandingPrincipal.amount + l.outstandingInterest.amount), 0) " +
           "FROM Loan l GROUP BY l.durationMonths")
    List<Object[]> getLoanStatsByDuration();
}
