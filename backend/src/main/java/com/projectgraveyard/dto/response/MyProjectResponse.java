package com.projectgraveyard.dto.response;

import com.projectgraveyard.enums.CompletionStatus;
import com.projectgraveyard.enums.ListingType;
import com.projectgraveyard.enums.ProjectCategory;
import com.projectgraveyard.enums.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Owner-only listing response for GET /api/projects/my.
 * Includes reviewStatus + rejectionReason. Never includes githubUrl.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyProjectResponse {
    private Long id;
    private String title;
    private String description;
    private ProjectCategory category;
    private List<String> techStack;
    private List<String> imageUrls;
    private Long price;
    private ListingType listingType;
    private CompletionStatus completionStatus;
    private Integer completionPercent;
    private String completedParts;
    private String missingParts;
    private String currentStage;
    private ReviewStatus reviewStatus;
    private boolean approved;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
