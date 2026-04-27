package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.ConfigurationDto;
import et.edu.woldia.coop.entity.SystemConfiguration;
import et.edu.woldia.coop.mapper.ConfigurationMapper;
import et.edu.woldia.coop.service.ConfigurationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST API controller for system configuration management.
 * 
 * Provides endpoints for managing versioned system configuration parameters.
 * Only administrators can create new configurations.
 */
@RestController
@RequestMapping("/api/configurations")
@RequiredArgsConstructor
@Tag(name = "Configuration", description = "System configuration management API")
@SecurityRequirement(name = "bearerAuth")
public class ConfigurationController {
    
    private final ConfigurationService configurationService;
    private final ConfigurationMapper configurationMapper;
    
    /**
     * Get the current (latest) system configuration
     */
    @GetMapping("/current")
    @Operation(summary = "Get current configuration", 
               description = "Retrieves the current active system configuration")
    public ResponseEntity<ConfigurationDto> getCurrentConfiguration() {
        SystemConfiguration config = configurationService.getCurrentConfiguration();
        return ResponseEntity.ok(configurationMapper.toDto(config));
    }
    
    /**
     * Get configuration by version number
     */
    @GetMapping("/{version}")
    @Operation(summary = "Get configuration by version", 
               description = "Retrieves a specific configuration version")
    public ResponseEntity<ConfigurationDto> getConfigurationVersion(@PathVariable Integer version) {
        SystemConfiguration config = configurationService.getConfigurationVersion(version);
        return ResponseEntity.ok(configurationMapper.toDto(config));
    }
    
    /**
     * Get configuration effective at a specific date
     */
    @GetMapping("/at-date")
    @Operation(summary = "Get configuration at date", 
               description = "Retrieves the configuration that was effective at a specific date")
    public ResponseEntity<ConfigurationDto> getConfigurationAtDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        SystemConfiguration config = configurationService.getConfigurationAtDate(date);
        return ResponseEntity.ok(configurationMapper.toDto(config));
    }
    
    /**
     * Get all configuration versions (history)
     */
    @GetMapping("/history")
    @Operation(summary = "Get configuration history", 
               description = "Retrieves all configuration versions")
    public ResponseEntity<List<ConfigurationDto>> getConfigurationHistory() {
        List<SystemConfiguration> configs = configurationService.getConfigurationHistory();
        List<ConfigurationDto> dtos = configs.stream()
            .map(configurationMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * Create a new configuration version
     * 
     * Only administrators can create new configurations.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create new configuration", 
               description = "Creates a new configuration version. Requires ADMINISTRATOR role.")
    public ResponseEntity<ConfigurationDto> createConfiguration(
            @Valid @RequestBody ConfigurationDto configDto,
            Authentication authentication) {
        
        SystemConfiguration config = configurationMapper.toEntity(configDto);
        SystemConfiguration created = configurationService.createNewConfiguration(
            config, 
            authentication.getName()
        );
        
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(configurationMapper.toDto(created));
    }
    
    /**
     * Get the locked configuration for a transaction
     */
    @GetMapping("/locked/{transactionType}/{transactionId}")
    @Operation(summary = "Get locked configuration", 
               description = "Retrieves the configuration version locked for a specific transaction")
    public ResponseEntity<ConfigurationDto> getLockedConfiguration(
            @PathVariable String transactionType,
            @PathVariable UUID transactionId) {
        
        SystemConfiguration config = configurationService.getLockedConfiguration(
            transactionType, 
            transactionId
        );
        return ResponseEntity.ok(configurationMapper.toDto(config));
    }
}
