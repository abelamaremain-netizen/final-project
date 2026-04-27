package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.AuthResponse;
import et.edu.woldia.coop.dto.LoginRequest;
import et.edu.woldia.coop.dto.UserDto;
import et.edu.woldia.coop.entity.Role;
import et.edu.woldia.coop.entity.User;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.UserMapper;
import et.edu.woldia.coop.repository.RoleRepository;
import et.edu.woldia.coop.repository.UserRepository;
import et.edu.woldia.coop.security.JwtUtil;
import et.edu.woldia.coop.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for user authentication and registration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final AuditService auditService;
    private final et.edu.woldia.coop.repository.UserAdminEventRepository userAdminEventRepository;
    
    /**
     * Authenticate user and generate JWT tokens
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        // Get user with roles
        User user = userRepository.findByUsernameWithRoles(request.getUsername())
            .orElseThrow(() -> new ValidationException("User not found"));
        
        // Generate tokens
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);
        
        // Get roles
        Set<String> roles = user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toSet());
        
        log.info("User {} logged in successfully with roles: {}", request.getUsername(), roles);

        try {
            auditService.logAction(user.getId(), user.getUsername(), "LOGIN", "USER", user.getId(),
                "User logged in");
        } catch (Exception ignored) {}

        return new AuthResponse(token, refreshToken, user.getUsername(), roles);
    }
    
    /**
     * Register a new user
     */
    @Transactional
    public UserDto register(UserDto userDto, String createdBy) {
        // Validate username and email uniqueness
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new ValidationException("Username already exists");
        }
        
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new ValidationException("Email already exists");
        }
        
        // Create user
        User user = userMapper.toEntity(userDto);
        user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
        user.setStatus(User.UserStatus.ACTIVE);
        user.setCreatedBy(createdBy);
        
        // Assign roles from DTO, or use first available role as fallback
        if (userDto.getRoles() != null && !userDto.getRoles().isEmpty()) {
            for (String roleName : userDto.getRoles()) {
                roleRepository.findByName(roleName).ifPresent(user::addRole);
            }
        }
        if (user.getRoles().isEmpty()) {
            roleRepository.findAll().stream().findFirst().ifPresent(user::addRole);
        }
        
        User saved = userRepository.save(user);
        
        log.info("User {} registered successfully by {}", saved.getUsername(), createdBy);

        try {
            et.edu.woldia.coop.entity.UserAdminEvent event = new et.edu.woldia.coop.entity.UserAdminEvent();
            event.setUserId(saved.getId());
            event.setUsername(saved.getUsername());
            event.setEventType(et.edu.woldia.coop.entity.UserAdminEvent.EventType.CREATE_USER);
            event.setPerformedBy(createdBy);
            event.setDescription("User account created: " + saved.getUsername());
            userAdminEventRepository.save(event);
        } catch (Exception ignored) {}

        return userMapper.toDto(saved);
    }
    
    /**
     * Refresh JWT token
     */
    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtUtil.extractUsername(refreshToken);
        
        User user = userRepository.findByUsernameWithRoles(username)
            .orElseThrow(() -> new ValidationException("User not found"));
        
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername(user.getUsername())
            .password(user.getPasswordHash())
            .authorities(user.getRoles().stream()
                .map(role -> "ROLE_" + role.getName())
                .toArray(String[]::new))
            .build();
        
        if (!jwtUtil.validateToken(refreshToken, userDetails)) {
            throw new ValidationException("Invalid refresh token");
        }
        
        String newToken = jwtUtil.generateToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);
        
        Set<String> roles = user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toSet());
        
        return new AuthResponse(newToken, newRefreshToken, user.getUsername(), roles);
    }
}
