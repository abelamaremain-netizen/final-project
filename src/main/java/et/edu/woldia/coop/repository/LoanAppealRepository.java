package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.LoanAppeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.UUID;

/**
 * Repository for LoanAppeal entity.
 */
@Repository
public interface LoanAppealRepository extends JpaRepository<LoanAppeal, UUID> {
    
    /**
     * Find appeals by application ID
     */
    List<LoanAppeal> findByApplicationIdOrderBySubmissionDateDesc(UUID applicationId);
    
    /**
     * Find appeals by member
     */
    List<LoanAppeal> findByMemberIdOrderBySubmissionDateDesc(UUID memberId);
    
    /**
     * Find appeals by status
     */
    List<LoanAppeal> findByStatusOrderBySubmissionDateAsc(LoanAppeal.AppealStatus status);
}
