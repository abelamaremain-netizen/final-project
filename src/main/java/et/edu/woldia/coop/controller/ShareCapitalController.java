package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.ShareBalanceDto;
import et.edu.woldia.coop.dto.SharePurchaseRequestDto;
import et.edu.woldia.coop.dto.ShareRecordDto;
import et.edu.woldia.coop.dto.ShareTransferDto;
import et.edu.woldia.coop.dto.ShareTransferRequestDto;
import et.edu.woldia.coop.service.ShareCapitalService;
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
 * REST API controller for share capital management.
 */
@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
@Tag(name = "Share Capital", description = "Share capital management API")
@SecurityRequirement(name = "bearerAuth")
public class ShareCapitalController {
    
    private final ShareCapitalService shareCapitalService;
    
    /**
     * Purchase shares
     */
    @PostMapping("/purchase")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Purchase shares", description = "Record share purchase for a member")
    public ResponseEntity<Void> purchaseShares(
            @Valid @RequestBody SharePurchaseRequestDto dto,
            Authentication authentication) {
        
        shareCapitalService.recordSharePurchase(
                dto.getMemberId(),
            dto.getSharesCount(),
            authentication.getName(),
            dto.getNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
    /**
     * Get share balance
     */
    @GetMapping("/{memberId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get share balance", description = "Get member's share balance")
    public ResponseEntity<ShareBalanceDto> getShareBalance(@PathVariable UUID memberId) {
        ShareBalanceDto balance = shareCapitalService.getShareBalance(memberId);
        return ResponseEntity.ok(balance);
    }
    
    /**
     * Get share purchase history
     */
    @GetMapping("/{memberId}/history")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get purchase history", description = "Get member's share purchase history")
    public ResponseEntity<List<ShareRecordDto>> getPurchaseHistory(@PathVariable UUID memberId) {
        List<ShareRecordDto> history = shareCapitalService.getSharePurchaseHistory(memberId);
        return ResponseEntity.ok(history);
    }
    
    /**
     * Initiate share transfer
     */
    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Initiate transfer", description = "Initiate share transfer between members")
    public ResponseEntity<UUID> initiateTransfer(
            @Valid @RequestBody ShareTransferRequestDto dto) {
        
        UUID transferId = shareCapitalService.initiateShareTransfer(
            dto.getFromMemberId(),
            dto.getToMemberId(),
            dto.getSharesCount(),
            dto.getNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(transferId);
    }
    
    /**
     * Approve share transfer
     */
    @PostMapping("/transfer/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Approve transfer", description = "Approve pending share transfer. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> approveTransfer(
            @PathVariable UUID id,
            Authentication authentication) {
        
        shareCapitalService.approveShareTransfer(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Deny share transfer
     */
    @PostMapping("/transfer/{id}/deny")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Deny transfer", description = "Deny pending share transfer. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> denyTransfer(
            @PathVariable UUID id,
            @RequestParam String reason,
            Authentication authentication) {
        
        shareCapitalService.denyShareTransfer(id, reason, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get pending transfers
     */
    @GetMapping("/transfers/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Get pending transfers", description = "Get all pending share transfers")
    public ResponseEntity<List<ShareTransferDto>> getPendingTransfers() {
        List<ShareTransferDto> transfers = shareCapitalService.getPendingTransfers();
        return ResponseEntity.ok(transfers);
    }
    
    /**
     * Get transfer history for member
     */
    @GetMapping("/transfers/{memberId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get transfer history", description = "Get share transfer history for a member")
    public ResponseEntity<List<ShareTransferDto>> getTransferHistory(@PathVariable UUID memberId) {
        List<ShareTransferDto> history = shareCapitalService.getTransferHistory(memberId);
        return ResponseEntity.ok(history);
    }
}
