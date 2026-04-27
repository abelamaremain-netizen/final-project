package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.FinancialReportDto;
import et.edu.woldia.coop.dto.LoanPortfolioReportDto;
import et.edu.woldia.coop.dto.MembershipReportDto;
import et.edu.woldia.coop.entity.*;
import et.edu.woldia.coop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for generating reports and analytics.
 * All aggregations are pushed to the database — no findAll() calls.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportingService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final ShareRecordRepository shareRecordRepository;
    private final LoanRepository loanRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final MemberRepository memberRepository;
    private final MemberSuspensionRepository memberSuspensionRepository;
    private final ConfigurationService configurationService;

    /**
     * Generate financial report
     */
    @Transactional(readOnly = true)
    public FinancialReportDto generateFinancialReport(String generatedBy) {
        log.info("Generating financial report");

        FinancialReportDto report = new FinancialReportDto();
        report.setReportDate(LocalDate.now());
        report.setGeneratedBy(generatedBy);

        // Savings — aggregate in DB
        BigDecimal totalRegular = accountRepository.getTotalBalanceByType(Account.AccountType.REGULAR_SAVING);
        BigDecimal totalNonRegular = accountRepository.getTotalBalanceByType(Account.AccountType.NON_REGULAR_SAVING);
        report.setTotalRegularSavings(totalRegular);
        report.setTotalNonRegularSavings(totalNonRegular);
        report.setTotalSavings(totalRegular.add(totalNonRegular));

        // Share capital — aggregate in DB
        Integer totalShares = shareRecordRepository.getTotalSharesAllMembers();
        BigDecimal totalShareCapital = shareRecordRepository.getTotalShareCapital();
        report.setTotalShares(totalShares != null ? totalShares : 0);
        report.setTotalShareCapital(totalShareCapital);

        // Loan metrics — aggregate in DB
        BigDecimal totalDisbursed = loanRepository.getTotalDisbursedPrincipal();
        BigDecimal totalOutstanding = loanRepository.getTotalOutstandingActive();
        BigDecimal totalRepayments = loanRepaymentRepository.getTotalRepayments();
        long activeLoanCount = loanRepository.countByStatus(Loan.LoanStatus.ACTIVE);

        report.setTotalLoansDisbursed(totalDisbursed);
        report.setTotalOutstandingLoans(totalOutstanding);
        report.setTotalLoanRepayments(totalRepayments);
        report.setActiveLoanCount((int) activeLoanCount);

        // Interest — aggregate in DB
        BigDecimal interestEarned = transactionRepository.getTotalAmountByType(Transaction.TransactionType.INTEREST_CREDIT);
        BigDecimal interestPaid = loanRepaymentRepository.getTotalInterestPaid();
        report.setTotalInterestEarned(interestEarned);
        report.setTotalInterestPaid(interestPaid);

        // Liquidity
        BigDecimal totalAssets = report.getTotalSavings().add(totalShareCapital);
        BigDecimal availableLiquidity = totalAssets.subtract(totalOutstanding);

        SystemConfiguration config = configurationService.getCurrentConfiguration();
        BigDecimal lendingLimit = config.getLendingLimitPercentage();
        BigDecimal maxLendingCapacity = totalAssets.multiply(lendingLimit);
        BigDecimal remainingCapacity = maxLendingCapacity.subtract(totalOutstanding);

        BigDecimal liquidityRatio = totalAssets.compareTo(BigDecimal.ZERO) > 0
            ? availableLiquidity.divide(totalAssets, 4, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        report.setAvailableLiquidity(availableLiquidity);
        report.setLiquidityRatio(liquidityRatio);
        report.setLendingLimitPercentage(lendingLimit);
        report.setRemainingLendingCapacity(remainingCapacity);

        boolean withinLimit = totalOutstanding.compareTo(maxLendingCapacity) <= 0;
        report.setWithinLendingLimit(withinLimit);
        report.setComplianceStatus(withinLimit ? "COMPLIANT" : "EXCEEDS_LENDING_LIMIT");

        log.info("Financial report generated successfully");
        return report;
    }

    /**
     * Generate loan portfolio report
     */
    @Transactional(readOnly = true)
    public LoanPortfolioReportDto generateLoanPortfolioReport(String generatedBy) {
        log.info("Generating loan portfolio report");

        LoanPortfolioReportDto report = new LoanPortfolioReportDto();
        report.setReportDate(LocalDate.now());
        report.setGeneratedBy(generatedBy);

        // Status counts — aggregate in DB
        long totalLoans = loanRepository.count();
        long activeLoans = loanRepository.countByStatus(Loan.LoanStatus.ACTIVE);
        long completedLoans = loanRepository.countByStatus(Loan.LoanStatus.PAID_OFF);
        long defaultedLoans = loanRepository.countByStatus(Loan.LoanStatus.DEFAULTED);

        report.setTotalLoans((int) totalLoans);
        report.setActiveLoans((int) activeLoans);
        report.setCompletedLoans((int) completedLoans);
        report.setDefaultedLoans((int) defaultedLoans);

        // Financial metrics — aggregate in DB
        BigDecimal totalDisbursed = loanRepository.getTotalDisbursedPrincipal();
        BigDecimal totalOutstanding = loanRepository.getTotalOutstandingActive();
        BigDecimal totalRepaid = loanRepaymentRepository.getTotalRepayments();
        BigDecimal avgInterestRate = loanRepository.getAverageInterestRate();

        BigDecimal avgLoanAmount = totalLoans > 0
            ? totalDisbursed.divide(BigDecimal.valueOf(totalLoans), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        report.setTotalDisbursed(totalDisbursed);
        report.setTotalOutstanding(totalOutstanding);
        report.setTotalRepaid(totalRepaid);
        report.setAverageLoanAmount(avgLoanAmount);
        report.setAverageInterestRate(avgInterestRate);

        // Loans by status — aggregate in DB
        Map<String, Integer> loansByStatus = new HashMap<>();
        Map<String, BigDecimal> outstandingByStatus = new HashMap<>();
        for (Object[] row : loanRepository.getLoanStatsByStatus()) {
            String status = row[0].toString();
            loansByStatus.put(status, ((Number) row[1]).intValue());
            outstandingByStatus.put(status, (BigDecimal) row[3]);
        }
        report.setLoansByStatus(loansByStatus);
        report.setOutstandingByStatus(outstandingByStatus);

        // Loans by duration bucket — aggregate in DB
        Map<String, Integer> loansByDuration = new HashMap<>();
        Map<String, BigDecimal> outstandingByDuration = new HashMap<>();
        for (Object[] row : loanRepository.getLoanStatsByDuration()) {
            int months = ((Number) row[0]).intValue();
            String bucket = getDurationRange(months);
            loansByDuration.merge(bucket, ((Number) row[1]).intValue(), Integer::sum);
            outstandingByDuration.merge(bucket, (BigDecimal) row[2], BigDecimal::add);
        }
        report.setLoansByDuration(loansByDuration);
        report.setOutstandingByDuration(outstandingByDuration);

        // Performance metrics
        BigDecimal repaymentRate = totalDisbursed.compareTo(BigDecimal.ZERO) > 0
            ? totalRepaid.divide(totalDisbursed, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        BigDecimal defaultRate = totalLoans > 0
            ? BigDecimal.valueOf(defaultedLoans)
                .divide(BigDecimal.valueOf(totalLoans), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        long delinquentCount = loanRepository.countDelinquentLoans();
        BigDecimal delinquentAmount = loanRepository.getTotalDelinquentOutstanding();

        report.setRepaymentRate(repaymentRate);
        report.setDefaultRate(defaultRate);
        report.setDelinquentLoans((int) delinquentCount);
        report.setDelinquentAmount(delinquentAmount);

        log.info("Loan portfolio report generated successfully");
        return report;
    }

    /**
     * Generate membership report
     */
    @Transactional(readOnly = true)
    public MembershipReportDto generateMembershipReport(String generatedBy) {
        log.info("Generating membership report");

        MembershipReportDto report = new MembershipReportDto();
        report.setReportDate(LocalDate.now());
        report.setGeneratedBy(generatedBy);

        // Status counts — aggregate in DB
        long totalMembers = memberRepository.count();
        report.setTotalMembers((int) totalMembers);

        Map<String, Integer> membersByStatus = new HashMap<>();
        for (Object[] row : memberRepository.countMembersByStatus()) {
            membersByStatus.put(row[0].toString(), ((Number) row[1]).intValue());
        }
        report.setMembersByStatus(membersByStatus);
        report.setActiveMembers(membersByStatus.getOrDefault(Member.MemberStatus.ACTIVE.name(), 0));
        report.setSuspendedMembers(membersByStatus.getOrDefault(Member.MemberStatus.SUSPENDED.name(), 0));
        report.setWithdrawnMembers(membersByStatus.getOrDefault(Member.MemberStatus.WITHDRAWN.name(), 0));
        report.setDeathExits(membersByStatus.getOrDefault(Member.MemberStatus.DECEASED.name(), 0));
        report.setVoluntaryWithdrawals(membersByStatus.getOrDefault(Member.MemberStatus.WITHDRAWN.name(), 0));
        report.setInvoluntaryTerminations(0);

        // Type distribution — aggregate in DB
        for (Object[] row : memberRepository.countMembersByType()) {
            String type = row[0].toString();
            int count = ((Number) row[1]).intValue();
            if (type.equals("REGULAR")) {
                report.setRegularMembers(count);
            } else if (type.equals("EXTERNAL_COOPERATIVE")) {
                report.setExternalCooperativeMembers(count);
            }
        }

        // Growth metrics — aggregate in DB
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);

        long newThisMonth = memberRepository.countNewMembersBetween(
            currentMonth.atDay(1), currentMonth.atEndOfMonth());
        long newThisYear = memberRepository.countNewMembersInYear(today.getYear());
        report.setNewMembersThisMonth((int) newThisMonth);
        report.setNewMembersThisYear((int) newThisYear);

        // Growth by month (last 12 months) — aggregate in DB
        LocalDate since = today.minusMonths(11).withDayOfMonth(1);
        Map<String, Integer> growthByMonth = new HashMap<>();
        for (Object[] row : memberRepository.countNewMembersByMonth(since)) {
            String key = YearMonth.of(((Number) row[0]).intValue(), ((Number) row[1]).intValue()).toString();
            growthByMonth.put(key, ((Number) row[2]).intValue());
        }
        // Fill in zeros for months with no registrations
        for (int i = 0; i < 12; i++) {
            String key = currentMonth.minusMonths(i).toString();
            growthByMonth.putIfAbsent(key, 0);
        }
        report.setMemberGrowthByMonth(growthByMonth);

        // Suspension stats — aggregate in DB
        report.setTotalSuspensions((int) memberSuspensionRepository.count());
        report.setActiveSuspensions((int) memberSuspensionRepository.countByReactivatedDateIsNull());

        Map<String, Integer> suspensionsByReason = new HashMap<>();
        for (Object[] row : memberSuspensionRepository.countByReason()) {
            suspensionsByReason.put(row[0].toString(), ((Number) row[1]).intValue());
        }
        report.setSuspensionsByReason(suspensionsByReason);

        log.info("Membership report generated successfully");
        return report;
    }

    private String getDurationRange(int months) {
        if (months <= 12) return "0-12 months";
        if (months <= 24) return "13-24 months";
        if (months <= 36) return "25-36 months";
        if (months <= 48) return "37-48 months";
        return "49-60 months";
    }
}

/**
 * Service for generating reports and analytics.
 */


