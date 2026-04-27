package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.LoanRestructuringDto;
import et.edu.woldia.coop.dto.LoanRestructuringRequestDto;
import et.edu.woldia.coop.service.LoanRestructuringService;
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
 * REST API controller for loan restructuring management.
 */
@RestController
@RequestMapping("/api/loans/restructurings")
@RequiredArgsConstructor
@Tag(name = "Loan Restructuring", description = "Loan restructuring management API")
@SecurityRequirement(name = "bearerAuth")
public class LoanRestructuringController {
    
    private final LoanRestructuringService loanRestructuringService;
    
    /**
     * Initiate restructuring
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Initiate restructuring", description = "Initiate loan restructuring")
    public ResponseEntity<UUID> initiateRestructuring(
            @Valid @RequestBody LoanRestructuringRequestDto dto,
            Authentication authentication) {
        
        UUID restructuringId = loanRestructuringService.initiateRestructuring(
            dto.getLoanId(),
            dto.getRestructuringReason(),
            dto.getNewDurationMonths(),
            dto.getNewInterestRate(),
            authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(restructuringId);
    }
    
    /**
     * Approve restructuring
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Approve restructuring", description = "Approve loan restructuring. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> approveRestructuring(
            @PathVariable UUID id,
            Authentication authentication) {
        
        loanRestructuringService.approveRestructuring(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Deny restructuring
     */
    @PostMapping("/{id}/deny")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Deny restructuring", description = "Deny loan restructuring. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> denyRestructuring(
            @PathVariable UUID id,
            @RequestParam String reason,
            Authentication authentication) {
        
        loanRestructuringService.denyRestructuring(id, reason, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get pending restructurings
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Get pending restructurings", description = "Get all pending restructuring requests")
    public ResponseEntity<List<LoanRestructuringDto>> getPendingRestructurings() {
        List<LoanRestructuringDto> restructurings = loanRestructuringService.getPendingRestructurings();
        return ResponseEntity.ok(restructurings);
    }
    
    /**
     * Get restructurings for member
     */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER')")
    @Operation(summary = "Get restructurings for member", description = "Get restructuring history for a member")
    public ResponseEntity<List<LoanRestructuringDto>> getRestructuringsForMember(@PathVariable UUID memberId) {
        List<LoanRestructuringDto> restructurings = loanRestructuringService.getRestructuringsForMember(memberId);
        return ResponseEntity.ok(restructurings);
    }
}
