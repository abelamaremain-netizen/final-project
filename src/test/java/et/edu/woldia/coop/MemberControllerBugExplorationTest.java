package et.edu.woldia.coop;

import com.fasterxml.jackson.databind.ObjectMapper;
import et.edu.woldia.coop.controller.MemberController;
import et.edu.woldia.coop.dto.MemberDto;
import et.edu.woldia.coop.service.MemberService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Bug condition exploration tests for MemberController.
 *
 * These tests MUST FAIL on unfixed code — failure confirms Bug 6 exists.
 * DO NOT fix the code when they fail.
 *
 * Validates: Requirement 1.6
 */
@WebMvcTest(MemberController.class)
class MemberControllerBugExplorationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MemberService memberService;

    /**
     * Bug 6: PUT /api/members/{id} with a partial payload (only email) should return HTTP 200.
     * EXPECTED TO FAIL on unfixed code because MemberController accepts @Valid @RequestBody MemberDto,
     * which has @NotBlank on firstName, lastName, memberType, etc. — a partial payload fails
     * Bean Validation with HTTP 400.
     *
     * Validates: Requirement 1.6
     */
    @Test
    @WithMockUser(roles = {"ADMINISTRATOR"})
    void bug6_partialUpdate_shouldReturn200_whenOnlyEmailProvided() throws Exception {
        UUID memberId = UUID.randomUUID();

        // Partial payload — only email, all other required fields omitted
        Map<String, String> partialPayload = Map.of("email", "x@y.com");

        MemberDto updatedDto = new MemberDto();
        updatedDto.setId(memberId);
        updatedDto.setFirstName("Abebe");
        updatedDto.setLastName("Kebede");
        updatedDto.setMemberType("REGULAR");
        updatedDto.setNationalId("ETH-12345");
        updatedDto.setPhoneNumber("0911000000");
        updatedDto.setEmploymentStatus("EMPLOYED");
        updatedDto.setDateOfBirth(LocalDate.of(1990, 1, 1));
        updatedDto.setCommittedDeduction(BigDecimal.valueOf(200));
        updatedDto.setEmail("x@y.com");

        when(memberService.updateMemberProfile(eq(memberId), any(), any()))
                .thenReturn(updatedDto);

        // This assertion FAILS on unfixed code: returns HTTP 400 due to @Valid @RequestBody MemberDto
        // validation rejecting the partial payload (missing @NotBlank fields)
        mockMvc.perform(put("/api/members/{id}", memberId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partialPayload)))
                .andExpect(status().isOk()); // Fails with 400 on unfixed code
    }
}
