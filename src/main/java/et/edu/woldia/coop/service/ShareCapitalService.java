package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.ShareBalanceDto;
import et.edu.woldia.coop.dto.ShareRecordDto;
import et.edu.woldia.coop.dto.ShareTransferDto;
import et.edu.woldia.coop.entity.Member;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.entity.ShareRecord;
import et.edu.woldia.coop.entity.ShareTransfer;
import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.ShareRecordMapper;
import et.edu.woldia.coop.mapper.ShareTransferMapper;
import et.edu.woldia.coop.repository.MemberRepository;
import et.edu.woldia.coop.repository.ShareRecordRepository;
import et.edu.woldia.coop.repository.ShareTransferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for share capital management operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ShareCapitalService {
    
    private final ShareRecordRepository shareRecordRepository;
    private final ShareTransferRepository shareTransferRepository;
    private final ConfigurationService configurationService;
    private final MemberService memberService;
    private final ShareRecordMapper shareRecordMapper;
    private final ShareTransferMapper shareTransferMapper;
    private final AuditService auditService;
    
    /**
     * Record share purchase
     */
    @Transactional
    public void recordSharePurchase(UUID memberId, Integer sharesCount, String processedBy, String notes) {
        log.info("Recording share purchase: {} shares for member: {}", sharesCount, memberId);
        
        // Validate member exists
        Member member = memberService.getMemberEntity(memberId);
        
        if (member.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new ValidationException("Cannot purchase shares for inactive member");
        }
        
        // Get current configuration for share price
        SystemConfiguration config = configurationService.getCurrentConfiguration();
        Money pricePerShare = config.getSharePricePerShare();
        
        // Calculate total amount
        Money totalAmount = new Money(
            pricePerShare.getAmount().multiply(BigDecimal.valueOf(sharesCount)),
            pricePerShare.getCurrency()
        );
        
        // Create share record
        ShareRecord record = new ShareRecord();
        record.setMemberId(memberId);
        record.setSharesPurchased(sharesCount);
        record.setPricePerShare(pricePerShare);
        record.setTotalAmount(totalAmount);
        record.setPurchaseDate(LocalDate.now());
        record.setConfigVersion(config.getVersion());
        record.setProcessedBy(processedBy);
        record.setNotes(notes);
        
        shareRecordRepository.save(record);
        
        // Update member's share count
        Integer currentShares = member.getShareCount();
        memberService.updateShareCount(memberId, currentShares + sharesCount);
        
        log.info("Share purchase recorded: {} shares for member: {}, total: {}", 
            sharesCount, memberId, totalAmount.getAmount());

        try { auditService.logAction(null, processedBy, "CREATE", "SHARE", memberId,
            sharesCount + " shares purchased for member " + memberId + ". Total: ETB " + totalAmount.getAmount()); } catch (Exception ignored) {}
    }
    
    /**
     * Get share balance for a member
     */
    @Transactional(readOnly = true)
    public ShareBalanceDto getShareBalance(UUID memberId) {
        Member member = memberService.getMemberEntity(memberId);
        
        Integer totalShares = member.getShareCount();
        
        // Get current share price
        SystemConfiguration config = configurationService.getCurrentConfiguration();
        BigDecimal currentPrice = config.getSharePricePerShare().getAmount();
        
        // Calculate total value
        BigDecimal totalValue = currentPrice.multiply(BigDecimal.valueOf(totalShares));
        
        return ShareBalanceDto.builder()
            .memberId(memberId)
            .memberName(member.getFullName())
            .totalShares(totalShares)
            .currentPricePerShare(currentPrice)
            .totalValue(totalValue)
            .currency("ETB")
            .build();
    }
    
    /**
     * Calculate share value at current price
     */
    @Transactional(readOnly = true)
    public Money calculateShareValue(UUID memberId) {
        Member member = memberService.getMemberEntity(memberId);
        
        SystemConfiguration config = configurationService.getCurrentConfiguration();
        BigDecimal currentPrice = config.getSharePricePerShare().getAmount();
        BigDecimal totalValue = currentPrice.multiply(BigDecimal.valueOf(member.getShareCount()));
        
        return new Money(totalValue, "ETB");
    }
    
    /**
     * Get share purchase history for a member
     */
    @Transactional(readOnly = true)
    public List<ShareRecordDto> getSharePurchaseHistory(UUID memberId) {
        return shareRecordRepository.findByMemberIdOrderByPurchaseDateDesc(memberId).stream()
            .map(shareRecordMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Execute share transfer immediately between members (no approval step required).
     */
    @Transactional
    public UUID initiateShareTransfer(UUID fromMemberId, UUID toMemberId,
                                       Integer sharesCount, String notes) {
        log.info("Executing share transfer: {} shares from {} to {}", 
            sharesCount, fromMemberId, toMemberId);
        
        // Validate members
        Member fromMember = memberService.getMemberEntity(fromMemberId);
        Member toMember = memberService.getMemberEntity(toMemberId);
        
        // Validate both members are active
        if (fromMember.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new ValidationException("From member is not active");
        }
        
        if (toMember.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new ValidationException("To member is not active");
        }
        
        // Validate from member has enough shares
        if (fromMember.getShareCount() < sharesCount) {
            throw new ValidationException(
                "Insufficient shares. Member has " + fromMember.getShareCount() + " shares"
            );
        }
        
        // Validate from member will still have minimum shares after transfer
        SystemConfiguration config = configurationService.getCurrentConfiguration();
        Integer remainingShares = fromMember.getShareCount() - sharesCount;
        
        if (remainingShares < config.getMinimumSharesRequired()) {
            throw new ValidationException(
                "Transfer would leave member with less than minimum required shares (" + 
                config.getMinimumSharesRequired() + ")"
            );
        }
        
        // Get current share price
        Money pricePerShare = config.getSharePricePerShare();
        Money totalAmount = new Money(
            pricePerShare.getAmount().multiply(BigDecimal.valueOf(sharesCount)),
            pricePerShare.getCurrency()
        );
        
        // Create transfer record as COMPLETED immediately
        ShareTransfer transfer = new ShareTransfer();
        transfer.setFromMemberId(fromMemberId);
        transfer.setToMemberId(toMemberId);
        transfer.setSharesCount(sharesCount);
        transfer.setPricePerShare(pricePerShare);
        transfer.setTotalAmount(totalAmount);
        transfer.setStatus(ShareTransfer.TransferStatus.COMPLETED);
        transfer.setRequestedDate(LocalDateTime.now());
        transfer.setApprovedDate(LocalDateTime.now());
        transfer.setNotes(notes);
        
        ShareTransfer saved = shareTransferRepository.save(transfer);
        
        // Update share counts immediately
        memberService.updateShareCount(fromMemberId, fromMember.getShareCount() - sharesCount);
        memberService.updateShareCount(toMemberId, toMember.getShareCount() + sharesCount);
        
        log.info("Share transfer completed: {} shares from {} to {}, transfer ID: {}", 
            sharesCount, fromMemberId, toMemberId, saved.getId());

        try { auditService.logAction(null, "SYSTEM", "TRANSFER", "SHARE", saved.getId(),
            sharesCount + " shares transferred from " + fromMemberId + " to " + toMemberId); } catch (Exception ignored) {}

        return saved.getId();
    }
    
    /**
     * Approve share transfer
     */
    @Transactional
    public void approveShareTransfer(UUID transferId, String approvedBy) {
        log.info("Approving share transfer: {}", transferId);
        
        ShareTransfer transfer = shareTransferRepository.findById(transferId)
            .orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + transferId));
        
        if (transfer.getStatus() != ShareTransfer.TransferStatus.PENDING) {
            throw new ValidationException("Transfer is not pending");
        }
        
        // Get members
        Member fromMember = memberService.getMemberEntity(transfer.getFromMemberId());
        Member toMember = memberService.getMemberEntity(transfer.getToMemberId());
        
        // Validate from member still has enough shares
        if (fromMember.getShareCount() < transfer.getSharesCount()) {
            throw new ValidationException("From member no longer has sufficient shares");
        }
        
        // Update share counts
        memberService.updateShareCount(fromMember.getId(), fromMember.getShareCount() - transfer.getSharesCount());
        memberService.updateShareCount(toMember.getId(), toMember.getShareCount() + transfer.getSharesCount());
        
        // Update transfer status
        transfer.setStatus(ShareTransfer.TransferStatus.COMPLETED);
        transfer.setApprovedDate(LocalDateTime.now());
        transfer.setApprovedBy(approvedBy);
        
        shareTransferRepository.save(transfer);
        
        log.info("Share transfer approved and completed: {}", transferId);
    }
    
    /**
     * Deny share transfer
     */
    @Transactional
    public void denyShareTransfer(UUID transferId, String reason, String deniedBy) {
        log.info("Denying share transfer: {}", transferId);
        
        ShareTransfer transfer = shareTransferRepository.findById(transferId)
            .orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + transferId));
        
        if (transfer.getStatus() != ShareTransfer.TransferStatus.PENDING) {
            throw new ValidationException("Transfer is not pending");
        }
        
        transfer.setStatus(ShareTransfer.TransferStatus.DENIED);
        transfer.setDenialReason(reason);
        transfer.setApprovedBy(deniedBy);
        transfer.setApprovedDate(LocalDateTime.now());
        
        shareTransferRepository.save(transfer);
        
        log.info("Share transfer denied: {}", transferId);
    }
    
    /**
     * Get pending share transfers
     */
    @Transactional(readOnly = true)
    public List<ShareTransferDto> getPendingTransfers() {
        return shareTransferRepository.findByStatusOrderByRequestedDateAsc(
            ShareTransfer.TransferStatus.PENDING
        ).stream()
            .map(shareTransferMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get transfer history for a member
     */
    @Transactional(readOnly = true)
    public List<ShareTransferDto> getTransferHistory(UUID memberId) {
        return shareTransferRepository.findByFromMemberIdOrToMemberIdOrderByRequestedDateDesc(memberId, memberId).stream()
            .map(shareTransferMapper::toDto)
            .collect(Collectors.toList());
    }
}
