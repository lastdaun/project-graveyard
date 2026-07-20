package com.projectgraveyard.dto.request;

import com.projectgraveyard.enums.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ProjectRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private ProjectCategory category;

    private ProjectStatus status;

    private List<String> skillsNeeded;

    private List<String> techStack;

    @Min(value = 1, message = "Team size must be at least 1")
    private int teamSize;

    @Min(value = 0, message = "Progress must be at least 0%")
    @Max(value = 100, message = "Progress cannot exceed 100%")
    private int progress;

    private String imageUrl;

    private CollaborationMode collaborationMode;

    private Long price;

    @Min(value = 0, message = "Equity split must be at least 0%")
    @Max(value = 100, message = "Equity split cannot exceed 100%")
    private Integer equitySplit;

    private SellerType sellerType;

    private ListingType listingType;

    private CompletionStatus completionStatus;

    @Min(value = 0, message = "Completion percent must be at least 0%")
    @Max(value = 100, message = "Completion percent cannot exceed 100%")
    private Integer completionPercent;

    private String completedParts;

    private String missingParts;

    private String currentStage;

    private String githubUrl;

    @NotEmpty(message = "At least one project image is required")
    private List<String> imageUrls;

    private LicenseType licenseType;

    private String demoUrl;

    private Integer supportDays;

    private Long estimatedPriceLow;
    private Long estimatedPriceSuggested;
    private Long estimatedPriceHigh;
    private Integer valuationScore;
    private String valuationConfidence;
    private String valuationNote;
}
