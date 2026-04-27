package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.RoleDto;
import et.edu.woldia.coop.entity.Role;
import et.edu.woldia.coop.entity.RoleAssignmentAudit;
import et.edu.woldia.coop.entity.User;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.RoleMapper;
import et.edu.woldia.coop.repository.RoleAssignmentAuditRepository;
import et.edu.woldia.coop.repository.RoleRepository;
import et.edu.woldia.coop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing user roles with grant/revoke model.
 * 
 * Implements flexible RBAC where users can have multiple roles simultaneously.
 * All role changes are audited for compliance.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RoleManagementService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleAssignmentAuditRepository auditRepository;
    private final RoleMapper roleMapper;
    
    /**
     * Grant a role to a user
     */
    @Transactional
    public void grantRole(UUID userId, UUID roleId, String grantedBy, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));
        
        // Check if user already has this role
        if (user.hasRole(role.getName())) {
            throw new ValidationException("User already has role: " + role.getName());
        }
        
        // Grant role
        user.addRole(role);
        userRepository.save(user);
        
        // Audit
        RoleAssignmentAudit audit = new RoleAssignmentAudit();
        audit.setUserId(userId);
        audit.setRoleId(roleId);
        audit.setAction(RoleAssignmentAudit.Action.grant);
        audit.setPerformedBy(grantedBy);
        audit.setReason(reason);
        auditRepository.save(audit);
        
        log.info("Granted role {} to user {} by {}", role.getName(), user.getUsername(), grantedBy);
    }
    
    /**
     * Revoke a role from a user
     */
    @Transactional
    public void revokeRole(UUID userId, UUID roleId, String revokedBy, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));
        
        // Check if user has this role
        if (!user.hasRole(role.getName())) {
            throw new ValidationException("User does not have role: " + role.getName());
        }
        
        // Revoke role
        user.removeRole(role);
        userRepository.save(user);
        
        // Audit
        RoleAssignmentAudit audit = new RoleAssignmentAudit();
        audit.setUserId(userId);
        audit.setRoleId(roleId);
        audit.setAction(RoleAssignmentAudit.Action.revoke);
        audit.setPerformedBy(revokedBy);
        audit.setReason(reason);
        auditRepository.save(audit);
        
        log.info("Revoked role {} from user {} by {}", role.getName(), user.getUsername(), revokedBy);
    }
    
    /**
     * Get all roles for a user
     */
    @Transactional(readOnly = true)
    public Set<Role> getUserRoles(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return user.getRoles();
    }
    
    /**
     * Get all permissions for a user (combined from all roles)
     */
    @Transactional(readOnly = true)
    public Set<String> getUserPermissions(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        return user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .collect(Collectors.toSet());
    }
    
    /**
     * Check if user has a specific permission
     */
    @Transactional(readOnly = true)
    public boolean checkPermission(UUID userId, String permission) {
        Set<String> permissions = getUserPermissions(userId);
        return permissions.contains(permission);
    }
    
    /**
     * Get all available roles
     */
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
            .map(roleMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get role by name
     */
    @Transactional(readOnly = true)
    public RoleDto getRoleByName(String name) {
        Role role = roleRepository.findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + name));
        return roleMapper.toDto(role);
    }
    
    /**
     * Get all roles for a user (returns DTOs)
     */
    @Transactional(readOnly = true)
    public Set<RoleDto> getUserRolesDto(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return user.getRoles().stream()
            .map(roleMapper::toDto)
            .collect(Collectors.toSet());
    }
    
    /**
     * Get audit trail for a user
     */
    @Transactional(readOnly = true)
    public List<RoleAssignmentAudit> getUserAuditTrail(UUID userId) {
        return auditRepository.findByUserIdOrderByPerformedAtDesc(userId);
    }
}
