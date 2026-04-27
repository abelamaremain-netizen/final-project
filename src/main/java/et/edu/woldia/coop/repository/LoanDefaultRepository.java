package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.LoanDefault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for LoanDefault entity.
 */
@Repository
public interface LoanDefaultRepository extends JpaRepository<LoanDefault, UUID> {
    
    /**
     * Find default by loan ID
     */
    Optional<LoanDefault> findByLoanId(UUID loanId);
    
    /**
     * Find defaults by status
     */
    List<LoanDefault> findByStatusOrderByDefaultDateDesc(LoanDefault.DefaultStatus status);
    
    /**
     * Check if loan is defaulted
     */
    boolean existsByLoanId(UUID loanId);
}
