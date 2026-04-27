package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.RoleDto;
import et.edu.woldia.coop.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Role entity and DTO.
 */
@Mapper(componentModel = "spring")
public interface RoleMapper {
    
    RoleDto toDto(Role entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Role toEntity(RoleDto dto);
}
