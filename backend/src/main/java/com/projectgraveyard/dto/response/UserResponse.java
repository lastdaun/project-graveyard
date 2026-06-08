package com.projectgraveyard.dto.response;

import com.projectgraveyard.enums.AccountType;
import com.projectgraveyard.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String avatar;
    private String bio;
    private String location;
    private String university;
    private UserRole role;
    private AccountType accountType;
    private boolean verified;
    private List<String> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
