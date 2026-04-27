package et.edu.woldia.coop;

import et.edu.woldia.coop.dto.MemberDto;
import et.edu.woldia.coop.dto.MemberRegistrationDto;
import et.edu.woldia.coop.entity.Member;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.mapper.MemberMapper;
import et.edu.woldia.coop.repository.AccountRepository;
import et.edu.woldia.coop.repository.LoanRepository;
import et.edu.woldia.coop.repository.MemberRepository;
import et.edu.woldia.coop.repository.MemberSuspensionRepository;
import et.edu.woldia.coop.service.AccountService;
import et.edu.woldia.coop.service.ConfigurationService;
import et.edu.woldia.coop.service.MemberService;
import et.edu.woldia.coop.mapper.MemberSuspensionMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Bug condition exploration tests for MemberService.
 *
 * These tests MUST FAIL on unfixed code — failure confirms Bugs 1 and 2 exist.
 * DO NOT fix the code when they fail.
 *
 * Validates: Requirements 1.1, 1.2
 */
@ExtendWith(MockitoExtension.class)
class MemberServiceBugExplorationTest {

    @Mock private MemberRepository memberRepository;
    @Mock private MemberSuspensionRepository memberSuspensionRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private LoanRepository loanRepository;
    @Mock private AccountService accountService;
    @Mock private MemberMapper memberMapper;
    @Mock private MemberSuspensionMapper memberSuspensionMapper;
    @Mock private ConfigurationService configurationService;

    @InjectMocks
    private MemberService memberService;

    private SystemConfiguration config;

    @BeforeEach
    void setUp() {
        config = new SystemConfiguration();
        config.setVersion(1);
        config.setEffectiveDate(LocalDateTime.now());
        config.setRegistrationFee(new Money(BigDecimal.ZERO, "ETB"));
        config.setSharePricePerShare(new Money(BigDecimal.valueOf(100), "ETB"));
        config.setMinimumMonthlyDeduction(new Money(BigDecimal.valueOf(100), "ETB"));
        config.setMaximumLoanCapPerMember(new Money(BigDecimal.valueOf(100000), "ETB"));
        config.setMinimumLoanAmount(new Money(BigDecimal.valueOf(1000), "ETB"));
        config.setSavingsInterestRate(BigDecimal.valueOf(0.05));
        config.setLoanInterestRateMin(BigDecimal.valueOf(0.05));
        config.setLoanInterestRateMax(BigDecimal.valueOf(0.15));
        config.setLendingLimitPercentage(BigDecimal.valueOf(0.8));
        config.setFixedAssetLtvRatio(BigDecimal.valueOf(0.7));
        config.setMinimumSharesRequired(1);
        config.setMaxConsecutiveMissedDeductionsBeforeSuspension(3);
        config.setMinimumMembershipDurationBeforeWithdrawalMonths(6);
        config.setDeductionDecreaseWaitingMonths(6);
        config.setMembershipDurationThresholdMonths(12);
        config.setLoanMultiplierBelowThreshold(BigDecimal.valueOf(2));
        config.setLoanMultiplierAboveThreshold(BigDecimal.valueOf(3));
        config.setContractSigningDeadlineDays(7);
        config.setLoanDisbursementDeadlineDays(14);
        config.setLoanProcessingSlaDays(30);
        config.setDelinquencyGracePeriodDays(5);
        config.setMemberWithdrawalProcessingDays(30);
        config.setCollateralAppraisalValidityMonths(12);
        config.setVehicleAgeLimitYears(10);
        config.setNonRegularSavingsWithdrawalDays(30);
        config.setLatePaymentPenaltyRate(BigDecimal.valueOf(0.02));
        config.setLatePaymentPenaltyGraceDays(5);
        config.setMaximumActiveLoansPerMember(3);
        config.setMemberWithdrawalProcessingFee(new Money(BigDecimal.ZERO, "ETB"));
        config.setShareTransferFee(new Money(BigDecimal.ZERO, "ETB"));
    }

    private MemberRegistrationDto buildValidDto(String middleName) {
        MemberRegistrationDto dto = new MemberRegistrationDto();
        dto.setMemberType("REGULAR");
        dto.setFirstName("Abebe");
        dto.setLastName("Kebede");
        dto.setDateOfBirth(LocalDate.of(1990, 1, 1));
        dto.setNationalId("ETH-" + UUID.randomUUID().toString().substring(0, 8));
        dto.setPhoneNumber("0911000000");
        dto.setEmail("abebe@example.com");
        dto.setAddress("Addis Ababa");
        dto.setEmploymentStatus("EMPLOYED");
        dto.setCommittedDeduction(BigDecimal.valueOf(200));
        dto.setShareCount(2);
        if (middleName != null) {
            // middleName field does not exist on unfixed MemberRegistrationDto —
            // we set it via reflection to simulate the intended input
            try {
                java.lang.reflect.Field f = MemberRegistrationDto.class.getDeclaredField("middleName");
                f.setAccessible(true);
                f.set(dto, middleName);
            } catch (NoSuchFieldException | IllegalAccessException e) {
                // Field absent on unfixed code — this is the bug condition
            }
        }
        return dto;
    }

    private Member buildMemberEntity(String middleName) {
        Member member = new Member();
        member.setId(UUID.randomUUID());
        member.setMemberType("REGULAR");
        member.setFirstName("Abebe");
        member.setMiddleName(middleName);
        member.setLastName("Kebede");
        member.setDateOfBirth(LocalDate.of(1990, 1, 1));
        member.setNationalId("ETH-12345");
        member.setPhoneNumber("0911000000");
        member.setEmail("abebe@example.com");
        member.setAddress("Addis Ababa");
        member.setEmploymentStatus("EMPLOYED");
        member.setCommittedDeduction(new Money(BigDecimal.valueOf(200), "ETB"));
        member.setShareCount(2);
        member.setStatus(Member.MemberStatus.ACTIVE);
        member.setRegistrationDate(LocalDate.now());
        member.setRegistrationConfigVersion(1);
        // memberNumber is intentionally null — this is Bug 1
        return member;
    }

    /**
     * Bug 1: MemberService.registerMember never generates a memberNumber.
     * EXPECTED TO FAIL on unfixed code because no generation logic exists —
     * the saved member has memberNumber = null.
     *
     * Validates: Requirement 1.1
     */
    @Test
    void bug1_memberNumber_shouldBeNonNull_afterRegistration() {
        MemberRegistrationDto dto = buildValidDto(null);
        Member savedMember = buildMemberEntity(null);
        // memberNumber is null on unfixed code
        savedMember.setMemberNumber(null);

        MemberDto returnedDto = new MemberDto();
        returnedDto.setId(savedMember.getId());
        returnedDto.setFirstName("Abebe");
        returnedDto.setLastName("Kebede");
        returnedDto.setMemberType("REGULAR");
        returnedDto.setNationalId("ETH-12345");
        returnedDto.setPhoneNumber("0911000000");
        returnedDto.setEmploymentStatus("EMPLOYED");
        returnedDto.setDateOfBirth(LocalDate.of(1990, 1, 1));
        returnedDto.setCommittedDeduction(BigDecimal.valueOf(200));
        // memberNumber absent from MemberDto on unfixed code — leave null

        when(memberRepository.existsByNationalId(any())).thenReturn(false);
        when(configurationService.lockConfigurationForTransaction(any(), any(), any()))
                .thenReturn(config);
        when(memberMapper.toEntity(any(MemberRegistrationDto.class))).thenReturn(savedMember);
        when(memberRepository.save(any(Member.class))).thenReturn(savedMember);
        when(memberMapper.toDto(any(Member.class))).thenReturn(returnedDto);

        MemberDto result = memberService.registerMember(dto, "admin");

        // This assertion FAILS on unfixed code: memberNumber is null
        assertThat(result.getMemberNumber())
                .as("Bug 1: memberNumber must be non-null after registration")
                .isNotNull();
    }

    /**
     * Bug 2: MemberRegistrationDto has no middleName field, so middleName is silently dropped.
     * EXPECTED TO FAIL on unfixed code because MemberRegistrationDto does not declare middleName.
     *
     * Validates: Requirement 1.2
     */
    @Test
    void bug2_middleName_shouldBePersisted_whenProvidedOnRegistration() {
        // Verify MemberRegistrationDto has a middleName field
        boolean hasMiddleName = false;
        try {
            MemberRegistrationDto.class.getDeclaredField("middleName");
            hasMiddleName = true;
        } catch (NoSuchFieldException e) {
            hasMiddleName = false;
        }

        // This assertion FAILS on unfixed code: MemberRegistrationDto has no middleName field
        assertThat(hasMiddleName)
                .as("Bug 2: MemberRegistrationDto must have a middleName field so it is accepted on registration")
                .isTrue();
    }
}
