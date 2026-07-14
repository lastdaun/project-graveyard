package com.projectgraveyard.service;

import com.projectgraveyard.dto.request.ProjectRequest;
import com.projectgraveyard.dto.response.ProjectMemberResponse;
import com.projectgraveyard.dto.response.ProjectResponse;
import com.projectgraveyard.dto.response.UserResponse;
import com.projectgraveyard.entity.Project;
import com.projectgraveyard.entity.ProjectMember;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.enums.*;
import com.projectgraveyard.exception.AppException;
import com.projectgraveyard.repository.ProjectMemberRepository;
import com.projectgraveyard.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public Page<ProjectResponse> getProjects(
            String search,
            ProjectCategory category,
            ProjectStatus status,
            CollaborationMode collaborationMode,
            Long creatorId,
            Pageable pageable
    ) {
        log.info("Searching projects with keyword: {}, category: {}, status: {}, mode: {}, creator: {}",
                search, category, status, collaborationMode, creatorId);
        
        Page<Project> projects = projectRepository.findProjects(
                search, category, status, collaborationMode, creatorId, pageable
        );
        
        return projects.map(this::mapToProjectResponse);
    }

    public ProjectResponse getProjectById(Long id) {
        log.info("Fetching details for project ID: {}", id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
        return mapToProjectResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, User creator) {
        log.info("Creating new project: '{}' by creator: {}", request.getTitle(), creator.getEmail());

        // For regular users, force listingType to USER_PROJECT, approved=false, and PENDING_REVIEW
        ListingType finalListingType = creator.getRole() == Role.ADMIN ? request.getListingType() : ListingType.USER_PROJECT;
        if (finalListingType == null) {
            finalListingType = ListingType.USER_PROJECT;
        }

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(request.getStatus())
                .skillsNeeded(request.getSkillsNeeded())
                .techStack(request.getTechStack())
                .creator(creator)
                .teamSize(request.getTeamSize() > 0 ? request.getTeamSize() : 5)
                .currentMembers(1) // Creator joins automatically
                .progress(request.getProgress())
                .imageUrl(request.getImageUrl())
                .imageUrls(request.getImageUrls())
                .collaborationMode(request.getCollaborationMode())
                .price(request.getPrice())
                .equitySplit(request.getEquitySplit())
                .approved(false)
                .sellerType(request.getSellerType())
                .listingType(finalListingType)
                .completionStatus(request.getCompletionStatus())
                .completionPercent(request.getCompletionPercent())
                .completedParts(request.getCompletedParts())
                .missingParts(request.getMissingParts())
                .currentStage(request.getCurrentStage())
                .githubUrl(request.getGithubUrl())
                .licenseType(request.getLicenseType())
                .demoUrl(request.getDemoUrl())
                .supportDays(request.getSupportDays())
                .reviewStatus(ReviewStatus.PENDING_REVIEW)
                .soldCount(0)
                .build();

        project = projectRepository.save(project);

        // Add creator as OWNER in the project member table
        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(creator)
                .role("OWNER")
                .build();
        projectMemberRepository.save(member);

        log.info("Project created successfully with ID: {}", project.getId());
        return mapToProjectResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, User currentUser) {
        log.info("Updating project ID: {} by user: {}", id, currentUser.getEmail());

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        // Security check: only project creator can modify
        if (!project.getCreator().getId().equals(currentUser.getId())) {
            log.error("Update failed: User is not the project owner. Creator ID: {}, Current User ID: {}",
                    project.getCreator().getId(), currentUser.getId());
            throw new AppException(ErrorCode.NOT_PROJECT_OWNER);
        }

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setCategory(request.getCategory());
        project.setStatus(request.getStatus());
        project.setSkillsNeeded(request.getSkillsNeeded());
        project.setTechStack(request.getTechStack());
        project.setTeamSize(request.getTeamSize());
        project.setProgress(request.getProgress());
        project.setImageUrl(request.getImageUrl());
        project.setImageUrls(request.getImageUrls());
        project.setCollaborationMode(request.getCollaborationMode());
        project.setPrice(request.getPrice());
        project.setEquitySplit(request.getEquitySplit());
        project.setSellerType(request.getSellerType());
        // For regular users, prevent changing listingType to COMPANY_PROJECT
        if (currentUser.getRole() == Role.ADMIN) {
            project.setListingType(request.getListingType());
        }
        project.setCompletionStatus(request.getCompletionStatus());
        project.setCompletionPercent(request.getCompletionPercent());
        project.setCompletedParts(request.getCompletedParts());
        project.setMissingParts(request.getMissingParts());
        project.setCurrentStage(request.getCurrentStage());
        project.setGithubUrl(request.getGithubUrl());
        project.setLicenseType(request.getLicenseType());
        project.setDemoUrl(request.getDemoUrl());
        project.setSupportDays(request.getSupportDays());

        project = projectRepository.save(project);
        log.info("Project updated successfully. ID: {}", project.getId());
        return mapToProjectResponse(project);
    }

    @Transactional
    public void deleteProject(Long id, User currentUser) {
        log.info("Deleting project ID: {} by user: {}", id, currentUser.getEmail());

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        // Only creator or admin can delete
        if (!project.getCreator().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            log.error("Delete failed: Unauthorized. Creator ID: {}, Current User ID: {}",
                    project.getCreator().getId(), currentUser.getId());
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // Delete membership entries first
        List<ProjectMember> members = projectMemberRepository.findByProjectId(id);
        projectMemberRepository.deleteAll(members);

        projectRepository.delete(project);
        log.info("Project deleted successfully. ID: {}", id);
    }

    @Transactional
    public ProjectMemberResponse joinProject(Long projectId, User currentUser) {
        log.info("User {} requesting to join project ID: {}", currentUser.getEmail(), projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        if (projectMemberRepository.existsByProjectAndUser(project, currentUser)) {
            log.warn("Join failed: User already a member. User: {}, Project ID: {}", currentUser.getEmail(), projectId);
            throw new AppException(ErrorCode.ALREADY_MEMBER);
        }

        if (project.getCurrentMembers() >= project.getTeamSize()) {
            log.error("Join failed: Team is full. Current members: {}, Capacity: {}",
                    project.getCurrentMembers(), project.getTeamSize());
            throw new AppException(ErrorCode.TEAM_FULL);
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(currentUser)
                .role("MEMBER")
                .build();
        member = projectMemberRepository.save(member);

        // Increment member count on project
        project.setCurrentMembers(project.getCurrentMembers() + 1);
        projectRepository.save(project);

        log.info("User successfully joined the project. Member entry ID: {}", member.getId());
        return mapToProjectMemberResponse(member);
    }

    public List<ProjectMemberResponse> getProjectMembers(Long projectId) {
        log.info("Fetching members for project ID: {}", projectId);
        if (!projectRepository.existsById(projectId)) {
            throw new AppException(ErrorCode.PROJECT_NOT_FOUND);
        }
        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(this::mapToProjectMemberResponse)
                .collect(Collectors.toList());
    }

    public List<ProjectResponse> getMyProjects(User currentUser) {
        log.info("Fetching my projects for user: {}", currentUser.getEmail());
        List<Project> projects = projectRepository.findByCreatorId(currentUser.getId());
        return projects.stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse mapToProjectResponse(Project project) {
        if (project == null) return null;
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .category(project.getCategory())
                .status(project.getStatus())
                .skillsNeeded(project.getSkillsNeeded())
                .techStack(project.getTechStack())
                .creator(mapToUserResponse(project.getCreator()))
                .teamSize(project.getTeamSize())
                .currentMembers(project.getCurrentMembers())
                .progress(project.getProgress())
                .imageUrl(project.getImageUrl())
                .imageUrls(project.getImageUrls())
                .collaborationMode(project.getCollaborationMode())
                .price(project.getPrice())
                .equitySplit(project.getEquitySplit())
                .approved(project.isApproved())
                .reviewStatus(project.getReviewStatus())
                .rejectionReason(project.getRejectionReason())
                .soldCount(project.getSoldCount())
                .sellerType(project.getSellerType())
                .listingType(project.getListingType())
                .completionStatus(project.getCompletionStatus())
                .completionPercent(project.getCompletionPercent())
                .completedParts(project.getCompletedParts())
                .missingParts(project.getMissingParts())
                .currentStage(project.getCurrentStage())
                .licenseType(project.getLicenseType())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private ProjectMemberResponse mapToProjectMemberResponse(ProjectMember member) {
        if (member == null) return null;
        return ProjectMemberResponse.builder()
                .id(member.getId())
                .user(mapToUserResponse(member.getUser()))
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
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
