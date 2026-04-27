package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.PassbookDto;
import et.edu.woldia.coop.service.PassbookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for passbook management operations.
 */
@RestController
@RequestMapping("/api/members/{memberId}/passbook")
@RequiredArgsConstructor
@Tag(name = "Passbook", description = "Passbook management API")
@SecurityRequirement(name = "bearerAuth")
public class PassbookController {
    
    private final PassbookService passbookService;
    
    /**
     * Get member passbook
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'ADMINISTRATOR')")
    @Operation(summary = "Get member passbook")
    public ResponseEntity<PassbookDto> getPassbook(@PathVariable UUID memberId) {
        PassbookDto passbook = passbookService.generatePassbook(memberId);
        return ResponseEntity.ok(passbook);
    }
}
