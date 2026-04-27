package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Partial update DTO for member profile — all fields optional, no @NotBlank/@NotNull.
 */
@Data
public class UpdateMemberRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private LocalDate dateOfBirth;
    private String employmentStatus;
}
