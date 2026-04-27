package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.LoanPenaltyDto;
import et.edu.woldia.coop.entity.Loan;
import et.edu.woldia.coop.entity.LoanPenalty;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.LoanPenaltyMapper;
import et.edu.woldia.coop.repository.LoanPenaltyRepository;
import et.edu.woldia.coop.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for loan penalty management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LoanPenaltyService {
    
    private final LoanPenaltyRepository loanPenaltyRepository;
    private final LoanRepository loanRepository;
    private final ConfigurationService configurationService;
    private final LoanPenaltyMapper loanPenaltyMapper;
    private final AuditService auditService;
    
    /**
     * Assess late payment penalty
     */
    @Transactional
    public void assessLatePaymentPenalty(UUID loanId, String assessedBy) {
        log.info("Assessing late payment penalty for loan: {}", loanId);
        
        Loan loan = findLoanById(loanId);
        
        if (loan.getStatus() != Loan.LoanStatus.ACTIVE && loan.getStatus() != Loan.LoanStatus.DISBURSED) {
            throw new ValidationException("Loan is not active");
        }
        
        // Prevent duplicate penalty assessment in the same calendar month
        LocalDate today = LocalDate.now();
        if (loanPenaltyRepository.existsByLoanIdAndAssessmentMonth(loanId, today.getYear(), today.getMonthValue())) {
            throw new ValidationException("A penalty has already been assessed for this loan this month");
        }
        
        // Calculate days overdue
        LocalDate expectedPaymentDate = loan.getFirstPaymentDate();
        if (loan.getLastPaymentDate() != null) {
            expectedPaymentDate = loan.getLastPaymentDate().plusMonths(1);
        }
        
        // Get configuration for grace period
        SystemConfiguration config = configurationService.getConfigurationVersion(loan.getConfigVersion());
        LocalDate gracePeriodEnd = expectedPaymentDate.plusDays(config.getLatePaymentPenaltyGraceDays());
        
        if (today.isBefore(gracePeriodEnd)) {
            throw new ValidationException("Loan is still within grace period");
        }
        
        long daysOverdue = ChronoUnit.DAYS.between(gracePeriodEnd, today);
        
        // Calculate penalty amount
        BigDecimal penaltyRate = config.getLatePaymentPenaltyRate();
        BigDecimal outstandingAmount = loan.getOutstandingPrincipal().getAmount()
            .add(loan.getOutstandingInterest().getAmount());
        
        // Penalty = Outstanding × Rate × (Days Overdue / 365)
        BigDecimal penaltyAmount = outstandingAmount
            .multiply(penaltyRate)
            .multiply(BigDecimal.valueOf(daysOverdue))
            .divide(BigDecimal.valueOf(365), 2, RoundingMode.HALF_UP);
        
        // Create penalty record
        LoanPenalty penalty = new LoanPenalty();
        penalty.setLoanId(loanId);
        penalty.setPenaltyType(LoanPenalty.PenaltyType.LATE_PAYMENT);
        penalty.setPenaltyAmount(new Money(penaltyAmount, "ETB"));
        penalty.setPenaltyRate(penaltyRate);
        penalty.setDaysOverdue((int) daysOverdue);
        penalty.setAssessmentDate(LocalDate.now());
        penalty.setAssessedBy(assessedBy);
        penalty.setConfigVersion(config.getVersion());
        penalty.setIsPaid(false);
        
        loanPenaltyRepository.save(penalty);
        
        log.info("Late payment penalty assessed: {} ETB for {} days overdue", penaltyAmount, daysOverdue);

        try { auditService.logAction(null, assessedBy, "PENALTY", "LOAN", loanId,
            "Late payment penalty of ETB " + penaltyAmount + " assessed for " + daysOverdue + " days overdue"); } catch (Exception ignored) {}
    }
    
    /**
     * Get penalties for a loan
     */
    @Transactional(readOnly = true)
    public List<LoanPenaltyDto> getLoanPenalties(UUID loanId) {
        return loanPenaltyRepository.findByLoanIdOrderByAssessmentDateDesc(loanId).stream()
            .map(loanPenaltyMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get unpaid penalties for a loan
     */
    @Transactional(readOnly = true)
    public List<LoanPenaltyDto> getUnpaidPenalties(UUID loanId) {
        return loanPenaltyRepository.findByLoanIdAndIsPaidFalseOrderByAssessmentDateAsc(loanId).stream()
            .map(loanPenaltyMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get total unpaid penalties
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalUnpaidPenalties(UUID loanId) {
        return loanPenaltyRepository.getTotalUnpaidPenalties(loanId);
    }
    
    /**
     * Mark penalty as paid
     */
    @Transactional
    public void markPenaltyAsPaid(UUID penaltyId) {
        LoanPenalty penalty = loanPenaltyRepository.findById(penaltyId)
            .orElseThrow(() -> new ResourceNotFoundException("Penalty not found: " + penaltyId));
        
        penalty.setIsPaid(true);
        penalty.setPaidDate(LocalDate.now());
        
        loanPenaltyRepository.save(penalty);
        
        log.info("Penalty marked as paid: {}", penaltyId);
    }
    
    /**
     * Find loan by ID or throw exception
     */
    private Loan findLoanById(UUID id) {
        return loanRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + id));
    }
}
