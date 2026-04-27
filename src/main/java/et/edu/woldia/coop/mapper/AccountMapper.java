package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.AccountDto;
import et.edu.woldia.coop.entity.Account;
import et.edu.woldia.coop.entity.Money;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;

/**
 * MapStruct mapper for Account entity.
 */
@Mapper(componentModel = "spring")
public interface AccountMapper {
    
    @Mapping(target = "accountType", source = "accountType", qualifiedByName = "accountTypeToString")
    @Mapping(target = "status", source = "status", qualifiedByName = "statusToString")
    @Mapping(target = "balance", source = "balance", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "pledgedAmount", source = "pledgedAmount", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "availableBalance", source = "availableBalance", qualifiedByName = "moneyToDecimal")
    AccountDto toDto(Account account);
    
    @Named("accountTypeToString")
    default String accountTypeToString(Account.AccountType accountType) {
        return accountType != null ? accountType.name() : null;
    }
    
    @Named("statusToString")
    default String statusToString(Account.AccountStatus status) {
        return status != null ? status.name() : null;
    }
    
    @Named("moneyToDecimal")
    default BigDecimal moneyToDecimal(Money money) {
        return money != null ? money.getAmount() : null;
    }
}
