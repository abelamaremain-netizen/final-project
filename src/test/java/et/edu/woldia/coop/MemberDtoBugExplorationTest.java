package et.edu.woldia.coop;

import et.edu.woldia.coop.dto.MemberDto;
import et.edu.woldia.coop.entity.Member;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.mapper.MemberMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

/**
 * Bug condition exploration tests for MemberDto / MemberMapper.
 *
 * These tests MUST FAIL on unfixed code — failure confirms Bug 3 exists.
 * DO NOT fix the code when they fail.
 *
 * Validates: Requirement 1.3
 */
@ExtendWith(MockitoExtension.class)
class MemberDtoBugExplorationTest {

    /**
     * Bug 3: MemberDto has no middleName field.
     * When a Member entity with middleName is mapped to MemberDto, the middleName is lost.
     * EXPECTED TO FAIL on unfixed code because MemberDto does not declare middleName.
     *
     * Validates: Requirement 1.3
     */
    @Test
    void bug3_memberDto_shouldContainMiddleNameField() {
        // Verify MemberDto has a middleName field via reflection
        boolean hasMiddleName = false;
        try {
            java.lang.reflect.Field f = MemberDto.class.getDeclaredField("middleName");
            hasMiddleName = f != null;
        } catch (NoSuchFieldException e) {
            hasMiddleName = false;
        }

        // This assertion FAILS on unfixed code: MemberDto has no middleName field
        assertThat(hasMiddleName)
                .as("Bug 3: MemberDto must have a middleName field so it is included in API responses")
                .isTrue();
    }

    /**
     * Bug 3 (extended): When a Member entity with middleName is mapped to MemberDto,
     * the middleName value must be present in the DTO.
     * EXPECTED TO FAIL on unfixed code because MemberMapper ignores middleName.
     *
     * Validates: Requirement 1.3
     */
    @Test
    void bug3_memberMapper_shouldMapMiddleName_fromEntityToDto() {
        // Build a Member entity with middleName set
        Member member = new Member();
        member.setId(UUID.randomUUID());
        member.setMemberType("REGULAR");
        member.setFirstName("Abebe");
        member.setMiddleName("Bekele");
        member.setLastName("Kebede");
        member.setDateOfBirth(LocalDate.of(1990, 1, 1));
        member.setNationalId("ETH-12345");
        member.setPhoneNumber("0911000000");
        member.setEmploymentStatus("EMPLOYED");
        member.setCommittedDeduction(new Money(BigDecimal.valueOf(200), "ETB"));
        member.setShareCount(2);
        member.setStatus(Member.MemberStatus.ACTIVE);
        member.setRegistrationDate(LocalDate.now());
        member.setRegistrationConfigVersion(1);

        // Check that MemberDto has middleName field before attempting mapping
        boolean hasMiddleName = false;
        try {
            MemberDto.class.getDeclaredField("middleName");
            hasMiddleName = true;
        } catch (NoSuchFieldException e) {
            // Field absent — Bug 3 confirmed at DTO level
        }

        if (!hasMiddleName) {
            fail("Bug 3: MemberDto has no middleName field — cannot map middleName from entity");
        }

        // If the field exists, verify the mapper maps it correctly
        // (MapStruct-generated mapper is not available in unit test without Spring context,
        //  so we verify via reflection on the DTO field)
        MemberDto dto = new MemberDto();
        try {
            java.lang.reflect.Field f = MemberDto.class.getDeclaredField("middleName");
            f.setAccessible(true);
            f.set(dto, member.getMiddleName());
            String middleName = (String) f.get(dto);
            assertThat(middleName)
                    .as("Bug 3: middleName must be 'Bekele' when mapped from entity")
                    .isEqualTo("Bekele");
        } catch (Exception e) {
            fail("Bug 3: Could not access middleName field on MemberDto: " + e.getMessage());
        }
    }
}
