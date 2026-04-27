package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.LoanApplicationDto;
import et.edu.woldia.coop.entity.LoanApplication;
import org.springframework.stereotype.Component;

/**
 * Mapper for LoanApplication entity and DTO.
 */
@Component
public class LoanApplicationMapper {

    public LoanApplicationDto toDto(LoanApplication entity) {
        if (entity == null) {
            return null;
        }

        LoanApplicationDto dto = new LoanApplicationDto();
        dto.setId(entity.getId());
        dto.setMemberId(entity.getMemberId());
        dto.setRequestedAmount(entity.getRequestedAmount().getAmount());
        dto.setLoanDurationMonths(entity.getLoanDurationMonths());
        dto.setLoanPurpose(entity.getLoanPurpose() != null ? entity.getLoanPurpose().name() : null);
        dto.setPurposeDescription(entity.getPurposeDescription());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setSubmissionDate(entity.getSubmissionDate());
        dto.setReviewedBy(entity.getReviewedBy());
        dto.setReviewStartDate(entity.getReviewStartedDate());
        dto.setDenialReason(entity.getDenialReason());
        dto.setCurrency(entity.getRequestedAmount().getCurrency());

        return dto;
    }
}