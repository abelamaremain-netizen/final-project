package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.DeductionConfirmationDto;
import et.edu.woldia.coop.dto.PayrollDeductionDto;
import et.edu.woldia.coop.dto.ReconciliationReportDto;
import et.edu.woldia.coop.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for payroll integration operations.
 */
@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll", description = "Payroll integration API")
@SecurityRequirement(name = "bearerAuth")
public class PayrollController {
    
    private final PayrollService payrollService;
    
    /**
     * Generate monthly deduction list
     */
    @PostMapping("/deduction-list")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Generate monthly deduction list")
    public ResponseEntity<List<PayrollDeductionDto>> generateDeductionList(
            @RequestParam YearMonth month,
            Authentication authentication) {
        
        String userId = authentication.getName();
        List<PayrollDeductionDto> deductions = payrollService.generateMonthlyDeductionList(month, userId);
        
        return ResponseEntity.ok(deductions);
    }
    
    /**
     * Get deduction list for a month
     */
    @GetMapping("/deduction-list")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Get deduction list for a month")
    public ResponseEntity<List<PayrollDeductionDto>> getDeductionList(@RequestParam YearMonth month) {
        List<PayrollDeductionDto> deductions = payrollService.getDeductionList(month);
        return ResponseEntity.ok(deductions);
    }
    
    /**
     * Process single deduction confirmation
     */
    @PostMapping("/confirmations")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Process single deduction confirmation")
    public ResponseEntity<PayrollDeductionDto> processConfirmation(
            @Valid @RequestBody DeductionConfirmationDto dto,
            Authentication authentication) {
        
        String userId = authentication.getName();
        PayrollDeductionDto result = payrollService.processDeductionConfirmation(dto, userId);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Process batch deduction confirmations from CSV
     */
    @PostMapping("/confirmations/batch")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Process batch deduction confirmations from CSV file")
    public ResponseEntity<List<PayrollDeductionDto>> processBatchConfirmations(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        
        String userId = authentication.getName();
        String csvData = new String(file.getBytes(), StandardCharsets.UTF_8);
        
        List<PayrollDeductionDto> results = payrollService.processBatchConfirmations(csvData, userId);
        
        return ResponseEntity.ok(results);
    }
    
    /**
     * Reconcile deductions for a month
     */
    @PostMapping("/reconcile")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Reconcile deductions for a month")
    public ResponseEntity<ReconciliationReportDto> reconcileDeductions(
            @RequestParam YearMonth month,
            Authentication authentication) {
        
        String userId = authentication.getName();
        ReconciliationReportDto report = payrollService.reconcileDeductions(month, userId);
        
        return ResponseEntity.ok(report);
    }
    
    /**
     * Flag a deduction as failed
     */
    @PostMapping("/failed-deductions")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Flag a deduction as failed")
    public ResponseEntity<Void> flagFailedDeduction(
            @RequestParam UUID memberId,
            @RequestParam YearMonth month,
            @RequestParam String reason,
            Authentication authentication) {
        
        String userId = authentication.getName();
        payrollService.flagFailedDeduction(memberId, month, reason, userId);
        
        return ResponseEntity.ok().build();
    }
}
