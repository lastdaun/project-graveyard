package com.projectgraveyard.dto.request;

import com.projectgraveyard.enums.ProjectCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CompanyProjectRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private ProjectCategory category;

    private List<String> techStack;

    @NotEmpty(message = "At least one project image is required")
    private List<String> imageUrls;

    private String demoUrl;

    @NotNull(message = "Price is required")
    @Min(value = 1, message = "Price must be greater than 0")
    private Long price;

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String companyWebsite;

    private String companyEmail;

    private String companyPhone;
}
