package com.projectgraveyard.service;

import com.projectgraveyard.dto.request.CompanyProjectRequest;
import com.projectgraveyard.dto.request.ProjectRequest;
import com.projectgraveyard.dto.response.ProjectMemberResponse;
import com.projectgraveyard.dto.response.ProjectResponse;
import com.projectgraveyard.dto.response.UserResponse;
import com.projectgraveyard.entity.Project;
import com.projectgraveyard.entity.ProjectMember;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.enums.CollaborationMode;
import com.projectgraveyard.enums.ErrorCode;
import com.projectgraveyard.enums.ProjectCategory;
import com.projectgraveyard.enums.ProjectStatus;
import com.projectgraveyard.enums.UserRole;
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
            String listingType,
            Pageable pageable
    ) {
        log.info("Searching projects with keyword: {}, category: {}, status: {}, mode: {}, creator: {}, listingType: {}",
                search, category, status, collaborationMode, creatorId, listingType);

        Page<Project> projects = projectRepository.findProjects(
                search, category, status, collaborationMode, creatorId, listingType, pageable
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
        log.info("Creating new abandoned project: '{}' by creator: {}", request.getTitle(), creator.getEmail());

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(request.getStatus())
                .skillsNeeded(request.getSkillsNeeded())
                .techStack(request.getTechStack())
                .creator(creator)
                .teamSize(request.getTeamSize() > 0 ? request.getTeamSize() : 1)
                .currentMembers(1)
                .progress(request.getProgress())
                .imageUrl(request.getImageUrl())
                .collaborationMode(request.getCollaborationMode() != null
                        ? request.getCollaborationMode()
                        : CollaborationMode.FIND_COFOUNDER)
                .price(request.getPrice())
                .equitySplit(request.getEquitySplit())
                .approved(false)
                .listingType("ABANDONED_PROJECT")
                .licenseType(request.getLicenseType())
                .reviewStatus("PENDING_REVIEW")
                .soldCount(0)
                .demoUrl(request.getDemoUrl())
                .supportDays(request.getSupportDays())
                .projectStage(request.getProjectStage())
                .completionPercent(request.getCompletionPercent())
                .completedParts(request.getCompletedParts())
                .missingParts(request.getMissingParts())
                .handoverType(request.getHandoverType())
                .lookingFor(request.getLookingFor())
                .estimatedPriceLow(request.getEstimatedPriceLow())
                .estimatedPriceSuggested(request.getEstimatedPriceSuggested())
                .estimatedPriceHigh(request.getEstimatedPriceHigh())
                .valuationScore(request.getValuationScore())
                .valuationConfidence(request.getValuationConfidence())
                .valuationNote(request.getValuationNote())
                .build();

        project = projectRepository.save(project);

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(creator)
                .role("OWNER")
                .build();
        projectMemberRepository.save(member);

        log.info("Abandoned project created with ID: {}", project.getId());
        return mapToProjectResponse(project);
    }

    @Transactional
    public ProjectResponse createCompanyProject(CompanyProjectRequest request, User admin) {
        log.info("Admin {} creating company showcase: '{}'", admin.getEmail(), request.getTitle());

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
                .imageUrl(request.getImageUrl())
                .collaborationMode(CollaborationMode.SELL_USAGE_RIGHTS)
                .price(request.getPrice())
                .approved(true)
                .listingType("COMPANY_SHOWCASE")
                .reviewStatus("APPROVED")
                .soldCount(0)
                .demoUrl(request.getDemoUrl())
                .priceRange(request.getPriceRange())
                .companyName(request.getCompanyName())
                .companyWebsite(request.getCompanyWebsite())
                .companyContactEmail(request.getCompanyContactEmail())
                .companyContactPhone(request.getCompanyContactPhone())
                .companyLogo(request.getCompanyLogo())
                .build();

        project = projectRepository.save(project);
        log.info("Company showcase created with ID: {}", project.getId());
        return mapToProjectResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, User currentUser) {
        log.info("Updating project ID: {} by user: {}", id, currentUser.getEmail());

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        if (!project.getCreator().getId().equals(currentUser.getId())) {
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
        project.setCollaborationMode(request.getCollaborationMode());
        project.setPrice(request.getPrice());
        project.setEquitySplit(request.getEquitySplit());
        project.setLicenseType(request.getLicenseType());
        project.setDemoUrl(request.getDemoUrl());
        project.setSupportDays(request.getSupportDays());
        project.setProjectStage(request.getProjectStage());
        project.setCompletionPercent(request.getCompletionPercent());
        project.setCompletedParts(request.getCompletedParts());
        project.setMissingParts(request.getMissingParts());
        project.setHandoverType(request.getHandoverType());
        project.setLookingFor(request.getLookingFor());
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

        if (!project.getCreator().getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
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

    public List<ProjectResponse> getMyProjects(User currentUser) {
        log.info("Fetching my projects for user: {}", currentUser.getEmail());
        List<ProjectMember> memberships = projectMemberRepository.findByUserId(currentUser.getId());
        return memberships.stream()
                .map(ProjectMember::getProject)
                .distinct()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    // ======== Admin methods ========

    public List<ProjectResponse> getAdminPendingProjects() {
        return projectRepository.findByReviewStatus("PENDING_REVIEW").stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponse approveProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
        project.setApproved(true);
        project.setReviewStatus("APPROVED");
        project.setRejectionReason(null);
        projectRepository.save(project);
        log.info("Project {} approved by admin", id);
        return mapToProjectResponse(project);
    }

    @Transactional
    public ProjectResponse rejectProject(Long id, String reason) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
        project.setApproved(false);
        project.setReviewStatus("REJECTED");
        project.setRejectionReason(reason);
        projectRepository.save(project);
        log.info("Project {} rejected by admin, reason: {}", id, reason);
        return mapToProjectResponse(project);
    }

    public List<ProjectResponse> getCompanyProjects() {
        return projectRepository.findByListingType("COMPANY_SHOWCASE").stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    // ======== Mapping helpers ========

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
                .collaborationMode(project.getCollaborationMode())
                .price(project.getPrice())
                .equitySplit(project.getEquitySplit())
                .approved(project.isApproved())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .listingType(project.getListingType())
                .licenseType(project.getLicenseType())
                .reviewStatus(project.getReviewStatus())
                .rejectionReason(project.getRejectionReason())
                .soldCount(project.getSoldCount())
                .demoUrl(project.getDemoUrl())
                .supportDays(project.getSupportDays())
                .commissionRate(project.getCommissionRate())
                .companyName(project.getCompanyName())
                .companyWebsite(project.getCompanyWebsite())
                .companyContactEmail(project.getCompanyContactEmail())
                .companyContactPhone(project.getCompanyContactPhone())
                .companyLogo(project.getCompanyLogo())
                .priceRange(project.getPriceRange())
                .projectStage(project.getProjectStage())
                .completionPercent(project.getCompletionPercent())
                .completedParts(project.getCompletedParts())
                .missingParts(project.getMissingParts())
                .handoverType(project.getHandoverType())
                .lookingFor(project.getLookingFor())
                .estimatedPriceLow(project.getEstimatedPriceLow())
                .estimatedPriceSuggested(project.getEstimatedPriceSuggested())
                .estimatedPriceHigh(project.getEstimatedPriceHigh())
                .valuationScore(project.getValuationScore())
                .valuationConfidence(project.getValuationConfidence())
                .valuationNote(project.getValuationNote())
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
