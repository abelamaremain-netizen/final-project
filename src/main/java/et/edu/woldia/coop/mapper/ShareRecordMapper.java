package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.ShareRecordDto;
import et.edu.woldia.coop.entity.ShareRecord;
import org.springframework.stereotype.Component;

/**
 * Mapper for ShareRecord entity and DTO.
 */
@Component
public class ShareRecordMapper {
    
    public ShareRecordDto toDto(ShareRecord entity) {
        if (entity == null) {
            return null;
        }
        
        ShareRecordDto dto = new ShareRecordDto();
        dto.setId(entity.getId());
        dto.setMemberId(entity.getMemberId());
        dto.setSharesPurchased(entity.getSharesPurchased());
        dto.setPricePerShare(entity.getPricePerShare().getAmount());
        dto.setTotalAmount(entity.getTotalAmount().getAmount());
        dto.setPurchaseDate(entity.getPurchaseDate());
        dto.setProcessedBy(entity.getProcessedBy());
        dto.setNotes(entity.getNotes());
        dto.setCurrency(entity.getTotalAmount().getCurrency());
        
        return dto;
    }
}
