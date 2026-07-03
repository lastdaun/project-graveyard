package com.projectgraveyard.dto.request;

import com.projectgraveyard.enums.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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

    @NotNull(message = "Status is required")
    private ProjectStatus status;

    private List<String> skillsNeeded;

    private List<String> techStack;

    @Min(value = 1, message = "Team size must be at least 1")
    private int teamSize;

    @Min(value = 0, message = "Progress must be at least 0%")
    @Max(value = 100, message = "Progress cannot exceed 100%")
    private int progress;

    private String imageUrl;

    @NotNull(message = "Collaboration mode is required")
    private CollaborationMode collaborationMode;

    @NotNull(message = "Price is required")
    @Min(value = 1, message = "Price must be greater than 0")
    private Long price; // VND

    @Min(value = 0, message = "Equity split must be at least 0%")
    @Max(value = 100, message = "Equity split cannot exceed 100%")
    private Integer equitySplit; // %

    @NotNull(message = "Seller type is required")
    private SellerType sellerType;

    @NotNull(message = "Listing type is required")
    private ListingType listingType;

    @NotNull(message = "License type is required")
    private LicenseType licenseType;

    private String demoUrl;

    @NotNull(message = "Support days is required")
    @Min(value = 0, message = "Support days must be at least 0")
    private Integer supportDays;
}
