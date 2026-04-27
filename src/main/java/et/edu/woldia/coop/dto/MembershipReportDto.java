package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

/**
 * DTO for membership report.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembershipReportDto {
    
    private LocalDate reportDate;
    private String generatedBy;
    
    // Overall statistics
    private int totalMembers;
    private int activeMembers;
    private int suspendedMembers;
    private int withdrawnMembers;
    
    // Member type distribution
    private int regularMembers;
    private int externalCooperativeMembers;
    
    // Growth metrics
    private int newMembersThisMonth;
    private int newMembersThisYear;
    private Map<String, Integer> memberGrowthByMonth;  // "2024-01" -> count
    
    // Status distribution
    private Map<String, Integer> membersByStatus;
    
    // Suspension statistics
    private int totalSuspensions;
    private int activeSuspensions;
    private Map<String, Integer> suspensionsByReason;
    
    // Termination statistics
    private int voluntaryWithdrawals;
    private int involuntaryTerminations;
    private int deathExits;
}
