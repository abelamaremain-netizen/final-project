package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.LoanDto;
import et.edu.woldia.coop.entity.Loan;
import org.springframework.stereotype.Component;

/**
 * Mapper for Loan entity and DTO.
 */
@Component
public class LoanMapper {
    
    public LoanDto toDto(Loan entity) {
        if (entity == null) {
            return null;
        }
        
        LoanDto dto = new LoanDto();
        dto.setId(entity.getId());
        dto.setMemberId(entity.getMemberId());
        dto.setApplicationId(entity.getApplicationId());
        dto.setPrincipalAmount(entity.getPrincipalAmount().getAmount());
        dto.setInterestRate(entity.getInterestRate());
        dto.setDurationMonths(entity.getDurationMonths());
        dto.setOutstandingPrincipal(entity.getOutstandingPrincipal().getAmount());
        dto.setOutstandingInterest(entity.getOutstandingInterest().getAmount());
        dto.setDisbursementDate(entity.getDisbursementDate());
        dto.setMaturityDate(entity.getMaturityDate());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setApprovalDate(entity.getApprovalDate() != null ? entity.getApprovalDate().toLocalDate() : null);
        dto.setConfigVersion(entity.getConfigVersion());
        dto.setCurrency(entity.getPrincipalAmount().getCurrency());
        
        return dto;
    }
}
