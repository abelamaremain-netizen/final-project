package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.*;
import et.edu.woldia.coop.dto.LoanScheduleDto;
import et.edu.woldia.coop.entity.LoanApplication;
import et.edu.woldia.coop.service.CollateralService;
import et.edu.woldia.coop.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API controller for loan management.
 */
@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Tag(name = "Loans", description = "Loan management API")
@SecurityRequirement(name = "bearerAuth")
public class LoanController {
    
    private final LoanService loanService;
    private final CollateralService collateralService;
    
    /**
     * Submit loan application
     */
    @PostMapping("/applications")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Submit application", description = "Submit a new loan application")
    public ResponseEntity<UUID> submitApplication(
            @Valid @RequestBody LoanApplicationRequestDto dto) {
        
        UUID applicationId = loanService.submitLoanApplication(
            dto.getMemberId(),
            dto.getRequestedAmount(),
            dto.getLoanDurationMonths(),
            LoanApplication.LoanPurpose.valueOf(dto.getLoanPurpose()),
            dto.getPurposeDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationId);
    }
    
    /**
     * Get application queue
     */
    @GetMapping("/applications/queue")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Get application queue", description = "Get pending loan applications in queue order")
    public ResponseEntity<List<LoanApplicationDto>> getApplicationQueue() {
        List<LoanApplicationDto> queue = loanService.getApplicationQueue();
        return ResponseEntity.ok(queue);
    }

    /**
     * Get application by ID
     */
    @GetMapping("/applications/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get application by ID", description = "Get a loan application by its ID")
    public ResponseEntity<LoanApplicationDto> getApplicationById(@PathVariable UUID id) {
        LoanApplicationDto application = loanService.getApplicationById(id);
        return ResponseEntity.ok(application);
    }

    /**
     * Get denied applications (for appeal workflow)
     */
    @GetMapping("/applications/denied")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get denied applications", description = "Get all denied loan applications")
    public ResponseEntity<List<LoanApplicationDto>> getDeniedApplications() {
        List<LoanApplicationDto> denied = loanService.getDeniedApplications();
        return ResponseEntity.ok(denied);
    }
    
    /**
     * Start reviewing application
     */
    @PostMapping("/applications/{id}/review")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Start review", description = "Start reviewing a loan application")
    public ResponseEntity<Void> startReview(
            @PathVariable UUID id,
            Authentication authentication) {
        
        loanService.startReview(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Approve loan application
     */
    @PostMapping("/applications/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Approve application", description = "Approve a loan application")
    public ResponseEntity<UUID> approveApplication(
            @PathVariable UUID id,
            Authentication authentication) {
        
        UUID loanId = loanService.approveLoanApplication(id, authentication.getName());
        return ResponseEntity.ok(loanId);
    }
    
    /**
     * Deny loan application
     */
    @PostMapping("/applications/{id}/deny")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Deny application", description = "Deny a loan application")
    public ResponseEntity<Void> denyApplication(
            @PathVariable UUID id,
            @RequestParam String reason,
            Authentication authentication) {
        
        loanService.denyLoanApplication(id, reason, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Disburse loan
     */
    @PostMapping("/{id}/disburse")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Disburse loan", description = "Disburse an approved loan")
    public ResponseEntity<Void> disburseLoan(
            @PathVariable UUID id,
            Authentication authentication) {
        
        loanService.disburseLoan(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Record repayment
     */
    @PostMapping("/{id}/repayments")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Record repayment", description = "Record a loan repayment")
    public ResponseEntity<java.util.Map<String, String>> recordRepayment(
            @PathVariable UUID id,
            @Valid @RequestBody LoanRepaymentRequestDto dto,
            Authentication authentication) {
        
        String warning = loanService.recordRepayment(
            id,
            dto.getPaymentAmount(),
            authentication.getName(),
            dto.getNotes()
        );

        java.util.Map<String, String> body = new java.util.HashMap<>();
        body.put("status", "success");
        if (warning != null) body.put("warning", warning);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
    
    /**
     * Get all loans (paginated, optional status filter)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get all loans", description = "Get all loans with optional status filter")
    public ResponseEntity<org.springframework.data.domain.Page<LoanDto>> getAllLoans(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size,
            org.springframework.data.domain.Sort.by("approvalDate").descending());
        return ResponseEntity.ok(loanService.getAllLoans(status, pageable));
    }

    /**
     * Get loan details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get loan details", description = "Get loan details")
    public ResponseEntity<LoanDto> getLoanDetails(@PathVariable UUID id) {
        LoanDto loan = loanService.getLoanDetails(id);
        return ResponseEntity.ok(loan);
    }
    
    /**
     * Get loan amortization schedule
     */
    @GetMapping("/{id}/schedule")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get loan schedule", description = "Get the amortization schedule for a disbursed loan")
    public ResponseEntity<LoanScheduleDto> getLoanSchedule(@PathVariable UUID id) {
        LoanScheduleDto schedule = loanService.getLoanSchedule(id);
        return ResponseEntity.ok(schedule);
    }

    /**
     * Get repayment history
     */
    @GetMapping("/{id}/repayments")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get repayment history", description = "Get loan repayment history")
    public ResponseEntity<List<LoanRepaymentDto>> getRepaymentHistory(@PathVariable UUID id) {
        List<LoanRepaymentDto> history = loanService.getRepaymentHistory(id);
        return ResponseEntity.ok(history);
    }
    
    /**
     * Get active loans for member
     */
    @GetMapping("/member/{memberId}/active")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get active loans", description = "Get active loans for a member")
    public ResponseEntity<List<LoanDto>> getActiveLoans(@PathVariable UUID memberId) {
        List<LoanDto> loans = loanService.getActiveLoansForMember(memberId);
        return ResponseEntity.ok(loans);
    }
    
    // ==================== COLLATERAL ENDPOINTS ====================
    
    /**
     * Add collateral to loan application
     */
    @PostMapping("/applications/{applicationId}/collateral")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Add collateral", description = "Add collateral to a loan application")
    public ResponseEntity<CollateralDto> addCollateral(
            @PathVariable UUID applicationId,
            @Valid @RequestBody CollateralDto dto,
            Authentication authentication) {
        
        CollateralDto created = collateralService.addCollateral(applicationId, dto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * Get collateral for loan application
     */
    @GetMapping("/applications/{applicationId}/collateral")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get application collateral", description = "Get all collateral for a loan application")
    public ResponseEntity<List<CollateralDto>> getApplicationCollateral(@PathVariable UUID applicationId) {
        List<CollateralDto> collateral = collateralService.getCollateralForApplication(applicationId);
        return ResponseEntity.ok(collateral);
    }
    
    /**
     * Get collateral for loan
     */
    @GetMapping("/{loanId}/collateral")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get loan collateral", description = "Get all collateral for a loan")
    public ResponseEntity<List<CollateralDto>> getLoanCollateral(@PathVariable UUID loanId) {
        List<CollateralDto> collateral = collateralService.getCollateralForLoan(loanId);
        return ResponseEntity.ok(collateral);
    }
    
    /**
     * Get collateral by ID
     */
    @GetMapping("/collateral/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get collateral", description = "Get collateral by ID")
    public ResponseEntity<CollateralDto> getCollateral(@PathVariable UUID id) {
        CollateralDto collateral = collateralService.getCollateralById(id);
        return ResponseEntity.ok(collateral);
    }
    
    /**
     * Update collateral
     */
    @PutMapping("/collateral/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Update collateral", description = "Update collateral details")
    public ResponseEntity<CollateralDto> updateCollateral(
            @PathVariable UUID id,
            @Valid @RequestBody CollateralDto dto,
            Authentication authentication) {
        
        CollateralDto updated = collateralService.updateCollateral(id, dto, authentication.getName());
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Delete collateral
     */
    @DeleteMapping("/collateral/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Delete collateral", description = "Delete collateral (only if not pledged)")
    public ResponseEntity<Void> deleteCollateral(@PathVariable UUID id) {
        collateralService.deleteCollateral(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Release collateral
     */
    @PostMapping("/collateral/{id}/release")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Release collateral", description = "Release collateral after loan is fully paid")
    public ResponseEntity<Void> releaseCollateral(
            @PathVariable UUID id,
            Authentication authentication) {
        
        collateralService.releaseCollateral(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Liquidate collateral
     */
    @PostMapping("/collateral/{id}/liquidate")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Liquidate collateral", description = "Liquidate collateral for defaulted loan. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> liquidateCollateral(
            @PathVariable UUID id,
            Authentication authentication) {
        
        collateralService.liquidateCollateral(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
