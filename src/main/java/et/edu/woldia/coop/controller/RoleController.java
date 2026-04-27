package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.RoleDto;
import et.edu.woldia.coop.service.RoleManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API controller for role management.
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Role management API")
@SecurityRequirement(name = "bearerAuth")
public class RoleController {
    
    private final RoleManagementService roleManagementService;
    
    /**
     * Get all roles
     */
    @GetMapping
    @Operation(summary = "Get all roles", description = "Retrieve all available roles")
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        List<RoleDto> roles = roleManagementService.getAllRoles();
        return ResponseEntity.ok(roles);
    }
    
    /**
     * Get role by name
     */
    @GetMapping("/{name}")
    @Operation(summary = "Get role by name", description = "Retrieve role by name")
    public ResponseEntity<RoleDto> getRoleByName(@PathVariable String name) {
        RoleDto role = roleManagementService.getRoleByName(name);
        return ResponseEntity.ok(role);
    }
}
