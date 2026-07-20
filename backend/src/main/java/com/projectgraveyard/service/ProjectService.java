package com.projectgraveyard.service;

import com.projectgraveyard.dto.request.CompanyProjectRequest;
import com.projectgraveyard.dto.request.ProjectRequest;
import com.projectgraveyard.dto.response.AdminProjectResponse;
import com.projectgraveyard.dto.response.MyProjectResponse;
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
            ListingType listingType,
            Long creatorId,
            Pageable pageable
    ) {
        log.info("Searching projects keyword={}, category={}, status={}, listingType={}, creator={}",
                search, category, status, listingType, creatorId);

        Page<Project> projects = projectRepository.findProjects(
                search, category, status, listingType, creatorId, pageable
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
        log.info("Creating project '{}' by {}", request.getTitle(), creator.getEmail());

        if (request.getImageUrls() == null || request.getImageUrls().isEmpty()) {
            throw new AppException(ErrorCode.IMAGE_URLS_REQUIRED);
        }

        // Users may only post incomplete community projects
        if (creator.getRole() != Role.ADMIN) {
            if (request.getGithubUrl() == null || request.getGithubUrl().isBlank()) {
                throw new AppException(ErrorCode.GITHUB_URL_REQUIRED);
            }

            Project project = Project.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .category(request.getCategory())
                    .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.DEVELOPING)
                    .skillsNeeded(request.getSkillsNeeded())
                    .techStack(request.getTechStack())
                    .creator(creator)
                    .teamSize(request.getTeamSize() > 0 ? request.getTeamSize() : 1)
                    .currentMembers(1)
                    .progress(request.getCompletionPercent() != null ? request.getCompletionPercent() : request.getProgress())
                    .imageUrl(request.getImageUrls().get(0))
                    .imageUrls(request.getImageUrls())
                    .collaborationMode(request.getCollaborationMode() != null
                            ? request.getCollaborationMode()
                            : CollaborationMode.SELL_USAGE_RIGHTS)
                    .price(request.getPrice())
                    .equitySplit(request.getEquitySplit())
                    .approved(false)
                    .listingType(ListingType.USER_INCOMPLETE_PROJECT)
                    .completionStatus(CompletionStatus.INCOMPLETE)
                    .completionPercent(request.getCompletionPercent())
                    .completedParts(request.getCompletedParts())
                    .missingParts(request.getMissingParts())
                    .currentStage(request.getCurrentStage())
                    .githubUrl(request.getGithubUrl())
                    .licenseType(request.getLicenseType())
                    .demoUrl(request.getDemoUrl())
                    .supportDays(request.getSupportDays())
                    .estimatedPriceLow(request.getEstimatedPriceLow())
                    .estimatedPriceSuggested(request.getEstimatedPriceSuggested())
                    .estimatedPriceHigh(request.getEstimatedPriceHigh())
                    .valuationScore(request.getValuationScore())
                    .valuationConfidence(request.getValuationConfidence())
                    .valuationNote(request.getValuationNote())
                    .reviewStatus(ReviewStatus.PENDING_REVIEW)
                    .soldCount(0)
                    .build();

            return saveWithOwner(project);
        }

        // Admin creating via /api/projects (prefer company endpoint)
        boolean isCompany = request.getListingType() == ListingType.COMPANY_PROJECT;
        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.DEVELOPING)
                .skillsNeeded(request.getSkillsNeeded())
                .techStack(request.getTechStack())
                .creator(creator)
                .teamSize(1)
                .currentMembers(1)
                .progress(isCompany ? 100 : (request.getCompletionPercent() != null ? request.getCompletionPercent() : request.getProgress()))
                .imageUrl(request.getImageUrls().get(0))
                .imageUrls(request.getImageUrls())
                .collaborationMode(CollaborationMode.SELL_USAGE_RIGHTS)
                .price(request.getPrice())
                .approved(true)
                .listingType(isCompany ? ListingType.COMPANY_PROJECT : ListingType.USER_INCOMPLETE_PROJECT)
                .completionStatus(isCompany ? CompletionStatus.COMPLETED : CompletionStatus.INCOMPLETE)
                .completionPercent(isCompany ? 100 : request.getCompletionPercent())
                .completedParts(request.getCompletedParts())
                .missingParts(request.getMissingParts())
                .currentStage(request.getCurrentStage())
                .githubUrl(request.getGithubUrl())
                .licenseType(request.getLicenseType())
                .demoUrl(request.getDemoUrl())
                .supportDays(request.getSupportDays())
                .estimatedPriceLow(request.getEstimatedPriceLow())
                .estimatedPriceSuggested(request.getEstimatedPriceSuggested())
                .estimatedPriceHigh(request.getEstimatedPriceHigh())
                .valuationScore(request.getValuationScore())
                .valuationConfidence(request.getValuationConfidence())
                .valuationNote(request.getValuationNote())
                .reviewStatus(ReviewStatus.APPROVED)
                .soldCount(0)
                .build();

        return saveWithOwner(project);
    }

    @Transactional
    public ProjectResponse createCompanyProject(CompanyProjectRequest request, User admin) {
        if (admin == null || admin.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        if (request.getImageUrls() == null || request.getImageUrls().isEmpty()) {
            throw new AppException(ErrorCode.IMAGE_URLS_REQUIRED);
        }

        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new AppException(ErrorCode.INVALID_PRICE);
        }

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(ProjectStatus.DEVELOPING)
                .techStack(request.getTechStack())
                .creator(admin)
                .teamSize(1)
                .currentMembers(1)
                .progress(100)
                .imageUrl(request.getImageUrls().get(0))
                .imageUrls(request.getImageUrls())
                .collaborationMode(CollaborationMode.SELL_USAGE_RIGHTS)
                .price(request.getPrice())
                .approved(true)
                .listingType(ListingType.COMPANY_PROJECT)
                .completionStatus(CompletionStatus.COMPLETED)
                .completionPercent(100)
                .demoUrl(request.getDemoUrl())
                .githubUrl(null)
                .companyName(request.getCompanyName())
                .companyWebsite(request.getCompanyWebsite())
                .companyEmail(request.getCompanyEmail())
                .companyPhone(request.getCompanyPhone())
                .reviewStatus(ReviewStatus.APPROVED)
                .soldCount(0)
                .build();

        log.info("Admin {} created company project '{}'", admin.getEmail(), request.getTitle());
        return saveWithOwner(project);
    }

    public List<AdminProjectResponse> getPendingProjects() {
        return projectRepository.findPendingUserProjects().stream()
                .map(this::mapToAdminProjectResponse)
                .collect(Collectors.toList());
    }

    public List<AdminProjectResponse> getProjectsByReviewStatus(ReviewStatus status) {
        return projectRepository.findByReviewStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToAdminProjectResponse)
                .collect(Collectors.toList());
    }

    public AdminProjectResponse getAdminProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
        return mapToAdminProjectResponse(project);
    }

    @Transactional
    public AdminProjectResponse approveProject(Long id, User admin) {
        requireAdmin(admin);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        if (project.getReviewStatus() != ReviewStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.PROJECT_NOT_PENDING);
        }

        project.setApproved(true);
        project.setReviewStatus(ReviewStatus.APPROVED);
        project.setRejectionReason(null);
        project = projectRepository.save(project);
        log.info("Project {} approved by {}", id, admin.getEmail());
        return mapToAdminProjectResponse(project);
    }

    @Transactional
    public AdminProjectResponse rejectProject(Long id, String reason, User admin) {
        requireAdmin(admin);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        if (project.getReviewStatus() != ReviewStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.PROJECT_NOT_PENDING);
        }

        project.setApproved(false);
        project.setReviewStatus(ReviewStatus.REJECTED);
        project.setRejectionReason(reason);
        project = projectRepository.save(project);
        log.info("Project {} rejected by {}", id, admin.getEmail());
        return mapToAdminProjectResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, User currentUser) {
        log.info("Updating project ID: {} by user: {}", id, currentUser.getEmail());

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        if (!project.getCreator().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.NOT_PROJECT_OWNER);
        }

        if (request.getImageUrls() == null || request.getImageUrls().isEmpty()) {
            throw new AppException(ErrorCode.IMAGE_URLS_REQUIRED);
        }

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setCategory(request.getCategory());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        project.setSkillsNeeded(request.getSkillsNeeded());
        project.setTechStack(request.getTechStack());
        if (request.getTeamSize() > 0) {
            project.setTeamSize(request.getTeamSize());
        }
        project.setImageUrl(request.getImageUrls().get(0));
        project.setImageUrls(request.getImageUrls());
        if (request.getCollaborationMode() != null) {
            project.setCollaborationMode(request.getCollaborationMode());
        }
        project.setPrice(request.getPrice());
        project.setEquitySplit(request.getEquitySplit());

        // Users cannot change listing type or mark as completed
        if (currentUser.getRole() == Role.ADMIN) {
            if (request.getListingType() != null) {
                project.setListingType(request.getListingType());
            }
            if (request.getCompletionStatus() != null) {
                project.setCompletionStatus(request.getCompletionStatus());
            }
        } else {
            project.setListingType(ListingType.USER_INCOMPLETE_PROJECT);
            project.setCompletionStatus(CompletionStatus.INCOMPLETE);
            if (request.getGithubUrl() == null || request.getGithubUrl().isBlank()) {
                throw new AppException(ErrorCode.GITHUB_URL_REQUIRED);
            }
            // Re-submit for review after edit
            project.setApproved(false);
            project.setReviewStatus(ReviewStatus.PENDING_REVIEW);
            project.setRejectionReason(null);
        }

        project.setCompletionPercent(request.getCompletionPercent());
        if (request.getCompletionPercent() != null) {
            project.setProgress(request.getCompletionPercent());
        }
        project.setCompletedParts(request.getCompletedParts());
        project.setMissingParts(request.getMissingParts());
        project.setCurrentStage(request.getCurrentStage());
        project.setGithubUrl(request.getGithubUrl());
        project.setLicenseType(request.getLicenseType());
        project.setDemoUrl(request.getDemoUrl());
        project.setSupportDays(request.getSupportDays());
        project.setEstimatedPriceLow(request.getEstimatedPriceLow());
        project.setEstimatedPriceSuggested(request.getEstimatedPriceSuggested());
        project.setEstimatedPriceHigh(request.getEstimatedPriceHigh());
        project.setValuationScore(request.getValuationScore());
        project.setValuationConfidence(request.getValuationConfidence());
        project.setValuationNote(request.getValuationNote());

        project = projectRepository.save(project);
        return mapToProjectResponse(project);
    }

    @Transactional
    public void deleteProject(Long id, User currentUser) {
        log.info("Deleting project ID: {} by user: {}", id, currentUser.getEmail());

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        if (!project.getCreator().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        List<ProjectMember> members = projectMemberRepository.findByProjectId(id);
        projectMemberRepository.deleteAll(members);

        projectRepository.delete(project);
        log.info("Project deleted successfully. ID: {}", id);
    }

    @Transactional
    public ProjectMemberResponse joinProject(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        if (projectMemberRepository.existsByProjectAndUser(project, currentUser)) {
            throw new AppException(ErrorCode.ALREADY_MEMBER);
        }

        if (project.getCurrentMembers() >= project.getTeamSize()) {
            throw new AppException(ErrorCode.TEAM_FULL);
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(currentUser)
                .role("MEMBER")
                .build();
        member = projectMemberRepository.save(member);

        project.setCurrentMembers(project.getCurrentMembers() + 1);
        projectRepository.save(project);

        return mapToProjectMemberResponse(member);
    }

    public List<ProjectMemberResponse> getProjectMembers(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new AppException(ErrorCode.PROJECT_NOT_FOUND);
        }
        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(this::mapToProjectMemberResponse)
                .collect(Collectors.toList());
    }

    public List<MyProjectResponse> getMyProjects(User currentUser) {
        return projectRepository.findByCreatorId(currentUser.getId()).stream()
                .map(this::mapToMyProjectResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse saveWithOwner(Project project) {
        project = projectRepository.save(project);

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(project.getCreator())
                .role("OWNER")
                .build();
        projectMemberRepository.save(member);

        log.info("Project created successfully with ID: {}", project.getId());
        return mapToProjectResponse(project);
    }

    private void requireAdmin(User user) {
        if (user == null || user.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    public ProjectResponse mapToProjectResponse(Project project) {
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
                .soldCount(project.getSoldCount())
                .sellerType(project.getSellerType())
                .listingType(project.getListingType())
                .completionStatus(project.getCompletionStatus())
                .completionPercent(project.getCompletionPercent())
                .completedParts(project.getCompletedParts())
                .missingParts(project.getMissingParts())
                .currentStage(project.getCurrentStage())
                .licenseType(project.getLicenseType())
                .demoUrl(project.getDemoUrl())
                .estimatedPriceLow(project.getEstimatedPriceLow())
                .estimatedPriceSuggested(project.getEstimatedPriceSuggested())
                .estimatedPriceHigh(project.getEstimatedPriceHigh())
                .valuationScore(project.getValuationScore())
                .valuationConfidence(project.getValuationConfidence())
                .valuationNote(project.getValuationNote())
                .companyName(project.getCompanyName())
                .companyWebsite(project.getCompanyWebsite())
                .companyEmail(project.getCompanyEmail())
                .companyPhone(project.getCompanyPhone())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    /** Owner-only listing view: includes rejectionReason, never githubUrl */
    private MyProjectResponse mapToMyProjectResponse(Project project) {
        if (project == null) return null;
        return MyProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .category(project.getCategory())
                .techStack(project.getTechStack())
                .imageUrls(project.getImageUrls())
                .price(project.getPrice())
                .listingType(project.getListingType())
                .completionStatus(project.getCompletionStatus())
                .completionPercent(project.getCompletionPercent())
                .completedParts(project.getCompletedParts())
                .missingParts(project.getMissingParts())
                .currentStage(project.getCurrentStage())
                .reviewStatus(project.getReviewStatus())
                .approved(project.isApproved())
                .rejectionReason(project.getRejectionReason())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public AdminProjectResponse mapToAdminProjectResponse(Project project) {
        if (project == null) return null;
        return AdminProjectResponse.builder()
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
                .demoUrl(project.getDemoUrl())
                .estimatedPriceLow(project.getEstimatedPriceLow())
                .estimatedPriceSuggested(project.getEstimatedPriceSuggested())
                .estimatedPriceHigh(project.getEstimatedPriceHigh())
                .valuationScore(project.getValuationScore())
                .valuationConfidence(project.getValuationConfidence())
                .valuationNote(project.getValuationNote())
                .companyName(project.getCompanyName())
                .companyWebsite(project.getCompanyWebsite())
                .companyEmail(project.getCompanyEmail())
                .companyPhone(project.getCompanyPhone())
                .githubUrl(project.getGithubUrl())
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
