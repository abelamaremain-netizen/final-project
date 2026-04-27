package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MemberDto {

    private UUID id;

    @NotBlank(message = "Member type is required")
    private String memberType;

    // Personal Info
    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @NotNull(message = "Date of birth is required")
    @Past
    private LocalDate dateOfBirth;

    @NotBlank(message = "National ID is required")
    @Size(max = 50)
    private String nationalId;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20)
    private String phoneNumber;

    @Email
    private String email;

    // Address
    private String address;

    // Employment Info
    @NotBlank(message = "Employment status is required")
    private String employmentStatus;

    @NotNull(message = "Committed deduction is required")
    @DecimalMin(value = "0.0")
    private BigDecimal committedDeduction;

    private LocalDate lastDeductionChangeDate;

    // External Cooperative Info
    private String externalCooperativeName;
    private String externalCooperativeMemberId;

    // Registration Info
    private LocalDate registrationDate;
    private Integer registrationConfigVersion;
    private Integer shareCount;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}