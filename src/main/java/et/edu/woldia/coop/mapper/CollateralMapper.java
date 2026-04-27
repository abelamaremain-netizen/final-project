package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.CollateralDto;
import et.edu.woldia.coop.entity.Collateral;
import et.edu.woldia.coop.entity.Money;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Mapper for Collateral entity and DTO.
 */
@Component
public class CollateralMapper {
    
    public CollateralDto toDto(Collateral entity) {
        if (entity == null) {
            return null;
        }
        
        CollateralDto dto = new CollateralDto();
        dto.setId(entity.getId());
        dto.setLoanId(entity.getLoanId());
        dto.setCollateralType(entity.getCollateralType() != null ? entity.getCollateralType().name() : null);
        dto.setCollateralValue(entity.getCollateralValue() != null ? entity.getCollateralValue().getAmount() : null);
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        
        // Own Savings
        dto.setAccountId(entity.getAccountId());
        dto.setPledgedAmount(entity.getPledgedAmount() != null ? entity.getPledgedAmount().getAmount() : null);
        
        // Guarantor
        dto.setGuarantorMemberId(entity.getGuarantorMemberId());
        dto.setGuarantorAccountId(entity.getGuarantorAccountId());
        dto.setGuaranteedAmount(entity.getGuaranteedAmount() != null ? entity.getGuaranteedAmount().getAmount() : null);
        
        // External Cooperative
        dto.setExternalCooperativeName(entity.getExternalCooperativeName());
        dto.setExternalAccountNumber(entity.getExternalAccountNumber());
        dto.setVerificationDocument(entity.getVerificationDocument());
        
        // Fixed Asset
        dto.setAssetType(entity.getAssetType() != null ? entity.getAssetType().name() : null);
        dto.setAssetDescription(entity.getAssetDescription());
        dto.setVehicleYear(entity.getVehicleYear());
        dto.setAppraisalValue(entity.getAppraisalValue() != null ? entity.getAppraisalValue().getAmount() : null);
        dto.setAppraisalDate(entity.getAppraisalDate());
        dto.setAppraisedBy(entity.getAppraisedBy());
        
        // Dates
        dto.setPledgeDate(entity.getPledgeDate());
        dto.setReleaseDate(entity.getReleaseDate());
        
        // Audit
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setUpdatedBy(entity.getUpdatedBy());
        
        return dto;
    }
    
    public Collateral toEntity(CollateralDto dto) {
        if (dto == null) {
            return null;
        }
        
        Collateral entity = new Collateral();
        entity.setId(dto.getId());
        entity.setLoanId(dto.getLoanId());
        
        if (dto.getCollateralType() != null) {
            entity.setCollateralType(Collateral.CollateralType.valueOf(dto.getCollateralType()));
        }
        
        if (dto.getCollateralValue() != null) {
            entity.setCollateralValue(new Money(dto.getCollateralValue(), "ETB"));
        }
        
        if (dto.getStatus() != null) {
            entity.setStatus(Collateral.CollateralStatus.valueOf(dto.getStatus()));
        }
        
        // Own Savings
        entity.setAccountId(dto.getAccountId());
        if (dto.getPledgedAmount() != null) {
            entity.setPledgedAmount(new Money(dto.getPledgedAmount(), "ETB"));
        }
        
        // Guarantor
        entity.setGuarantorMemberId(dto.getGuarantorMemberId());
        entity.setGuarantorAccountId(dto.getGuarantorAccountId());
        if (dto.getGuaranteedAmount() != null) {
            entity.setGuaranteedAmount(new Money(dto.getGuaranteedAmount(), "ETB"));
        }
        
        // External Cooperative
        entity.setExternalCooperativeName(dto.getExternalCooperativeName());
        entity.setExternalAccountNumber(dto.getExternalAccountNumber());
        entity.setVerificationDocument(dto.getVerificationDocument());
        
        // Fixed Asset
        if (dto.getAssetType() != null) {
            entity.setAssetType(Collateral.AssetType.valueOf(dto.getAssetType()));
        }
        entity.setAssetDescription(dto.getAssetDescription());
        entity.setVehicleYear(dto.getVehicleYear());
        if (dto.getAppraisalValue() != null) {
            entity.setAppraisalValue(new Money(dto.getAppraisalValue(), "ETB"));
        }
        entity.setAppraisalDate(dto.getAppraisalDate());
        entity.setAppraisedBy(dto.getAppraisedBy());
        
        // Dates
        entity.setPledgeDate(dto.getPledgeDate());
        entity.setReleaseDate(dto.getReleaseDate());
        
        return entity;
    }
}
