package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.ConfigurationLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ConfigurationLock entity.
 */
@Repository
public interface ConfigurationLockRepository extends JpaRepository<ConfigurationLock, UUID> {
    
    /**
     * Find configuration lock by transaction type and ID
     */
    Optional<ConfigurationLock> findByTransactionTypeAndTransactionId(String transactionType, UUID transactionId);
    
    /**
     * Check if a transaction already has a locked configuration
     */
    boolean existsByTransactionTypeAndTransactionId(String transactionType, UUID transactionId);
}
