package com.projectgraveyard.controller;

import com.projectgraveyard.dto.request.ProjectRequest;
import com.projectgraveyard.dto.response.ApiResponse;
import com.projectgraveyard.dto.response.MyProjectResponse;
import com.projectgraveyard.dto.response.ProjectMemberResponse;
import com.projectgraveyard.dto.response.ProjectResponse;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.enums.ListingType;
import com.projectgraveyard.enums.ProjectCategory;
import com.projectgraveyard.enums.ProjectStatus;
import com.projectgraveyard.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProjectCategory category,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) ListingType listingType,
            @RequestParam(required = false) Long creatorId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ProjectResponse> response = projectService.getProjects(
                search, category, status, listingType, creatorId, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<MyProjectResponse>>> getMyProjects(
            @AuthenticationPrincipal User currentUser
    ) {
        List<MyProjectResponse> response = projectService.getMyProjects(currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Long id) {
        ProjectResponse response = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        ProjectResponse response = projectService.createProject(request, currentUser);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Project created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        ProjectResponse response = projectService.updateProject(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Project updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted successfully"));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> joinProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        ProjectMemberResponse response = projectService.joinProject(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Joined project successfully"));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> getProjectMembers(@PathVariable Long id) {
        List<ProjectMemberResponse> response = projectService.getProjectMembers(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
