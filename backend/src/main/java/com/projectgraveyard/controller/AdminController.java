package com.projectgraveyard.controller;

import com.projectgraveyard.dto.request.CompanyProjectRequest;
import com.projectgraveyard.dto.request.RejectRequest;
import com.projectgraveyard.dto.response.ApiResponse;
import com.projectgraveyard.dto.response.ProjectResponse;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.enums.ErrorCode;
import com.projectgraveyard.enums.UserRole;
import com.projectgraveyard.exception.AppException;
import com.projectgraveyard.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProjectService projectService;

    private void requireAdmin(User user) {
        if (user == null || user.getRole() != UserRole.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    @GetMapping("/projects/pending")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getPendingProjects(
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        List<ProjectResponse> response = projectService.getAdminPendingProjects();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/projects/{id}/approve")
    public ResponseEntity<ApiResponse<ProjectResponse>> approveProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        ProjectResponse response = projectService.approveProject(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Project approved"));
    }

    @PatchMapping("/projects/{id}/reject")
    public ResponseEntity<ApiResponse<ProjectResponse>> rejectProject(
            @PathVariable Long id,
            @RequestBody RejectRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        ProjectResponse response = projectService.rejectProject(id, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(response, "Project rejected"));
    }

    @PostMapping("/company-projects")
    public ResponseEntity<ApiResponse<ProjectResponse>> createCompanyProject(
            @Valid @RequestBody CompanyProjectRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        ProjectResponse response = projectService.createCompanyProject(request, currentUser);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Company project created"));
    }

    @GetMapping("/company-projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getCompanyProjects(
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        List<ProjectResponse> response = projectService.getCompanyProjects();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
