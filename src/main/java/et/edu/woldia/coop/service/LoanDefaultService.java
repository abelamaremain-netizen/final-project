package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.LoanDefaultDto;
import et.edu.woldia.coop.entity.Loan;
import et.edu.woldia.coop.entity.LoanDefault;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.LoanDefaultMapper;
import et.edu.woldia.coop.repository.LoanDefaultRepository;
import et.edu.woldia.coop.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for loan default management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LoanDefaultService {
    
    private final LoanDefaultRepository loanDefaultRepository;
    private final LoanRepository loanRepository;
    private final LoanDefaultMapper loanDefaultMapper;
    private final AuditService auditService;
    
    /**
     * Declare loan as defaulted
     */
    @Transactional
    public void declareDefault(UUID loanId, String reason, String declaredBy) {
        log.info("Declaring loan as defaulted: {}", loanId);
        
        Loan loan = findLoanById(loanId);
        
        if (loan.getStatus() == Loan.LoanStatus.DEFAULTED) {
            throw new ValidationException("Loan is already defaulted");
        }
        
        if (loan.getStatus() == Loan.LoanStatus.PAID_OFF) {
            throw new ValidationException("Cannot default a paid-off loan");
        }
        
        // Check if already defaulted
        if (loanDefaultRepository.existsByLoanId(loanId)) {
            throw new ValidationException("Default record already exists for this loan");
        }
        
        // Calculate outstanding amount (null-safe for legacy loans)
        BigDecimal outstandingAmount = BigDecimal.ZERO;
        if (loan.getOutstandingPrincipal() != null && loan.getOutstandingPrincipal().getAmount() != null) {
            outstandingAmount = outstandingAmount.add(loan.getOutstandingPrincipal().getAmount());
        }
        if (loan.getOutstandingInterest() != null && loan.getOutstandingInterest().getAmount() != null) {
            outstandingAmount = outstandingAmount.add(loan.getOutstandingInterest().getAmount());
        }
        
        // Create default record
        LoanDefault loanDefault = new LoanDefault();
        loanDefault.setLoanId(loanId);
        loanDefault.setDefaultDate(LocalDateTime.now());
        loanDefault.setDeclaredBy(declaredBy);
        loanDefault.setDaysOverdueAtDefault(
            loan.getMaturityDate() != null
                ? (int) java.time.temporal.ChronoUnit.DAYS.between(loan.getMaturityDate(), java.time.LocalDate.now())
                : 0
        );
        loanDefault.setOutstandingAtDefault(new Money(outstandingAmount, "ETB"));
        loanDefault.setDefaultReason(reason);
        loanDefault.setStatus(LoanDefault.DefaultStatus.DECLARED);
        
        loanDefaultRepository.save(loanDefault);
        
        // Update loan status
        loan.setStatus(Loan.LoanStatus.DEFAULTED);
        loanRepository.save(loan);
        
        log.info("Loan declared as defaulted: {}, outstanding: {}", loanId, outstandingAmount);

        try { auditService.logAction(null, declaredBy, "DEFAULT", "LOAN", loanId,
            "Loan declared defaulted. Outstanding: ETB " + outstandingAmount + ". Reason: " + reason); } catch (Exception ignored) {}
    }
    
    /**
     * Initiate legal action
     */
    @Transactional
    public void initiateLegalAction(UUID loanId, String courtCaseNumber, String initiatedBy) {
        log.info("Initiating legal action for loan: {}", loanId);
        
        LoanDefault loanDefault = loanDefaultRepository.findByLoanId(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Default record not found for loan: " + loanId));
        
        if (loanDefault.getLegalActionInitiated()) {
            throw new ValidationException("Legal action already initiated");
        }
        
        loanDefault.setLegalActionInitiated(true);
        loanDefault.setLegalActionDate(LocalDateTime.now());
        loanDefault.setCourtCaseNumber(courtCaseNumber);
        loanDefault.setStatus(LoanDefault.DefaultStatus.LEGAL_ACTION_INITIATED);
        
        loanDefaultRepository.save(loanDefault);
        
        log.info("Legal action initiated for loan: {}, case number: {}", loanId, courtCaseNumber);

        try { auditService.logAction(null, initiatedBy, "LEGAL_ACTION", "LOAN", loanId,
            "Legal action initiated. Case: " + courtCaseNumber); } catch (Exception ignored) {}
    }
    
    /**
     * Update default status to in court
     */
    @Transactional
    public void updateToInCourt(UUID loanId) {
        LoanDefault loanDefault = loanDefaultRepository.findByLoanId(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Default record not found for loan: " + loanId));
        
        loanDefault.setStatus(LoanDefault.DefaultStatus.IN_COURT);
        loanDefaultRepository.save(loanDefault);
        
        log.info("Default status updated to IN_COURT for loan: {}", loanId);
    }
    
    /**
     * Resolve default
     */
    @Transactional
    public void resolveDefault(UUID loanId, String resolutionNotes) {
        LoanDefault loanDefault = loanDefaultRepository.findByLoanId(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Default record not found for loan: " + loanId));
        
        loanDefault.setStatus(LoanDefault.DefaultStatus.RESOLVED);
        loanDefault.setResolutionDate(LocalDateTime.now());
        loanDefault.setResolutionNotes(resolutionNotes);
        
        loanDefaultRepository.save(loanDefault);
        
        // Restore loan to ACTIVE status
        Loan loan = findLoanById(loanId);
        loan.setStatus(Loan.LoanStatus.ACTIVE);
        loanRepository.save(loan);
        
        log.info("Default resolved for loan: {}", loanId);

        try { auditService.logAction(null, "SYSTEM", "RESOLVE_DEFAULT", "LOAN", loanId,
            "Default resolved. Notes: " + resolutionNotes); } catch (Exception ignored) {}
    }
    
    /**
     * Get defaults by status
     */
    @Transactional(readOnly = true)
    public List<LoanDefaultDto> getDefaultsByStatus(LoanDefault.DefaultStatus status) {
        return loanDefaultRepository.findByStatusOrderByDefaultDateDesc(status).stream()
            .map(loanDefaultMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get default for loan
     */
    @Transactional(readOnly = true)
    public LoanDefaultDto getDefaultForLoan(UUID loanId) {
        LoanDefault loanDefault = loanDefaultRepository.findByLoanId(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Default record not found for loan: " + loanId));
        return loanDefaultMapper.toDto(loanDefault);
    }
    
    /**
     * Find loan by ID or throw exception
     */
    private Loan findLoanById(UUID id) {
        return loanRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + id));
    }
}
