package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.ConfigurationDto;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.entity.SystemConfiguration;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

/**
 * MapStruct mapper for SystemConfiguration entity and DTO.
 */
@Mapper(componentModel = "spring")
public interface ConfigurationMapper {

    @Mapping(target = "registrationFee", source = "registrationFee", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "sharePricePerShare", source = "sharePricePerShare", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "minimumMonthlyDeduction", source = "minimumMonthlyDeduction", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "maximumLoanCapPerMember", source = "maximumLoanCapPerMember", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "memberWithdrawalProcessingFee", source = "memberWithdrawalProcessingFee", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "shareTransferFee", source = "shareTransferFee", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "minimumLoanAmount", source = "minimumLoanAmount", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "effectiveDate", source = "effectiveDate", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    ConfigurationDto toDto(SystemConfiguration entity);

    @Mapping(target = "registrationFee", source = "registrationFee", qualifiedByName = "decimalToMoney")
    @Mapping(target = "sharePricePerShare", source = "sharePricePerShare", qualifiedByName = "decimalToMoney")
    @Mapping(target = "minimumMonthlyDeduction", source = "minimumMonthlyDeduction", qualifiedByName = "decimalToMoney")
    @Mapping(target = "maximumLoanCapPerMember", source = "maximumLoanCapPerMember", qualifiedByName = "decimalToMoney")
    @Mapping(target = "memberWithdrawalProcessingFee", source = "memberWithdrawalProcessingFee", qualifiedByName = "decimalToMoney")
    @Mapping(target = "shareTransferFee", source = "shareTransferFee", qualifiedByName = "decimalToMoney")
    @Mapping(target = "minimumLoanAmount", source = "minimumLoanAmount", qualifiedByName = "decimalToMoney")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "effectiveDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    SystemConfiguration toEntity(ConfigurationDto dto);

    /**
     * After mapping, parse the effectiveDate string from the DTO into the entity.
     * Accepts "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss".
     */
    @AfterMapping
    default void applyEffectiveDate(ConfigurationDto dto, @MappingTarget SystemConfiguration entity) {
        if (dto.getEffectiveDate() != null && !dto.getEffectiveDate().isBlank()) {
            entity.setEffectiveDate(dto.getEffectiveDateAsLocalDateTime());
        }
    }

    @Named("localDateTimeToString")
    default String localDateTimeToString(java.time.LocalDateTime dt) {
        return dt != null ? dt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
    }

    @Named("moneyToDecimal")
    default BigDecimal moneyToDecimal(Money money) {
        return money != null ? money.getAmount() : null;
    }

    @Named("decimalToMoney")
    default Money decimalToMoney(BigDecimal decimal) {
        return decimal != null ? new Money(decimal) : null;
    }
}
