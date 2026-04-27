package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.LoanPenaltyDto;
import et.edu.woldia.coop.service.LoanPenaltyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * REST API controller for loan penalty management.
 */
@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Tag(name = "Loan Penalties", description = "Loan penalty management API")
@SecurityRequirement(name = "bearerAuth")
public class LoanPenaltyController {
    
    private final LoanPenaltyService loanPenaltyService;
    
    /**
     * Assess late payment penalty
     */
    @PostMapping("/{id}/penalties/assess")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Assess penalty", description = "Assess late payment penalty for a loan")
    public ResponseEntity<Void> assessPenalty(
            @PathVariable UUID id,
            Authentication authentication) {
        
        loanPenaltyService.assessLatePaymentPenalty(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get penalties for loan
     */
    @GetMapping("/{id}/penalties")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get penalties", description = "Get all penalties for a loan")
    public ResponseEntity<List<LoanPenaltyDto>> getPenalties(@PathVariable UUID id) {
        List<LoanPenaltyDto> penalties = loanPenaltyService.getLoanPenalties(id);
        return ResponseEntity.ok(penalties);
    }
    
    /**
     * Get unpaid penalties
     */
    @GetMapping("/{id}/penalties/unpaid")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get unpaid penalties", description = "Get unpaid penalties for a loan")
    public ResponseEntity<List<LoanPenaltyDto>> getUnpaidPenalties(@PathVariable UUID id) {
        List<LoanPenaltyDto> penalties = loanPenaltyService.getUnpaidPenalties(id);
        return ResponseEntity.ok(penalties);
    }
    
    /**
     * Get total unpaid penalties
     */
    @GetMapping("/{id}/penalties/total")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get total unpaid", description = "Get total unpaid penalties for a loan")
    public ResponseEntity<BigDecimal> getTotalUnpaidPenalties(@PathVariable UUID id) {
        BigDecimal total = loanPenaltyService.getTotalUnpaidPenalties(id);
        return ResponseEntity.ok(total);
    }
}
