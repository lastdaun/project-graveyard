package com.projectgraveyard.dto.request;

import com.projectgraveyard.enums.CollaborationMode;
import com.projectgraveyard.enums.ProjectCategory;
import com.projectgraveyard.enums.ProjectStatus;
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

    private Long price; // VND

    @Min(value = 0, message = "Equity split must be at least 0%")
    @Max(value = 100, message = "Equity split cannot exceed 100%")
    private Integer equitySplit; // %
}
