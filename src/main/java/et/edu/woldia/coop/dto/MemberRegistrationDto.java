package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MemberRegistrationDto {

    @NotBlank(message = "Member type is required (REGULAR or EXTERNAL_COOPERATIVE)")
    private String memberType;

    // Personal Info
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotNull(message = "Date of birth is required")
    @Past
    private LocalDate dateOfBirth;

    @NotBlank(message = "National ID is required")
    private String nationalId;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @Email
    private String email;

    // Address
    private String address;

    // Employment Info
    @NotBlank(message = "Employment status is required")
    private String employmentStatus;

    @NotNull(message = "Committed monthly deduction is required")
    @DecimalMin(value = "0.0")
    private BigDecimal committedDeduction;

    // External Cooperative Info (for EXTERNAL_COOPERATIVE type)
    private String externalCooperativeName;
    private String externalCooperativeMemberId;

    // Share purchase (for REGULAR members)
    @Min(value = 0)
    private Integer shareCount;
}