package com.projectgraveyard.controller;

import com.projectgraveyard.dto.request.CompanyProjectRequest;
import com.projectgraveyard.dto.request.RejectRequest;
import com.projectgraveyard.dto.response.AdminProjectResponse;
import com.projectgraveyard.dto.response.ApiResponse;
import com.projectgraveyard.dto.response.OrderResponse;
import com.projectgraveyard.dto.response.ProjectResponse;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.enums.ErrorCode;
import com.projectgraveyard.enums.ReviewStatus;
import com.projectgraveyard.enums.Role;
import com.projectgraveyard.exception.AppException;
import com.projectgraveyard.service.OrderService;
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
    private final OrderService orderService;

    @GetMapping("/projects/pending")
    public ResponseEntity<ApiResponse<List<AdminProjectResponse>>> getPendingProjects(
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        return ResponseEntity.ok(ApiResponse.success(projectService.getPendingProjects()));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<AdminProjectResponse>>> getProjectsByStatus(
            @RequestParam ReviewStatus reviewStatus,
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectsByReviewStatus(reviewStatus)));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<AdminProjectResponse>> getAdminProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        return ResponseEntity.ok(ApiResponse.success(projectService.getAdminProjectById(id)));
    }

    @PatchMapping("/projects/{id}/approve")
    public ResponseEntity<ApiResponse<AdminProjectResponse>> approveProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        AdminProjectResponse response = projectService.approveProject(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Project approved"));
    }

    @PatchMapping("/projects/{id}/reject")
    public ResponseEntity<ApiResponse<AdminProjectResponse>> rejectProject(
            @PathVariable Long id,
            @Valid @RequestBody RejectRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        AdminProjectResponse response = projectService.rejectProject(id, request.getReason(), currentUser);
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

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(currentUser)));
    }

    @PatchMapping("/orders/{id}/complete")
    public ResponseEntity<ApiResponse<OrderResponse>> completeOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        return ResponseEntity.ok(ApiResponse.success(
                orderService.completeOrder(id, currentUser),
                "Order completed"
        ));
    }

    private void requireAdmin(User user) {
        if (user == null || user.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }
}
