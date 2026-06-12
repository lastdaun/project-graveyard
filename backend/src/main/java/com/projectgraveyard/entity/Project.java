package com.projectgraveyard.entity;

import com.projectgraveyard.enums.CollaborationMode;
import com.projectgraveyard.enums.ProjectCategory;
import com.projectgraveyard.enums.ProjectStatus;
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

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CollaborationMode collaborationMode;

    private Long price;

    private Integer equitySplit;

    private boolean approved;

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
