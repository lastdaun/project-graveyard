package com.projectgraveyard.repository;

import com.projectgraveyard.entity.Project;
import com.projectgraveyard.enums.ListingType;
import com.projectgraveyard.enums.ProjectCategory;
import com.projectgraveyard.enums.ProjectStatus;
import com.projectgraveyard.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p WHERE " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', COALESCE(:search, ''), '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', COALESCE(:search, ''), '%'))) " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:listingType IS NULL OR p.listingType = :listingType) " +
           "AND (:creatorId IS NULL OR p.creator.id = :creatorId) " +
           "AND p.reviewStatus = com.projectgraveyard.enums.ReviewStatus.APPROVED " +
           "AND p.approved = true")
    Page<Project> findProjects(
            @Param("search") String search,
            @Param("category") ProjectCategory category,
            @Param("status") ProjectStatus status,
            @Param("listingType") ListingType listingType,
            @Param("creatorId") Long creatorId,
            Pageable pageable
    );

    List<Project> findByCreatorId(Long creatorId);

    long countByCreatorId(Long creatorId);

    long countByCreatorIdAndReviewStatus(Long creatorId, ReviewStatus reviewStatus);

    List<Project> findByReviewStatusOrderByCreatedAtDesc(ReviewStatus reviewStatus);

    @Query("SELECT p FROM Project p WHERE " +
           "p.listingType = com.projectgraveyard.enums.ListingType.USER_INCOMPLETE_PROJECT " +
           "AND p.reviewStatus = com.projectgraveyard.enums.ReviewStatus.PENDING_REVIEW " +
           "AND p.approved = false " +
           "ORDER BY p.createdAt DESC")
    List<Project> findPendingUserProjects();
}
