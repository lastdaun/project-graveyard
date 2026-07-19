package com.projectgraveyard.entity;

import com.projectgraveyard.enums.*;
import com.projectgraveyard.util.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "text")
    private List<String> skillsNeeded;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "text")
    private List<String> techStack;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    private int teamSize;

    private int currentMembers;

    private int progress;

    @Column(name = "image_url", columnDefinition = "text")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CollaborationMode collaborationMode = CollaborationMode.SELL_USAGE_RIGHTS;

    private Long price;

    private Integer equitySplit;

    private boolean approved;

    @Enumerated(EnumType.STRING)
    @Column(name = "seller_type")
    private SellerType sellerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type")
    private ListingType listingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status")
    private CompletionStatus completionStatus;

    private Integer completionPercent;

    @Column(columnDefinition = "text")
    private String completedParts;

    @Column(columnDefinition = "text")
    private String missingParts;

    private String currentStage;

    @Column(name = "github_url", columnDefinition = "text")
    private String githubUrl;

    @ElementCollection
    @CollectionTable(name = "project_images", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "image_url", columnDefinition = "text")
    private List<String> imageUrls;

    @Enumerated(EnumType.STRING)
    @Column(name = "license_type")
    private LicenseType licenseType;

    @Column(name = "demo_url", columnDefinition = "text")
    private String demoUrl;

    @Column(name = "support_days")
    private Integer supportDays;

    @Column(name = "commission_rate")
    private Double commissionRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status")
    private ReviewStatus reviewStatus;

    @Column(name = "rejection_reason", columnDefinition = "text")
    private String rejectionReason;

    @Column(name = "sold_count")
    private Integer soldCount;

    // Soft valuation for incomplete user projects
    @Column(name = "estimated_price_low")
    private Long estimatedPriceLow;

    @Column(name = "estimated_price_suggested")
    private Long estimatedPriceSuggested;

    @Column(name = "estimated_price_high")
    private Long estimatedPriceHigh;

    @Column(name = "valuation_score")
    private Integer valuationScore;

    @Column(name = "valuation_confidence")
    private String valuationConfidence;

    @Column(name = "valuation_note", columnDefinition = "text")
    private String valuationNote;

    // Company project fields (admin-posted)
    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_website", columnDefinition = "text")
    private String companyWebsite;

    @Column(name = "company_email")
    private String companyEmail;

    @Column(name = "company_phone")
    private String companyPhone;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
