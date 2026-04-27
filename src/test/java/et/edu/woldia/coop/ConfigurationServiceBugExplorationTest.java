package et.edu.woldia.coop;

import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.repository.ConfigurationLockRepository;
import et.edu.woldia.coop.repository.SystemConfigurationRepository;
import et.edu.woldia.coop.service.ConfigurationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Bug condition exploration tests for ConfigurationService.
 *
 * These tests MUST FAIL on unfixed code — failure confirms Bug 13 exists.
 * DO NOT fix the code when they fail.
 *
 * Validates: Requirement 1.13
 */
@ExtendWith(MockitoExtension.class)
class ConfigurationServiceBugExplorationTest {

    @Mock private SystemConfigurationRepository configurationRepository;
    @Mock private ConfigurationLockRepository configurationLockRepository;

    @InjectMocks
    private ConfigurationService configurationService;

    private SystemConfiguration config;

    @BeforeEach
    void setUp() {
        config = new SystemConfiguration();
        config.setVersion(1);
        config.setEffectiveDate(LocalDateTime.of(2024, 1, 1, 0, 0, 0));
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
    }

    /**
     * Bug 13: ConfigurationService.getConfigurationAtDate accepts LocalDateTime.
     * The controller endpoint uses @DateTimeFormat(iso = DATE_TIME), so a date-only string
     * like "2024-01-15" causes a MethodArgumentTypeMismatchException (HTTP 400) before
     * even reaching the service.
     *
     * This test verifies that the service CAN be called with a LocalDate-derived value
     * (start of day) and returns the correct config. On unfixed code, the method signature
     * is LocalDateTime — so we demonstrate the bug by showing that calling with a date-only
     * concept (LocalDate.of(2024,1,15).atStartOfDay()) works at the service level, but the
     * controller rejects the date-only string "2024-01-15" before it gets there.
     *
     * We test the service-level bug: the method should accept LocalDate, not LocalDateTime.
     * On unfixed code, getConfigurationAtDate(LocalDate) does not exist — this test fails
     * with a compilation error or NoSuchMethodException.
     *
     * Validates: Requirement 1.13
     */
    @Test
    void bug13_getConfigurationAtDate_shouldAcceptDateOnlyString() {
        // The fixed API should accept a LocalDate (date-only)
        LocalDate dateOnly = LocalDate.of(2024, 1, 15);

        // On unfixed code, the repository query uses LocalDateTime exact match.
        // We stub the repository to return config when queried with start-of-day.
        when(configurationRepository.findByEffectiveDate(any(LocalDateTime.class)))
                .thenReturn(Optional.of(config));

        // On unfixed code, ConfigurationService.getConfigurationAtDate takes LocalDateTime.
        // The bug is that the controller rejects date-only strings before reaching the service.
        // At the service level, we verify the method can be called with a LocalDate-derived value.
        // This test will FAIL on unfixed code because the method signature is LocalDateTime,
        // not LocalDate — demonstrating the API mismatch.

        // Attempt to invoke getConfigurationAtDate with a LocalDate argument via reflection
        // to confirm the method does NOT accept LocalDate on unfixed code.
        boolean methodAcceptsLocalDate = false;
        try {
            java.lang.reflect.Method method = ConfigurationService.class
                    .getMethod("getConfigurationAtDate", LocalDate.class);
            method.invoke(configurationService, dateOnly);
            methodAcceptsLocalDate = true;
        } catch (NoSuchMethodException e) {
            // Bug confirmed: method only accepts LocalDateTime, not LocalDate
            methodAcceptsLocalDate = false;
        } catch (Exception e) {
            methodAcceptsLocalDate = false;
        }

        // This assertion FAILS on unfixed code: the method does not accept LocalDate
        assertThat(methodAcceptsLocalDate)
                .as("Bug 13: getConfigurationAtDate must accept LocalDate (date-only) parameter")
                .isTrue();
    }
}
