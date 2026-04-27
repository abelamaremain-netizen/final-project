package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.FinancialReportDto;
import et.edu.woldia.coop.dto.LoanPortfolioReportDto;
import et.edu.woldia.coop.dto.MembershipReportDto;
import et.edu.woldia.coop.service.ReportingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for reporting and analytics operations.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Reporting and analytics API")
@SecurityRequirement(name = "bearerAuth")
public class ReportingController {
    
    private final ReportingService reportingService;
    
    /**
     * Generate financial report
     */
    @GetMapping("/financial")
    @PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT', 'AUDITOR')")
    @Operation(summary = "Generate financial report")
    public ResponseEntity<FinancialReportDto> generateFinancialReport(Authentication authentication) {
        String userId = authentication.getName();
        FinancialReportDto report = reportingService.generateFinancialReport(userId);
        return ResponseEntity.ok(report);
    }
    
    /**
     * Generate loan portfolio report
     */
    @GetMapping("/loan-portfolio")
    @PreAuthorize("hasAnyRole('MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT', 'AUDITOR')")
    @Operation(summary = "Generate loan portfolio report")
    public ResponseEntity<LoanPortfolioReportDto> generateLoanPortfolioReport(Authentication authentication) {
        String userId = authentication.getName();
        LoanPortfolioReportDto report = reportingService.generateLoanPortfolioReport(userId);
        return ResponseEntity.ok(report);
    }
    
    /**
     * Generate membership report
     */
    @GetMapping("/membership")
    @PreAuthorize("hasAnyRole('MANAGER', 'MEMBER_OFFICER', 'AUDITOR')")
    @Operation(summary = "Generate membership report")
    public ResponseEntity<MembershipReportDto> generateMembershipReport(Authentication authentication) {
        String userId = authentication.getName();
        MembershipReportDto report = reportingService.generateMembershipReport(userId);
        return ResponseEntity.ok(report);
    }
}
