package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.LoanRestructuring;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for LoanRestructuring entity.
 */
@Repository
public interface LoanRestructuringRepository extends JpaRepository<LoanRestructuring, UUID> {
    
    /**
     * Find restructuring by original loan ID
     */
    Optional<LoanRestructuring> findByOriginalLoanId(UUID originalLoanId);
    
    /**
     * Find restructurings by member
     */
    List<LoanRestructuring> findByMemberIdOrderByRequestDateDesc(UUID memberId);
    
    /**
     * Find restructurings by status
     */
    List<LoanRestructuring> findByStatusOrderByRequestDateAsc(LoanRestructuring.RestructuringStatus status);
}
