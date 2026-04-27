package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.ShareTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for ShareTransfer entity.
 */
@Repository
public interface ShareTransferRepository extends JpaRepository<ShareTransfer, UUID> {
    
    /**
     * Find all transfers for a member (as sender or receiver)
     */
    List<ShareTransfer> findByFromMemberIdOrToMemberIdOrderByRequestedDateDesc(
        UUID fromMemberId, UUID toMemberId
    );
    
    /**
     * Find pending transfers
     */
    List<ShareTransfer> findByStatusOrderByRequestedDateAsc(ShareTransfer.TransferStatus status);
    
    /**
     * Find transfers from a member
     */
    List<ShareTransfer> findByFromMemberIdOrderByRequestedDateDesc(UUID fromMemberId);
    
    /**
     * Find transfers to a member
     */
    List<ShareTransfer> findByToMemberIdOrderByRequestedDateDesc(UUID toMemberId);
}
