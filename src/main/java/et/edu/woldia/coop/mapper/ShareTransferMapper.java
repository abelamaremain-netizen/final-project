package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.ShareTransferDto;
import et.edu.woldia.coop.entity.ShareTransfer;
import org.springframework.stereotype.Component;

/**
 * Mapper for ShareTransfer entity and DTO.
 */
@Component
public class ShareTransferMapper {
    
    public ShareTransferDto toDto(ShareTransfer entity) {
        if (entity == null) {
            return null;
        }
        
        ShareTransferDto dto = new ShareTransferDto();
        dto.setId(entity.getId());
        dto.setFromMemberId(entity.getFromMemberId());
        dto.setToMemberId(entity.getToMemberId());
        dto.setSharesCount(entity.getSharesCount());
        dto.setPricePerShare(entity.getPricePerShare().getAmount());
        dto.setTotalAmount(entity.getTotalAmount().getAmount());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setInitiatedDate(entity.getRequestedDate());
        dto.setApprovedBy(entity.getApprovedBy());
        dto.setApprovalDate(entity.getApprovedDate());
        dto.setDenialReason(entity.getDenialReason());
        dto.setNotes(entity.getNotes());
        dto.setCurrency(entity.getTotalAmount().getCurrency());
        
        return dto;
    }
}
