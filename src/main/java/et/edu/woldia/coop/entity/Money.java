package et.edu.woldia.coop.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Value object representing monetary amounts in Ethiopian Birr (ETB).
 * 
 * This class ensures consistent handling of currency throughout the system.
 */
@Embeddable
@Data
@AllArgsConstructor
public class Money {
    
    private BigDecimal amount;
    
    @Column(length = 3)
    private String currency;

    public Money() {
        this.currency = "ETB";
    }
    
    public Money(BigDecimal amount) {
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = "ETB";
    }
    
    public Money(double amount) {
        this(BigDecimal.valueOf(amount));
    }
    
    /**
     * Add two money amounts
     */
    public Money add(Money other) {
        validateCurrency(other);
        return new Money(this.amount.add(other.amount));
    }
    
    /**
     * Subtract two money amounts
     */
    public Money subtract(Money other) {
        validateCurrency(other);
        return new Money(this.amount.subtract(other.amount));
    }
    
    /**
     * Multiply money by a factor
     */
    public Money multiply(BigDecimal factor) {
        return new Money(this.amount.multiply(factor));
    }
    
    /**
     * Multiply money by a factor
     */
    public Money multiply(double factor) {
        return multiply(BigDecimal.valueOf(factor));
    }
    
    /**
     * Divide money by a divisor
     */
    public Money divide(BigDecimal divisor) {
        return new Money(this.amount.divide(divisor, 2, RoundingMode.HALF_UP));
    }
    
    /**
     * Divide money by a divisor
     */
    public Money divide(double divisor) {
        return divide(BigDecimal.valueOf(divisor));
    }
    
    /**
     * Check if this amount is greater than another
     */
    public boolean isGreaterThan(Money other) {
        validateCurrency(other);
        return this.amount.compareTo(other.amount) > 0;
    }
    
    /**
     * Check if this amount is less than another
     */
    public boolean isLessThan(Money other) {
        validateCurrency(other);
        return this.amount.compareTo(other.amount) < 0;
    }
    
    /**
     * Check if this amount is greater than or equal to another
     */
    public boolean isGreaterThanOrEqual(Money other) {
        validateCurrency(other);
        return this.amount.compareTo(other.amount) >= 0;
    }
    
    /**
     * Check if this amount is less than or equal to another
     */
    public boolean isLessThanOrEqual(Money other) {
        validateCurrency(other);
        return this.amount.compareTo(other.amount) <= 0;
    }
    
    /**
     * Check if this amount is zero
     */
    public boolean isZero() {
        return this.amount.compareTo(BigDecimal.ZERO) == 0;
    }
    
    /**
     * Check if this amount is positive
     */
    public boolean isPositive() {
        return this.amount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    /**
     * Check if this amount is negative
     */
    public boolean isNegative() {
        return this.amount.compareTo(BigDecimal.ZERO) < 0;
    }
    
    /**
     * Get absolute value
     */
    public Money abs() {
        return new Money(this.amount.abs());
    }
    
    /**
     * Validate that currencies match
     */
    private void validateCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                String.format("Currency mismatch: %s vs %s", this.currency, other.currency)
            );
        }
    }
    
    /**
     * Create zero money
     */
    public static Money zero() {
        return new Money(BigDecimal.ZERO);
    }
    
    @Override
    public String toString() {
        return String.format("%s %.2f", currency, amount);
    }
}
