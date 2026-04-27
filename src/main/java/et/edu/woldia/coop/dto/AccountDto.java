package et.edu.woldia.coop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Account entity.
 */
@Data
public class AccountDto {
    
    private UUID id;
    private UUID memberId;
    private String accountType;
    private BigDecimal balance;
    private BigDecimal pledgedAmount;
    private BigDecimal availableBalance;
    private BigDecimal interestRate;
    private LocalDate createdDate;
    private LocalDate lastInterestDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
