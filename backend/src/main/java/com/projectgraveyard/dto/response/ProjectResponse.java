package com.projectgraveyard.dto.response;

import com.projectgraveyard.enums.CollaborationMode;
import com.projectgraveyard.enums.ProjectCategory;
import com.projectgraveyard.enums.ProjectStatus;
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
public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private ProjectCategory category;
    private ProjectStatus status;
    private List<String> skillsNeeded;
    private List<String> techStack;
    private UserResponse creator;
    private int teamSize;
    private int currentMembers;
    private int progress;
    private String imageUrl;
    private CollaborationMode collaborationMode;
    private Long price;
    private Integer equitySplit;
    private boolean approved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Listing type: COMPANY_SHOWCASE | ABANDONED_PROJECT
    private String listingType;

    private String licenseType;
    private String reviewStatus;
    private String rejectionReason;
    private Integer soldCount;
    private String demoUrl;
    private Integer supportDays;
    private Double commissionRate;

    // Company showcase fields
    private String companyName;
    private String companyWebsite;
    private String companyContactEmail;
    private String companyContactPhone;
    private String companyLogo;
    private String priceRange;

    // Abandoned project fields
    private String projectStage;
    private Integer completionPercent;
    private String completedParts;
    private String missingParts;
    private String handoverType;
    private String lookingFor;

    // Valuation fields
    private Long estimatedPriceLow;
    private Long estimatedPriceSuggested;
    private Long estimatedPriceHigh;
    private Integer valuationScore;
    private String valuationConfidence;
    private String valuationNote;
}
