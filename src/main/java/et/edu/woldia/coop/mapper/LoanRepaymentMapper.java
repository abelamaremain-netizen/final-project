package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.LoanRepaymentDto;
import et.edu.woldia.coop.entity.LoanRepayment;
import org.springframework.stereotype.Component;

/**
 * Mapper for LoanRepayment entity and DTO.
 */
@Component
public class LoanRepaymentMapper {
    
    public LoanRepaymentDto toDto(LoanRepayment entity) {
        if (entity == null) {
            return null;
        }
        
        LoanRepaymentDto dto = new LoanRepaymentDto();
        dto.setId(entity.getId());
        dto.setLoanId(entity.getLoanId());
        // paymentAmount may be null for legacy records — fall back to the legacy amount_amount column
        if (entity.getPaymentAmount() != null && entity.getPaymentAmount().getAmount() != null) {
            dto.setPaymentAmount(entity.getPaymentAmount().getAmount());
            dto.setCurrency(entity.getPaymentAmount().getCurrency() != null ? entity.getPaymentAmount().getCurrency() : "ETB");
        } else {
            dto.setPaymentAmount(entity.getAmountAmount());
            dto.setCurrency("ETB");
        }
        dto.setPrincipalPaid(entity.getPrincipalPaid() != null ? entity.getPrincipalPaid().getAmount() : entity.getPrincipalPortionAmount());
        dto.setInterestPaid(entity.getInterestPaid() != null ? entity.getInterestPaid().getAmount() : entity.getInterestPortionAmount());
        dto.setPenaltyPaid(entity.getPenaltyPaid() != null ? entity.getPenaltyPaid().getAmount() : java.math.BigDecimal.ZERO);
        dto.setPaymentDate(entity.getPaymentDate());
        dto.setProcessedBy(entity.getProcessedBy());
        dto.setNotes(entity.getNotes());
        
        return dto;
    }
}
