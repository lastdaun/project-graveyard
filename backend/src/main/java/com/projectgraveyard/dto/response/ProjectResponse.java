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
    private CollaborationMode collaborationMode;
    private Long price;
    private Integer equitySplit;
    private boolean approved;
    private ReviewStatus reviewStatus;
    private String rejectionReason;
    private Integer soldCount;
    private SellerType sellerType;
    private ListingType listingType;
    private LicenseType licenseType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
