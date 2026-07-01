package com.projectgraveyard.service;

import com.projectgraveyard.dto.request.LoginRequest;
import com.projectgraveyard.dto.request.RegisterRequest;
import com.projectgraveyard.dto.response.AuthResponse;
import com.projectgraveyard.dto.response.UserResponse;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.enums.AccountType;
import com.projectgraveyard.enums.ErrorCode;
import com.projectgraveyard.enums.Role;
import com.projectgraveyard.exception.AppException;
import com.projectgraveyard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Processing user registration for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("Registration failed: Email already exists: {}", request.getEmail());
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .accountType(AccountType.FREE)
                .verified(false)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully. ID: {}", user.getId());

        String token = jwtService.generateAccessToken(user);
        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Processing login request for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("Login failed: User not found with email: {}", request.getEmail());
                    return new AppException(ErrorCode.INVALID_EMAIL_OR_PASSWORD);
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.error("Login failed: Password mismatch for email: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_EMAIL_OR_PASSWORD);
        }

        log.info("User logged in successfully. ID: {}", user.getId());
        String token = jwtService.generateAccessToken(user);
        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    public UserResponse mapToUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .location(user.getLocation())
                .university(user.getUniversity())
                .role(user.getRole())
                .accountType(user.getAccountType())
                .verified(user.isVerified())
                .skills(user.getSkills())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
