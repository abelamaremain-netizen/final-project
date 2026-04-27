package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for AuditLog entity.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    
    /**
     * Find audit logs by entity type and ID
     */
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, UUID entityId);
    
    /**
     * Find audit logs by user
     */
    Page<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId, Pageable pageable);
    
    /**
     * Find audit logs by action
     */
    Page<AuditLog> findByActionOrderByTimestampDesc(String action, Pageable pageable);

    /**
     * Find audit logs with filters — uses named params with CAST to avoid PostgreSQL type inference issue.
     */
    @Query(value = "SELECT * FROM audit_logs a WHERE " +
           "(:userId IS NULL OR a.user_id = CAST(:userId AS uuid)) AND " +
           "(:entityType IS NULL OR a.entity_type = :entityType) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:startDate IS NULL OR a.timestamp >= CAST(:startDate AS timestamp)) AND " +
           "(:endDate IS NULL OR a.timestamp <= CAST(:endDate AS timestamp)) " +
           "ORDER BY a.timestamp DESC",
           countQuery = "SELECT COUNT(*) FROM audit_logs a WHERE " +
           "(:userId IS NULL OR a.user_id = CAST(:userId AS uuid)) AND " +
           "(:entityType IS NULL OR a.entity_type = :entityType) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:startDate IS NULL OR a.timestamp >= CAST(:startDate AS timestamp)) AND " +
           "(:endDate IS NULL OR a.timestamp <= CAST(:endDate AS timestamp))",
           nativeQuery = true)
    Page<AuditLog> findWithFilters(@Param("userId") String userId,
                                    @Param("entityType") String entityType,
                                    @Param("action") String action,
                                    @Param("startDate") String startDate,
                                    @Param("endDate") String endDate,
                                    Pageable pageable);
}
