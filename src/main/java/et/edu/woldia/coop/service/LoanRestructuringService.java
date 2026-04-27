package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.LoanRestructuringDto;
import et.edu.woldia.coop.entity.*;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.LoanRestructuringMapper;
import et.edu.woldia.coop.repository.LoanRepository;
import et.edu.woldia.coop.repository.LoanRestructuringRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for loan restructuring management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LoanRestructuringService {
    
    private final LoanRestructuringRepository loanRestructuringRepository;
    private final LoanRepository loanRepository;
    private final ConfigurationService configurationService;
    private final LoanRestructuringMapper loanRestructuringMapper;
    private final AuditService auditService;
    
    /**
     * Initiate loan restructuring
     */
    @Transactional
    public UUID initiateRestructuring(UUID loanId, String reason, Integer newDurationMonths,
                                       BigDecimal newInterestRate, String requestedBy) {
        log.info("Initiating restructuring for loan: {}", loanId);
        
        Loan loan = findLoanById(loanId);
        
        if (loan.getStatus() != Loan.LoanStatus.ACTIVE && loan.getStatus() != Loan.LoanStatus.DISBURSED) {
            throw new ValidationException("Loan is not active");
        }
        
        if (loan.getStatus() == Loan.LoanStatus.RESTRUCTURED) {
            throw new ValidationException("Loan has already been restructured");
        }
        
        // Check if restructuring already exists
        if (loanRestructuringRepository.findByOriginalLoanId(loanId).isPresent()) {
            throw new ValidationException("Restructuring request already exists for this loan");
        }
        
        // Validate new interest rate
        SystemConfiguration config = configurationService.getCurrentConfiguration();
        if (newInterestRate.compareTo(config.getLoanInterestRateMin()) < 0 ||
            newInterestRate.compareTo(config.getLoanInterestRateMax()) > 0) {
            throw new ValidationException(
                String.format("Interest rate must be between %s and %s",
                    config.getLoanInterestRateMin(), config.getLoanInterestRateMax())
            );
        }
        
        // Calculate outstanding amount (null-safe for legacy loans)
        BigDecimal outstandingAmount = BigDecimal.ZERO;
        if (loan.getOutstandingPrincipal() != null && loan.getOutstandingPrincipal().getAmount() != null) {
            outstandingAmount = outstandingAmount.add(loan.getOutstandingPrincipal().getAmount());
        }
        if (loan.getOutstandingInterest() != null && loan.getOutstandingInterest().getAmount() != null) {
            outstandingAmount = outstandingAmount.add(loan.getOutstandingInterest().getAmount());
        }
        
        // Calculate new monthly payment using simple interest (consistent with rest of system)
        // Total payable = outstanding + (outstanding × rate × months/12)
        // Monthly payment = total payable / months
        BigDecimal totalInterest = calculateTotalInterest(outstandingAmount, newInterestRate, newDurationMonths);
        BigDecimal totalPayable = outstandingAmount.add(totalInterest);
        BigDecimal newMonthlyPayment = totalPayable.divide(BigDecimal.valueOf(newDurationMonths), 2, RoundingMode.HALF_UP);
        
        // Create restructuring request
        LoanRestructuring restructuring = new LoanRestructuring();
        restructuring.setOriginalLoanId(loanId);
        restructuring.setMemberId(loan.getMemberId());
        restructuring.setRestructuringReason(reason);
        restructuring.setOutstandingAtRestructure(new Money(outstandingAmount, "ETB"));
        restructuring.setNewDurationMonths(newDurationMonths);
        restructuring.setNewInterestRate(newInterestRate);
        restructuring.setNewMonthlyPayment(new Money(newMonthlyPayment, "ETB"));
        restructuring.setRequestDate(LocalDateTime.now());
        restructuring.setRequestedBy(requestedBy);
        restructuring.setStatus(LoanRestructuring.RestructuringStatus.PENDING);
        
        LoanRestructuring saved = loanRestructuringRepository.save(restructuring);
        
        log.info("Restructuring initiated: {}", saved.getId());

        try { auditService.logAction(null, requestedBy, "CREATE", "LOAN_RESTRUCTURING", saved.getId(),
            "Restructuring requested for loan " + loanId + ". Reason: " + reason); } catch (Exception ignored) {}

        return saved.getId();
    }
    
    /**
     * Approve restructuring
     */
    @Transactional
    public void approveRestructuring(UUID restructuringId, String approvedBy) {
        log.info("Approving restructuring: {}", restructuringId);
        
        LoanRestructuring restructuring = loanRestructuringRepository.findById(restructuringId)
            .orElseThrow(() -> new ResourceNotFoundException("Restructuring not found: " + restructuringId));
        
        if (restructuring.getStatus() != LoanRestructuring.RestructuringStatus.PENDING) {
            throw new ValidationException("Restructuring is not pending");
        }
        
        Loan originalLoan = findLoanById(restructuring.getOriginalLoanId());
        
        // Lock configuration
        SystemConfiguration config = configurationService.lockConfigurationForTransaction(
            "LOAN_RESTRUCTURING",
            restructuringId,
            approvedBy
        );
        
        // Create new loan
        Loan newLoan = new Loan();
        newLoan.setApplicationId(originalLoan.getApplicationId());
        newLoan.setMemberId(originalLoan.getMemberId());
        newLoan.setPrincipalAmount(restructuring.getOutstandingAtRestructure());
        newLoan.setInterestRate(restructuring.getNewInterestRate());
        newLoan.setDurationMonths(restructuring.getNewDurationMonths());
        newLoan.setOutstandingPrincipal(restructuring.getOutstandingAtRestructure());
        
        // Calculate new total interest
        BigDecimal totalInterest = calculateTotalInterest(
            restructuring.getOutstandingAtRestructure().getAmount(),
            restructuring.getNewInterestRate(),
            restructuring.getNewDurationMonths()
        );
        newLoan.setOutstandingInterest(new Money(totalInterest, "ETB"));
        newLoan.setTotalPaid(new Money(BigDecimal.ZERO, "ETB"));
        
        newLoan.setStatus(Loan.LoanStatus.ACTIVE);
        newLoan.setApprovalDate(LocalDateTime.now());
        newLoan.setDisbursementDate(LocalDate.now());
        newLoan.setFirstPaymentDate(LocalDate.now().plusMonths(1));
        newLoan.setMaturityDate(LocalDate.now().plusMonths(restructuring.getNewDurationMonths()));
        newLoan.setConfigVersion(config.getVersion());
        
        Loan savedNewLoan = loanRepository.save(newLoan);
        
        // Update original loan
        originalLoan.setStatus(Loan.LoanStatus.RESTRUCTURED);
        loanRepository.save(originalLoan);
        
        // Update restructuring record
        restructuring.setNewLoanId(savedNewLoan.getId());
        restructuring.setStatus(LoanRestructuring.RestructuringStatus.COMPLETED);
        restructuring.setApprovalDate(LocalDateTime.now());
        restructuring.setApprovedBy(approvedBy);
        restructuring.setConfigVersion(config.getVersion());
        
        loanRestructuringRepository.save(restructuring);
        
        log.info("Restructuring approved: {}, new loan: {}", restructuringId, savedNewLoan.getId());

        try { auditService.logAction(null, approvedBy, "APPROVE", "LOAN_RESTRUCTURING", restructuringId,
            "Restructuring approved. New loan: " + savedNewLoan.getId()); } catch (Exception ignored) {}
    }
    
    /**
     * Deny restructuring
     */
    @Transactional
    public void denyRestructuring(UUID restructuringId, String reason, String deniedBy) {
        log.info("Denying restructuring: {}", restructuringId);
        
        LoanRestructuring restructuring = loanRestructuringRepository.findById(restructuringId)
            .orElseThrow(() -> new ResourceNotFoundException("Restructuring not found: " + restructuringId));
        
        if (restructuring.getStatus() != LoanRestructuring.RestructuringStatus.PENDING) {
            throw new ValidationException("Restructuring is not pending");
        }
        
        restructuring.setStatus(LoanRestructuring.RestructuringStatus.DENIED);
        restructuring.setDenialReason(reason);
        restructuring.setApprovedBy(deniedBy);
        restructuring.setApprovalDate(LocalDateTime.now());
        
        loanRestructuringRepository.save(restructuring);
        
        log.info("Restructuring denied: {}", restructuringId);

        try { auditService.logAction(null, deniedBy, "DENY", "LOAN_RESTRUCTURING", restructuringId,
            "Restructuring denied. Reason: " + reason); } catch (Exception ignored) {}
    }
    
    /**
     * Get pending restructurings
     */
    @Transactional(readOnly = true)
    public List<LoanRestructuringDto> getPendingRestructurings() {
        return loanRestructuringRepository.findByStatusOrderByRequestDateAsc(
            LoanRestructuring.RestructuringStatus.PENDING
        ).stream()
            .map(loanRestructuringMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get restructurings for member
     */
    @Transactional(readOnly = true)
    public List<LoanRestructuringDto> getRestructuringsForMember(UUID memberId) {
        return loanRestructuringRepository.findByMemberIdOrderByRequestDateDesc(memberId).stream()
            .map(loanRestructuringMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate total interest
     */
    private BigDecimal calculateTotalInterest(BigDecimal principal, BigDecimal annualRate, Integer months) {
        BigDecimal years = BigDecimal.valueOf(months).divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        return principal.multiply(annualRate).multiply(years).setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Find loan by ID or throw exception
     */
    private Loan findLoanById(UUID id) {
        return loanRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + id));
    }
}
