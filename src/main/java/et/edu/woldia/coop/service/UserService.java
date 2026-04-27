package et.edu.woldia.coop.service;

import et.edu.woldia.coop.dto.UserDto;
import et.edu.woldia.coop.entity.User;
import et.edu.woldia.coop.exception.ResourceNotFoundException;
import et.edu.woldia.coop.exception.ValidationException;
import et.edu.woldia.coop.mapper.UserMapper;
import et.edu.woldia.coop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for user management operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final et.edu.woldia.coop.repository.UserAdminEventRepository userAdminEventRepository;

    private void recordEvent(java.util.UUID userId, String username,
                             et.edu.woldia.coop.entity.UserAdminEvent.EventType type,
                             String performedBy, String description) {
        try {
            et.edu.woldia.coop.entity.UserAdminEvent event = new et.edu.woldia.coop.entity.UserAdminEvent();
            event.setUserId(userId);
            event.setUsername(username);
            event.setEventType(type);
            event.setPerformedBy(performedBy);
            event.setDescription(description);
            userAdminEventRepository.save(event);
        } catch (Exception ignored) {}
    }
    
    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
            .map(userMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get all users — paginated
     */
    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsersPaged(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }
    
    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return userMapper.toDto(user);
    }
    
    /**
     * Get user by username
     */
    @Transactional(readOnly = true)
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return userMapper.toDto(user);
    }
    
    /**
     * Update user
     */
    @Transactional
    public UserDto updateUser(UUID id, UserDto userDto, String updatedBy) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        
        // Update fields
        if (userDto.getEmail() != null && !userDto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDto.getEmail())) {
                throw new ValidationException("Email already exists");
            }
            user.setEmail(userDto.getEmail());
        }

        if (userDto.getUsername() != null && !userDto.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(userDto.getUsername())) {
                throw new ValidationException("Username already exists");
            }
            user.setUsername(userDto.getUsername());
        }
        
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
        }
        
        if (userDto.getStatus() != null) {
            user.setStatus(User.UserStatus.valueOf(userDto.getStatus()));
        }
        
        user.setUpdatedBy(updatedBy);
        
        User updated = userRepository.save(user);
        
        log.info("User {} updated by {}", user.getUsername(), updatedBy);

        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            recordEvent(id, updated.getUsername(), et.edu.woldia.coop.entity.UserAdminEvent.EventType.PASSWORD_CHANGE,
                updatedBy, "Password changed for user " + updated.getUsername());
        } else {
            recordEvent(id, updated.getUsername(), et.edu.woldia.coop.entity.UserAdminEvent.EventType.UPDATE_PROFILE,
                updatedBy, "User profile updated: " + updated.getUsername());
        }

        return userMapper.toDto(updated);
    }
    
    /**
     * Delete user (soft delete — sets status to INACTIVE)
     */
    @Transactional
    public void deleteUser(UUID id, String deletedBy) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        
        user.setStatus(User.UserStatus.INACTIVE);
        user.setUpdatedBy(deletedBy);
        userRepository.save(user);
        
        log.info("User {} soft-deleted by {}", user.getUsername(), deletedBy);

        recordEvent(id, user.getUsername(), et.edu.woldia.coop.entity.UserAdminEvent.EventType.DEACTIVATE,
            deletedBy, "User deactivated (soft delete): " + user.getUsername());
    }
    
    /**
     * Activate user
     */
    @Transactional
    public void activateUser(UUID id, String activatedBy) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        
        user.setStatus(User.UserStatus.ACTIVE);
        user.setUpdatedBy(activatedBy);
        userRepository.save(user);
        
        log.info("User {} activated by {}", user.getUsername(), activatedBy);

        recordEvent(id, user.getUsername(), et.edu.woldia.coop.entity.UserAdminEvent.EventType.ACTIVATE,
            activatedBy, "User activated: " + user.getUsername());
    }
    
    /**
     * Deactivate user
     */
    @Transactional
    public void deactivateUser(UUID id, String deactivatedBy) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        
        user.setStatus(User.UserStatus.INACTIVE);
        user.setUpdatedBy(deactivatedBy);
        userRepository.save(user);
        
        log.info("User {} deactivated by {}", user.getUsername(), deactivatedBy);

        recordEvent(id, user.getUsername(), et.edu.woldia.coop.entity.UserAdminEvent.EventType.DEACTIVATE,
            deactivatedBy, "User deactivated: " + user.getUsername());
    }
}
