package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.MemberSuspensionDto;
import et.edu.woldia.coop.entity.MemberSuspension;
import org.springframework.stereotype.Component;

/**
 * Mapper for MemberSuspension entity and DTO.
 */
@Component
public class MemberSuspensionMapper {
    
    public MemberSuspensionDto toDto(MemberSuspension entity) {
        if (entity == null) {
            return null;
        }
        
        return MemberSuspensionDto.builder()
            .id(entity.getId())
            .memberId(entity.getMember().getId())
            .memberName(entity.getMember().getFullName())
            .suspendedDate(entity.getSuspendedDate())
            .reason(entity.getReason())
            .suspendedBy(entity.getSuspendedBy())
            .reactivatedDate(entity.getReactivatedDate())
            .reactivatedBy(entity.getReactivatedBy())
            .isActive(entity.getReactivatedDate() == null)
            .build();
    }
}
