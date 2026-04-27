package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.TransactionDto;
import et.edu.woldia.coop.entity.Money;
import et.edu.woldia.coop.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;

/**
 * MapStruct mapper for Transaction entity.
 */
@Mapper(componentModel = "spring")
public interface TransactionMapper {
    
    @Mapping(target = "transactionType", source = "transactionType", qualifiedByName = "transactionTypeToString")
    @Mapping(target = "amount", source = "amount", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "balanceBefore", source = "balanceBefore", qualifiedByName = "moneyToDecimal")
    @Mapping(target = "balanceAfter", source = "balanceAfter", qualifiedByName = "moneyToDecimal")
    TransactionDto toDto(Transaction transaction);
    
    @Named("transactionTypeToString")
    default String transactionTypeToString(Transaction.TransactionType transactionType) {
        return transactionType != null ? transactionType.name() : null;
    }
    
    @Named("moneyToDecimal")
    default BigDecimal moneyToDecimal(Money money) {
        return money != null ? money.getAmount() : null;
    }
}
