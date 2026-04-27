package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.DeductionChangeRequestDto;
import et.edu.woldia.coop.dto.MemberDto;
import et.edu.woldia.coop.dto.MemberRegistrationDto;
import et.edu.woldia.coop.dto.UpdateMemberRequest;
import et.edu.woldia.coop.dto.WithdrawalPayoutDto;
import et.edu.woldia.coop.dto.WithdrawalRequestDto;
import et.edu.woldia.coop.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API controller for member management.
 */
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@Tag(name = "Members", description = "Member management API")
@SecurityRequirement(name = "bearerAuth")
public class MemberController {
    
    private final MemberService memberService;
    
    /**
     * Search members by query string (name, national ID, phone) — returns flat list for autocomplete
     * GET /api/members/search?q=john
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'LOAN_OFFICER')")
    @Operation(summary = "Search members", description = "Search members by name, national ID, or phone number")
    public ResponseEntity<List<MemberDto>> searchMembers(
            @RequestParam(required = false, defaultValue = "") String q) {
        
        org.springframework.data.domain.Page<MemberDto> result = memberService.searchMembers(
            null, null, q.isBlank() ? null : q,
            org.springframework.data.domain.PageRequest.of(0, 20));
        return ResponseEntity.ok(result.getContent());
    }

    /**
     * Register a new member
     */
    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Register member", description = "Register a new member. Requires ADMINISTRATOR or MEMBER_OFFICER role.")
    public ResponseEntity<MemberDto> registerMember(
            @Valid @RequestBody MemberRegistrationDto dto,
            Authentication authentication) {
        
        MemberDto member = memberService.registerMember(dto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }
    
    /**
     * Get all members — paginated with optional search/filter
     * ?page=0&size=20&sort=lastName,asc&search=john&status=ACTIVE&memberType=REGULAR
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get members", description = "Retrieve members with optional search and pagination")
    public ResponseEntity<Page<MemberDto>> getAllMembers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String memberType,
            @PageableDefault(size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<MemberDto> members = memberService.searchMembers(status, memberType, search, pageable);
        return ResponseEntity.ok(members);
    }

    /**
     * Get active members — paginated
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get active members", description = "Retrieve all active members (paginated)")
    public ResponseEntity<Page<MemberDto>> getActiveMembers(
            @PageableDefault(size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<MemberDto> members = memberService.searchMembers("ACTIVE", null, null, pageable);
        return ResponseEntity.ok(members);
    }
    
    /**
     * Get member by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'LOAN_OFFICER')")
    @Operation(summary = "Get member by ID", description = "Retrieve member by ID")
    public ResponseEntity<MemberDto> getMemberById(@PathVariable UUID id) {
        MemberDto member = memberService.getMemberById(id);
        return ResponseEntity.ok(member);
    }
    
    /**
     * Get member by national ID
     */
    @GetMapping("/national-id/{nationalId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT', 'LOAN_OFFICER')")
    @Operation(summary = "Get member by national ID", description = "Retrieve member by national ID")
    public ResponseEntity<MemberDto> getMemberByNationalId(@PathVariable String nationalId) {
        MemberDto member = memberService.getMemberByNationalId(nationalId);
        return ResponseEntity.ok(member);
    }
    
    /**
     * Update member profile
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Update member", description = "Update member profile. Requires ADMINISTRATOR or MEMBER_OFFICER role.")
    public ResponseEntity<MemberDto> updateMember(
            @PathVariable UUID id,
            @RequestBody UpdateMemberRequest dto,
            Authentication authentication) {
        
        MemberDto updated = memberService.updateMemberProfile(id, dto, authentication.getName());
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Suspend member
     */
    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Suspend member", description = "Suspend member account. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> suspendMember(
            @PathVariable UUID id,
            @RequestParam String reason,
            Authentication authentication) {
        
        memberService.suspendMember(id, reason, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Reactivate member
     */
    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Reactivate member", description = "Reactivate suspended member. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> reactivateMember(
            @PathVariable UUID id,
            Authentication authentication) {
        
        memberService.reactivateMember(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get suspension history
     */
    @GetMapping("/{id}/suspensions")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'AUDITOR')")
    @Operation(summary = "Get suspension history", description = "Get member suspension history")
    public ResponseEntity<List<et.edu.woldia.coop.dto.MemberSuspensionDto>> getSuspensionHistory(@PathVariable UUID id) {
        List<et.edu.woldia.coop.dto.MemberSuspensionDto> history = memberService.getSuspensionHistory(id);
        return ResponseEntity.ok(history);
    }
    
    /**
     * Initiate voluntary withdrawal
     */
    @PostMapping("/{id}/withdrawal")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Initiate withdrawal", description = "Initiate member voluntary withdrawal")
    public ResponseEntity<Void> initiateWithdrawal(
            @PathVariable UUID id,
            @Valid @RequestBody WithdrawalRequestDto dto,
            Authentication authentication) {
        
        memberService.initiateVoluntaryWithdrawal(id, dto.getReason(), authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Calculate withdrawal payout
     */
    @GetMapping("/{id}/withdrawal-payout")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Calculate payout", description = "Calculate member withdrawal payout")
    public ResponseEntity<WithdrawalPayoutDto> calculatePayout(@PathVariable UUID id) {
        WithdrawalPayoutDto payout = memberService.calculateWithdrawalPayout(id);
        return ResponseEntity.ok(payout);
    }
    
    /**
     * Increase monthly deduction
     */
    @PutMapping("/{id}/deduction/increase")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Increase deduction", description = "Increase member monthly deduction (allowed anytime)")
    public ResponseEntity<Void> increaseDeduction(
            @PathVariable UUID id,
            @Valid @RequestBody DeductionChangeRequestDto dto,
            Authentication authentication) {
        
        memberService.increaseDeduction(id, dto.getNewDeductionAmount(), authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Request deduction decrease
     */
    @PutMapping("/{id}/deduction/decrease")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Decrease deduction", description = "Decrease member monthly deduction (must wait 6 months)")
    public ResponseEntity<Void> decreaseDeduction(
            @PathVariable UUID id,
            @Valid @RequestBody DeductionChangeRequestDto dto,
            Authentication authentication) {
        
        memberService.requestDeductionDecrease(id, dto.getNewDeductionAmount(), authentication.getName());
        return ResponseEntity.ok().build();
    }
}
