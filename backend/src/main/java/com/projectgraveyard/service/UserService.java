package com.projectgraveyard.service;

import com.projectgraveyard.dto.request.UpdateProfileRequest;
import com.projectgraveyard.dto.response.UserResponse;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.enums.ErrorCode;
import com.projectgraveyard.exception.AppException;
import com.projectgraveyard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUserProfile(Long id) {
        log.info("Fetching profile for user ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User not found with id: " + id));
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Long id, UpdateProfileRequest request) {
        log.info("Updating profile for user ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User not found with id: " + id));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }
        if (request.getUniversity() != null) {
            user.setUniversity(request.getUniversity());
        }
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }

        user = userRepository.save(user);
        log.info("User profile updated successfully. ID: {}", user.getId());
        return mapToUserResponse(user);
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
