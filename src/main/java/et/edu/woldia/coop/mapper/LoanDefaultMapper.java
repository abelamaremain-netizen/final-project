package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.LoanDefaultDto;
import et.edu.woldia.coop.entity.LoanDefault;
import org.springframework.stereotype.Component;

/**
 * Mapper for LoanDefault entity and DTO.
 */
@Component
public class LoanDefaultMapper {
    
    public LoanDefaultDto toDto(LoanDefault entity) {
        if (entity == null) {
            return null;
        }
        
        LoanDefaultDto dto = new LoanDefaultDto();
        dto.setId(entity.getId());
        dto.setLoanId(entity.getLoanId());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setDefaultDate(entity.getDefaultDate());
        dto.setDefaultReason(entity.getDefaultReason());
        dto.setCourtCaseNumber(entity.getCourtCaseNumber());
        dto.setLegalActionDate(entity.getLegalActionDate());
        dto.setResolutionDate(entity.getResolutionDate());
        dto.setResolutionNotes(entity.getResolutionNotes());
        dto.setDeclaredBy(entity.getDeclaredBy());
        
        return dto;
    }
}
