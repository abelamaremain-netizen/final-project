package et.edu.woldia.coop.repository;

import et.edu.woldia.coop.entity.PayrollDeduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for PayrollDeduction entity.
 * NOTE: deductionMonth is YearMonth with autoApply converter — pass YearMonth directly in queries.
 */
@Repository
public interface PayrollDeductionRepository extends JpaRepository<PayrollDeduction, UUID> {

    List<PayrollDeduction> findByDeductionMonth(YearMonth month);

    Optional<PayrollDeduction> findByMemberIdAndDeductionMonth(UUID memberId, YearMonth month);

    List<PayrollDeduction> findByDeductionMonthAndStatus(YearMonth month, PayrollDeduction.DeductionStatus status);

    long countByDeductionMonthAndStatus(YearMonth month, PayrollDeduction.DeductionStatus status);

    boolean existsByDeductionMonth(YearMonth month);

    @Query("SELECT pd FROM PayrollDeduction pd WHERE pd.deductionMonth = :month AND pd.status = 'FAILED'")
    List<PayrollDeduction> findFailedDeductions(@Param("month") YearMonth month);

    List<PayrollDeduction> findByMemberIdOrderByDeductionMonthDesc(UUID memberId);
}
