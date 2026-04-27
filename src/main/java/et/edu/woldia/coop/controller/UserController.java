package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.RoleAssignmentAuditDto;
import et.edu.woldia.coop.dto.RoleAssignmentRequest;
import et.edu.woldia.coop.dto.RoleDto;
import et.edu.woldia.coop.dto.UserDto;
import et.edu.woldia.coop.entity.Role;
import et.edu.woldia.coop.entity.User;
import et.edu.woldia.coop.mapper.RoleAssignmentAuditMapper;
import et.edu.woldia.coop.mapper.RoleMapper;
import et.edu.woldia.coop.repository.UserRepository;
import et.edu.woldia.coop.service.RoleManagementService;
import et.edu.woldia.coop.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST API controller for user management.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management API")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    
    private final UserService userService;
    private final RoleManagementService roleManagementService;
    private final RoleMapper roleMapper;
    private final RoleAssignmentAuditMapper roleAssignmentAuditMapper;
    private final UserRepository userRepository;
    private final et.edu.woldia.coop.repository.UserAdminEventRepository userAdminEventRepository;
    
    /**
     * Get all users — paginated
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Get all users", description = "Retrieve all users (paginated). Requires ADMINISTRATOR role.")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @PageableDefault(size = 20, sort = "username", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsersPaged(pageable));
    }
    
    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or #id == authentication.principal.username")
    @Operation(summary = "Get user by ID", description = "Retrieve user by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Get current user
     */
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Retrieve current authenticated user")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        UserDto user = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(user);
    }
    
    /**
     * Update own profile (any authenticated user)
     */
    @PutMapping("/me")
    @Operation(summary = "Update own profile", description = "Update own email, password, or username.")
    public ResponseEntity<UserDto> updateOwnProfile(
            @Valid @RequestBody UserDto userDto,
            Authentication authentication) {

        User currentUser = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new et.edu.woldia.coop.exception.ResourceNotFoundException("User not found"));
        UserDto updated = userService.updateUser(currentUser.getId(), userDto, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * Reset user password (admin action)
     */
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Reset password", description = "Reset user password. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> resetPassword(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, String> body,
            Authentication authentication) {
        
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        UserDto dto = new UserDto();
        dto.setPassword(newPassword);
        userService.updateUser(id, dto, authentication.getName());
        return ResponseEntity.ok().build();
    }

    /**
     * Update user
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update user", description = "Update user details. Requires ADMINISTRATOR role.")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserDto userDto,
            Authentication authentication) {
        
        UserDto updated = userService.updateUser(id, userDto, authentication.getName());
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Delete user (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Delete user", description = "Deactivates user account. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID id,
            Authentication authentication) {
        userService.deleteUser(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Activate user
     */
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Activate user", description = "Activate user account. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> activateUser(
            @PathVariable UUID id,
            Authentication authentication) {
        
        userService.activateUser(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Deactivate user
     */
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Deactivate user", description = "Deactivate user account. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> deactivateUser(
            @PathVariable UUID id,
            Authentication authentication) {
        
        userService.deactivateUser(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Grant role to user
     */
    @PostMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Grant role", description = "Grant a role to user. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> grantRole(
            @PathVariable UUID userId,
            @Valid @RequestBody RoleAssignmentRequest request,
            Authentication authentication) {
        
        roleManagementService.grantRole(
            userId, 
            request.getRoleId(), 
            authentication.getName(),
            request.getReason()
        );
        return ResponseEntity.ok().build();
    }
    
    /**
     * Revoke role from user
     */
    @DeleteMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Revoke role", description = "Revoke a role from user. Requires ADMINISTRATOR role.")
    public ResponseEntity<Void> revokeRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        
        roleManagementService.revokeRole(
            userId, 
            roleId, 
            authentication.getName(),
            reason
        );
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get user roles
     */
    @GetMapping("/{userId}/roles")
    @Operation(summary = "Get user roles", description = "Retrieve all roles for a user")
    public ResponseEntity<Set<RoleDto>> getUserRoles(@PathVariable UUID userId) {
        Set<Role> roles = roleManagementService.getUserRoles(userId);
        Set<RoleDto> roleDtos = roles.stream()
            .map(roleMapper::toDto)
            .collect(Collectors.toSet());
        return ResponseEntity.ok(roleDtos);
    }
    
    /**
     * Get user permissions
     */
    @GetMapping("/{userId}/permissions")
    @Operation(summary = "Get user permissions", description = "Retrieve all permissions for a user")
    public ResponseEntity<Set<String>> getUserPermissions(@PathVariable UUID userId) {
        Set<String> permissions = roleManagementService.getUserPermissions(userId);
        return ResponseEntity.ok(permissions);
    }
    
    /**
     * Get role assignment audit trail for a user
     */
    @GetMapping("/{userId}/audit/roles")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Get role assignment audit", description = "Retrieve role assignment audit trail for a user. Requires ADMINISTRATOR role.")
    public ResponseEntity<List<RoleAssignmentAuditDto>> getRoleAuditTrail(@PathVariable UUID userId) {
        return ResponseEntity.ok(
            roleManagementService.getUserAuditTrail(userId).stream()
                .map(roleAssignmentAuditMapper::toDto)
                .collect(Collectors.toList())
        );
    }

    /**
     * Get full user admin event history (account events + role changes)
     */
    @GetMapping("/{userId}/audit")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Get user admin audit", description = "Retrieve full admin event history for a user. Requires ADMINISTRATOR role.")
    public ResponseEntity<List<et.edu.woldia.coop.dto.UserAdminEventDto>> getUserAdminAudit(@PathVariable UUID userId) {
        List<et.edu.woldia.coop.dto.UserAdminEventDto> events =
            userAdminEventRepository.findByUserIdOrderByPerformedAtDesc(userId).stream()
                .map(e -> {
                    et.edu.woldia.coop.dto.UserAdminEventDto dto = new et.edu.woldia.coop.dto.UserAdminEventDto();
                    dto.setId(e.getId());
                    dto.setUserId(e.getUserId());
                    dto.setUsername(e.getUsername());
                    dto.setEventType(e.getEventType().name());
                    dto.setPerformedBy(e.getPerformedBy());
                    dto.setPerformedAt(e.getPerformedAt());
                    dto.setDescription(e.getDescription());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(events);
    }
}
