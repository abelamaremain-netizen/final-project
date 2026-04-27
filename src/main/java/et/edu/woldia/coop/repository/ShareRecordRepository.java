package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.ShareRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Repository for ShareRecord entity.
 */
@Repository
public interface ShareRecordRepository extends JpaRepository<ShareRecord, UUID> {
    
    /**
     * Find all share records for a member
     */
    List<ShareRecord> findByMemberIdOrderByPurchaseDateDesc(UUID memberId);
    
    /**
     * Calculate total shares for a member
     */
    @Query("SELECT COALESCE(SUM(sr.sharesPurchased), 0) FROM ShareRecord sr WHERE sr.memberId = :memberId")
    Integer getTotalSharesByMemberId(@Param("memberId") UUID memberId);

    /**
     * Sum total shares purchased across all members
     */
    @Query("SELECT COALESCE(SUM(sr.sharesPurchased), 0) FROM ShareRecord sr")
    Integer getTotalSharesAllMembers();

    /**
     * Sum total share capital value across all records
     */
    @Query("SELECT COALESCE(SUM(sr.totalAmount.amount), 0) FROM ShareRecord sr")
    BigDecimal getTotalShareCapital();
}
