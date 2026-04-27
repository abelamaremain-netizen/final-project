package et.edu.woldia.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Collateral entity representing loan collateral.
 */
@Entity
@Table(name = "collateral")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Collateral extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "loan_id", nullable = false, columnDefinition = "uuid")
    private UUID loanId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "collateral_type", nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private CollateralType collateralType;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "collateral_value_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "collateral_value_currency", length = 3))
    })
    private Money collateralValue;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private CollateralStatus status = CollateralStatus.PLEDGED;
    
    // Own Savings
    @Column(name = "account_id", columnDefinition = "uuid")
    private UUID accountId;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "pledged_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "pledged_currency", length = 3))
    })
    private Money pledgedAmount;
    
    // Guarantor
    @Column(name = "guarantor_member_id", columnDefinition = "uuid")
    private UUID guarantorMemberId;
    
    @Column(name = "guarantor_account_id", columnDefinition = "uuid")
    private UUID guarantorAccountId;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "guaranteed_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "guaranteed_currency", length = 3))
    })
    private Money guaranteedAmount;
    
    // External Cooperative
    @Column(name = "external_cooperative_name")
    private String externalCooperativeName;
    
    @Column(name = "external_account_number")
    private String externalAccountNumber;
    
    @Column(name = "verification_document")
    private String verificationDocument;
    
    // Fixed Asset
    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type")
    private AssetType assetType;
    
    @Column(name = "asset_description", length = 1000)
    private String assetDescription;
    
    @Column(name = "vehicle_year")
    private Integer vehicleYear;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "amount", column = @Column(name = "appraised_value_amount")),
        @AttributeOverride(name = "currency", column = @Column(name = "currency", length = 3))
    })
    private Money appraisalValue;
    
    @Column(name = "appraisal_date")
    private LocalDate appraisalDate;
    
    @Column(name = "appraised_by")
    private String appraisedBy;
    
    @Column(name = "pledge_date", nullable = false)
    private LocalDate pledgeDate;
    
    @Column(name = "release_date")
    private LocalDate releaseDate;
    
    public enum CollateralType {
        OWN_SAVINGS,
        GUARANTOR,
        EXTERNAL_COOPERATIVE,
        FIXED_ASSET
    }
    
    public enum CollateralStatus {
        PLEDGED,
        RELEASED,
        LIQUIDATED
    }
    
    public enum AssetType {
        VEHICLE,
        REAL_ESTATE,
        EQUIPMENT,
        OTHER
    }
}
