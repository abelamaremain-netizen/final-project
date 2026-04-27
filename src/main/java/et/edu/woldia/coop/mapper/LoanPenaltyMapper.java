package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.LoanPenaltyDto;
import et.edu.woldia.coop.entity.LoanPenalty;
import org.springframework.stereotype.Component;

/**
 * Mapper for LoanPenalty entity and DTO.
 */
@Component
public class LoanPenaltyMapper {
    
    public LoanPenaltyDto toDto(LoanPenalty entity) {
        if (entity == null) {
            return null;
        }
        
        LoanPenaltyDto dto = new LoanPenaltyDto();
        dto.setId(entity.getId());
        dto.setLoanId(entity.getLoanId());
        dto.setPenaltyAmount(entity.getPenaltyAmount().getAmount());
        dto.setPenaltyType(entity.getPenaltyType() != null ? entity.getPenaltyType().name() : null);
        dto.setAssessmentDate(entity.getAssessmentDate());
        dto.setAssessedBy(entity.getAssessedBy());
        dto.setPaid(entity.getIsPaid());
        dto.setPaidDate(entity.getPaidDate());
        dto.setCurrency(entity.getPenaltyAmount().getCurrency());
        
        return dto;
    }
}
