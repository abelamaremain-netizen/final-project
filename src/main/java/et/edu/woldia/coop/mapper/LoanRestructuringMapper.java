package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.LoanRestructuringDto;
import et.edu.woldia.coop.entity.LoanRestructuring;
import org.springframework.stereotype.Component;

/**
 * Mapper for LoanRestructuring entity and DTO.
 */
@Component
public class LoanRestructuringMapper {
    
    public LoanRestructuringDto toDto(LoanRestructuring entity) {
        if (entity == null) {
            return null;
        }
        
        LoanRestructuringDto dto = new LoanRestructuringDto();
        dto.setId(entity.getId());
        dto.setLoanId(entity.getOriginalLoanId());
        dto.setMemberId(entity.getMemberId());
        dto.setRestructuringReason(entity.getRestructuringReason());
        dto.setNewDurationMonths(entity.getNewDurationMonths());
        dto.setNewInterestRate(entity.getNewInterestRate());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setRequestDate(entity.getRequestDate());
        dto.setApprovedBy(entity.getApprovedBy());
        dto.setApprovalDate(entity.getApprovalDate());
        dto.setDenialReason(entity.getDenialReason());
        
        return dto;
    }
}
