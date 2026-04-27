package et.edu.woldia.coop.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.LocalDate;
import java.time.YearMonth;

/**
 * JPA converter for YearMonth <-> LocalDate (first day of month).
 * Applied automatically to all YearMonth fields via autoApply = true.
 */
@Converter(autoApply = true)
public class YearMonthConverter implements AttributeConverter<YearMonth, LocalDate> {

    @Override
    public LocalDate convertToDatabaseColumn(YearMonth attribute) {
        if (attribute == null) return null;
        return attribute.atDay(1);
    }

    @Override
    public YearMonth convertToEntityAttribute(LocalDate dbData) {
        if (dbData == null) return null;
        return YearMonth.from(dbData);
    }
}
