package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.LoanApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for LoanApplication entity.
 */
@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, UUID> {
    
    /**
     * Find applications by member
     */
    List<LoanApplication> findByMemberIdOrderBySubmissionDateDesc(UUID memberId);
    
    /**
     * Find applications by status
     */
    List<LoanApplication> findByStatusOrderBySubmissionDateAsc(LoanApplication.ApplicationStatus status);
    
    /**
     * Find pending applications in queue order
     */
    @Query("SELECT la FROM LoanApplication la WHERE la.status IN ('PENDING', 'UNDER_REVIEW') ORDER BY la.submissionDate ASC")
    List<LoanApplication> findPendingApplicationsInQueue();
    
    /**
     * Count active loans for a member
     */
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.memberId = :memberId AND l.status IN ('ACTIVE', 'DISBURSED')")
    Long countActiveLoansForMember(@Param("memberId") UUID memberId);
}
