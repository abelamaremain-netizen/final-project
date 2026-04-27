package et.edu.woldia.coop.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for Collateral entity.
 */
@Data
public class CollateralDto {
    
    private UUID id;
    
    private UUID loanId;
    
    @NotNull(message = "Collateral type is required")
    private String collateralType; // OWN_SAVINGS, GUARANTOR, EXTERNAL_COOPERATIVE, FIXED_ASSET
    
    @NotNull(message = "Collateral value is required")
    private BigDecimal collateralValue;
    
    private String status; // PLEDGED, RELEASED, LIQUIDATED
    
    // Own Savings fields
    private UUID accountId;
    private BigDecimal pledgedAmount;
    
    // Guarantor fields
    private UUID guarantorMemberId;
    private String guarantorMemberName;
    private UUID guarantorAccountId;
    private BigDecimal guaranteedAmount;
    
    // External Cooperative fields
    private String externalCooperativeName;
    private String externalAccountNumber;
    private String verificationDocument;
    
    // Fixed Asset fields
    private String assetType; // VEHICLE, REAL_ESTATE, EQUIPMENT, OTHER
    private String assetDescription;
    private Integer vehicleYear;
    private BigDecimal appraisalValue;
    private LocalDate appraisalDate;
    private String appraisedBy;
    
    // Dates
    private LocalDate pledgeDate;
    private LocalDate releaseDate;
    
    // Audit fields
    private String createdBy;
    private String updatedBy;
}
