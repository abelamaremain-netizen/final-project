package et.edu.woldia.coop.dto;

import lombok.Data;

/**
 * DTO for member search and filtering.
 */
@Data
public class MemberSearchDto {

    private String memberType;
    private String status;
    private String nationalId;
    private String phoneNumber;
    private String firstName;
    private String lastName;
}