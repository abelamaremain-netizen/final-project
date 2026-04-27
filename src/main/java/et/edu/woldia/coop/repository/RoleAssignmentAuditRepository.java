package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.RoleAssignmentAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for RoleAssignmentAudit entity.
 */
@Repository
public interface RoleAssignmentAuditRepository extends JpaRepository<RoleAssignmentAudit, UUID> {
    
    /**
     * Find all audit records for a user
     */
    List<RoleAssignmentAudit> findByUserIdOrderByPerformedAtDesc(UUID userId);
    
    /**
     * Find all audit records performed by a specific user
     */
    List<RoleAssignmentAudit> findByPerformedByOrderByPerformedAtDesc(String performedBy);
}
