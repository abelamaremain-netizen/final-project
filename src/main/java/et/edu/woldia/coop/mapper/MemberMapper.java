package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.MemberDto;
import et.edu.woldia.coop.dto.MemberRegistrationDto;
import et.edu.woldia.coop.entity.Member;
import et.edu.woldia.coop.entity.Money;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface MemberMapper {

    @Mapping(target = "memberType", source = "memberType")
    @Mapping(target = "status", source = "status", qualifiedByName = "statusToString")
    @Mapping(target = "committedDeduction", source = "committedDeduction", qualifiedByName = "moneyToDecimal")
    MemberDto toDto(Member member);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "memberType", source = "memberType")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "committedDeduction", source = "committedDeduction", qualifiedByName = "decimalToMoney")
    @Mapping(target = "registrationConfigVersion", ignore = true)
    @Mapping(target = "shareCount", constant = "0")
    @Mapping(target = "suspensionHistory", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Member toEntity(MemberRegistrationDto dto);

    @Named("statusToString")
    default String statusToString(Member.MemberStatus status) {
        return status != null ? status.name() : null;
    }

    @Named("moneyToDecimal")
    default BigDecimal moneyToDecimal(Money money) {
        return money != null ? money.getAmount() : null;
    }

    @Named("decimalToMoney")
    default Money decimalToMoney(BigDecimal amount) {
        return amount != null ? new Money(amount, "ETB") : null;
    }
}