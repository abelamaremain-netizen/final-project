package et.edu.woldia.coop.controller;

import et.edu.woldia.coop.dto.AuthResponse;
import et.edu.woldia.coop.dto.LoginRequest;
import et.edu.woldia.coop.dto.UserDto;
import et.edu.woldia.coop.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST API controller for authentication.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication and registration API")
public class AuthenticationController {
    
    private final AuthenticationService authenticationService;
    
    /**
     * Login endpoint
     */
    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and generate JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Register new user endpoint
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Register user", 
               description = "Register a new user. Requires ADMINISTRATOR role.")
    public ResponseEntity<UserDto> register(
            @Valid @RequestBody UserDto userDto,
            Authentication authentication) {
        
        UserDto created = authenticationService.register(userDto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * Refresh token endpoint
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Generate new JWT tokens using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestParam String refreshToken) {
        AuthResponse response = authenticationService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Logout endpoint
     */
    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logout user (client should clear tokens)")
    public ResponseEntity<Void> logout() {
        // Since we're using stateless JWT authentication, logout is handled client-side
        // by clearing the tokens. This endpoint exists for API completeness and 
        // could be extended to implement token blacklisting if needed.
        return ResponseEntity.ok().build();
    }
}
