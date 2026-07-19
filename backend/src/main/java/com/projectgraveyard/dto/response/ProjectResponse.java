package com.projectgraveyard.dto.response;

import com.projectgraveyard.enums.*;
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
    private List<String> imageUrls;
    private CollaborationMode collaborationMode;
    private Long price;
    private Integer equitySplit;
    private boolean approved;
    private ReviewStatus reviewStatus;
    private Integer soldCount;
    private SellerType sellerType;
    private ListingType listingType;
    private CompletionStatus completionStatus;
    private Integer completionPercent;
    private String completedParts;
    private String missingParts;
    private String currentStage;
    private LicenseType licenseType;
    private String demoUrl;
    private Long estimatedPriceLow;
    private Long estimatedPriceSuggested;
    private Long estimatedPriceHigh;
    private Integer valuationScore;
    private String valuationConfidence;
    private String valuationNote;
    private String companyName;
    private String companyWebsite;
    private String companyEmail;
    private String companyPhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
