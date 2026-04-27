package et.edu.woldia.coop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberTypeCategoryDto {
    private UUID id;
    private String name;
    private String description;
    private Boolean active;
}
