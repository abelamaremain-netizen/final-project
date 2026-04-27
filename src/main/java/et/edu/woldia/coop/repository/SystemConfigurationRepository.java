package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for SystemConfiguration entity.
 */
@Repository
public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, UUID> {
    
    /**
     * Find configuration by version number
     */
    Optional<SystemConfiguration> findByVersion(Integer version);
    
    /**
     * Find the current (latest) configuration
     */
    @Query("SELECT c FROM SystemConfiguration c ORDER BY c.version DESC LIMIT 1")
    Optional<SystemConfiguration> findCurrent();
    
    /**
     * Find configuration effective at a specific date
     */
    @Query("SELECT c FROM SystemConfiguration c WHERE c.effectiveDate <= :date ORDER BY c.effectiveDate DESC LIMIT 1")
    Optional<SystemConfiguration> findByEffectiveDate(LocalDateTime date);
    
    /**
     * Get the next version number
     */
    @Query("SELECT COALESCE(MAX(c.version), 0) + 1 FROM SystemConfiguration c")
    Integer getNextVersion();
}
