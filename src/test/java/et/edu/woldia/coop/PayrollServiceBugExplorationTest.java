package et.edu.woldia.coop;

import et.edu.woldia.coop.entity.Member;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.entity.PayrollDeduction;
import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.repository.MemberRepository;
import et.edu.woldia.coop.repository.PayrollDeductionRepository;
import et.edu.woldia.coop.service.AccountService;
import et.edu.woldia.coop.service.MemberService;
import et.edu.woldia.coop.service.PayrollService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Bug condition exploration tests for PayrollService.
 *
 * These tests MUST FAIL on unfixed code — failure confirms Bug 12 exists.
 * DO NOT fix the code when they fail.
 *
 * Validates: Requirement 1.12
 */
@ExtendWith(MockitoExtension.class)
class PayrollServiceBugExplorationTest {

    @Mock private PayrollDeductionRepository payrollDeductionRepository;
    @Mock private MemberService memberService;
    @Mock private AccountService accountService;
    @Mock private MemberRepository memberRepository;

    @InjectMocks
    private PayrollService payrollService;

    private UUID memberId;
    private int threshold;

    @BeforeEach
    void setUp() {
        memberId = UUID.randomUUID();
        threshold = 3; // maxConsecutiveMissedDeductionsBeforeSuspension
    }

    /**
     * Bug 12: When consecutive failed deductions reach the threshold, the member should be
     * automatically suspended. EXPECTED TO FAIL on unfixed code because PayrollService.flagFailedDeduction
     * never counts consecutive failures or calls memberService.suspendMember.
     *
     * Validates: Requirement 1.12
     */
    @Test
    void bug12_memberShouldBeSuspended_whenConsecutiveFailedDeductionsReachThreshold() {
        YearMonth month = YearMonth.of(2024, 3);

        PayrollDeduction deduction = new PayrollDeduction();
        deduction.setId(UUID.randomUUID());
        deduction.setMemberId(memberId);
        deduction.setDeductionMonth(month);
        deduction.setDeductionAmount(new Money(BigDecimal.valueOf(200), "ETB"));
        deduction.setStatus(PayrollDeduction.DeductionStatus.PENDING);

        when(payrollDeductionRepository.findByMemberIdAndDeductionMonth(memberId, month))
                .thenReturn(Optional.of(deduction));
        when(payrollDeductionRepository.save(any())).thenReturn(deduction);

        // Flag the deduction as failed (this is the Nth consecutive failure == threshold)
        payrollService.flagFailedDeduction(memberId, month, "Salary not received", "admin");

        // This assertion FAILS on unfixed code: suspendMember is never called
        verify(memberService, times(1))
                .suspendMember(
                        eq(memberId),
                        any(String.class),
                        any(String.class));
    }
}
