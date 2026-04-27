package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.Collateral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for Collateral entity.
 */
@Repository
public interface CollateralRepository extends JpaRepository<Collateral, UUID> {
    
    /**
     * Find collateral for a loan
     */
    List<Collateral> findByLoanId(UUID loanId);
    
    /**
     * Find collateral by status
     */
    List<Collateral> findByStatus(Collateral.CollateralStatus status);
    
    /**
     * Find collateral for a loan application
     * Note: Collateral is linked to loanId, but during application phase,
     * we use the applicationId which will become the loanId after approval
     */
    @Query("SELECT c FROM Collateral c WHERE c.loanId = :applicationId")
    List<Collateral> findByApplicationId(@Param("applicationId") UUID applicationId);
    /**
     * Find active collateral pledged from a specific account (own savings)
     */
    @Query("SELECT c FROM Collateral c WHERE c.accountId = :accountId AND c.status = 'PLEDGED'")
    List<Collateral> findActivePledgesByAccountId(@Param("accountId") UUID accountId);

    /**
     * Find active collateral where account is used as guarantor
     */
    @Query("SELECT c FROM Collateral c WHERE c.guarantorAccountId = :accountId AND c.status = 'PLEDGED'")
    List<Collateral> findActiveGuaranteesByAccountId(@Param("accountId") UUID accountId);
}
