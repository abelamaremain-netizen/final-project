package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.LoanDefaultDto;
import et.edu.woldia.coop.entity.LoanDefault;
import et.edu.woldia.coop.service.LoanDefaultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API controller for loan default management.
 */
@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Tag(name = "Loan Defaults", description = "Loan default management API")
@SecurityRequirement(name = "bearerAuth")
public class LoanDefaultController {
    
    private final LoanDefaultService loanDefaultService;
    
    /**
     * Declare loan as defaulted
     */
    @PostMapping("/{id}/default")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Declare default", description = "Declare loan as defaulted. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> declareDefault(
            @PathVariable UUID id,
            @RequestParam String reason,
            Authentication authentication) {
        
        loanDefaultService.declareDefault(id, reason, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Initiate legal action
     */
    @PostMapping("/{id}/legal-action")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Initiate legal action", description = "Initiate legal action for defaulted loan. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> initiateLegalAction(
            @PathVariable UUID id,
            @RequestParam String courtCaseNumber,
            Authentication authentication) {
        
        loanDefaultService.initiateLegalAction(id, courtCaseNumber, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Update to in court
     */
    @PostMapping("/{id}/in-court")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Update to in court", description = "Update default status to in court")
    public ResponseEntity<Void> updateToInCourt(@PathVariable UUID id) {
        loanDefaultService.updateToInCourt(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Resolve default
     */
    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Resolve default", description = "Resolve defaulted loan")
    public ResponseEntity<Void> resolveDefault(
            @PathVariable UUID id,
            @RequestParam String resolutionNotes) {
        
        loanDefaultService.resolveDefault(id, resolutionNotes);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get defaults by status
     */
    @GetMapping("/defaults")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Get defaults", description = "Get defaults by status")
    public ResponseEntity<List<LoanDefaultDto>> getDefaultsByStatus(
            @RequestParam LoanDefault.DefaultStatus status) {
        
        List<LoanDefaultDto> defaults = loanDefaultService.getDefaultsByStatus(status);
        return ResponseEntity.ok(defaults);
    }
    
    /**
     * Get default for loan
     */
    @GetMapping("/{id}/default")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Get default", description = "Get default record for a loan")
    public ResponseEntity<LoanDefaultDto> getDefaultForLoan(@PathVariable UUID id) {
        LoanDefaultDto loanDefault = loanDefaultService.getDefaultForLoan(id);
        return ResponseEntity.ok(loanDefault);
    }
}
