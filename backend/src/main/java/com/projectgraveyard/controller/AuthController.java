package com.projectgraveyard.controller;

import com.projectgraveyard.dto.request.LoginRequest;
import com.projectgraveyard.dto.request.RegisterRequest;
import com.projectgraveyard.dto.response.ApiResponse;
import com.projectgraveyard.dto.response.AuthResponse;
import com.projectgraveyard.dto.response.UserResponse;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "User logged in successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<UserResponse>builder()
                            .success(false)
                            .message("No active session found")
                            .build());
        }
        UserResponse response = authService.mapToUserResponse(currentUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Current user details fetched"));
    }
}
