package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.LoanAppealDto;
import et.edu.woldia.coop.entity.LoanAppeal;
import org.springframework.stereotype.Component;

/**
 * Mapper for LoanAppeal entity and DTO.
 */
@Component
public class LoanAppealMapper {
    
    public LoanAppealDto toDto(LoanAppeal entity) {
        if (entity == null) {
            return null;
        }
        
        LoanAppealDto dto = new LoanAppealDto();
        dto.setId(entity.getId());
        dto.setApplicationId(entity.getApplicationId());
        dto.setMemberId(entity.getMemberId());
        dto.setAppealReason(entity.getAppealReason());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setSubmissionDate(entity.getSubmissionDate());
        dto.setDecision(entity.getDecision() != null ? entity.getDecision().name() : null);
        dto.setDecisionNotes(entity.getDecisionNotes());
        dto.setDecisionDate(entity.getDecisionDate());
        dto.setDecidedBy(entity.getRecordedBy());
        
        return dto;
    }
}
