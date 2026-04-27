package et.edu.woldia.coop;

import et.edu.woldia.coop.dto.MemberSuspensionDto;
import et.edu.woldia.coop.entity.Member;
import et.edu.woldia.coop.entity.MemberSuspension;
import et.edu.woldia.coop.mapper.MemberSuspensionMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Bug condition exploration tests for MemberSuspensionMapper.
 *
 * These tests MUST FAIL on unfixed code — failure confirms Bug 9 exists.
 * DO NOT fix the code when they fail.
 *
 * Validates: Requirement 1.9
 */
class MemberSuspensionMapperBugExplorationTest {

    private final MemberSuspensionMapper mapper = new MemberSuspensionMapper();

    /**
     * Bug 9: MemberSuspensionMapper.toDto never sets memberName.
     * EXPECTED TO FAIL on unfixed code because the builder call omits memberName.
     *
     * Validates: Requirement 1.9
     */
    @Test
    void bug9_memberName_shouldBePopulated_inSuspensionDto() {
        Member member = new Member();
        member.setId(UUID.randomUUID());
        member.setFirstName("Abebe");
        member.setLastName("Kebede");
        member.setMemberType("REGULAR");

        MemberSuspension suspension = new MemberSuspension();
        suspension.setId(UUID.randomUUID());
        suspension.setMember(member);
        suspension.setSuspendedDate(LocalDateTime.now());
        suspension.setReason("Test suspension");
        suspension.setSuspendedBy("admin");

        MemberSuspensionDto dto = mapper.toDto(suspension);

        // This assertion FAILS on unfixed code: memberName is null
        assertThat(dto.getMemberName())
                .as("Bug 9: memberName must be non-null and equal to member's full name")
                .isNotNull()
                .isEqualTo("Abebe Kebede");
    }
}
