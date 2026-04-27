package et.edu.woldia.coop.mapper;

import et.edu.woldia.coop.dto.UserDto;
import et.edu.woldia.coop.entity.Role;
import et.edu.woldia.coop.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * MapStruct mapper for User entity and DTO.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {
    
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", source = "roles", qualifiedByName = "rolesToNames")
    UserDto toDto(User entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    User toEntity(UserDto dto);
    
    @Named("rolesToNames")
    default Set<String> rolesToNames(Set<Role> roles) {
        return roles.stream()
            .map(Role::getName)
            .collect(Collectors.toSet());
    }
}
