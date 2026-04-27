package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.MemberSuspension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for MemberSuspension entity.
 */
@Repository
public interface MemberSuspensionRepository extends JpaRepository<MemberSuspension, UUID> {
    
    /**
     * Find all suspensions for a member ordered by suspended date ascending
     */
    @Query("SELECT s FROM MemberSuspension s WHERE s.member.id = :memberId ORDER BY s.suspendedDate ASC")
    List<MemberSuspension> findByMemberId(@Param("memberId") UUID memberId);
    
    /**
     * Find active suspensions (not reactivated)
     */
    List<MemberSuspension> findByReactivatedDateIsNull();

    /**
     * Count total suspensions
     */
    long count();

    /**
     * Count active suspensions (not yet reactivated)
     */
    long countByReactivatedDateIsNull();

    /**
     * Count suspensions grouped by reason
     */
    @Query("SELECT s.reason, COUNT(s) FROM MemberSuspension s GROUP BY s.reason")
    List<Object[]> countByReason();
}
