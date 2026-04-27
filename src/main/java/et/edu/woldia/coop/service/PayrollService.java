package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.DeductionConfirmationDto;
import et.edu.woldia.coop.dto.MemberDto;
import et.edu.woldia.coop.dto.PayrollDeductionDto;
import et.edu.woldia.coop.dto.ReconciliationReportDto;
import et.edu.woldia.coop.entity.Account;
import et.edu.woldia.coop.entity.Member;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.entity.PayrollDeduction;
import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.repository.AccountRepository;
import et.edu.woldia.coop.repository.MemberRepository;
import et.edu.woldia.coop.repository.PayrollDeductionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.StringReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for payroll integration operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {
    
    private final PayrollDeductionRepository payrollDeductionRepository;
    private final MemberService memberService;
    private final AccountService accountService;
    private final MemberRepository memberRepository;
    private final ConfigurationService configurationService;
    private final AuditService auditService;
    
    /**
     * Generate monthly deduction list for all active members
     */
    @Transactional
    public List<PayrollDeductionDto> generateMonthlyDeductionList(YearMonth month, String generatedBy) {
        log.info("Generating deduction list for month: {}", month);
        
        // Check if list already exists
        if (payrollDeductionRepository.existsByDeductionMonth(month)) {
            throw new ValidationException("Deduction list already exists for month: " + month);
        }
        
        // Get all active members with committed deductions
        List<MemberDto> activeMemberDtos = memberService.getActiveMembers();
        
        List<PayrollDeduction> deductions = new ArrayList<>();
        
        for (MemberDto memberDto : activeMemberDtos) {
            if (memberDto.getCommittedDeduction() != null && 
                memberDto.getCommittedDeduction().compareTo(BigDecimal.ZERO) > 0) {
                
                PayrollDeduction deduction = new PayrollDeduction();
                deduction.setMemberId(memberDto.getId());
                deduction.setDeductionMonth(month);
                deduction.setDeductionAmount(new Money(memberDto.getCommittedDeduction(), "ETB"));
                deduction.setStatus(PayrollDeduction.DeductionStatus.PENDING);
                deduction.setGeneratedDate(LocalDate.now());
                deduction.setProcessedBy(generatedBy);
                
                deductions.add(deduction);
            }
        }
        
        List<PayrollDeduction> saved = payrollDeductionRepository.saveAll(deductions);
        
        log.info("Generated {} deductions for month: {}", saved.size(), month);

        try { auditService.logAction(null, generatedBy, "PAYROLL_GENERATE", "PAYROLL", null,
            "Payroll deduction list generated for " + month + " — " + saved.size() + " members"); } catch (Exception ignored) {}

        return toDtoList(saved);
    }
    
    /**
     * Process single deduction confirmation
     */
    @Transactional
    public PayrollDeductionDto processDeductionConfirmation(DeductionConfirmationDto dto, String processedBy) {
        log.info("Processing deduction confirmation for member: {} month: {}", 
            dto.getMemberId(), dto.getDeductionMonth());
        
        // Find the deduction record
        PayrollDeduction deduction = payrollDeductionRepository
            .findByMemberIdAndDeductionMonth(dto.getMemberId(), dto.getDeductionMonth())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Deduction not found for member: " + dto.getMemberId() + " month: " + dto.getDeductionMonth()));
        
        if (deduction.getStatus() == PayrollDeduction.DeductionStatus.CONFIRMED) {
            throw new ValidationException("Deduction already confirmed");
        }
        
        // Update deduction status
        deduction.setStatus(PayrollDeduction.DeductionStatus.CONFIRMED);
        deduction.setConfirmedDate(LocalDate.now());
        deduction.setConfirmedAmount(new Money(dto.getAmount(), "ETB"));
        deduction.setProcessedBy(processedBy);
        
        PayrollDeduction saved = payrollDeductionRepository.save(deduction);
        
        // Credit Regular Saving account
        creditRegularSavingAccount(dto.getMemberId(), dto.getAmount(), 
            dto.getDeductionMonth(), dto.getEmployerReference(), processedBy);
        
        log.info("Deduction confirmed and credited for member: {}", dto.getMemberId());

        try { auditService.logAction(null, processedBy, "PAYROLL_CONFIRM", "PAYROLL", saved.getId(),
            "Deduction confirmed for member " + dto.getMemberId() + " month " + dto.getDeductionMonth() +
            " amount ETB " + dto.getAmount()); } catch (Exception ignored) {}

        return toDto(saved);
    }
    
    /**
     * Process batch deduction confirmations from CSV.
     * Each line is processed in its own transaction — failures on individual lines
     * are collected and reported without rolling back successful lines.
     */
    public List<PayrollDeductionDto> processBatchConfirmations(String csvData, String processedBy) {
        log.info("Processing batch deduction confirmations");
        
        List<PayrollDeductionDto> results = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new StringReader(csvData))) {
            String line;
            int lineNumber = 0;
            
            // Skip header
            reader.readLine();
            lineNumber++;
            
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                try {
                    String[] parts = line.split(",");
                    if (parts.length < 3) {
                        errors.add("Line " + lineNumber + ": Invalid format");
                        continue;
                    }
                    
                    UUID memberId = UUID.fromString(parts[0].trim());
                    YearMonth month = YearMonth.parse(parts[1].trim());
                    BigDecimal amount = new BigDecimal(parts[2].trim());
                    String reference = parts.length > 3 ? parts[3].trim() : null;
                    
                    DeductionConfirmationDto dto = new DeductionConfirmationDto();
                    dto.setMemberId(memberId);
                    dto.setDeductionMonth(month);
                    dto.setAmount(amount);
                    dto.setEmployerReference(reference);
                    
                    PayrollDeductionDto result = processDeductionConfirmation(dto, processedBy);
                    results.add(result);
                    
                } catch (Exception e) {
                    errors.add("Line " + lineNumber + ": " + e.getMessage());
                    log.error("Error processing line {}: {}", lineNumber, e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new ValidationException("Error processing CSV: " + e.getMessage());
        }
        
        if (!errors.isEmpty()) {
            log.warn("Batch processing completed with {} errors", errors.size());
        }
        
        log.info("Batch processing completed: {} successful, {} errors", results.size(), errors.size());
        
        return results;
    }
    
    /**
     * Reconcile deductions for a month
     */
    @Transactional(readOnly = true)
    public ReconciliationReportDto reconcileDeductions(YearMonth month, String reconciledBy) {
        log.info("Reconciling deductions for month: {}", month);
        
        List<PayrollDeduction> allDeductions = payrollDeductionRepository.findByDeductionMonth(month);
        
        if (allDeductions.isEmpty()) {
            throw new ResourceNotFoundException("No deductions found for month: " + month);
        }
        
        long expectedCount = allDeductions.size();
        long confirmedCount = payrollDeductionRepository.countByDeductionMonthAndStatus(
            month, PayrollDeduction.DeductionStatus.CONFIRMED);
        long failedCount = payrollDeductionRepository.countByDeductionMonthAndStatus(
            month, PayrollDeduction.DeductionStatus.FAILED);
        
        BigDecimal totalExpected = allDeductions.stream()
            .map(d -> d.getDeductionAmount().getAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalConfirmed = allDeductions.stream()
            .filter(d -> d.getStatus() == PayrollDeduction.DeductionStatus.CONFIRMED)
            .map(d -> d.getConfirmedAmount() != null ? 
                d.getConfirmedAmount().getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Find discrepancies
        List<ReconciliationReportDto.DiscrepancyDto> discrepancies = new ArrayList<>();
        
        for (PayrollDeduction deduction : allDeductions) {
            if (deduction.getStatus() == PayrollDeduction.DeductionStatus.CONFIRMED) {
                BigDecimal expected = deduction.getDeductionAmount().getAmount();
                BigDecimal confirmed = deduction.getConfirmedAmount().getAmount();
                
                if (expected.compareTo(confirmed) != 0) {
                    MemberDto memberDto = memberService.getMemberById(deduction.getMemberId());
                    
                    ReconciliationReportDto.DiscrepancyDto discrepancy = 
                        new ReconciliationReportDto.DiscrepancyDto();
                    discrepancy.setMemberId(String.valueOf(deduction.getMemberId()));
                    discrepancy.setMemberName(memberDto.getFullName());
                    discrepancy.setExpectedAmount(expected);
                    discrepancy.setConfirmedAmount(confirmed);
                    discrepancy.setDifference(confirmed.subtract(expected));
                    discrepancy.setReason("Amount mismatch");
                    
                    discrepancies.add(discrepancy);
                }
            } else if (deduction.getStatus() == PayrollDeduction.DeductionStatus.FAILED) {
                MemberDto memberDto = memberService.getMemberById(deduction.getMemberId());
                
                ReconciliationReportDto.DiscrepancyDto discrepancy = 
                    new ReconciliationReportDto.DiscrepancyDto();
                discrepancy.setMemberId(String.valueOf(deduction.getMemberId()));
                discrepancy.setMemberName(memberDto.getFullName());
                discrepancy.setExpectedAmount(deduction.getDeductionAmount().getAmount());
                discrepancy.setConfirmedAmount(BigDecimal.ZERO);
                discrepancy.setDifference(deduction.getDeductionAmount().getAmount().negate());
                discrepancy.setReason(deduction.getFailureReason());
                
                discrepancies.add(discrepancy);
            }
        }
        
        ReconciliationReportDto report = new ReconciliationReportDto();
        report.setMonth(month);
        report.setExpectedDeductions(expectedCount);
        report.setConfirmedDeductions(confirmedCount);
        report.setFailedDeductions(failedCount);
        report.setTotalExpected(totalExpected);
        report.setTotalConfirmed(totalConfirmed);
        report.setDiscrepancyAmount(totalConfirmed.subtract(totalExpected));
        report.setDiscrepancies(discrepancies);
        report.setReconciliationDate(LocalDate.now());
        report.setReconciledBy(reconciledBy);
        
        log.info("Reconciliation completed for month: {} - {} discrepancies found", 
            month, discrepancies.size());
        
        return report;
    }
    
    /**
     * Flag a deduction as failed
     */
    @Transactional
    public void flagFailedDeduction(UUID memberId, YearMonth month, String reason, String flaggedBy) {
        log.info("Flagging failed deduction for member: {} month: {}", memberId, month);
        
        PayrollDeduction deduction = payrollDeductionRepository
            .findByMemberIdAndDeductionMonth(memberId, month)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Deduction not found for member: " + memberId + " month: " + month));
        
        deduction.setStatus(PayrollDeduction.DeductionStatus.FAILED);
        deduction.setFailureReason(reason);
        deduction.setProcessedBy(flaggedBy);
        
        payrollDeductionRepository.save(deduction);
        
        // Count consecutive FAILED deductions (no CONFIRMED gap)
        List<PayrollDeduction> history = payrollDeductionRepository
            .findByMemberIdOrderByDeductionMonthDesc(memberId);
        int consecutive = 0;
        for (PayrollDeduction d : history) {
            if (d.getStatus() == PayrollDeduction.DeductionStatus.FAILED) {
                consecutive++;
            } else if (d.getStatus() == PayrollDeduction.DeductionStatus.CONFIRMED) {
                break;
            }
        }
        
        SystemConfiguration config = configurationService.getCurrentConfiguration();
        int threshold = config.getMaxConsecutiveMissedDeductionsBeforeSuspension();
        if (threshold > 0 && consecutive >= threshold) {
            try {
                memberService.suspendMember(memberId,
                    "Auto-suspended: " + consecutive + " consecutive missed deductions", flaggedBy);
                log.info("Member {} auto-suspended after {} consecutive missed deductions", memberId, consecutive);
            } catch (et.edu.woldia.coop.exception.ValidationException e) {
                log.warn("Could not auto-suspend member {}: {}", memberId, e.getMessage());
            }
        }
        
        log.info("Deduction flagged as failed for member: {}", memberId);
    }
    
    /**
     * Get deduction list for a month
     */
    @Transactional(readOnly = true)
    public List<PayrollDeductionDto> getDeductionList(YearMonth month) {
        return toDtoList(payrollDeductionRepository.findByDeductionMonth(month));
    }
    
    /**
     * Credit Regular Saving account with deduction amount
     */
    private void creditRegularSavingAccount(UUID memberId, BigDecimal amount, 
                                           YearMonth month, String reference, String processedBy) {
        // Find member's Regular Saving account
        Account account = accountService.getAccountByMemberIdAndType(
                memberId, Account.AccountType.REGULAR_SAVING);
        
        // Deposit to account
        String depositReference = "PAYROLL_" + month.toString() + 
            (reference != null ? "_" + reference : "");
        
        accountService.deposit(
            account.getId(),
            amount,
            "PAYROLL_DEDUCTION",
            depositReference,
            "Payroll deduction for " + month,
            processedBy
        );
    }
    
    /**
     * Convert a list of deductions to DTOs with a single batch member query (avoids N+1)
     */
    private List<PayrollDeductionDto> toDtoList(List<PayrollDeduction> deductions) {
        if (deductions.isEmpty()) return List.of();
        
        List<UUID> memberIds = deductions.stream()
            .map(PayrollDeduction::getMemberId)
            .distinct()
            .collect(Collectors.toList());
        
        Map<UUID, String> memberNames = memberRepository.findAllById(memberIds).stream()
            .collect(Collectors.toMap(Member::getId, Member::getFullName));
        
        return deductions.stream()
            .map(d -> toDto(d, memberNames.getOrDefault(d.getMemberId(), "Unknown")))
            .collect(Collectors.toList());
    }
    
    /**
     * Convert entity to DTO
     */
    private PayrollDeductionDto toDto(PayrollDeduction deduction) {
        MemberDto memberDto = memberService.getMemberById(deduction.getMemberId());
        return toDto(deduction, memberDto.getFullName());
    }
    
    /**
     * Convert entity to DTO with pre-fetched member name
     */
    private PayrollDeductionDto toDto(PayrollDeduction deduction, String memberName) {
        PayrollDeductionDto dto = new PayrollDeductionDto();
        dto.setId(deduction.getId());
        dto.setMemberId(deduction.getMemberId());
        dto.setMemberName(memberName);
        dto.setDeductionMonth(deduction.getDeductionMonth());
        dto.setDeductionAmount(deduction.getDeductionAmount().getAmount());
        dto.setStatus(deduction.getStatus().name());
        dto.setGeneratedDate(deduction.getGeneratedDate());
        dto.setConfirmedDate(deduction.getConfirmedDate());
        dto.setConfirmedAmount(deduction.getConfirmedAmount() != null ? 
            deduction.getConfirmedAmount().getAmount() : null);
        dto.setFailureReason(deduction.getFailureReason());
        dto.setProcessedBy(deduction.getProcessedBy());
        
        return dto;
    }
}
