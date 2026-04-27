package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.AccountDto;
import et.edu.woldia.coop.dto.DepositRequestDto;
import et.edu.woldia.coop.dto.TransactionDto;
import et.edu.woldia.coop.dto.WithdrawalRequestDto2;
import et.edu.woldia.coop.service.AccountService;
import et.edu.woldia.coop.service.InterestCalculationService;
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
 * REST API controller for account management.
 */
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Account management API")
@SecurityRequirement(name = "bearerAuth")
public class AccountController {
    
    private final AccountService accountService;
    private final InterestCalculationService interestCalculationService;
    
    /**
     * Create Regular Saving account
     */
    @PostMapping("/regular")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Create Regular Saving account", description = "Create a Regular Saving account for a member")
    public ResponseEntity<AccountDto> createRegularSavingAccount(
            @RequestParam UUID memberId,
            Authentication authentication) {
        
        AccountDto account = accountService.createRegularSavingAccount(memberId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }
    
    /**
     * Create Non-Regular Saving account
     */
    @PostMapping("/non-regular")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER')")
    @Operation(summary = "Create Non-Regular Saving account", description = "Create a Non-Regular Saving account for a member")
    public ResponseEntity<AccountDto> createNonRegularSavingAccount(
            @RequestParam UUID memberId,
            Authentication authentication) {
        
        AccountDto account = accountService.createNonRegularSavingAccount(memberId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }
    
    /**
     * Get member accounts
     */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get member accounts", description = "Retrieve all accounts for a member")
    public ResponseEntity<List<AccountDto>> getMemberAccounts(@PathVariable UUID memberId) {
        List<AccountDto> accounts = accountService.getMemberAccounts(memberId);
        return ResponseEntity.ok(accounts);
    }
    
    /**
     * Get account balance
     */
    @GetMapping("/{id}/balance")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get account balance", description = "Retrieve account balance")
    public ResponseEntity<AccountDto> getAccountBalance(@PathVariable UUID id) {
        AccountDto account = accountService.getAccountBalance(id);
        return ResponseEntity.ok(account);
    }
    
    /**
     * Deposit to account
     */
    @PostMapping("/{id}/deposit")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Deposit funds", description = "Deposit funds to account")
    public ResponseEntity<TransactionDto> deposit(
            @PathVariable UUID id,
            @Valid @RequestBody DepositRequestDto dto,
            Authentication authentication) {
        
        TransactionDto transaction = accountService.deposit(
            id, 
            dto.getAmount(), 
            dto.getSource(), 
            dto.getReference(), 
            dto.getNotes(), 
            authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }
    
    /**
     * Withdraw from account
     */
    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Withdraw funds", description = "Withdraw funds from Non-Regular Saving account")
    public ResponseEntity<TransactionDto> withdraw(
            @PathVariable UUID id,
            @Valid @RequestBody WithdrawalRequestDto2 dto,
            Authentication authentication) {
        
        TransactionDto transaction = accountService.withdraw(
            id, 
            dto.getAmount(), 
            dto.getNotes(), 
            authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }
    
    /**
     * Get transaction history — paginated
     * ?page=0&size=20&sort=timestamp,desc
     */
    @GetMapping("/{id}/transactions")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'ACCOUNTANT')")
    @Operation(summary = "Get transactions", description = "Retrieve paginated transaction history for account")
    public ResponseEntity<Page<TransactionDto>> getTransactionHistory(
            @PathVariable UUID id,
            @PageableDefault(size = 20, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<TransactionDto> transactions = accountService.getTransactionHistoryPaged(id, pageable);
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * Freeze account
     */
    @PostMapping("/{id}/freeze")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Freeze account", description = "Freeze an account to prevent transactions. Requires ADMINISTRATOR role.")
    public ResponseEntity<AccountDto> freezeAccount(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "") String reason,
            Authentication authentication) {

        AccountDto account = accountService.freezeAccount(id, reason, authentication.getName());
        return ResponseEntity.ok(account);
    }

    /**
     * Unfreeze account
     */
    @PostMapping("/{id}/unfreeze")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Unfreeze account", description = "Unfreeze a previously frozen account. Requires ADMINISTRATOR role.")
    public ResponseEntity<AccountDto> unfreezeAccount(
            @PathVariable UUID id,
            Authentication authentication) {

        AccountDto account = accountService.unfreezeAccount(id, authentication.getName());
        return ResponseEntity.ok(account);
    }

    /**
     * Apply monthly interest to specific account
     */
    @PostMapping("/{id}/interest/apply")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'MANAGER')")
    @Operation(summary = "Apply interest", description = "Apply monthly interest to account. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> applyInterest(
            @PathVariable UUID id,
            Authentication authentication) {
        
        interestCalculationService.applyMonthlyInterest(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Apply monthly interest to all accounts
     */
    @PostMapping("/interest/apply-all")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'MANAGER')")
    @Operation(summary = "Apply interest to all", description = "Apply monthly interest to all active accounts. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> applyInterestToAll() {
        interestCalculationService.applyMonthlyInterestForAllAccounts();
        return ResponseEntity.ok().build();
    }
}
